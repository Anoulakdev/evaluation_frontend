"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  UserCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { axiosInstance } from "@/lib/axiosInstance";
import { encryptData } from "@/lib/crypto";

export interface RoleItem {
  id: number;
  name: string;
}

export interface RoleEvaluationSummary {
  roleId: number;
  roleName: string;
  total: number;
  evaluated: number;
  remaining: number;
  isCompleted: boolean;
}

export interface CountAllResult {
  total: number;
  evaluated: number;
  remaining: number;
  isAllCompleted: boolean;
  uniqueTotal: number;
  uniqueEvaluated: number;
  uniqueRemaining: number;
  approvedCount?: number;
  isAllApproved?: boolean;
  roles: RoleEvaluationSummary[];
}

export interface EvaluationListItem {
  id: number;
  approve: boolean;
}

export function EvaluateRoleView() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [countData, setCountData] = useState<CountAllResult | null>(null);
  const [resultList, setResultList] = useState<EvaluationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  const fetchSelectRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesRes, countRes, listRes] = await Promise.allSettled([
        axiosInstance.get<RoleItem[]>("/roles/selectrole"),
        axiosInstance.get<CountAllResult>("/users/countall"),
        axiosInstance.get<EvaluationListItem[]>("/totals/resultlist"),
      ]);

      if (rolesRes.status === "fulfilled") {
        setRoles(rolesRes.value.data || []);
      } else {
        throw rolesRes.reason;
      }

      if (countRes.status === "fulfilled") {
        setCountData(countRes.value.data || null);
      }

      if (listRes.status === "fulfilled") {
        setResultList(listRes.value.data || []);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch select roles:", err);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr?.response?.data?.message ||
        "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນສິດທິການປະເມີນໄດ້ ກະລຸນາລອງໃໝ່"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSelectRoles();
  }, [fetchSelectRoles]);

  const roleSummaryMap = useMemo(() => {
    const map = new Map<number, RoleEvaluationSummary>();
    countData?.roles?.forEach((r) => {
      map.set(r.roleId, r);
    });
    return map;
  }, [countData]);

  const isAllApproved = useMemo(() => {
    if (countData?.isAllApproved !== undefined) {
      return countData.isAllApproved;
    }
    if (!resultList || resultList.length === 0) return false;
    const allApproved = resultList.every((item) => item.approve);
    if (!allApproved) return false;
    if (countData && countData.total > 0) {
      return countData.remaining === 0 && resultList.length >= countData.total;
    }
    return allApproved;
  }, [countData, resultList]);

  // Ensure role 10 (ຕົນເອງ) is always at the end
  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => {
      if (a.id === 10) return 1;
      if (b.id === 10) return -1;
      return a.id - b.id;
    });
  }, [roles]);

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
      case 10:
        return <UserCheck className="w-7 h-7 text-sky-600" />;
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
              {countData && (
                <span className="bg-sky-950/60 px-3 py-1 rounded-lg border border-sky-400/30 flex items-center gap-1.5">
                  ສະຖານະ:{" "}
                  <strong
                    className={
                      countData.isAllCompleted
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }
                  >
                    {countData.isAllCompleted
                      ? `ປະເມີນຄົບທັງໝົດແລ້ວ (${countData.evaluated}/${countData.total})`
                      : `ປະເມີນແລ້ວ ${countData.evaluated}/${countData.total} (ຍັງເຫຼືອ ${countData.remaining})`}
                  </strong>
                </span>
              )}
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
          <div className="pt-2">
            <Link href="/evaluatelist">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 shadow-sm cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>ໄປໜ້າຢືນຢັນການປະເມີນ</span>
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedRoles.map((role) => {
              const isSelected = selectedRoleId === role.id;
              const summary = roleSummaryMap.get(role.id);
              const totalInRole = summary ? summary.total : 0;
              const evaluatedInRole = summary ? summary.evaluated : 0;
              const remainingInRole = summary ? summary.remaining : 0;
              const isEmptyRole = totalInRole === 0;
              const isCompleted = summary ? summary.isCompleted : false;
              const isGreen = isCompleted || isEmptyRole;

              return (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`group relative p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer ${isGreen
                    ? "bg-emerald-50/20 border-emerald-500 shadow-xs hover:shadow-md hover:border-emerald-600 hover:bg-emerald-50/30"
                    : "bg-white border-orange-400 shadow-xs hover:shadow-md hover:border-orange-500 hover:bg-orange-50/20"
                    } ${isSelected ? "ring-2 ring-sky-400/30" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-2xl transition-colors ${isGreen
                        ? "bg-emerald-100/80 text-emerald-700"
                        : "bg-orange-100/80 text-orange-700"
                        }`}
                    >
                      {getRoleIcon(role.id)}
                    </div>

                    {summary && (
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 shadow-2xs ${isGreen
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-orange-100 text-orange-800 border-orange-300"
                          }`}
                      >
                        {isEmptyRole ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            0 ທ່ານ
                          </>
                        ) : isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ສຳເລັດ ({evaluatedInRole}/{totalInRole})
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                            ຍັງເຫຼືອ {remainingInRole}
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3
                      className={`text-base font-bold transition-colors flex items-center justify-between ${isGreen
                        ? "text-slate-800 group-hover:text-emerald-700"
                        : "text-slate-800 group-hover:text-orange-600"
                        }`}
                    >
                      <span>{role.name}</span>
                    </h3>
                    <p
                      className={`text-xs font-semibold ${isGreen ? "text-emerald-700" : "text-orange-600"
                        }`}
                    >
                      {totalInRole > 0
                        ? isCompleted
                          ? `ປະເມີນຄົບແລ້ວທັງໝົດ ${evaluatedInRole} ທ່ານ`
                          : `ປະເມີນແລ້ວ ${evaluatedInRole} ຈາກທັງໝົດ ${totalInRole} ທ່ານ`
                        : "ບໍ່ມີພະນັກງານໃນສິດທິນີ້"}
                    </p>
                  </div>

                  <div
                    className={`pt-3 border-t flex items-center justify-between text-xs font-semibold ${isGreen
                      ? "border-emerald-100 text-emerald-700"
                      : "border-orange-100 text-orange-700"
                      }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      {isEmptyRole ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ບໍ່ມີພະນັກງານໃນສິດທິນີ້
                        </>
                      ) : isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ປະເມີນຄົບທັງໝົດແລ້ວ
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                          ຍັງບໍ່ສຳເລັດທັງໝົດ
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">
                      {isGreen ? "ກວດສອບ" : "ເລືອກປະເມີນ"}{" "}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action card to /evaluatelist (Bottom right on desktop, below self-evaluation card on mobile) */}
          <div className="flex justify-end pt-2 sm:pt-3">
            <Link
              href="/evaluatelist"
              id="btn-navigate-evaluatelist"
              className="w-full sm:w-auto sm:min-w-[360px] sm:max-w-md group block"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 border border-sky-400/30 hover:border-sky-300/60 p-4 sm:p-5 text-white shadow-md shadow-sky-900/10 hover:shadow-xl hover:shadow-sky-900/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
                {/* Subtle Ambient Light Effects */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-sky-300/10 rounded-full blur-lg pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  {/* Left: Content */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isAllApproved ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/25 backdrop-blur-xs border border-emerald-300/40 text-[11px] font-semibold text-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                          ຢືນຢັນສຳເລັດແລ້ວ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-[11px] font-medium text-sky-100">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                          </span>
                          ລໍຖ້າຢືນຢັນ
                        </span>
                      )}

                      {countData && countData.evaluated > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-300/30 text-[11px] font-medium text-emerald-200">
                          {isAllApproved
                            ? `ຢືນຢັນແລ້ວ ${countData.evaluated} ທ່ານ`
                            : `ປະເມີນແລ້ວ ${countData.evaluated} ທ່ານ`}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-100 transition-colors tracking-tight truncate">
                      ໄປໜ້າຢືນຢັນການປະເມີນ
                    </h3>
                  </div>

                  {/* Right: Modern Action Arrow */}
                  <div className="shrink-0 pl-1">
                    <div className="w-10 h-10 rounded-xl bg-white/15 group-hover:bg-white border border-white/20 group-hover:border-white flex items-center justify-center text-white group-hover:text-sky-700 shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:shadow-md">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
