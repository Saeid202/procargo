import { supabase } from "../lib/supabase";

export interface CompanyVerificationRequest {
  id: string;
  user_id: string;
  company_name_english?: string | null;
  company_name_chinese?: string | null;
  business_license?: string | null;
  status?: "pending" | "in_review" | "verified" | "rejected";
  created_at?: string;
  updated_at?: string;
}

export interface CompanyVerificationFile {
  id: string;
  verification_request_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export interface CreateCompanyVerificationData {
  company_name_english?: string;
  company_name_chinese?: string;
  business_license?: string;
}

export class CompanyVerificationService {
  static async createVerificationRequest(
    userId: string,
    data: CreateCompanyVerificationData
  ): Promise<{ request: CompanyVerificationRequest | null; error?: string }> {
    try {
      const { data: request, error } = await supabase
        .from("company_verification_requests")
        .insert({
          user_id: userId,
          company_name_english: data.company_name_english || null,
          company_name_chinese: data.company_name_chinese || null,
          business_license: data.business_license || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating company verification request:", error);
        return { request: null, error: error.message };
      }

      return { request };
    } catch (err) {
      console.error("Unexpected error creating company verification request:", err);
      return {
        request: null,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  static async uploadFile(
    userId: string,
    verificationRequestId: string,
    file: File
  ): Promise<{ fileRecord: CompanyVerificationFile | null; error?: string }> {
    try {
      const filePath = `${userId}/${verificationRequestId}/${Date.now()}_${file.name}`;

      const { error: storageError } = await supabase.storage
        .from("company-verification-files")
        .upload(filePath, file);

      if (storageError) {
        console.error("Error uploading verification file:", storageError);
        return { fileRecord: null, error: storageError.message };
      }

      const { data: fileRecord, error: dbError } = await supabase
        .from("company_verification_files")
        .insert({
          verification_request_id: verificationRequestId,
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Error saving verification file record:", dbError);
        return { fileRecord: null, error: dbError.message };
      }

      return { fileRecord };
    } catch (err) {
      console.error("Unexpected error uploading verification file:", err);
      return {
        fileRecord: null,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
}


