"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GoogleLoginButton({
  onNewUser,
  onSuccess,
}: {
  onNewUser?: (email: string, name: string) => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: any) => {
    setError(null);

    try {
      const res = await fetch("/api/social-auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auth_token: credentialResponse.credential }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.error ?? "Google sign-in failed.");
        return;
      }

      const data = await res.json();
      // Cookies are set server-side — no localStorage needed

      if (data.is_new) {
        onNewUser?.(data.email ?? "", data.name ?? "");
      } else {
        onSuccess?.();
        router.refresh();
        // router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="flex flex-col gap-1.5">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError("Google Login Failed")}
          useOneTap={false}
          shape="rectangular"
          theme="outline"
          size="large"
          width="100%"
        />
        {error && <p className="text-center text-xs text-red-500">{error}</p>}
      </div>
    </GoogleOAuthProvider>
  );
}
