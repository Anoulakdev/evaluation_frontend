"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  ArrowLeft,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { axiosInstance } from "@/lib/axiosInstance";
import { decryptData, encryptData } from "@/lib/crypto";

export interface EvaluateUserItem {
  id: number;
  first_name: string | null;
  last_name: string | null;
  emp_code: string | null;
  empimg?: string | null;
  isEvaluated?: boolean;
}

export function EvaluateUserView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const [usersList, setUsersList] = useState<EvaluateUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decryptedRoleId, setDecryptedRoleId] = useState<number | null>(null);
  const [targetRoleName, setTargetRoleName] = useState<string | null>(null);
  const [evaluatedMap, setEvaluatedMap] = useState<Record<number, boolean>>({});

  // Decrypt roleId query param
  useEffect(() => {
    const rawRoleId = searchParams.get("roleId");
    if (rawRoleId) {
      const decryptedStr = decryptData(rawRoleId);
      const parsedRoleId = Number(decryptedStr);
      if (!isNaN(parsedRoleId) && parsedRoleId > 0) {
        setDecryptedRoleId(parsedRoleId);
      } else {
        setError("ລະຫັດສິດທິບໍ່ຖືກຕ້ອງ ຫຼື ຖອດລະຫັດບໍ່ສຳເລັດ");
        setLoading(false);
      }
    } else {
      setError("ບໍ່ພົບລະຫັດສິດທິໃນການປະເມີນ");
      setLoading(false);
    }
  }, [searchParams]);

  // Fetch users from API /users/getuser?roleId=... and check evaluation status
  const fetchUsersToEvaluate = async () => {
    if (!decryptedRoleId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get<EvaluateUserItem[]>(
        `/users/getuser?roleId=${decryptedRoleId}`
      );
      const users = res.data || [];
      setUsersList(users);

      const statusMap: Record<number, boolean> = {};
      users.forEach((item) => {
        statusMap[item.id] = !!item.isEvaluated;
      });
      setEvaluatedMap(statusMap);
    } catch (err: any) {
      console.error("Failed to fetch users to evaluate:", err);
      setError(
        err?.response?.data?.message ||
        "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນພະນັກງານໄດ້ ກະລຸນາລອງໃໝ່"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (decryptedRoleId) {
      fetchUsersToEvaluate();
      // Fetch select roles to obtain the target role name
      axiosInstance
        .get<{ id: number; name: string }[]>("/roles/selectrole")
        .then((res) => {
          const found = res.data?.find((r) => r.id === decryptedRoleId);
          if (found) {
            setTargetRoleName(found.name);
          }
        })
        .catch(() => { });
    }
  }, [decryptedRoleId]);

  const handleStartEvaluation = (targetUser: EvaluateUserItem) => {
    if (evaluatedMap[targetUser.id]) return;
    const encryptedEvalId = encryptData(targetUser.id);
    const encryptedRoleId = encryptData(decryptedRoleId!);
    router.push(`/scores?evalId=${encryptedEvalId}&roleId=${encryptedRoleId}`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-800 via-sky-700 to-blue-900 p-6 sm:p-8 text-white shadow-xl shadow-sky-900/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Users className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => router.push("/evaluaterole")}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-bold transition-all border border-white/20 text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              ກັບຄືນ
            </button>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
              <UserCheck className="w-8 h-8 sm:w-9 sm:h-9 text-sky-300 shrink-0" />
              ເລືອກພະນັກງານເພື່ອປະເມີນ
            </h1>
          </div>

          {user && (
            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-sky-200 font-medium">
              <span className="bg-sky-950/60 px-3.5 py-1.5 rounded-xl border border-sky-400/30 flex items-center gap-2 backdrop-blur-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ຜູ້ປະເມີນ: <strong className="text-white">{user.first_name || user.username} {user.last_name || ""}</strong>
              </span>
              {decryptedRoleId && (
                <span className="bg-sky-950/60 px-3.5 py-1.5 rounded-xl border border-sky-400/30 backdrop-blur-sm">
                  ປະເມີນ: <strong className="text-sky-300">{targetRoleName || `RoleId #${decryptedRoleId}`}</strong>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content List Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-pulse"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
              <div className="h-9 bg-slate-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-rose-50/80 border border-rose-200 text-rose-800 space-y-4 text-center max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base">ເກີດຂໍ້ຜິດພາດ</h3>
            <p className="text-xs text-rose-600 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => {
              if (decryptedRoleId) fetchUsersToEvaluate();
              else router.push("/evaluaterole");
            }}
            className="px-5 py-2.5 bg-rose-600 text-white text-xs font-extrabold rounded-2xl hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer"
          >
            {decryptedRoleId ? "ລອງໃໝ່ອີກຄັ້ງ" : "ກັບຄືນເລືອກບົດບາດ"}
          </button>
        </div>
      ) : usersList.length === 0 ? (
        <div className="p-14 rounded-3xl bg-white border border-slate-200/80 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">ບໍ່ພົບຂໍ້ມູນພະນັກງານ</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              ບໍ່ມີລາຍຊື່ພະນັກງານທີ່ຕ້ອງປະເມີນໃນສິດທິນີ້
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usersList.map((targetUser) => {
            const fullName = `${targetUser.first_name || ""} ${targetUser.last_name || ""}`.trim() || "ພະນັກງານ";
            const initials = fullName.slice(0, 2).toUpperCase();
            const isEvaluated = !!evaluatedMap[targetUser.id];

            return (
              <div
                key={targetUser.id}
                onClick={() => handleStartEvaluation(targetUser)}
                className={`group relative p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  isEvaluated
                    ? "bg-slate-50/80 border-slate-200/90 cursor-not-allowed opacity-90"
                    : "bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 hover:bg-slate-50/50 cursor-pointer"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {targetUser.empimg ? (
                      <img
                        src={targetUser.empimg}
                        alt={fullName}
                        className={`w-12 h-12 rounded-2xl object-cover object-top border shadow-sm bg-slate-100 shrink-0 ${
                          isEvaluated ? "border-slate-300 grayscale-[0.2]" : "border-slate-200"
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center shrink-0 ${
                          isEvaluated
                            ? "bg-slate-400 shadow-sm"
                            : "bg-gradient-to-br from-sky-600 to-blue-700 shadow-md shadow-sky-600/20"
                        }`}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <h3
                        className={`text-sm font-bold leading-tight ${
                          isEvaluated ? "text-slate-600" : "text-slate-800 group-hover:text-sky-700 transition-colors"
                        }`}
                      >
                        {fullName}
                      </h3>
                      <p className="text-xs text-sky-600 font-mono font-semibold">
                        {targetUser.emp_code || `EMP-${targetUser.id}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  {isEvaluated ? (
                    <>
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ປະເມີນແລ້ວ
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                        ປະເມີນແລ້ວ
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1 text-sky-600 group-hover:text-sky-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ພ້ອມດຳເນີນການປະເມີນ
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform text-sky-700">
                        ເລີ່ມປະເມີນ <ArrowRight className="w-4 h-4" />
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
