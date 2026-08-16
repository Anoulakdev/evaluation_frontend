"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { ManageDataView } from "@/components/managedata/ManageDataView";

export default function ManageDataPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-500 font-semibold text-sm animate-pulse">
              ກຳລັງໂຫຼດຂໍ້ມູນ...
            </div>
          }
        >
          <ManageDataView />
        </Suspense>
      </main>
    </div>
  );
}
