"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleLogin = () => {
    // After Google login, send the user back to /admin
    signIn("google", { callbackUrl: "/admin" });
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Login</h1>
      <p style={{ marginBottom: "1rem" }}>
        Please sign in to access the admin panel.
      </p>
      <button
        onClick={handleLogin}
        style={{
          padding: "0.6rem 1.2rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        Sign in with Google
      </button>
    </main>
  );
}
