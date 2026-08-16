"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { axiosInstance } from "@/lib/axiosInstance";
import { encryptData } from "@/lib/crypto";

export interface RoleItem {
  id: number;
  name: string;
}

export function EvaluateRoleView() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, []);

  const fetchSelectRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get<RoleItem[]>("/roles/selectrole");
      setRoles(res.data || []);
    } catch (err: any) {
      console.error("Failed to fetch select roles:", err);
      setError(
        err?.response?.data?.message ||
        "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນສິດທິການປະເມີນໄດ້ ກະລຸນາລອງໃໝ່"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectRoles();
  }, []);

  const getRoleIcon = (id: number) => {
    switch (id) {
      case 1:
        return <ShieldCheck className="w-7 h-7 text-rose-600" />;
      case 2:
        return <Users className="w-7 h-7 text-purple-600" />;
      case 3:
        return <Users className="w-7 h-7 text-indigo-600" />;
      case 4:
        return <Users className="w-7 h-7 text-blue-600" />;
      case 5:
        return <Users className="w-7 h-7 text-sky-600" />;
      case 6:
        return <Users className="w-7 h-7 text-teal-600" />;
      case 7:
        return <Users className="w-7 h-7 text-emerald-600" />;
      case 8:
        return <Users className="w-7 h-7 text-amber-600" />;
      case 9:
        return <Users className="w-7 h-7 text-slate-600" />;
      default:
        return <Users className="w-7 h-7 text-sky-600" />;
    }
  };

  const handleSelectRole = (role: RoleItem) => {
    setSelectedRoleId(role.id);
    const encryptedRoleId = encryptData(role.id);
    router.push(`/evaluateuser?roleId=${encryptedRoleId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-800 via-sky-700 to-blue-900 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-8 h-8 text-sky-300 shrink-0" />
            ເລືອກການປະເມີນ
          </h1>

          {user && (
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-sky-200 font-medium">
              <span className="bg-sky-950/60 px-3 py-1 rounded-lg border border-sky-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ຜູ້ປະເມີນ: <strong className="text-white">{user.first_name || user.username} {user.last_name || ""}</strong>
              </span>
              <span className="bg-sky-950/60 px-3 py-1 rounded-lg border border-sky-400/30">
                ສິດຜູ້ໃຊ້: <strong className="text-sky-300">{user.role?.name || `RoleId #${user.roleId}`}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                <div className="w-16 h-6 rounded-full bg-slate-200" />
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
              </div>
              <div className="h-9 bg-slate-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3 text-center max-w-lg mx-auto my-8">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-base">ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ</h3>
          <p className="text-xs text-rose-600">{error}</p>
          <button
            onClick={fetchSelectRoles}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
          >
            ລອງໃໝ່ອີກຄັ້ງ
          </button>
        </div>
      ) : roles.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">ບໍ່ພົບຂໍ້ມູນບົດບາດການປະເມີນ</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            ທ່ານບໍ່ມີສິດທິໃນການເລືອກບົດບາດປະເມີນໃນປະຈຸບັນ
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const isSelected = selectedRoleId === role.id;
            return (
              <div
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`group relative p-5 rounded-2xl bg-white border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 cursor-pointer ${isSelected
                  ? "border-sky-500 ring-2 ring-sky-400/20 bg-sky-50/30"
                  : "border-slate-200/90 hover:border-sky-300 hover:bg-slate-50/50"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-slate-100/80 group-hover:bg-sky-100/80 transition-colors">
                    {getRoleIcon(role.id)}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-700 transition-colors flex items-center justify-between">
                    <span>{role.name}</span>
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600 group-hover:text-sky-700">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                    ພ້ອມດຳເນີນການ
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">
                    ເລືອກປະເມີນ <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
