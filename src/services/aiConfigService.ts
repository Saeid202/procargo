import { supabase } from '../lib/supabase';

export interface AIConfiguration {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  systemRole: string;
  analysisDepth: 'basic' | 'detailed' | 'expert';
  temperature: number;
  maxTokens: number;
  categoryInstructions: Record<string, string>;
  focusAreas: string[];
  customInstructions: string;
  responseFormat: 'json' | 'text' | 'structured';
  validationRules: string[];
  fallbackBehavior: 'retry' | 'simplify' | 'error';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AIConfigResponse {
  config: AIConfiguration | null;
  error: string | null;
}

export class AIConfigService {
  /**
   * Get the active AI configuration
   */
  static async getActiveConfig(): Promise<AIConfigResponse> {
    try {
      const { data, error } = await supabase
        .from('ai_configurations')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (error) {
        return {
          config: null,
          error: `Failed to fetch AI configuration: ${error.message}`
        };
      }

      // If no active configuration found, return null without error
      if (!data || data.length === 0) {
        return {
          config: null,
          error: null
        };
      }

      return {
        config: data[0],
        error: null
      };
    } catch (error) {
      console.error('Error fetching AI config:', error);
      return {
        config: null,
        error: `Failed to fetch AI configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get all AI configurations (admin only)
   */
  static async getAllConfigs(): Promise<{
    configs: AIConfiguration[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('ai_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          configs: [],
          error: `Failed to fetch AI configurations: ${error.message}`
        };
      }

      return {
        configs: data || [],
        error: null
      };
    } catch (error) {
      console.error('Error fetching AI configs:', error);
      return {
        configs: [],
        error: `Failed to fetch AI configurations: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create a new AI configuration (admin only)
   */
  static async createConfig(config: Omit<AIConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIConfigResponse> {
    try {
      const { data, error } = await supabase
        .from('ai_configurations')
        .insert({
          name: config.name,
          description: config.description,
          is_active: config.isActive,
          system_role: config.systemRole,
          analysis_depth: config.analysisDepth,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          category_instructions: config.categoryInstructions,
          focus_areas: config.focusAreas,
          custom_instructions: config.customInstructions,
          response_format: config.responseFormat,
          validation_rules: config.validationRules,
          fallback_behavior: config.fallbackBehavior,
          created_by: config.createdBy
        })
        .select()
        .single();

      if (error) {
        return {
          config: null,
          error: `Failed to create AI configuration: ${error.message}`
        };
      }

      return {
        config: data,
        error: null
      };
    } catch (error) {
      console.error('Error creating AI config:', error);
      return {
        config: null,
        error: `Failed to create AI configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update an AI configuration (admin only)
   */
  static async updateConfig(id: string, updates: Partial<AIConfiguration>): Promise<AIConfigResponse> {
    try {
      const { data, error } = await supabase
        .from('ai_configurations')
        .update({
          name: updates.name,
          description: updates.description,
          is_active: updates.isActive,
          system_role: updates.systemRole,
          analysis_depth: updates.analysisDepth,
          temperature: updates.temperature,
          max_tokens: updates.maxTokens,
          category_instructions: updates.categoryInstructions,
          focus_areas: updates.focusAreas,
          custom_instructions: updates.customInstructions,
          response_format: updates.responseFormat,
          validation_rules: updates.validationRules,
          fallback_behavior: updates.fallbackBehavior,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          config: null,
          error: `Failed to update AI configuration: ${error.message}`
        };
      }

      return {
        config: data,
        error: null
      };
    } catch (error) {
      console.error('Error updating AI config:', error);
      return {
        config: null,
        error: `Failed to update AI configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Set active configuration (admin only)
   */
  static async setActiveConfig(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, deactivate all configurations
      await supabase
        .from('ai_configurations')
        .update({ is_active: false })
        .neq('id', id);

      // Then activate the selected one
      const { error } = await supabase
        .from('ai_configurations')
        .update({ is_active: true })
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: `Failed to set active configuration: ${error.message}`
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting active config:', error);
      return {
        success: false,
        error: `Failed to set active configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Delete an AI configuration (admin only)
   */
  static async deleteConfig(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ai_configurations')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: `Failed to delete AI configuration: ${error.message}`
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting AI config:', error);
      return {
        success: false,
        error: `Failed to delete AI configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
