import { supabase } from "../lib/supabase";

export interface OtherRequest {
  id: string;
  user_id: string;
  description: string;
  contact_info?: string;
  urgency: "low" | "normal" | "high" | "urgent";
  status: "pending" | "in_progress" | "resolved" | "closed";
  admin_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOtherRequestData {
  description: string;
  contact_info?: string;
  urgency: "low" | "normal" | "high" | "urgent";
}

export class OtherRequestService {
  static async createOtherRequest(
    userId: string,
    data: CreateOtherRequestData
  ): Promise<{
    request: OtherRequest | null;
    error?: string;
  }> {
    try {
      const { data: request, error } = await supabase
        .from("other_requests")
        .insert({
          user_id: userId,
          description: data.description,
          contact_info: data.contact_info,
          urgency: data.urgency,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating other request:", error);
        return {
          request: null,
          error: `Failed to create request: ${error.message}`,
        };
      }

      console.log("Other request created successfully:", request);
      return { request };
    } catch (error) {
      console.error("Error creating other request:", error);
      return {
        request: null,
        error: `Failed to create request: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  static async getUserOtherRequests(userId: string): Promise<{
    requests: OtherRequest[];
    error?: string;
  }> {
    try {
      const { data: requests, error } = await supabase
        .from("other_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching other requests:", error);
        return {
          requests: [],
          error: `Failed to fetch requests: ${error.message}`,
        };
      }

      return { requests: requests || [] };
    } catch (error) {
      console.error("Error fetching other requests:", error);
      return {
        requests: [],
        error: `Failed to fetch requests: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  static async getAllOtherRequests(): Promise<{
    requests: OtherRequest[];
    error?: string;
  }> {
    try {
      const { data: requests, error } = await supabase
        .from("other_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all other requests:", error);
        return {
          requests: [],
          error: `Failed to fetch requests: ${error.message}`,
        };
      }

      return { requests: requests || [] };
    } catch (error) {
      console.error("Error fetching all other requests:", error);
      return {
        requests: [],
        error: `Failed to fetch requests: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  static async updateOtherRequestStatus(
    requestId: string,
    status: OtherRequest["status"],
    adminNotes?: string,
    assignedTo?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const updateData: any = { status };

      if (adminNotes) updateData.admin_notes = adminNotes;
      if (assignedTo) updateData.assigned_to = assignedTo;

      const { error } = await supabase
        .from("other_requests")
        .update(updateData)
        .eq("id", requestId);

      if (error) {
        console.error("Error updating other request status:", error);
        return {
          success: false,
          error: `Failed to update request status: ${error.message}`,
        };
      }

      console.log("Other request status updated successfully");
      return { success: true };
    } catch (error) {
      console.error("Error updating other request status:", error);
      return {
        success: false,
        error: `Failed to update request status: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}
