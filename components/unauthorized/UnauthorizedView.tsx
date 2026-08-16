"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldAlert, ArrowLeft, LogIn, Home, Lock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export function UnauthorizedView() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
        {/* Warning Icon Badge */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-10 h-10 animate-pulse" />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Error Details */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
            ບໍ່ມີສິດເຂົ້າເຖິງ (Unauthorized)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ການເຂົ້າເຖິງຖືກປະຕິເສດ
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
            ຂໍອະໄພ ບັນຊີຂອງທ່ານບໍ່ມີສິດທິໃນການເຂົ້າເຖິງໜ້ານີ້. ສິດທິນີ້ຖືກກຳນົດສະເພາະຜູ້ເບິ່ງແຍງລະບົບ.
          </p>
        </div>

        {/* User Info Capsule (if logged in) */}
        {user && (
          <div className="py-2.5 px-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
            <span>ບັນຊີປັດຈຸບັນ:</span>
            <span className="font-bold text-slate-200">
              {user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.username}
              <span className="ml-1.5 text-sky-400 font-mono">
                (Role #{user.roleId})
              </span>
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>ກັບຄືນສູ່ໜ້າຫຼັກ</span>
          </Link>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-500">
          ຫາກທ່ານຕ້ອງການສິດທິເພີ່ມເຕີມ ກະລຸນາຕິດຕໍ່ຝ່າຍ IT / Admin ຂອງ EDL
        </p>
      </div>
    </div>
  );
}
