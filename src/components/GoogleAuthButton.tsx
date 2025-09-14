"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Add type for window.google
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            options: { theme: string; size: string }
          ) => void;
        };
      };
    };
  }
}

interface GoogleJwtUser {
  email: string;
  name: string;
  sub: string;
}

export default function GoogleAuthButton() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeGoogle = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
        callback: async (response: { credential: string }) => {
          try {
            const user = jwtDecode<GoogleJwtUser>(response.credential);

            const res = await fetch("/api/googleauth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                provider: "google",
                providerId: user.sub,
                idToken: response.credential,
              }),
            });

            const data = await res.json();
            if (data.access_token) {
              localStorage.setItem("authToken", data.access_token);
              router.push("/");
            } else {
              console.error("Google login failed", data);
            }
          } catch (err) {
            console.error("Google login error:", err);
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-login-btn"),
        { theme: "outline", size: "large" }
      );
    };

    // Try init immediately, then again after short delay (in case script is still loading)
    initializeGoogle();
    setTimeout(initializeGoogle, 1000);
  }, [router]);

  return <div id="google-login-btn" className="flex justify-center mt-4"></div>;
}
