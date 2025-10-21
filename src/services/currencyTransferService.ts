import { supabase } from "../lib/supabase";

export interface CurrencyTransferRequest {
  id: string;
  user_id: string;
  transfer_type: string;
  amount: number;
  from_currency: string;
  to_currency: string;
  purpose: string;
  beneficiary_name: string;
  beneficiary_account: string;
  beneficiary_bank: string;
  additional_info?: string | null;
  customer_request: string;
  status?: "pending" | "in_review" | "processed" | "rejected";
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCurrencyTransferData {
  transfer_type: string;
  amount: number;
  from_currency: string;
  to_currency: string;
  purpose: string;
  beneficiary_name: string;
  beneficiary_account: string;
  beneficiary_bank: string;
  additional_info?: string;
  customer_request: string;
}

export interface CurrencyTransferResponse {
  id: string;
  transfer_id: string;
  agent_id: string | null;
  response: string;
  offered_rate?: number | null;
  fee?: number | null;
  delivery_date?: string | null;
  created_at?: string;
  agent?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    role: string | null;
  } | null;
}

export interface CreateCurrencyTransferResponseData {
  response: string;
  offered_rate?: number;
  fee?: number;
  delivery_date?: string;
}

export class CurrencyTransferService {
  static async createTransfer(
    userId: string,
    data: CreateCurrencyTransferData
  ): Promise<{ transfer: CurrencyTransferRequest | null; error?: string }> {
    try {
      const { data: transfer, error } = await supabase
        .from("currency_transfer_requests")
        .insert({
          user_id: userId,
          transfer_type: data.transfer_type,
          amount: data.amount,
          from_currency: data.from_currency,
          to_currency: data.to_currency,
          purpose: data.purpose,
          beneficiary_name: data.beneficiary_name,
          beneficiary_account: data.beneficiary_account,
          beneficiary_bank: data.beneficiary_bank,
          additional_info: data.additional_info || null,
          customer_request: data.customer_request,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating currency transfer request:", error);
        return { transfer: null, error: error.message };
      }

      return { transfer };
    } catch (err) {
      console.error("Unexpected error creating currency transfer:", err);
      return { transfer: null, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }

  static async getTransfersByUser(
    userId: string
  ): Promise<{ transfers: CurrencyTransferRequest[]; error?: string }> {
    try {
      const { data: transfers, error } = await supabase
        .from("currency_transfer_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user currency transfers:", error);
        return {
          transfers: [],
          error: `Failed to fetch transfers: ${error.message}`,
        };
      }

      return { transfers: transfers || [] };
    } catch (error) {
      console.error("Error fetching user currency transfers:", error);
      return {
        transfers: [],
        error: `Failed to fetch transfers: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  static async getAllTransfers(): Promise<{
    transfers: CurrencyTransferRequest[];
    error?: string;
  }> {
    try {
      const { data: transfers, error } = await supabase
        .from("currency_transfer_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all currency transfers:", error);
        return {
          transfers: [],
          error: `Failed to fetch transfers: ${error.message}`,
        };
      }

      return { transfers: transfers || [] };
    } catch (error) {
      console.error("Error fetching all currency transfers:", error);
      return {
        transfers: [],
        error: `Failed to fetch transfers: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  static async updateTransferStatus(
    transferId: string,
    status: NonNullable<CurrencyTransferRequest["status"]>,
    adminNotes?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const updateData: Record<string, any> = { status };
      if (adminNotes) updateData.admin_notes = adminNotes;

      const { error } = await supabase
        .from("currency_transfer_requests")
        .update(updateData)
        .eq("id", transferId);

      if (error) {
        console.error("Error updating currency transfer status:", error);
        return {
          success: false,
          error: `Failed to update transfer: ${error.message}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating currency transfer status:", error);
      return {
        success: false,
        error: `Failed to update transfer: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  static async createTransferResponse(
    transferId: string,
    agentId: string,
    data: CreateCurrencyTransferResponseData
  ): Promise<{ response: CurrencyTransferResponse | null; error?: string }> {
    try {
      const { data: response, error } = await supabase
        .from("currency_transfer_responses")
        .insert({
          transfer_id: transferId,
          agent_id: agentId,
          response: data.response,
          offered_rate:
            typeof data.offered_rate === "number" ? data.offered_rate : null,
          fee: typeof data.fee === "number" ? data.fee : null,
          delivery_date: data.delivery_date || null,
        })
        .select(
          `
          id,
          transfer_id,
          agent_id,
          response,
          offered_rate,
          fee,
          delivery_date,
          created_at,
          agent:profiles!currency_transfer_responses_agent_id_fkey (
            id,
            first_name,
            last_name,
            email,
            role
          )
        `
        )
        .single();

      if (error) {
        console.error("Error creating currency transfer response:", error);
        return { response: null, error: error.message };
      }

      return {
        response: (response as unknown as CurrencyTransferResponse) || null,
      };
    } catch (err) {
      console.error("Unexpected error creating currency transfer response:", err);
      return {
        response: null,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  static async getResponsesForTransfers(
    transferIds: string[]
  ): Promise<{ responses: CurrencyTransferResponse[]; error?: string }> {
    if (!transferIds.length) {
      return { responses: [] };
    }

    try {
      const uniqueIds = Array.from(new Set(transferIds));
      const { data: responses, error } = await supabase
        .from("currency_transfer_responses")
        .select(
          `
          id,
          transfer_id,
          agent_id,
          response,
          offered_rate,
          fee,
          delivery_date,
          created_at,
          agent:profiles!currency_transfer_responses_agent_id_fkey (
            id,
            first_name,
            last_name,
            email,
            role
          )
        `
        )
        .in("transfer_id", uniqueIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching currency transfer responses:", error);
        return {
          responses: [],
          error: `Failed to fetch responses: ${error.message}`,
        };
      }

      return {
        responses: ((responses || []) as unknown as CurrencyTransferResponse[]) || [],
      };
    } catch (error) {
      console.error("Error fetching currency transfer responses:", error);
      return {
        responses: [],
        error: `Failed to fetch responses: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

