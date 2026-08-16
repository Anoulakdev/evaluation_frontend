"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { AllTotalScoreView } from "@/components/alltotalscore/AllTotalScoreView";
import { RefreshCw } from "lucide-react";

export default function AllTotalScorePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12 text-slate-400 gap-2 font-bold text-xs">
              <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
              <span>ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
            </div>
          }
        >
          <AllTotalScoreView />
        </Suspense>
      </main>
    </div>
  );
}
