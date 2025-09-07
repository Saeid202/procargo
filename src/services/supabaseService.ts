import { supabase, Profile } from "../lib/supabase";
import {
  OrderFormData,
  Supplier,
  SupplierLink,
} from "../pages/dashboard/OrdersPage";

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName: string;
}

export interface AuthResponse {
  user: any;
  error: string | null;
}

export class SupabaseService {
  // Sign up with email and password, send verification link with redirect
  static async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: metadata || {},
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || "An error occurred during signup",
      };
    }
  }

  // Create profile in profiles table
  static async createProfile(
    userId: string,
    profileData: Omit<Profile, "id" | "created_at" | "updated_at" | "role">
  ): Promise<{ profile: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            phone: profileData.phone,
            company_name: profileData.company_name,
            email: profileData.email,
            //TODO: We should create this email account and confirm it for real agent.
            role: profileData.email == "agent@procargo.com" ? "AGENT" : "USER",
          },
        ])
        .select()
        .single();

      if (error) {
        return { profile: null, error: error.message };
      }

      return { profile: data, error: null };
    } catch (error: any) {
      return {
        profile: null,
        error: error.message || "An error occurred while creating profile",
      };
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || "An error occurred during signin",
      };
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || "An error occurred during signout" };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<{ user: any; error: string | null }> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        return { user: null, error: error.message };
      }

      return { user, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || "An error occurred while getting user",
      };
    }
  }

  // Get profile by user ID
  static async getProfile(
    userId: string
  ): Promise<{ profile: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        return { profile: null, error: error.message };
      }

      return { profile: data, error: null };
    } catch (error: any) {
      return {
        profile: null,
        error: error.message || "An error occurred while getting profile",
      };
    }
  }

  static async createOrder(
    userId: string,
    formData: OrderFormData,
    orderNumber: string
  ) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            user_id: userId,
            order_number: orderNumber,
            status: "Pending",
            priority: formData.priority,
            origin_country: formData.origin_country,
            destination_country: formData.destination_country,
            total_value: formData.total_value,
            currency: formData.currency,
            estimated_delivery: formData.estimated_delivery || null,
          },
        ])
        .select()
        .single();
      if (error) return { order: null, error: error.message };

      return { order: data, error: null };
    } catch (err: any) {
      return { order: null, error: err.message || "Failed to create order" };
    }
  }

  static async getAgentOrders() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
        *,
        suppliers (
          *,
          supplier_links (*),
          supplier_files (*)
        )
      `
        )
        .order("created_at", { ascending: false });

      if (error) {
        return { orders: null, error: error.message };
      }

      return { orders: data, error: null };
    } catch (err: any) {
      return { orders: null, error: err.message || "Failed to fetch orders" };
    }
  }

  // Create supplier
  static async createSupplier(orderId: string, supplier: Supplier) {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .insert([
          {
            order_id: orderId,
            product_name: supplier.product_name,
            quantity: supplier.quantity,
            unit_type: supplier.unit_type,
            unit_price: supplier.unit_price,
            logistics_type: supplier.logistics_type,
            special_instructions: supplier.special_instructions,
            notes: supplier.notes,
          },
        ])
        .select()
        .single();

      if (error) return { supplier: null, error: error.message };

      return { supplier: data, error: null };
    } catch (err: any) {
      return {
        supplier: null,
        error: err.message || "Failed to create supplier",
      };
    }
  }

  // Create supplier links
  static async createSupplierLinks(supplierId: string, links: SupplierLink[]) {
    try {
      const payload = links.map((link) => ({
        supplier_id: supplierId,
        url: link.url,
        description: link.description,
        quantity: link.quantity,
      }));

      const { error } = await supabase.from("supplier_links").insert(payload);

      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to create supplier links" };
    }
  }

  // Upload supplier files
  static async uploadSupplierFiles(
    orderId: string,
    supplierId: string,
    files: File[]
  ) {
    try {
      await Promise.all(
        files.map(async (file) => {
          const filePath = `${orderId}/${supplierId}/${file.name}`;

          // Upload file to storage
          const { error: uploadError } = await supabase.storage
            .from("supplier_files")
            .upload(filePath, file, { upsert: false, cacheControl: "3600" });

          if (uploadError) throw uploadError;

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("supplier_files").getPublicUrl(filePath);

          // Save metadata
          const { error: dbError } = await supabase
            .from("supplier_files")
            .insert([
              {
                supplier_id: supplierId,
                file_name: file.name,
                file_url: publicUrl,
                file_type: file.type,
              },
            ]);

          if (dbError) throw dbError;
        })
      );

      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to upload supplier files" };
    }
  }
}
