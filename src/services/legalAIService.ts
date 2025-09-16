import { supabase } from '../lib/supabase';
import { AIConfigService } from './aiConfigService';

export interface LegalChatMessage {
  id: string;
  user_id: string;
  session_id: string;
  message: string;
  response: string;
  message_type: 'user' | 'assistant';
  ai_confidence: number;
  suggestions: string[];
  related_topics: string[];
  context_data: any;
  timestamp: string;
}

export interface LegalChatSession {
  id: string;
  user_id: string;
  title: string;
  summary: string | null;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LegalAIResponse {
  response: string;
  suggestions?: string[];
  relatedTopics?: string[];
  confidence: number;
}

export class LegalAIService {
  /**
   * Minimal API test - just test the API call without any database operations
   */
  static async testMinimalAPI(): Promise<{
    success: boolean;
    response?: string;
    error?: string;
  }> {
    try {
      console.log('=== MINIMAL API TEST ===');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk-2531714d05d94a16a216aa80c984b41d`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: "user",
              content: "Say 'Minimal API test successful'"
            }
          ],
          max_tokens: 20,
          temperature: 0.1,
        }),
      });

      console.log('Minimal API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Minimal API test failed:', errorText);
        return {
          success: false,
          error: `API test failed: ${response.statusText} - ${errorText}`
        };
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      console.log('Minimal API test successful:', aiResponse);
      
      return {
        success: true,
        response: aiResponse
      };

    } catch (error) {
      console.error('Minimal API test error:', error);
      return {
        success: false,
        error: `Minimal API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Simple API test method
   */
  static async testSimpleAPI(): Promise<{
    success: boolean;
    response?: string;
    error?: string;
  }> {
    try {
      console.log('=== SIMPLE API TEST ===');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk-2531714d05d94a16a216aa80c984b41d`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: "user",
              content: "Say 'Simple API test successful'"
            }
          ],
          max_tokens: 20,
          temperature: 0.1,
        }),
      });

      console.log('Simple API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Simple API test failed:', errorText);
        return {
          success: false,
          error: `API test failed: ${response.statusText} - ${errorText}`
        };
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      console.log('Simple API test successful:', aiResponse);
      
      return {
        success: true,
        response: aiResponse
      };

    } catch (error) {
      console.error('Simple API test error:', error);
      return {
        success: false,
        error: `Simple API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Test API connection
   */
  static async testAPIConnection(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('Testing DeepSeek API connection...');
      console.log('API Key:', 'sk-2531714d05d94a16a216aa80c984b41d');
      console.log('API URL:', 'https://api.deepseek.com/v1/chat/completions');
      
      const requestBody = {
        model: 'deepseek-chat',
        messages: [
          {
            role: "user",
            content: "Hello, this is a test message. Please respond with 'API connection successful'."
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk-2531714d05d94a16a216aa80c984b41d`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API test failed:', errorText);
        return {
          success: false,
          error: `API test failed: ${response.statusText} - ${errorText}`
        };
      }

      const data = await response.json();
      console.log('API test successful:', data);
      console.log('AI Response:', data.choices?.[0]?.message?.content);
      return {
        success: true
      };

    } catch (error) {
      console.error('API connection test failed:', error);
      return {
        success: false,
        error: `API connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Test database connection and table structure
   */
  static async testDatabaseConnection(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('Testing database connection...');
      
      // Test basic connection
      const { data, error } = await supabase
        .from('legal_chat_sessions')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Database connection test failed:', error);
        return {
          success: false,
          error: `Database connection failed: ${error.message}`
        };
      }

      console.log('Database connection test successful');
      return {
        success: true
      };
    } catch (error) {
      console.error('Database connection test failed:', error);
      return {
        success: false,
        error: `Database connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Send a message to the Legal AI and get a response
   */
  static async sendMessage(
    userId: string, 
    message: string, 
    sessionId?: string
  ): Promise<{
    response: LegalAIResponse;
    newSessionId?: string;
    error?: string;
  }> {
    try {
      // Get AI configuration
      const { config: aiConfig, error: configError } = await AIConfigService.getActiveConfig();
      
      if (configError || !aiConfig) {
        console.warn('No AI configuration found, using direct API call:', configError);
        // Use direct API call without admin configuration
        const aiResponse = await this.getDirectAILegalResponse(message, '');
        
        // Generate session ID if not provided
        const currentSessionId = sessionId || this.generateSessionId();
        
        // Save chat message to database
        const { error: saveError } = await supabase
          .from('legal_chat_messages')
          .insert({
            user_id: userId,
            message: message,
            response: aiResponse.response,
            session_id: currentSessionId,
            timestamp: new Date().toISOString()
          });

        if (saveError) {
          console.error('Failed to save message:', saveError);
        }

        return {
          response: aiResponse,
          newSessionId: sessionId ? undefined : currentSessionId
        };
      }

      // Use admin-configured AI for legal assistance
      const aiResponse = await this.getAILegalResponse(message, aiConfig);
      
      // Generate session ID if not provided
      const currentSessionId = sessionId || this.generateSessionId();
      
      // Save chat message to database
      const { error: saveError } = await supabase
        .from('legal_chat_messages')
        .insert({
          user_id: userId,
          message: message,
          response: aiResponse.response,
          session_id: currentSessionId,
          timestamp: new Date().toISOString()
        });

      if (saveError) {
        console.error('Failed to save message:', saveError);
      }

      return {
        response: aiResponse,
        newSessionId: sessionId ? undefined : currentSessionId
      };

    } catch (error) {
      console.error('Legal AI Service error:', error);
      return {
        response: {
          response: 'I apologize, but I\'m experiencing technical difficulties. Please try again or contact our support team for assistance.',
          confidence: 0
        },
        error: `Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get AI-powered legal response using admin configuration
   */
  private static async getAILegalResponse(message: string, config: any): Promise<LegalAIResponse> {
    try {
      console.log('Sending request to DeepSeek API...');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk-2531714d05d94a16a216aa80c984b41d`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: "system",
              content: `${config.systemRole}

You are a specialized legal AI assistant focused on international trade law, customs compliance, and China-Canada trade regulations. 

LEGAL EXPERTISE AREAS:
- International trade law and regulations
- Canadian customs and import requirements
- Chinese export regulations and procedures
- Trade agreements and preferential tariffs
- Legal compliance and documentation requirements
- Dispute resolution and legal procedures
- Contract law and commercial agreements

IMPORTANT LEGAL DISCLAIMERS:
- Provide general legal information and guidance only
- Always recommend consulting qualified legal professionals for specific legal matters
- Do not provide specific legal advice that could be relied upon in court
- Emphasize the importance of professional legal consultation for complex matters

RESPONSE GUIDELINES:
- Be accurate and up-to-date with current regulations
- Provide practical, actionable guidance
- Include relevant legal references when possible
- Suggest next steps and professional resources
- Maintain a professional and helpful tone

${config.customInstructions ? `ADDITIONAL INSTRUCTIONS: ${config.customInstructions}` : ''}`
            },
            {
              role: "user",
              content: `Legal Question: ${message}

Please provide a comprehensive legal response that includes:
1. Direct answer to the legal question
2. Relevant legal framework and regulations
3. Practical steps and recommendations
4. When to consult a qualified legal professional
5. Any relevant legal disclaimers

Format your response as clear, actionable legal guidance.`
            }
          ],
          max_tokens: config.maxTokens || 2000,
          temperature: config.temperature || 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Parse response and extract suggestions
      const suggestions = this.extractSuggestions(aiResponse);
      const relatedTopics = this.extractRelatedTopics(aiResponse);

      return {
        response: aiResponse,
        suggestions,
        relatedTopics,
        confidence: 0.85 // High confidence for legal AI
      };

    } catch (error) {
      console.error('AI Legal Response error:', error);
      const defaultResponse = this.getDefaultLegalResponse(message);
      return defaultResponse.response;
    }
  }

  /**
   * Fallback to default legal responses
   */
  private static getDefaultLegalResponse(message: string, sessionId?: string): {
    response: LegalAIResponse;
    newSessionId?: string;
  } {
    const messageLower = message.toLowerCase();
    
    let response = '';
    let suggestions: string[] = [];
    let relatedTopics: string[] = [];

    if (messageLower.includes('export') || messageLower.includes('china')) {
      response = 'For China exports, you\'ll need a Commercial Invoice, Packing List, Certificate of Origin (if applicable), and Export License for restricted items. The process typically takes 3-5 business days for documentation review.';
      suggestions = ['Export Documentation Checklist', 'China Export Regulations', 'Certificate of Origin Requirements'];
      relatedTopics = ['Export Procedures', 'Documentation', 'China Trade'];
    } else if (messageLower.includes('import') || messageLower.includes('canada')) {
      response = 'Canada imports require a Bill of Lading, Commercial Invoice in English/French, Packing List, and Import Declaration (B3 Form). Customs clearance usually takes 1-3 business days.';
      suggestions = ['Import Documentation', 'Canada Customs Procedures', 'B3 Form Requirements'];
      relatedTopics = ['Import Procedures', 'Customs Clearance', 'Canada Trade'];
    } else if (messageLower.includes('customs') || messageLower.includes('documentation')) {
      response = 'Essential customs documents include: Commercial Invoice, Packing List, Bill of Lading, Certificate of Origin, and Customs Declaration. Always ensure documents are complete and accurate to avoid delays.';
      suggestions = ['Documentation Checklist', 'Customs Requirements', 'Common Mistakes to Avoid'];
      relatedTopics = ['Documentation', 'Customs', 'Compliance'];
    } else if (messageLower.includes('tariff') || messageLower.includes('duty')) {
      response = 'Tariffs and duties vary by product classification (HS code), country of origin, and trade agreements. Use the Canada Border Services Agency (CBSA) tariff calculator for accurate rates. Preferential rates may apply under trade agreements.';
      suggestions = ['HS Code Lookup', 'Tariff Calculator', 'Trade Agreement Benefits'];
      relatedTopics = ['Tariffs', 'Duties', 'HS Codes', 'Trade Agreements'];
    } else if (messageLower.includes('hs code') || messageLower.includes('classification')) {
      response = 'HS codes are 6-10 digit codes that classify products for customs purposes. Accurate classification is crucial for determining tariffs, restrictions, and requirements. Use the CBSA classification tool or consult with a customs broker.';
      suggestions = ['HS Code Classification Tool', 'CBSA Resources', 'Customs Broker Consultation'];
      relatedTopics = ['HS Codes', 'Product Classification', 'Customs'];
    } else if (messageLower.includes('restricted') || messageLower.includes('prohibited')) {
      response = 'Many products have import/export restrictions or require special permits. Check the CBSA prohibited and restricted goods list, and consult with relevant regulatory agencies (Health Canada, CFIA, etc.) for specific requirements.';
      suggestions = ['Prohibited Goods List', 'Restricted Items Guide', 'Permit Requirements'];
      relatedTopics = ['Restrictions', 'Permits', 'Regulations'];
    } else {
      response = 'I can help you with various aspects of international trade law and customs compliance. Please ask about specific topics like export/import procedures, documentation requirements, tariffs, HS codes, or regulatory compliance. For complex legal matters, I recommend consulting with a qualified trade lawyer.';
      suggestions = ['Export Procedures', 'Import Requirements', 'Legal Consultation'];
      relatedTopics = ['General Trade Law', 'Compliance', 'Legal Advice'];
    }

    return {
      response: {
        response,
        suggestions,
        relatedTopics,
        confidence: 0.7 // Medium confidence for default responses
      },
      newSessionId: sessionId
    };
  }

  /**
   * Get chat history for a specific session
   */
  static async getChatHistory(userId: string, sessionId: string): Promise<{
    messages: LegalChatMessage[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('legal_chat_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching chat history:', error);
        return {
          messages: [],
          error: `Failed to fetch chat history: ${error.message}`
        };
      }

      console.log('Chat history fetched successfully:', data?.length || 0, 'messages');
      return {
        messages: data || []
      };
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return {
        messages: [],
        error: `Failed to fetch chat history: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get chat sessions for a user
   */
  static async getChatSessions(userId: string): Promise<{
    sessions: LegalChatSession[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('legal_chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat sessions:', error);
        return {
          sessions: [],
          error: `Failed to fetch chat sessions: ${error.message}`
        };
      }

      return {
        sessions: data || []
      };
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      return {
        sessions: [],
        error: `Failed to fetch chat sessions: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create a new chat session
   */
  static async createChatSession(userId: string, title: string): Promise<{
    session: LegalChatSession | null;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('legal_chat_sessions')
        .insert({
          user_id: userId,
          title: title,
          summary: null,
          message_count: 0,
          last_message_at: null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat session:', error);
        return {
          session: null,
          error: `Failed to create chat session: ${error.message}`
        };
      }

      console.log('Chat session created successfully:', data);
      return {
        session: data
      };
    } catch (error) {
      console.error('Error creating chat session:', error);
      return {
        session: null,
        error: `Failed to create chat session: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get chat context for AI memory
   */
  static async getChatContext(sessionId: string): Promise<{
    context: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('legal_chat_context')
        .select('*')
        .eq('session_id', sessionId)
        .order('importance', { ascending: false });

      if (error) {
        console.error('Error fetching chat context:', error);
        return {
          context: [],
          error: `Failed to fetch chat context: ${error.message}`
        };
      }

      return {
        context: data || []
      };
    } catch (error) {
      console.error('Error fetching chat context:', error);
      return {
        context: [],
        error: `Failed to fetch chat context: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Save important context for AI memory
   */
  static async saveChatContext(
    sessionId: string, 
    userId: string, 
    contextKey: string, 
    contextValue: string, 
    contextType: string = 'general',
    importance: number = 1
  ): Promise<{
    error?: string;
  }> {
    try {
      const { error } = await supabase
        .from('legal_chat_context')
        .upsert({
          session_id: sessionId,
          user_id: userId,
          context_key: contextKey,
          context_value: contextValue,
          context_type: contextType,
          importance: importance
        });

      if (error) {
        console.error('Error saving chat context:', error);
        return {
          error: `Failed to save chat context: ${error.message}`
        };
      }

      return {};
    } catch (error) {
      console.error('Error saving chat context:', error);
      return {
        error: `Failed to save chat context: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get conversation history for context
   */
  static async getConversationHistory(sessionId: string, limit: number = 10): Promise<{
    messages: LegalChatMessage[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('legal_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching conversation history:', error);
        return {
          messages: [],
          error: `Failed to fetch conversation history: ${error.message}`
        };
      }

      return {
        messages: data || []
      };
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return {
        messages: [],
        error: `Failed to fetch conversation history: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Enhanced sendMessage with memory and context
   */
  static async sendMessageWithMemory(
    userId: string, 
    message: string, 
    sessionId?: string
  ): Promise<{
    response: LegalAIResponse;
    newSessionId?: string;
    error?: string;
  }> {
    try {
      console.log('=== SEND MESSAGE WITH MEMORY START ===');
      console.log('User ID:', userId);
      console.log('Message:', message);
      console.log('Session ID:', sessionId);

      // Get or create session
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        console.log('Creating new session...');
        const sessionResult = await this.createChatSession(userId, `Legal Chat - ${new Date().toLocaleDateString()}`);
        if (sessionResult.error || !sessionResult.session) {
          console.error('Failed to create session:', sessionResult.error);
          throw new Error(sessionResult.error || 'Failed to create session');
        }
        currentSessionId = sessionResult.session.id;
        console.log('New session created:', currentSessionId);
      }

      // Get chat context and history
      console.log('Getting chat context and history...');
      const [contextResult, historyResult] = await Promise.all([
        this.getChatContext(currentSessionId),
        this.getConversationHistory(currentSessionId, 5)
      ]);

      console.log('Context result:', contextResult);
      console.log('History result:', historyResult);

      // Build context-aware prompt
      const contextInfo = this.buildContextPrompt(contextResult.context, historyResult.messages);
      console.log('Built context info:', contextInfo);
      
      // Get AI configuration
      console.log('Fetching AI configuration...');
      const { config: aiConfig, error: configError } = await AIConfigService.getActiveConfig();
      
      if (configError || !aiConfig) {
        console.warn('No AI configuration found, using direct API call:', configError);
        console.log('=== CALLING DIRECT AI RESPONSE ===');
        // Use direct API call without admin configuration
        const aiResponse = await this.getDirectAILegalResponse(message, contextInfo);
        console.log('Direct AI response received:', aiResponse);
        
        // Save both user message and AI response to database
        const timestamp = new Date().toISOString();
        
        console.log('Saving user message to database...');
        const { error: userMessageError } = await supabase
          .from('legal_chat_messages')
          .insert({
            session_id: currentSessionId,
            user_id: userId,
            message: message,
            response: '',
            message_type: 'user',
            ai_confidence: 0.0,
            suggestions: [],
            related_topics: [],
            context_data: {},
            timestamp: timestamp
          });

        if (userMessageError) {
          console.error('Failed to save user message:', userMessageError);
          throw new Error(`Database error: ${userMessageError.message}`);
        } else {
          console.log('User message saved successfully');
        }

        console.log('Saving AI message to database...');
        const { error: aiMessageError } = await supabase
          .from('legal_chat_messages')
          .insert({
            session_id: currentSessionId,
            user_id: userId,
            message: '',
            response: aiResponse.response,
            message_type: 'assistant',
            ai_confidence: aiResponse.confidence,
            suggestions: aiResponse.suggestions || [],
            related_topics: aiResponse.relatedTopics || [],
            context_data: contextInfo,
            timestamp: timestamp
          });

        if (aiMessageError) {
          console.error('Failed to save AI message:', aiMessageError);
          throw new Error(`Database error: ${aiMessageError.message}`);
        } else {
          console.log('AI message saved successfully');
        }

        // Extract and save important context
        await this.extractAndSaveContext(currentSessionId, userId, message, aiResponse.response);

        console.log('=== SEND MESSAGE WITH MEMORY SUCCESS (DIRECT API) ===');
        return {
          response: aiResponse,
          newSessionId: sessionId ? undefined : currentSessionId
        };
      }

      console.log('AI configuration found:', aiConfig);

      // Send message with context
      const aiResponse = await this.getAILegalResponseWithContext(message, aiConfig, contextInfo);
      
      // Save both user message and AI response to database
      const timestamp = new Date().toISOString();
      
      console.log('Saving user message to database...');
      const { error: userMessageError } = await supabase
        .from('legal_chat_messages')
        .insert({
          session_id: currentSessionId,
          user_id: userId,
          message: message,
          response: '',
          message_type: 'user',
          ai_confidence: 0.0,
          suggestions: [],
          related_topics: [],
          context_data: {},
          timestamp: timestamp
        });

      if (userMessageError) {
        console.error('Failed to save user message:', userMessageError);
        console.log('Continuing despite database error...');
      } else {
        console.log('User message saved successfully');
      }

      console.log('Saving AI message to database...');
      const { error: aiMessageError } = await supabase
        .from('legal_chat_messages')
        .insert({
          session_id: currentSessionId,
          user_id: userId,
          message: '',
          response: aiResponse.response,
          message_type: 'assistant',
          ai_confidence: aiResponse.confidence,
          suggestions: aiResponse.suggestions || [],
          related_topics: aiResponse.relatedTopics || [],
          context_data: contextInfo,
          timestamp: timestamp
        });

      if (aiMessageError) {
        console.error('Failed to save AI message:', aiMessageError);
        console.log('Continuing despite database error...');
      } else {
        console.log('AI message saved successfully');
      }

      // Extract and save important context
      await this.extractAndSaveContext(currentSessionId, userId, message, aiResponse.response);

      console.log('=== SEND MESSAGE WITH MEMORY SUCCESS (ADMIN CONFIG) ===');
      return {
        response: aiResponse,
        newSessionId: sessionId ? undefined : currentSessionId
      };

    } catch (error) {
      console.error('=== LEGAL AI SERVICE WITH MEMORY ERROR ===', error);
      console.log('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      
      // Return the default response instead of throwing
      const defaultResponse = this.getDefaultLegalResponse(message);
      console.log('Returning default response:', defaultResponse);
      
      return {
        response: defaultResponse.response,
        newSessionId: sessionId ? undefined : undefined,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get AI-powered legal response using direct API call (fallback when no admin config)
   */
  private static async getDirectAILegalResponse(message: string, contextInfo: string): Promise<LegalAIResponse> {
    try {
      console.log('=== SENDING DIRECT REQUEST TO DEEPSEEK API ===');
      console.log('Message:', message);
      console.log('Context Info:', contextInfo);
      
      const requestBody = {
        model: 'deepseek-chat',
        messages: [
          {
            role: "system",
            content: `You are a specialized legal AI assistant focused on international trade law, customs compliance, and China-Canada trade regulations. 

LEGAL EXPERTISE AREAS:
- International trade law and regulations
- Canadian customs and import requirements
- Chinese export regulations and procedures
- Trade agreements and preferential tariffs
- Legal compliance and documentation requirements
- Dispute resolution and legal procedures
- Contract law and commercial agreements

IMPORTANT LEGAL DISCLAIMERS:
- Provide general legal information and guidance only
- Always recommend consulting qualified legal professionals for specific legal matters
- Do not provide specific legal advice that could be relied upon in court
- Emphasize the importance of professional legal consultation for complex matters

RESPONSE GUIDELINES:
- Be accurate and up-to-date with current regulations
- Provide practical, actionable guidance
- Include relevant legal references when possible
- Suggest next steps and professional resources
- Maintain a professional and helpful tone
- Use conversation context to provide more relevant and personalized responses

CONVERSATION CONTEXT:
${contextInfo}`
          },
          {
            role: "user",
            content: `Legal Question: ${message}

Please provide a comprehensive legal response that includes:
1. Direct answer to the legal question
2. Relevant legal framework and regulations
3. Practical steps and recommendations
4. When to consult a qualified legal professional
5. Any relevant legal disclaimers

Format your response as clear, actionable legal guidance.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk-2531714d05d94a16a216aa80c984b41d`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('DeepSeek API response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error:', errorText);
        throw new Error(`AI API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('DeepSeek API response received:', data);
      
      const aiResponse = data.choices[0].message.content;
      console.log('AI Response:', aiResponse);

      // Parse response and extract suggestions
      const suggestions = this.extractSuggestions(aiResponse);
      const relatedTopics = this.extractRelatedTopics(aiResponse);

      console.log('=== API CALL SUCCESSFUL ===');
      return {
        response: aiResponse,
        suggestions,
        relatedTopics,
        confidence: 0.85 // High confidence for legal AI
      };

    } catch (error) {
      console.error('=== DIRECT AI LEGAL RESPONSE ERROR ===', error);
      console.log('Error type:', typeof error);
      console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.log('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.log('Falling back to default response');
      
      // Try to return a more specific error response
      const defaultResponse = this.getDefaultLegalResponse(message);
      console.log('Default response:', defaultResponse);
      return defaultResponse.response;
    }
  }

  /**
   * Get AI-powered legal response using admin configuration with context
   */
  private static async getAILegalResponseWithContext(message: string, config: any, contextInfo: string): Promise<LegalAIResponse> {
    try {
      console.log('Sending request to DeepSeek API...');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk-2531714d05d94a16a216aa80c984b41d`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: "system",
              content: `${config.systemRole}

You are a specialized legal AI assistant focused on international trade law, customs compliance, and China-Canada trade regulations. 

LEGAL EXPERTISE AREAS:
- International trade law and regulations
- Canadian customs and import requirements
- Chinese export regulations and procedures
- Trade agreements and preferential tariffs
- Legal compliance and documentation requirements
- Dispute resolution and legal procedures
- Contract law and commercial agreements

IMPORTANT LEGAL DISCLAIMERS:
- Provide general legal information and guidance only
- Always recommend consulting qualified legal professionals for specific legal matters
- Do not provide specific legal advice that could be relied upon in court
- Emphasize the importance of professional legal consultation for complex matters

RESPONSE GUIDELINES:
- Be accurate and up-to-date with current regulations
- Provide practical, actionable guidance
- Include relevant legal references when possible
- Suggest next steps and professional resources
- Maintain a professional and helpful tone
- Use conversation context to provide more relevant and personalized responses

${config.customInstructions ? `ADDITIONAL INSTRUCTIONS: ${config.customInstructions}` : ''}

CONVERSATION CONTEXT:
${contextInfo}`
            },
            {
              role: "user",
              content: `Legal Question: ${message}

Please provide a comprehensive legal response that includes:
1. Direct answer to the legal question
2. Relevant legal framework and regulations
3. Practical steps and recommendations
4. When to consult a qualified legal professional
5. Any relevant legal disclaimers

Format your response as clear, actionable legal guidance.`
            }
          ],
          max_tokens: config.maxTokens || 2000,
          temperature: config.temperature || 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Parse response and extract suggestions
      const suggestions = this.extractSuggestions(aiResponse);
      const relatedTopics = this.extractRelatedTopics(aiResponse);

      return {
        response: aiResponse,
        suggestions,
        relatedTopics,
        confidence: 0.85 // High confidence for legal AI
      };

    } catch (error) {
      console.error('AI Legal Response with Context error:', error);
      return this.getDefaultLegalResponse(message).response;
    }
  }

  /**
   * Build context-aware prompt
   */
  private static buildContextPrompt(context: any[], history: any[]): string {
    let contextPrompt = '';
    
    // Add conversation history
    if (history.length > 0) {
      contextPrompt += '\n\nCONVERSATION HISTORY:\n';
      history.reverse().forEach((msg, index) => {
        contextPrompt += `Previous ${index + 1}: User: "${msg.message}"\nAI: "${msg.response}"\n\n`;
      });
    }

    // Add saved context
    if (context.length > 0) {
      contextPrompt += '\n\nSAVED CONTEXT:\n';
      context.forEach((ctx, index) => {
        contextPrompt += `${ctx.context_key}: ${ctx.context_value}\n`;
      });
    }

    return contextPrompt;
  }

  /**
   * Extract and save important context from conversation
   */
  private static async extractAndSaveContext(
    sessionId: string, 
    userId: string, 
    userMessage: string, 
    aiResponse: string
  ): Promise<void> {
    try {
      // Extract legal topics
      const legalTopics = this.extractLegalTopics(userMessage, aiResponse);
      if (legalTopics.length > 0) {
        await this.saveChatContext(
          sessionId, 
          userId, 
          'legal_topics', 
          legalTopics.join(', '), 
          'legal_topic', 
          3
        );
      }

      // Extract user preferences
      const userPreferences = this.extractUserPreferences(userMessage);
      if (userPreferences.length > 0) {
        await this.saveChatContext(
          sessionId, 
          userId, 
          'user_preferences', 
          userPreferences.join(', '), 
          'preference', 
          2
        );
      }

      // Extract case information
      const caseInfo = this.extractCaseInformation(userMessage);
      if (caseInfo) {
        await this.saveChatContext(
          sessionId, 
          userId, 
          'case_information', 
          caseInfo, 
          'case_info', 
          4
        );
      }
    } catch (error) {
      console.error('Error extracting and saving context:', error);
    }
  }

  /**
   * Extract legal topics from conversation
   */
  private static extractLegalTopics(userMessage: string, aiResponse: string): string[] {
    const topics: string[] = [];
    const text = `${userMessage} ${aiResponse}`.toLowerCase();

    const legalKeywords = [
      'export', 'import', 'customs', 'tariff', 'duty', 'hs code', 'classification',
      'commercial invoice', 'packing list', 'bill of lading', 'certificate of origin',
      'trade agreement', 'nafta', 'cptpp', 'free trade', 'preferential tariff',
      'restricted goods', 'prohibited items', 'permit', 'license', 'regulation',
      'compliance', 'documentation', 'clearance', 'border', 'cbsa', 'cbsa',
      'china', 'canada', 'international trade', 'legal advice', 'consultation'
    ];

    legalKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        topics.push(keyword);
      }
    });

    return Array.from(new Set(topics));
  }

  /**
   * Extract user preferences from message
   */
  private static extractUserPreferences(message: string): string[] {
    const preferences: string[] = [];
    const text = message.toLowerCase();

    if (text.includes('urgent') || text.includes('asap') || text.includes('quickly')) {
      preferences.push('urgent_response');
    }
    if (text.includes('detailed') || text.includes('comprehensive') || text.includes('thorough')) {
      preferences.push('detailed_explanation');
    }
    if (text.includes('simple') || text.includes('basic') || text.includes('overview')) {
      preferences.push('simple_explanation');
    }

    return preferences;
  }

  /**
   * Extract case information from message
   */
  private static extractCaseInformation(message: string): string | null {
    const text = message.toLowerCase();

    // Look for specific case details
    if (text.includes('case') || text.includes('situation') || text.includes('scenario')) {
      return message.substring(0, 200); // First 200 characters as case summary
    }

    return null;
  }

  /**
   * Extract suggestions from AI response
   */
  private static extractSuggestions(response: string): string[] {
    const suggestions: string[] = [];
    const lines = response.split('\n');

    lines.forEach(line => {
      if (line.includes('•') || line.includes('-') || line.includes('*')) {
        const suggestion = line.replace(/^[\s•\-*]+/, '').trim();
        if (suggestion.length > 0) {
          suggestions.push(suggestion);
        }
      }
    });

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Extract related topics from AI response
   */
  private static extractRelatedTopics(response: string): string[] {
    const topics: string[] = [];
    const text = response.toLowerCase();

    const topicKeywords = [
      'export procedures', 'import requirements', 'customs clearance',
      'documentation', 'tariffs', 'hs codes', 'trade agreements',
      'compliance', 'regulations', 'legal consultation'
    ];

    topicKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        topics.push(keyword);
      }
    });

    return Array.from(new Set(topics));
  }

  /**
   * Generate a unique session ID
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}