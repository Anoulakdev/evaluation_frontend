"use client";

import { Navbar } from "@/components/Navbar";
import { UserList } from "@/components/users/UserList";

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <UserList />
      </main>
    </div>
  );
}
