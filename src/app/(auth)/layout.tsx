// app/(auth)/layout.tsx
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  // Auth layout: no Navbar here
  return (
    <div className="min-h-screen bg-base-200">
      {/* header / logo for auth pages if you want */}
      <main>{children}</main>
    </div>
  );
}
