export const metadata = { title: "AI Hub", description: "Fresh start clean build" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
