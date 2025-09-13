import { supabase } from "../lib/supabase";


export interface ContactMessage {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  contactMessage: ContactMessage | null;
  error: string | null;
}

export class ContactService {
  static async createContactMessage(contactMessage: ContactMessage): Promise<ContactMessageResponse> {
    const { data, error } = await supabase.from("contact_messages").insert(contactMessage);
    if (error) return { contactMessage: null, error: error.message };
    return { contactMessage: data, error: null };
  }
}