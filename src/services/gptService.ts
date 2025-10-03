import { ImageUploadService } from './imageUploadService';
import { AIConfigService } from './aiConfigService';

export interface ComplianceAnalysisRequest {
  productName: string;
  productDescription: string;
  productCategory: string;
  originCountry: string;
  destinationCountry: string;
  productImage?: File;
}

export interface ComplianceAnalysisResult {
  hsCode: string;
  tariffRate: number;
  requirements: string[];
  restrictions: string[];
  documentation: string[];
  estimatedProcessingTime: string;
  confidence: number;
  analysis: string;
}

export class GPTService {
  private static readonly API_URL = '/deepseek/v1/chat/completions';

  static async analyzeCompliance(request: ComplianceAnalysisRequest): Promise<ComplianceAnalysisResult> {
    try {
      // Get active AI configuration
      const { config: aiConfig, error: configError } = await AIConfigService.getActiveConfig();
      
      if (configError || !aiConfig) {
        console.warn('No AI configuration found, using default settings:', configError);
        // Fallback to default behavior
        return this.analyzeWithDefaultConfig(request);
      }

      // Use admin-configured settings
      return this.analyzeWithCustomConfig(request, aiConfig);
    } catch (error) {
      console.error('AI Analysis error:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async analyzeWithDefaultConfig(request: ComplianceAnalysisRequest): Promise<ComplianceAnalysisResult> {
    try {
      let imageBase64: string | undefined;

      // Convert image to base64 if provided
      if (request.productImage) {
        imageBase64 = await ImageUploadService.convertToBase64(request.productImage);
      }

      // Prepare messages for GPT with default settings
      const messages = this.buildPrompt(request, imageBase64);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          max_tokens: 2000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseGPTResponse(data.choices[0].message.content);

    } catch (error) {
      console.error('Default Analysis error:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async analyzeWithCustomConfig(request: ComplianceAnalysisRequest, config: any): Promise<ComplianceAnalysisResult> {
    try {
      let imageBase64: string | undefined;

      // Convert image to base64 if provided
      if (request.productImage) {
        imageBase64 = await ImageUploadService.convertToBase64(request.productImage);
      }

      // Build custom prompt using admin configuration
      const messages = this.buildCustomPrompt(request, config, imageBase64);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          max_tokens: config.maxTokens || 2000,
          temperature: config.temperature || 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseGPTResponse(data.choices[0].message.content);

    } catch (error) {
      console.error('Custom Analysis error:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static buildPrompt(request: ComplianceAnalysisRequest, imageBase64?: string): any[] {
    const basePrompt = `You are a Canadian customs compliance expert. Analyze the following product for import requirements to Canada.

Product Details:
- Name: ${request.productName}
- Description: ${request.productDescription}
- Category: ${request.productCategory}
- Origin: ${request.originCountry}
- Destination: ${request.destinationCountry}

Please provide a detailed analysis including:
1. HS Code (Harmonized System code)
2. Tariff rate (percentage)
3. Required documentation
4. Any restrictions or special requirements
5. Estimated processing time
6. Your confidence level (0-1)

Format your response as JSON with these exact keys:
{
  "hsCode": "string",
  "tariffRate": number,
  "requirements": ["string array"],
  "restrictions": ["string array"],
  "documentation": ["string array"],
  "estimatedProcessingTime": "string",
  "confidence": number,
  "analysis": "detailed text explanation"
}`;

    // DeepSeek doesn't support vision, so we only use text content
    // Add note about image if provided
    const promptWithImageNote = imageBase64 
      ? basePrompt + '\n\nNote: A product image was provided but cannot be analyzed with this model. Analysis will be based on the text description provided.'
      : basePrompt;

    return [
      {
        role: "user",
        content: promptWithImageNote
      }
    ];
  }

  private static buildCustomPrompt(request: ComplianceAnalysisRequest, config: any, imageBase64?: string): any[] {
    const categoryInstruction = config.categoryInstructions[request.productCategory] || 
                               config.categoryInstructions['Other'] || '';
    
    const basePrompt = `${config.systemRole}

ANALYSIS REQUEST:
Product: ${request.productName}
Description: ${request.productDescription}
Category: ${request.productCategory}
Route: ${request.originCountry} → ${request.destinationCountry}

CATEGORY-SPECIFIC FOCUS:
${categoryInstruction}

FOCUS AREAS:
${config.focusAreas.join(', ')}

${config.customInstructions ? `ADDITIONAL INSTRUCTIONS: ${config.customInstructions}` : ''}

Please provide a comprehensive analysis including:

1. HS CODE CLASSIFICATION:
   - Primary HS code with 6-10 digits
   - Alternative codes to consider
   - Classification reasoning and methodology

2. TARIFF ANALYSIS:
   - Most Favored Nation (MFN) rate
   - Preferential rates (if applicable)
   - Tariff reduction opportunities
   - Estimated duties and taxes

3. REGULATORY REQUIREMENTS:
   - Mandatory certifications and standards
   - Import permits and licenses
   - Labeling and marking requirements
   - Country-specific regulations

4. DOCUMENTATION CHECKLIST:
   - Commercial invoice requirements
   - Certificates of origin
   - Safety and compliance certificates
   - Special documentation needs

5. COMPLIANCE RISKS:
   - Potential regulatory violations
   - Common mistakes to avoid
   - Penalty risks and mitigation

6. COST OPTIMIZATION:
   - Duty reduction strategies
   - Free trade agreement benefits
   - Supply chain optimization tips

7. PROCESSING TIMELINE:
   - Standard processing time
   - Factors affecting timeline
   - Expedited options

8. CONFIDENCE ASSESSMENT:
   - Classification confidence (0-1)
   - Areas of uncertainty
   - Recommended verification steps

Format your response as JSON with these exact keys:
{
  "hsCode": "string",
  "tariffRate": number,
  "requirements": ["string array"],
  "restrictions": ["string array"],
  "documentation": ["string array"],
  "estimatedProcessingTime": "string",
  "confidence": number,
  "analysis": "detailed text explanation"
}`;

    return [
      {
        role: "system",
        content: "You are a specialized AI assistant focused on Canadian customs compliance. Always provide accurate, up-to-date information based on current regulations."
      },
      {
        role: "user",
        content: basePrompt
      }
    ];
  }

  private static parseGPTResponse(content: string): ComplianceAnalysisResult {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        hsCode: parsed.hsCode || 'Unknown',
        tariffRate: parsed.tariffRate || 0,
        requirements: parsed.requirements || [],
        restrictions: parsed.restrictions || [],
        documentation: parsed.documentation || [],
        estimatedProcessingTime: parsed.estimatedProcessingTime || 'Unknown',
        confidence: parsed.confidence || 0,
        analysis: parsed.analysis || content
      };
    } catch (error) {
      console.error('Error parsing GPT response:', error);
      // Return fallback response
      return {
        hsCode: 'Unknown',
        tariffRate: 0,
        requirements: ['Manual review required'],
        restrictions: ['Manual review required'],
        documentation: ['Manual review required'],
        estimatedProcessingTime: 'Unknown',
        confidence: 0,
        analysis: content
      };
    }
  }
}
