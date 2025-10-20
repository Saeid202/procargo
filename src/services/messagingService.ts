import { supabase } from "../lib/supabase";

export interface MessagingProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
}

export interface DirectMessageThreadMember {
  user_id: string;
  is_admin: boolean;
  joined_at: string;
  last_read_at: string | null;
  profile: MessagingProfile | null;
}

export interface DirectMessageThread {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_group: boolean;
  title: string | null;
  metadata: Record<string, unknown>;
  last_message_at: string | null;
  last_message_preview: string | null;
  members: DirectMessageThreadMember[];
}

export interface DirectMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  metadata: Record<string, unknown>;
  sender?: MessagingProfile | null;
}

export class MessagingService {
  static async listPotentialRecipients(currentUserId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, role")
      .neq("id", currentUserId)
      .order("first_name", { ascending: true });

    return { data, error };
  }

  static async createOrGetDirectThread(targetUserId: string) {
    const { data, error } = await supabase.rpc("create_or_get_direct_thread", {
      target_user: targetUserId,
    });

    return { data, error };
  }

  static async fetchThreads(): Promise<{
    data: DirectMessageThread[] | null;
    error: any;
  }> {
    const { data, error } = await supabase
      .from("direct_message_threads")
      .select(
        `
        id,
        created_at,
        updated_at,
        created_by,
        is_group,
        title,
        metadata,
        last_message_at,
        last_message_preview,
        members:direct_message_thread_members (
          user_id,
          is_admin,
          joined_at,
          last_read_at,
          profile:profiles (
            id,
            first_name,
            last_name,
            email,
            role
          )
        )
      `
      )
      .order("last_message_at", { ascending: false })
      .order("updated_at", { ascending: false });

    return { data: (data as unknown as DirectMessageThread[]) || null, error };
  }

  static async fetchThreadById(
    threadId: string
  ): Promise<{ data: DirectMessageThread | null; error: any }> {
    const { data, error } = await supabase
      .from("direct_message_threads")
      .select(
        `
        id,
        created_at,
        updated_at,
        created_by,
        is_group,
        title,
        metadata,
        last_message_at,
        last_message_preview,
        members:direct_message_thread_members (
          user_id,
          is_admin,
          joined_at,
          last_read_at,
          profile:profiles (
            id,
            first_name,
            last_name,
            email,
            role
          )
        )
      `
      )
      .eq("id", threadId)
      .single();

    return { data: (data as unknown as DirectMessageThread) || null, error };
  }

  static async fetchMessages(
    threadId: string,
    { limit = 100, before }: { limit?: number; before?: string } = {}
  ): Promise<{ data: DirectMessage[] | null; error: any }> {
    let query = supabase
      .from("direct_messages")
      .select(
        `
        id,
        thread_id,
        sender_id,
        body,
        created_at,
        metadata,
        sender:profiles!direct_messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          email,
          role
        )
      `
      )
      .eq("thread_id", threadId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt("created_at", before);
    }

    const { data, error } = await query;

    const normalized = ((data as unknown as DirectMessage[]) || []).reverse();
    return { data: normalized, error };
  }

  static async sendMessage(threadId: string, body: string) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError || new Error("Not authenticated") };
    }

    const { data, error } = await supabase
      .from("direct_messages")
      .insert([
        {
          thread_id: threadId,
          sender_id: user.id,
          body,
        },
      ])
      .select(
        `
        id,
        thread_id,
        sender_id,
        body,
        created_at,
        metadata,
        sender:profiles!direct_messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          email,
          role
        )
      `
      )
      .single();

    return { data: (data as unknown as DirectMessage) || null, error };
  }

  static async markThreadRead(threadId: string) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError || new Error("Not authenticated") };
    }

    const { data, error } = await supabase
      .from("direct_message_thread_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("thread_id", threadId)
      .eq("user_id", user.id)
      .select()
      .single();

    return { data, error };
  }

  static subscribeToThreadMessages(
    threadId: string,
    onChange: (message: DirectMessage) => void
  ) {
    const channel = supabase
      .channel(`direct-messages-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          onChange(payload.new as DirectMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  static subscribeToThreadListUpdates(onUpdate: () => void) {
    const channel = supabase
      .channel("direct-threads")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_message_threads",
        },
        () => {
          onUpdate();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_message_thread_members",
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
