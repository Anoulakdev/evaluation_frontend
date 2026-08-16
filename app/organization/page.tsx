"use client";

import { Navbar } from "@/components/Navbar";
import { OrganizationView } from "@/components/organization/OrganizationView";

export default function OrganizationPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <OrganizationView />
      </main>
    </div>
  );
}
