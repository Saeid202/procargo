import { supabase } from '../lib/supabase';
import { ImageUploadService } from './imageUploadService';
import { GPTService } from './gptService';

export interface ComplianceAnalysisData {
  productName: string;
  productDescription: string;
  productCategory: string;
  originCountry: string;
  destinationCountry: string;
  productImage?: File;
}

export interface ComplianceAnalysisResult {
  id: string;
  hsCode: string;
  tariffRate: number;
  requirements: string[];
  restrictions: string[];
  documentation: string[];
  estimatedProcessingTime: string;
  confidence: number;
  analysis: string;
  productImagePath?: string;
  productImageUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ComplianceAnalysisResponse {
  analysis: ComplianceAnalysisResult | null;
  error: string | null;
}

export class ComplianceService {
  /**
   * Create a new compliance analysis
   */
  static async createAnalysis(
    userId: string, 
    data: ComplianceAnalysisData
  ): Promise<ComplianceAnalysisResponse> {
    try {
      // Start with pending status
      const { data: analysis, error: insertError } = await supabase
        .from('compliance_analyses')
        .insert({
          user_id: userId,
          product_name: data.productName,
          product_description: data.productDescription,
          product_category: data.productCategory,
          origin_country: data.originCountry,
          destination_country: data.destinationCountry,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        return {
          analysis: null,
          error: `Failed to create analysis: ${insertError.message}`
        };
      }

      // Upload image if provided
      let imagePath: string | undefined;
      let imageUrl: string | undefined;

      if (data.productImage) {
        const uploadResult = await ImageUploadService.uploadImage(
          data.productImage,
          userId,
          analysis.id
        );

        if (uploadResult.success) {
          imagePath = uploadResult.imagePath;
          imageUrl = uploadResult.imageUrl;

          // Update analysis with image info
          await supabase
            .from('compliance_analyses')
            .update({
              product_image_path: imagePath,
              product_image_url: imageUrl
            })
            .eq('id', analysis.id);
        }
      }

      // Update status to processing
      await supabase
        .from('compliance_analyses')
        .update({ status: 'processing' })
        .eq('id', analysis.id);

      // Run GPT analysis
      try {
        const gptResult = await GPTService.analyzeCompliance(data);

        // Update analysis with GPT results
        const { error: updateError } = await supabase
          .from('compliance_analyses')
          .update({
            hs_code: gptResult.hsCode,
            tariff_rate: gptResult.tariffRate,
            requirements: gptResult.requirements,
            restrictions: gptResult.restrictions,
            documentation: gptResult.documentation,
            estimated_processing_time: gptResult.estimatedProcessingTime,
            confidence_score: gptResult.confidence,
            analysis_text: gptResult.analysis,
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', analysis.id);

        if (updateError) {
          console.error('Failed to update analysis with GPT results:', updateError);
        }

        return {
          analysis: {
            id: analysis.id,
            hsCode: gptResult.hsCode,
            tariffRate: gptResult.tariffRate,
            requirements: gptResult.requirements,
            restrictions: gptResult.restrictions,
            documentation: gptResult.documentation,
            estimatedProcessingTime: gptResult.estimatedProcessingTime,
            confidence: gptResult.confidence,
            analysis: gptResult.analysis,
            productImagePath: imagePath,
            productImageUrl: imageUrl,
            status: 'completed',
            createdAt: analysis.created_at,
            updatedAt: analysis.updated_at,
            completedAt: new Date().toISOString()
          },
          error: null
        };

      } catch (gptError) {
        // Mark as failed if GPT analysis fails
        await supabase
          .from('compliance_analyses')
          .update({
            status: 'failed',
            analysis_text: `GPT Analysis failed: ${gptError instanceof Error ? gptError.message : 'Unknown error'}`
          })
          .eq('id', analysis.id);

        return {
          analysis: null,
          error: `Analysis failed: ${gptError instanceof Error ? gptError.message : 'Unknown error'}`
        };
      }

    } catch (error) {
      console.error('Compliance analysis error:', error);
      return {
        analysis: null,
        error: `Failed to create analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get all compliance analyses for a user
   */
  static async getUserAnalyses(userId: string): Promise<{
    analyses: ComplianceAnalysisResult[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('compliance_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          analyses: [],
          error: `Failed to fetch analyses: ${error.message}`
        };
      }

      const analyses: ComplianceAnalysisResult[] = data.map(item => ({
        id: item.id,
        hsCode: item.hs_code || 'Unknown',
        tariffRate: item.tariff_rate || 0,
        requirements: item.requirements || [],
        restrictions: item.restrictions || [],
        documentation: item.documentation || [],
        estimatedProcessingTime: item.estimated_processing_time || 'Unknown',
        confidence: item.confidence_score || 0,
        analysis: item.analysis_text || '',
        productImagePath: item.product_image_path,
        productImageUrl: item.product_image_url,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        completedAt: item.completed_at
      }));

      return {
        analyses,
        error: null
      };

    } catch (error) {
      console.error('Error fetching analyses:', error);
      return {
        analyses: [],
        error: `Failed to fetch analyses: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get a specific compliance analysis
   */
  static async getAnalysis(analysisId: string): Promise<ComplianceAnalysisResponse> {
    try {
      const { data, error } = await supabase
        .from('compliance_analyses')
        .select('*')
        .eq('id', analysisId)
        .single();

      if (error) {
        return {
          analysis: null,
          error: `Failed to fetch analysis: ${error.message}`
        };
      }

      const analysis: ComplianceAnalysisResult = {
        id: data.id,
        hsCode: data.hs_code || 'Unknown',
        tariffRate: data.tariff_rate || 0,
        requirements: data.requirements || [],
        restrictions: data.restrictions || [],
        documentation: data.documentation || [],
        estimatedProcessingTime: data.estimated_processing_time || 'Unknown',
        confidence: data.confidence_score || 0,
        analysis: data.analysis_text || '',
        productImagePath: data.product_image_path,
        productImageUrl: data.product_image_url,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        completedAt: data.completed_at
      };

      return {
        analysis,
        error: null
      };

    } catch (error) {
      console.error('Error fetching analysis:', error);
      return {
        analysis: null,
        error: `Failed to fetch analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Delete a compliance analysis and its associated image
   */
  static async deleteAnalysis(analysisId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get analysis to find image path
      const { data: analysis, error: fetchError } = await supabase
        .from('compliance_analyses')
        .select('product_image_path')
        .eq('id', analysisId)
        .single();

      if (fetchError) {
        return {
          success: false,
          error: `Failed to fetch analysis: ${fetchError.message}`
        };
      }

      // Delete image if exists
      if (analysis.product_image_path) {
        await ImageUploadService.deleteImage(analysis.product_image_path);
      }

      // Delete analysis record
      const { error: deleteError } = await supabase
        .from('compliance_analyses')
        .delete()
        .eq('id', analysisId);

      if (deleteError) {
        return {
          success: false,
          error: `Failed to delete analysis: ${deleteError.message}`
        };
      }

      return {
        success: true
      };

    } catch (error) {
      console.error('Error deleting analysis:', error);
      return {
        success: false,
        error: `Failed to delete analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
