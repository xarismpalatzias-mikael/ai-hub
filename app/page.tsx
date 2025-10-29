export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>AI Hub</h1>
      <p>✅ Home page working</p>
      <p>
        <a href="/api/health">Health</a> •{" "}
        <a href="/api/auth/session">Session</a> •{" "}
        <a href="/api/auth/signin">Sign in</a> •{" "}
        <a href="/admin">Admin</a>
      </p>
    </main>
  );
}
