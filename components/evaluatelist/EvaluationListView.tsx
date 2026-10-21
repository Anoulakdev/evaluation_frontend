"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Eye,
  FileSpreadsheet,
  LayoutGrid,
  List,
  ArrowRight,
  X,
  Filter,
  Edit3,
} from "lucide-react";
import { axiosInstance, isAxiosError } from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-toastify";
import {
  EvaluationDetailModal,
  EvaluationItem,
} from "./EvaluationDetailModal";
import { EditEvaluationModal } from "./EditEvaluationModal";
import { ConfirmApproveModal } from "./ConfirmApproveModal";
import { Button } from "@/components/ui/button";

interface RoleEvaluationSummary {
  roleId: number;
  roleName: string;
  total: number;
  evaluated: number;
  remaining: number;
  isCompleted: boolean;
}

interface CountAllResult {
  total: number;
  evaluated: number;
  remaining: number;
  isAllCompleted: boolean;
  uniqueTotal: number;
  uniqueEvaluated: number;
  uniqueRemaining: number;
  roles: RoleEvaluationSummary[];
}

export function EvaluationListView() {
  const { user, fetchUser } = useAuthStore();

  const [list, setList] = useState<EvaluationItem[]>([]);
  const [countData, setCountData] = useState<CountAllResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals
  const [detailItem, setDetailItem] = useState<EvaluationItem | null>(null);
  const [editingItem, setEditingItem] = useState<EvaluationItem | null>(null);
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    ids: number[];
    names: string[];
  }>({
    isOpen: false,
    ids: [],
    names: [],
  });
  const [approving, setApproving] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  // Fetch list from backend
  const fetchResultList = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
        setError(null);
      }

      const [res, countRes] = await Promise.all([
        axiosInstance.get<EvaluationItem[]>("/totals/resultlist"),
        axiosInstance.get<CountAllResult>("/users/countall"),
      ]);
      setError(null);
      setList(res.data || []);
      setCountData(countRes.data || null);
    } catch (err: unknown) {
      console.error("Failed to fetch evaluation result list:", err);
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍການປະເມີນໄດ້ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResultList();
  }, [fetchResultList]);

  // Filtered list
  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((item) => {
      const fullName = `${item.receiver?.first_name || ""} ${item.receiver?.last_name || ""
        }`.toLowerCase();
      const empCode = (item.receiver?.emp_code || "").toLowerCase();
      const posName = (item.receiver?.position?.pos_name || "").toLowerCase();
      const deptName = (
        item.receiver?.department?.department_name || ""
      ).toLowerCase();
      const roleName = (item.role?.name || "").toLowerCase();

      return (
        fullName.includes(q) ||
        empCode.includes(q) ||
        posName.includes(q) ||
        deptName.includes(q) ||
        roleName.includes(q)
      );
    });
  }, [list, search]);

  const targetItems = useMemo(() => {
    return search.trim() ? filteredList : list;
  }, [filteredList, list, search]);

  const unapprovedCount = useMemo(() => {
    return targetItems.filter((i) => !i.approve).length;
  }, [targetItems]);

  const isAllApproved = useMemo(() => {
    return targetItems.length > 0 && unapprovedCount === 0;
  }, [targetItems, unapprovedCount]);

  // ตรวจสอบว่าประเมินครบตามจำนวนที่กำหนด (total จาก countAll) แล้วหรือไม่
  const isCompletedEvaluationCount = useMemo(() => {
    if (!countData) return false;
    if (countData.total === 0) return true;
    return countData.remaining === 0 && countData.evaluated >= countData.total;
  }, [countData]);

  // Trigger confirmation modal for all unapproved items
  const handleOpenApproveAll = () => {
    if (!isCompletedEvaluationCount) {
      toast.warning(
        `ທ່ານຍັງປະເມີນບໍ່ຄົບຕາມຈຳນວນທີ່ກຳນົດ (ປະເມີນແລ້ວ ${countData?.evaluated || list.length}/${countData?.total || 0} ທ່ານ, ຍັງເຫຼືອ ${countData?.remaining || 0} ທ່ານ)`
      );
      return;
    }
    const itemsToConfirm = targetItems.filter((i) => !i.approve);
    if (itemsToConfirm.length === 0) {
      toast.info("ບໍ່ມີລາຍການປະເມີນທີ່ຕ້ອງການຢືນຢັນ");
      return;
    }
    const ids = itemsToConfirm.map((i) => i.id);
    const names = itemsToConfirm.map(
      (item) =>
        `${item.receiver?.first_name || ""} ${item.receiver?.last_name || ""} (${item.receiver?.emp_code || "ບໍ່ມີລະຫັດ"
        })`
    );
    setConfirmModalData({
      isOpen: true,
      ids,
      names,
    });
  };

  // Perform backend updateList
  const handleConfirmApprove = async () => {
    if (confirmModalData.ids.length === 0) return;
    try {
      setApproving(true);
      await axiosInstance.put("/totals/updatelist", confirmModalData.ids);
      toast.success(
        `ອະນຸມັດ ແລະ ສົ່ງຄະແນນປະເມີນສຳເລັດ (${confirmModalData.ids.length} ລາຍການ)`
      );
      setConfirmModalData({ isOpen: false, ids: [], names: [] });
      await fetchResultList();
    } catch (err: unknown) {
      console.error("Failed to approve evaluations:", err);
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "ເກີດຂໍ້ຜິດພາດໃນການອະນຸມັດ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ";
      toast.error(msg);
    } finally {
      setApproving(false);
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const XLSX = await import("xlsx");
      const dataToExport = filteredList.map((item, index) => ({
        ລຳດັບ: index + 1,
        ລະຫັດພະນັກງານ: item.receiver?.emp_code || "",
        "ຊື່ ແລະ ນາມສະກຸນ": `${item.receiver?.first_name || ""} ${item.receiver?.last_name || ""
          }`.trim(),
        ຕຳແໜ່ງ: item.receiver?.position?.pos_name || "",
        ພະແນກ: item.receiver?.department?.department_name || "",
        ພາກສ່ວນ: item.receiver?.division?.division_name || "",
        ໜ່ວຍງານ: item.receiver?.unit?.unit_name || "",
        ບົດບາດການປະເມີນ: item.role?.name || "",
        "ດ້ານ 1 (ຄວາມເປັນຜູ້ນໍາ)": item.s1_score,
        "ດ້ານ 2 (ການປະຕິບັດວຽກງານ)": item.s2_score,
        "ດ້ານ 3 (ການສື່ສານ)": item.s3_score,
        "ດ້ານ 4 (ລະບຽບວິໄນ)": item.s4_score,
        ຄະແນນລວມ: item.total_score,
        "ເປີເຊັນ (%)": `${item.percent_score}%`,
        ສະຖານະ: "ລໍຖ້າຢືນຢັນ",
        ວັນທີປະເມີນ: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("lo-LA")
          : "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ລາຍການປະເມີນ");
      XLSX.writeFile(
        workbook,
        `ລາຍການປະເມີນ_ລໍຖ້າຢືນຢັນ_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      toast.success("ສົ່ງອອກໄຟລ໌ Excel ສຳເລັດ!");
    } catch (err) {
      console.error("Export Excel error:", err);
      toast.error("ບໍ່ສາມາດສົ່ງອອກ Excel ໄດ້");
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Banner Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-800 via-sky-700 to-blue-900 p-5 sm:p-6 text-white shadow-xl shadow-sky-900/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
          <ClipboardList className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2.5">
                <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 text-sky-300 shrink-0" />
                ລາຍການປະເມີນຜົນທີ່ລໍຖ້າຢືນຢັນ
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchResultList(true)}
                disabled={loading || refreshing}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md text-xs font-bold rounded-xl cursor-pointer h-8"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
                ຣີເຟຣຊ
              </Button>

              <Link href="/evaluaterole">
                <Button
                  type="button"
                  size="sm"
                  className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 h-8"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  ປະເມີນຜົນເພີ່ມເຕີມ
                </Button>
              </Link>
            </div>
          </div>

          {user && (
            <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs text-sky-200 font-medium border-t border-sky-700/50">
              <span className="bg-sky-950/50 px-3 py-1 rounded-xl border border-sky-400/30 flex items-center gap-1.5 backdrop-blur-sm text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ຜູ້ປະເມີນ:{" "}
                <strong className="text-white">
                  {user.first_name || user.username} {user.last_name || ""}
                </strong>
              </span>
              <span className="bg-sky-950/50 px-3 py-1 rounded-xl border border-sky-400/30 backdrop-blur-sm text-[11px]">
                ສິດທິ:{" "}
                <strong className="text-sky-300">
                  {user.role?.name || `RoleId #${user.roleId}`}
                </strong>
              </span>
              {countData && (
                <span className="bg-sky-950/50 px-3 py-1 rounded-xl border border-sky-400/30 backdrop-blur-sm text-[11px] flex items-center gap-1.5">
                  <span>ຄວາມຄືບໜ້າ:</span>
                  <strong
                    className={
                      isCompletedEvaluationCount
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }
                  >
                    {countData.evaluated} / {countData.total} ທ່ານ
                  </strong>
                  {isCompletedEvaluationCount ? (
                    <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40 font-bold">
                      ຄົບແລ້ວ
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40 font-bold">
                      ເຫຼືອ {countData.remaining}
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search, Filter & Bulk Actions Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ຄົ້ນຫາຊື່, ລະຫັດພະນັກງານ, ຕຳແໜ່ງ, ພະແນກ..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Actions on right: View Mode Toggle & Export Excel */}
          <div className="flex flex-wrap items-center gap-2">

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => setViewMode("table")}
                title="Table view"
                className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${viewMode === "table"
                  ? "bg-white text-sky-600 shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${viewMode === "grid"
                  ? "bg-white text-sky-600 shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Export Excel Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleExportExcel}
              disabled={exportingExcel || filteredList.length === 0}
              className="px-3.5 py-2 text-xs rounded-xl font-bold border-slate-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 hover:text-emerald-800 hover:border-emerald-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
            <span className="text-sm font-semibold text-slate-600">
              ກຳລັງໂຫຼດລາຍການປະເມີນ...
            </span>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-center max-w-lg mx-auto space-y-3 my-6">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-base">ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ</h3>
          <p className="text-xs text-rose-600 leading-relaxed">{error}</p>
          <Button
            type="button"
            onClick={() => fetchResultList()}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
          >
            ລອງໃໝ່ອີກຄັ້ງ
          </Button>
        </div>
      ) : list.length === 0 ? (
        /* Empty State */
        <div className="p-12 sm:p-16 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-800">
              ບໍ່ມີລາຍການປະເມີນທີ່ລໍຖ້າຢືນຢັນ
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ທ່ານໄດ້ຢືນຢັນການປະເມີນຄົບຖ້ວນແລ້ວ ຫຼື
              ຍັງບໍ່ທັນມີລາຍການປະເມີນທີ່ໄດ້ບັນທຶກໄວ້ໃນລະບົບ
            </p>
          </div>
          <div className="pt-2">
            <Link href="/evaluaterole">
              <Button
                type="button"
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                ໄປທີ່ໜ້າເລືອກການປະເມີນ
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : filteredList.length === 0 ? (
        /* Search result 0 */
        <div className="p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-3">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">
            ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບເງື່ອນໄຂການຄົ້ນຫາ
          </h4>
          <p className="text-xs text-slate-400">
            ກະລຸນາກວດສອບຄຳຄົ້ນຫາ ຫຼື ລອງປ່ຽນຕົວກອງ
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
            }}
            className="text-xs rounded-xl font-bold cursor-pointer"
          >
            ລ້າງຄຳຄົ້ນຫາ
          </Button>
        </div>
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Mobile View (< md): Clean Compact Table Rows */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredList.map((item, index) => {
              const receiver = item.receiver;
              const fullName = `${receiver?.first_name || ""} ${receiver?.last_name || ""
                }`.trim();
              const empCode = receiver?.emp_code || "ບໍ່ມີລະຫັດ";

              return (
                <div
                  key={item.id}
                  className="p-3 sm:p-3.5 hover:bg-sky-50/40 transition-colors flex items-center justify-between gap-2.5"
                >
                  {/* Left: Index, Avatar, Full Name, Code */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-400 shrink-0 w-6">
                      #{index + 1}
                    </span>
                    {receiver?.empimg ? (
                      <img
                        src={receiver.empimg}
                        alt={empCode}
                        className="w-10 h-10 rounded-xl object-cover object-top border border-slate-200 shadow-xs shrink-0 bg-slate-100"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0 uppercase">
                        {(receiver?.first_name || empCode || "ED").slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight truncate">
                        {fullName || "ບໍ່ລະບຸຊື່"}
                      </h4>
                      <span className="inline-block font-mono font-bold text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100 mt-0.5">
                        {empCode}
                      </span>
                    </div>
                  </div>

                  {/* Right: Percent Score & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-200">
                      {item.percent_score}%
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailItem(item)}
                        className="h-8 w-8 p-0 rounded-xl border-slate-200 text-slate-700 hover:text-sky-700 hover:border-sky-300 hover:bg-sky-50 shadow-xs cursor-pointer inline-flex items-center justify-center"
                        title="ເບິ່ງລາຍລະອຽດຄະແນນ"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={item.approve}
                        onClick={() => setEditingItem(item)}
                        title={
                          item.approve
                            ? "ບໍ່ສາມາດແກ້ໄຂໄດ້ ເນື່ອງຈາກຢືນຢັນແລ້ວ"
                            : "ແກ້ໄຂຄະແນນ"
                        }
                        className="h-8 w-8 p-0 rounded-xl border-slate-200 text-amber-700 hover:text-amber-800 hover:border-amber-300 hover:bg-amber-50 shadow-xs cursor-pointer inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 disabled:hover:text-slate-400"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">ລ/ດ</th>
                  <th className="py-3.5 px-4 min-w-[220px]">ພະນັກງານທີ່ຖືກປະເມີນ</th>
                  <th className="py-3.5 px-4 text-center min-w-[120px]">
                    ຄະແນນ (%)
                  </th>
                  <th className="py-3.5 px-4 text-center min-w-[110px]">
                    ຈັດການ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredList.map((item, index) => {
                  const receiver = item.receiver;
                  const fullName = `${receiver?.first_name || ""} ${receiver?.last_name || ""
                    }`.trim();
                  const empCode = receiver?.emp_code || "ບໍ່ມີລະຫັດ";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-sky-50/40 transition-colors"
                    >
                      {/* Index */}
                      <td className="py-3.5 px-4 text-center text-slate-400 font-bold font-mono">
                        {index + 1}
                      </td>

                      {/* Employee Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {receiver?.empimg ? (
                            <img
                              src={receiver.empimg}
                              alt={empCode}
                              className="w-10 h-10 rounded-xl object-cover object-top border border-slate-200 shadow-sm shrink-0 bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0 uppercase">
                              {(receiver?.first_name || empCode || "ED").slice(
                                0,
                                2
                              )}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-800 leading-tight">
                              {fullName || "ບໍ່ລະບຸຊື່"}
                            </p>
                            <span className="inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {empCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Percent Score */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-200">
                          {item.percent_score}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailItem(item)}
                            className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 hover:text-sky-700 hover:border-sky-300 hover:bg-sky-50 text-[11px] font-bold shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                            title="ເບິ່ງລາຍລະອຽດຄະແນນ"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={item.approve}
                            onClick={() => setEditingItem(item)}
                            title={
                              item.approve
                                ? "ບໍ່ສາມາດແກ້ໄຂໄດ້ ເນື່ອງຈາກຢືນຢັນແລ້ວ"
                                : "ແກ້ໄຂຄະແນນ"
                            }
                            className="h-8 px-2.5 rounded-xl border-slate-200 text-amber-700 hover:text-amber-800 hover:border-amber-300 hover:bg-amber-50 text-[11px] font-bold shadow-sm cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 disabled:hover:text-slate-400"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              ສະແດງ {filteredList.length} ຈາກທັງໝົດ {list.length} ລາຍການ
            </span>
          </div>
        </div>
      ) : (
        /* Card / Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5">
          {filteredList.map((item, index) => {
            const receiver = item.receiver;
            const fullName = `${receiver?.first_name || ""} ${receiver?.last_name || ""
              }`.trim();
            const empCode = receiver?.emp_code || "ບໍ່ມີລະຫັດ";

            return (
              <div
                key={item.id}
                className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/90 hover:border-sky-300 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-2"
              >
                {/* Card Top: Index & Role */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    #{index + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {item.role?.name || `Role #${item.roleId}`}
                  </span>
                </div>

                {/* Receiver Info */}
                <div className="flex items-center gap-2">
                  {receiver?.empimg ? (
                    <img
                      src={receiver.empimg}
                      alt={empCode}
                      className="w-9 h-9 rounded-lg object-cover object-top border border-slate-200 shadow-sm shrink-0 bg-slate-100"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0 uppercase">
                      {(receiver?.first_name || empCode || "ED").slice(0, 2)}
                    </div>
                  )}

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                      {fullName || "ບໍ່ລະບຸຊື່"}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {receiver?.position?.pos_name || "-"}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                      <span className="font-mono font-bold text-sky-700 bg-sky-50 px-1 py-0.2 rounded">
                        {empCode}
                      </span>
                      <span>• {receiver?.department?.department_name || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Percent Score */}
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-semibold">
                    ຄະແນນ (%):
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-200">
                    {item.percent_score}%
                  </span>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailItem(item)}
                    className="flex-1 h-8 text-[11px] rounded-lg font-bold border-slate-200 text-slate-700 hover:text-sky-700 hover:border-sky-300 hover:bg-sky-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    ເບິ່ງຄະແນນ
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={item.approve}
                    onClick={() => setEditingItem(item)}
                    title={
                      item.approve
                        ? "ບໍ່ສາມາດແກ້ໄຂໄດ້ ເນື່ອງຈາກຢືນຢັນແລ້ວ"
                        : "ແກ້ໄຂຄະແນນ"
                    }
                    className="h-8 px-3 text-[11px] rounded-lg font-bold border-slate-200 text-amber-700 hover:text-amber-800 hover:border-amber-300 hover:bg-amber-50 cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 disabled:hover:text-slate-400"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    ແກ້ໄຂ
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Action Bar: Single Confirm All Button */}
      {!loading && !error && list.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isAllApproved
                  ? "bg-sky-100 text-sky-600"
                  : !isCompletedEvaluationCount
                  ? "bg-amber-100 text-amber-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {!isCompletedEvaluationCount && !isAllApproved ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                ຢືນຢັນຜົນການປະເມີນທັງໝົດ
              </h3>
              <p className="text-xs text-slate-500">
                {isAllApproved ? (
                  <span className="text-sky-700 font-semibold">
                    ລາຍການປະເມີນທັງໝົດ ({targetItems.length}) ຖືກຢືນຢັນສຳເລັດແລ້ວ
                  </span>
                ) : !isCompletedEvaluationCount ? (
                  <span className="text-amber-700 font-medium flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" /> ຍັງປະເມີນບໍ່ຄົບ
                    </span>
                    <span>
                      ທ່ານຕ້ອງປະເມີນໃຫ້ຄົບທັງໝົດ{" "}
                      <strong className="text-slate-900 font-bold">
                        {countData?.total || 0}
                      </strong>{" "}
                      ທ່ານ (ປະເມີນແລ້ວ{" "}
                      <strong className="text-emerald-700 font-bold">
                        {countData?.evaluated ?? list.length}
                      </strong>
                      , ຍັງເຫຼືອ{" "}
                      <strong className="text-rose-600 font-bold">
                        {countData?.remaining ??
                          (countData
                            ? countData.total - countData.evaluated
                            : 0)}
                      </strong>{" "}
                      ທ່ານ) ຈຶ່ງຈະສາມາດຢືນຢັນໄດ້
                    </span>
                  </span>
                ) : (
                  <>
                    ຢືນຢັນ ແລະ ສົ່ງຄະແນນການປະເມີນທີ່ຍັງເຫຼືອ{" "}
                    <strong className="text-emerald-700 font-bold">
                      {unapprovedCount}
                    </strong>{" "}
                    ລາຍການ ເຂົ້າສູ່ລະບົບ
                  </>
                )}
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={handleOpenApproveAll}
            disabled={
              approving ||
              isAllApproved ||
              unapprovedCount === 0 ||
              !isCompletedEvaluationCount
            }
            className={`w-full sm:w-auto px-6 py-2.5 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ${
              isAllApproved
                ? "bg-sky-500 hover:bg-sky-500 text-white shadow-md shadow-sky-500/20 disabled:opacity-100 cursor-not-allowed"
                : !isCompletedEvaluationCount
                ? "bg-slate-200 text-slate-400 border border-slate-300 disabled:opacity-100 cursor-not-allowed shadow-none"
                : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg shadow-emerald-600/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {isAllApproved ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : !isCompletedEvaluationCount ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {isAllApproved
              ? "ຢືນຢັນສຳເລັດ"
              : !isCompletedEvaluationCount
              ? `ຍັງປະເມີນບໍ່ຄົບ (${countData?.evaluated ?? list.length}/${countData?.total ?? 0})`
              : `ຢືນຢັນທັງໝົດ (${unapprovedCount})`}
          </Button>
        </div>
      )}

      {/* Modals */}
      <EvaluationDetailModal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
      />

      <EditEvaluationModal
        key={editingItem?.id}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        onSuccess={() => fetchResultList()}
      />

      <ConfirmApproveModal
        isOpen={confirmModalData.isOpen}
        onClose={() =>
          setConfirmModalData({ isOpen: false, ids: [], names: [] })
        }
        onConfirm={handleConfirmApprove}
        count={confirmModalData.ids.length}
        targetNames={confirmModalData.names}
        loading={approving}
      />
    </div>
  );
}
