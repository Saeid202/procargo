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
}


