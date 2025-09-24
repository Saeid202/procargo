import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { SupabaseService } from "../../services/supabaseService";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const hasCode = !!currentUrl.searchParams.get("code");
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, "")
        );
        const hasAccessToken =
          hashParams.has("access_token") && hashParams.has("refresh_token");

        // OAuth/PKCE flow
        if (hasCode) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(window.location.href);
          if (exchangeError) {
            setError(exchangeError.message);
            setMessage("");
            return;
          }
        }

        // Email confirm / magic link flow
        if (!hasCode && hasAccessToken) {
          const access_token = hashParams.get("access_token") as string;
          const refresh_token = hashParams.get("refresh_token") as string;
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (setSessionError) {
            setError(setSessionError.message);
            setMessage("");
            return;
          }
        }

        // If neither flow matched, surface upstream error if present
        if (!hasCode && !hasAccessToken) {
          const upstreamError =
            hashParams.get("error_description") || hashParams.get("error");
          if (upstreamError) {
            setError(upstreamError);
            setMessage("");
            return;
          }
        }

        const session = (await supabase.auth.getSession()).data.session;

        if (!session?.user) {
          setError("No authenticated user found after verification.");
          setMessage("");
          return;
        }

        // Ensure profile exists; create if missing
        const { profile } = await SupabaseService.getProfile(session.user.id);
        if (!profile) {
          const userMeta = session.user.user_metadata || {};
          await SupabaseService.createProfile(session.user.id, {
            first_name: userMeta.first_name || "",
            last_name: userMeta.last_name || "",
            phone: userMeta.phone || null,
            company_name: userMeta.company_name || "",
            email: session.user.email || null,
          });
        }

        setMessage("Email verified! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } catch (err: any) {
        setError(err?.message || "Unexpected error during verification");
        setMessage("");
      }
    };

    handleCallback();
  }, [navigate]);

  useEffect(() => {
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-6 text-center">
        {message && (
          <div className="text-gray-800 font-medium mb-2">{message}</div>
        )}
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>
    </div>
  );
};

export default AuthCallback;
