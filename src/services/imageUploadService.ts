import { supabase } from "../lib/supabase";

export interface ImageUploadResult {
  success: boolean;
  imagePath?: string;
  imageUrl?: string;
  error?: string;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export class ImageUploadService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ["image/jpeg", "image/png"];
  private static readonly BUCKET_NAME = "compliance-images";

  /**
   * Validate image file before upload
   */
  static validateImage(file: File): ImageValidationResult {
    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: "Only JPG and PNG images are allowed",
      };
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: "File size must be less than 10MB",
      };
    }

    return { isValid: true };
  }

  /**
   * Upload image to Supabase Storage
   */
  static async uploadImage(
    file: File,
    userId: string,
    analysisId: string
  ): Promise<ImageUploadResult> {
    try {
      // Validate image first
      const validation = this.validateImage(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${analysisId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${analysisId}/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        return {
          success: false,
          error: `Upload failed: ${error.message}`,
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        success: true,
        imagePath: filePath,
        imageUrl: urlData.publicUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: `Upload error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Delete image from Supabase Storage
   */
  static async deleteImage(imagePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([imagePath]);

      return !error;
    } catch (error) {
      console.error("Delete image error:", error);
      return false;
    }
  }

  /**
   * Convert image to base64 for GPT Vision API
   */
  static async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
