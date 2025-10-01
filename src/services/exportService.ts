import { supabase } from "../lib/supabase";

export interface ExportRequest {
  id: string;
  user_id: string;
  company_name?: string | null;
  company_type?: string | null;
  company_introduction?: string | null;
  product_name?: string | null;
  product_description?: string | null;
  additional_info?: string | null;
  status?: "pending" | "in_review" | "processed" | "rejected";
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExportRequestFile {
  id: string;
  export_request_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export interface CreateExportRequestData {
  company_name: string;
  company_type: string;
  company_introduction: string;
  product_name: string;
  product_description: string;
  additional_info: string;
}

export class ExportService {
  static async createExportRequest(userId: string, data: CreateExportRequestData): Promise<{ export: ExportRequest | null; error?: string }> {
    try {
        const { data: exportRequest, error } = await supabase
        .from("export_requests")
        .insert({
          user_id: userId,
          company_name: data.company_name,
          company_type: data.company_type,
          company_introduction: data.company_introduction,
          product_name: data.product_name,
          product_description: data.product_description,
          additional_info: data.additional_info,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating export request:", error);
        return { export: null, error: error.message };
      }

      return { export: exportRequest };
    } catch (error) {
        console.error("Error creating export request:", error);
        return { export: null, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  static async uploadFile(
    userId: string,
    exportRequestId: string,
    file: File
  ): Promise<{ fileRecord: ExportRequestFile | null; error?: string }> {
    try {
      // Upload to Supabase Storage
      const filePath = `${userId}/${exportRequestId}/${Date.now()}_${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("export_files")
        .upload(filePath, file);

      if (storageError) {
        console.error("Error uploading file:", storageError);
        return { fileRecord: null, error: storageError.message };
      }

      // Save metadata in DB
      const { data: fileRecord, error: dbError } = await supabase
        .from("export_request_files")
        .insert({
          export_request_id: exportRequestId,
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Error saving file record:", dbError);
        return { fileRecord: null, error: dbError.message };
      }

      return { fileRecord };
    } catch (err) {
      console.error("Unexpected error uploading file:", err);
      return { fileRecord: null, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }

  static async getAllExportRequests(): Promise<{
    exports: ExportRequest[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("export_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching export requests:", error);
        return { exports: [], error: `Failed to fetch exports: ${error.message}` };
      }

      return { exports: data || [] };
    } catch (error) {
      console.error("Error fetching export requests:", error);
      return { exports: [], error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  static async getExportRequestFiles(exportRequestId: string): Promise<{
    files: ExportRequestFile[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("export_request_files")
        .select("*")
        .eq("export_request_id", exportRequestId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching export files:", error);
        return { files: [], error: `Failed to fetch files: ${error.message}` };
      }

      return { files: data || [] };
    } catch (error) {
      console.error("Error fetching export files:", error);
      return { files: [], error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  static getFilePublicUrl(filePath: string): string | null {
    try {
      const { data } = supabase.storage.from("export_files").getPublicUrl(filePath);
      return data?.publicUrl || null;
    } catch (error) {
      console.error("Error getting public URL:", error);
      return null;
    }
  }
}