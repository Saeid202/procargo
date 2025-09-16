import { supabase } from "../lib/supabase";

export interface QuotationRequest {
  id: string;
  user_id: string;
  product_name: string;
  description: string;
  reference_links: string[];
  explanation_of_needs: string;
  quantity: number;
  status: "pending" | "in_progress" | "quoted" | "rejected" | "completed";
  agent_notes?: string;
  quoted_price?: number;
  quoted_currency: string;
  estimated_delivery_days?: number;
  created_at: string;
  updated_at: string;
}

export interface QuotationRequestFile {
  id: string;
  quotation_request_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export interface CreateQuotationRequestData {
  product_name: string;
  description: string;
  reference_links: string[];
  explanation_of_needs: string;
  quantity: number;
}

export class QuotationService {
  static async createQuotationRequest(
    userId: string,
    data: CreateQuotationRequestData
  ): Promise<{
    quotation: QuotationRequest | null;
    error?: string;
  }> {
    try {
      const { data: quotation, error } = await supabase
        .from("quotation_requests")
        .insert({
          user_id: userId,
          product_name: data.product_name,
          description: data.description,
          reference_links: data.reference_links,
          explanation_of_needs: data.explanation_of_needs,
          quantity: data.quantity,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating quotation request:", error);
        return {
          quotation: null,
          error: `Failed to create quotation request: ${error.message}`,
        };
      }

      console.log("Quotation request created successfully:", quotation);
      return { quotation };
    } catch (error) {
      console.error("Error creating quotation request:", error);
      return {
        quotation: null,
        error: `Failed to create quotation request: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  static async getUserQuotationRequests(userId: string): Promise<{
    quotations: QuotationRequest[];
    error?: string;
  }> {
    try {
      const { data: quotations, error } = await supabase
        .from("quotation_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching quotation requests:", error);
        return {
          quotations: [],
          error: `Failed to fetch quotation requests: ${error.message}`,
        };
      }

      return { quotations: quotations || [] };
    } catch (error) {
      console.error("Error fetching quotation requests:", error);
      return {
        quotations: [],
        error: `Failed to fetch quotation requests: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  static async uploadQuotationFile(
    quotationId: string,
    userId: string,
    file: File
  ): Promise<{
    file: QuotationRequestFile | null;
    error?: string;
  }> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${quotationId}/${Date.now()}.${fileExt}`;
      const filePath = `quotation-request-files/${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("quotation-request-files")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        return {
          file: null,
          error: `Failed to upload file: ${uploadError.message}`,
        };
      }

      const { data: fileRecord, error: dbError } = await supabase
        .from("quotation_request_files")
        .insert({
          quotation_request_id: quotationId,
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Error saving file metadata:", dbError);
        return {
          file: null,
          error: `Failed to save file metadata: ${dbError.message}`,
        };
      }

      console.log("File uploaded successfully:", fileRecord);
      return { file: fileRecord };
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        file: null,
        error: `Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  static async getQuotationFiles(quotationId: string): Promise<{
    files: QuotationRequestFile[];
    error?: string;
  }> {
    try {
      const { data: files, error } = await supabase
        .from("quotation_request_files")
        .select("*")
        .eq("quotation_request_id", quotationId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching quotation files:", error);
        return {
          files: [],
          error: `Failed to fetch quotation files: ${error.message}`,
        };
      }

      return { files: files || [] };
    } catch (error) {
      console.error("Error fetching quotation files:", error);
      return {
        files: [],
        error: `Failed to fetch quotation files: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  static async getFileDownloadUrl(filePath: string): Promise<{
    url: string | null;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.storage
        .from("quotation-request-files")
        .createSignedUrl(filePath, 3600);

      if (error) {
        console.error("Error creating download URL:", error);
        return {
          url: null,
          error: `Failed to create download URL: ${error.message}`,
        };
      }

      return { url: data.signedUrl };
    } catch (error) {
      console.error("Error creating download URL:", error);
      return {
        url: null,
        error: `Failed to create download URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  static async updateQuotationStatus(
    quotationId: string,
    status: QuotationRequest["status"],
    agentNotes?: string,
    quotedPrice?: number,
    estimatedDeliveryDays?: number
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const updateData: any = { status };

      if (agentNotes) updateData.agent_notes = agentNotes;
      if (quotedPrice) updateData.quoted_price = quotedPrice;
      if (estimatedDeliveryDays) updateData.estimated_delivery_days = estimatedDeliveryDays;

      const { error } = await supabase
        .from("quotation_requests")
        .update(updateData)
        .eq("id", quotationId);

      if (error) {
        console.error("Error updating quotation status:", error);
        return {
          success: false,
          error: `Failed to update quotation status: ${error.message}`,
        };
      }

      console.log("Quotation status updated successfully");
      return { success: true };
    } catch (error) {
      console.error("Error updating quotation status:", error);
      return {
        success: false,
        error: `Failed to update quotation status: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}