// app/(site)/layout.tsx
import type { ReactNode } from "react";
import Navbar from "./frontend_components/navbar";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <main className="flex-1 ">{children}</main>
      <Navbar />
    </div>
  );
}
