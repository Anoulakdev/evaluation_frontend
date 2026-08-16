"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Award,
  Search,
  Users,
  Printer,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  Building,
  UserCheck,
  Sparkles,
  Layers,
  Info,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";

export interface GiverInfo {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  emp_code?: string | null;
  empimg?: string | null;
}

export interface ReceiverInfo {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  emp_code?: string | null;
  empimg?: string | null;
}

export interface RoleInfo {
  id: number;
  name: string;
}

export interface TotalDetailItem {
  id: number;
  roleId: number;
  giverId: number;
  receiverId: number;
  s1_1: number;
  s1_2: number;
  s1_3: number;
  s1_4: number;
  s1_5: number;
  s1_6: number;
  s1_score: number;
  s2_1: number;
  s2_2: number;
  s2_3: number;
  s2_4: number;
  s2_5: number;
  s2_score: number;
  s3_1: number;
  s3_2: number;
  s3_3: number;
  s3_score: number;
  s4_1: number;
  s4_2: number;
  s4_score: number;
  total_score: number;
  percent_score?: number | null;
  createdAt?: string;
  updatedAt?: string;
  giver: GiverInfo;
  receiver?: ReceiverInfo;
  role: RoleInfo;
}

export interface RoleGroupSummary {
  s1_score: number;
  s2_score: number;
  s3_score: number;
  s4_score: number;
  total_score: number;
  percent_score: number;
  avg_s1_score: number;
  avg_s2_score: number;
  avg_s3_score: number;
  avg_s4_score: number;
  avg_total_score: number;
  avg_percent_score: number;
  count: number;
}

export type GroupedResultDetail = Record<string, TotalDetailItem[] | { items: TotalDetailItem[]; summary: RoleGroupSummary | null }>;

const getRoleItems = (val: any): TotalDetailItem[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (Array.isArray(val.items)) return val.items;
  return [];
};

const getRoleSummary = (val: any): RoleGroupSummary | null => {
  if (!val) return null;
  if (!Array.isArray(val) && val.summary) return val.summary;
  return null;
};

export interface UserSelectItem {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  emp_code?: string | null;
  empimg?: string | null;
  position?: { pos_name?: string } | null;
  department?: { department_name?: string } | null;
  division?: { division_name?: string } | null;
}

export function TotalScoreView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initial load & search from query param `emp_code`
  const initialEmpCode = searchParams.get("emp_code") || "";

  // Employee Code input state
  const [empCodeInput, setEmpCodeInput] = useState(initialEmpCode);
  const [selectedUser, setSelectedUser] = useState<UserSelectItem | null>(null);

  // Result Detail Data state
  const [groupedResult, setGroupedResult] = useState<GroupedResultDetail | null>(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accordion toggle state for itemized detail
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (initialEmpCode) {
      setEmpCodeInput(initialEmpCode);
      fetchResultDetail(initialEmpCode);
    }
  }, [initialEmpCode]);

  // Fetch result detail by emp_code
  const fetchResultDetail = async (emp_code: string) => {
    const trimmedCode = emp_code.trim();
    if (!trimmedCode) return;

    try {
      setLoadingResult(true);
      setError(null);

      const res = await axiosInstance.get<GroupedResultDetail>("/totals/resultdetail", {
        params: { emp_code: trimmedCode },
      });

      const resData = res.data || {};
      setGroupedResult(resData);

      // Extract receiver info if present in response
      let receiverFromData: UserSelectItem | null = null;
      const firstGroupKey = Object.keys(resData)[0];
      const firstGroupItems = getRoleItems(resData[firstGroupKey]);
      if (firstGroupItems.length > 0 && firstGroupItems[0].receiver) {
        const r = firstGroupItems[0].receiver;
        if (r) {
          receiverFromData = {
            id: r.id,
            first_name: r.first_name,
            last_name: r.last_name,
            emp_code: r.emp_code,
            empimg: r.empimg,
          };
        }
      }

      if (receiverFromData) {
        setSelectedUser(receiverFromData);
      } else {
        try {
          const userRes = await axiosInstance.get("/users", {
            params: { search: trimmedCode },
          });
          const list = Array.isArray(userRes.data) ? userRes.data : userRes.data?.data || [];
          const matched = list.find((u: UserSelectItem) => u.emp_code === trimmedCode) || list[0] || null;
          if (matched) setSelectedUser(matched);
        } catch {
          // ignore fallback
        }
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError(err?.response?.data?.message || "ບໍ່ພົບຂໍ້ມູນຜົນການປະເມີນສຳລັບພະນັກງານນີ້");
      } else {
        console.error("Failed to fetch result detail:", err);
        setError(err?.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນຜົນການປະເມີນ");
      }
      setGroupedResult(null);
      setSelectedUser(null);
    } finally {
      setLoadingResult(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = empCodeInput.trim();
    if (!code) return;
    router.push(`/totalscore?emp_code=${encodeURIComponent(code)}`);
    fetchResultDetail(code);
  };

  const toggleItemExpand = (id: number) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportExcel = async () => {
    if (!groupedResult || !selectedUser) return;

    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const sheetData: any[] = [];

    sheetData.push([`ຜົນການປະເມີນ 360 - ${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`]);
    sheetData.push([`ລະຫັດພະນັກງານ: ${selectedUser.emp_code || ""}`]);
    sheetData.push([]);

    sheetData.push([
      "ກຸ່ມ",
      "ຜູ້ປະເມີນ",
      "ລະຫັດຜູ້ປະເມີນ",
      "ຂໍ້ 1.1",
      "ຂໍ້ 1.2",
      "ຂໍ້ 1.3",
      "ຂໍ້ 1.4",
      "ຂໍ້ 1.5",
      "ຂໍ້ 1.6",
      "ລວມຫົວຂໍ້ທີ I",
      "ຂໍ້ 2.1",
      "ຂໍ້ 2.2",
      "ຂໍ້ 2.3",
      "ຂໍ້ 2.4",
      "ຂໍ້ 2.5",
      "ລວມຫົວຂໍ້ທີ II",
      "ຂໍ້ 3.1",
      "ຂໍ້ 3.2",
      "ຂໍ້ 3.3",
      "ລວມຫົວຂໍ້ທີ III",
      "ຂໍ້ 4.1",
      "ຂໍ້ 4.2",
      "ລວມຫົວຂໍ້ທີ IV",
      "ຄະແນນລວມ",
      "ສະເລ່ຍ (ເປີເຊັນ)",
    ]);

    Object.keys(groupedResult).forEach((roleName) => {
      const items = getRoleItems(groupedResult[roleName]);
      items.forEach((item) => {
        const giverName = item.giver ? `${item.giver.first_name || ""} ${item.giver.last_name || ""}`.trim() : "ຜູ້ປະເມີນ";
        const giverCode = item.giver?.emp_code || "";
        sheetData.push([
          roleName,
          giverName,
          giverCode,

          item.s1_1,
          item.s1_2,
          item.s1_3,
          item.s1_4,
          item.s1_5,
          item.s1_6,
          item.s1_score,

          item.s2_1,
          item.s2_2,
          item.s2_3,
          item.s2_4,
          item.s2_5,
          item.s2_score,

          item.s3_1,
          item.s3_2,
          item.s3_3,
          item.s3_score,

          item.s4_1,
          item.s4_2,
          item.s4_score,

          item.total_score,
          item.percent_score != null ? `${item.percent_score}%` : "-",
        ]);
      });

      if (items.length > 0) {
        const count = items.length;
        const avgS1 = (items.reduce((s, i) => s + (i.s1_score || 0), 0) / count).toFixed(2);
        const avgS2 = (items.reduce((s, i) => s + (i.s2_score || 0), 0) / count).toFixed(2);
        const avgS3 = (items.reduce((s, i) => s + (i.s3_score || 0), 0) / count).toFixed(2);
        const avgS4 = (items.reduce((s, i) => s + (i.s4_score || 0), 0) / count).toFixed(2);
        const avgTotal = (items.reduce((s, i) => s + (i.total_score || 0), 0) / count).toFixed(2);
        const avgPercent = (items.reduce((s, i) => s + (i.percent_score || 0), 0) / count).toFixed(2);

        sheetData.push([
          `ສະເລ່ຍກຸ່ມ ${roleName}`,
          "-",
          "-",
          "-", "-", "-", "-", "-", "-", avgS1,
          "-", "-", "-", "-", "-", avgS2,
          "-", "-", "-", avgS3,
          "-", "-", avgS4,
          avgTotal,
          `${avgPercent}%`,
        ]);
        sheetData.push([]);
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [
      { wch: 20 },
      { wch: 22 },
      { wch: 16 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 16 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 16 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 16 },
      { wch: 8 },
      { wch: 8 },
      { wch: 16 },
      { wch: 16 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Evaluation Result");
    const filename = `Evaluation_Result_${selectedUser.emp_code || "export"}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const [exportingPDF, setExportingPDF] = useState(false);

  const handleExportPDF = async () => {
    if (!groupedResult || !selectedUser || exportingPDF) return;

    try {
      setExportingPDF(true);

      const [{ pdf }, { TotalScorePDFDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./TotalScorePDF"),
      ]);

      const docBlob = await pdf(
        <TotalScorePDFDocument
          selectedUser={selectedUser}
          groupedResult={groupedResult}
          getRoleItems={getRoleItems}
        />
      ).toBlob();

      const url = URL.createObjectURL(docBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Evaluation_Result_${selectedUser.emp_code || selectedUser.id}_${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Export error:", err);
    } finally {
      setExportingPDF(false);
    }
  };

  const allRoleKeys = groupedResult
    ? Object.keys(groupedResult).filter((key) => key !== "_weightedCalculation")
    : [];
  const allTotalsList: TotalDetailItem[] = groupedResult
    ? Object.values(groupedResult).flatMap((val) => getRoleItems(val))
    : [];
  const totalEvaluators = allTotalsList.length;

  return (
    <div className="space-y-4 font-sans pb-8 print:p-0 print:space-y-4">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 p-6 sm:p-8 text-white shadow-xl shadow-sky-900/15 relative overflow-hidden print:hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Award className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
              <Award className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 shrink-0" />
              <span>ຜົນການປະເມີນ 360</span>
            </h1>
            <p className="text-xs sm:text-sm text-sky-200/90 max-w-xl leading-relaxed">
              ລາຍລະອຽດຄະແນນການປະເມີນຜົນການປະຕິບັດງານບຸກຄົນ
            </p>
          </div>

          {/* User Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-96 space-y-1.5">
            <label className="block text-xs font-bold text-sky-200">
              ຄົ້ນຫາ ພະນັກງານ:
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={empCodeInput}
                  onChange={(e) => setEmpCodeInput(e.target.value)}
                  placeholder="ພິມລະຫັດພະນັກງານ..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white focus:text-slate-900 placeholder:text-sky-200/60 rounded-2xl border border-white/20 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/20 text-xs font-bold transition-all text-white backdrop-blur-md"
                />
                <Search className="w-4 h-4 text-sky-200 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              <button
                type="submit"
                disabled={loadingResult || !empCodeInput.trim()}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingResult ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>ຄົ້ນຫາ</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      {loadingResult ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-sm animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-2xl w-1/3" />
          <div className="h-64 bg-slate-100 rounded-3xl" />
        </div>
      ) : error ? (
        <div className="p-10 rounded-3xl bg-amber-50/80 border border-amber-200 text-amber-900 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="font-extrabold text-base">{error}</h3>
          <p className="text-xs text-amber-700">
            ກະລຸນາເລືອກພະນັກງານຄົນອື່ນ ຫຼື ກວດສອບລະຫັດພະນັກງານອີກຄັ້ງ
          </p>
        </div>
      ) : groupedResult && selectedUser ? (
        <div id="evaluation-report-content" className="space-y-4 bg-slate-50 p-2 sm:p-4 rounded-3xl">
          {/* Selected Employee Info Header Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 print:border-none print:shadow-none print:p-0">
            <div className="flex items-center gap-5">
              {selectedUser.empimg ? (
                <img
                  src={selectedUser.empimg}
                  alt={selectedUser.first_name || ""}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover object-top border-4 border-sky-100 shadow-md shrink-0"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md border-4 border-sky-100 shrink-0">
                  {(selectedUser.first_name || "U").charAt(0).toUpperCase()}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-sky-100 text-sky-800 text-[11px] font-extrabold px-3 py-1 rounded-xl font-mono border border-sky-200">
                    {selectedUser.emp_code || `EMP-${selectedUser.id}`}
                  </span>
                  {selectedUser.department?.department_name && (
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-xl border border-slate-200 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {selectedUser.department.department_name}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h2>
                {selectedUser.position?.pos_name && (
                  <p className="text-xs sm:text-sm font-bold text-sky-700 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    {selectedUser.position.pos_name}
                  </p>
                )}
              </div>
            </div>

            {/* Export Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 print:hidden">
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FileText className={`w-4 h-4 ${exportingPDF ? "animate-spin" : ""}`} />
                <span>{exportingPDF ? "ກຳລັງສ້າງ PDF..." : "PDF"}</span>
              </button>
            </div>
          </div>

          {/* 360 Degree Weighted Score Summary Card */}
          {groupedResult && (groupedResult as any)._weightedCalculation && (() => {
            const wc = (groupedResult as any)._weightedCalculation;
            const groups = [wc.groupA, wc.groupB, wc.groupC, wc.groupD, wc.groupE].filter(Boolean);

            return (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-sky-500/10 to-indigo-500/10 border border-amber-300/80 shadow-md space-y-4 print:border-none print:shadow-none print:p-0">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-sm shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        ຜົນຄິດໄລ່ຄະແນນລວມ
                      </h3>
                      <p className="text-xs font-bold text-slate-500">
                        ຄິດໄລ່ຕາມສັດສ່ວນນ້ຳໜັກເປີເຊັນຂອງແຕ່ລະກຸ່ມບົດບາດ
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/90 px-5 py-2.5 rounded-2xl border border-amber-300 shadow-sm flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-600">ຄະແນນສຸດທິ (100%):</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
                      {wc.final_weighted_total}%
                    </span>
                  </div>
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {groups.map((g: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-2 hover:border-amber-300 transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg inline-block border border-sky-200">
                          ສັດສ່ວນ {g.weight_percent}%
                        </span>
                        <p className="text-xs font-extrabold text-slate-800 line-clamp-2">
                          {g.label}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold text-[11px]">ສະເລ່ຍ: {g.avg_score}%</span>
                        <span className="font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-mono">
                          +{g.weighted_score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Grouped Evaluation Results Tables by Role */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600" />
                <span>ລາຍການຜົນການປະເມີນແຍກຕາມກຸ່ມ ({allRoleKeys.length} ກຸ່ມ)</span>
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                ຈຳນວນຜູ້ປະເມີນລວມ: {totalEvaluators} ຄົນ
              </span>
            </div>

            {allRoleKeys.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
                <Info className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-sm">ຍັງບໍ່ມີຂໍ້ມູນການປະເມີນສຳລັບພະນັກງານຄົນນີ້</p>
              </div>
            ) : (
              allRoleKeys.map((roleName) => {
                const roleItems = getRoleItems(groupedResult[roleName]);
                const roleSummary = getRoleSummary(groupedResult[roleName]);
                const roleEvaluatorCount = roleItems.length;

                return (
                  <div
                    key={roleName}
                    className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden transition-all"
                  >
                    {/* Role Header Bar */}
                    <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-sky-600/20 shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <span>ກຸ່ມ: {roleName}</span>
                          </h4>
                          <p className="text-xs text-slate-500 font-bold">
                            ຈຳນວນຜູ້ປະເມີນໃນກຸ່ມນີ້: {roleEvaluatorCount} ຄົນ
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Evaluator Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] table-fixed text-left text-xs font-sans">
                        <thead className="bg-slate-100/70 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4 w-[24%]">ຜູ້ປະເມີນ</th>
                            <th className="py-3 px-3 w-[10%] text-center">ຫົວຂໍ້ທີ I</th>
                            <th className="py-3 px-3 w-[10%] text-center">ຫົວຂໍ້ທີ II</th>
                            <th className="py-3 px-3 w-[10%] text-center">ຫົວຂໍ້ທີ III</th>
                            <th className="py-3 px-3 w-[10%] text-center">ຫົວຂໍ້ທີ IV</th>
                            <th className="py-3 px-3 w-[12%] text-right">ຄະແນນລວມ</th>
                            <th className="py-3 px-3 w-[14%] text-center">ສະເລ່ຍ (ເປີເຊັນ)</th>
                            <th className="py-3 px-3 w-[10%] text-center">ລາຍລະອຽດ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {roleItems.map((item) => {
                            const isExpanded = !!expandedItems[item.id];
                            const giverName = item.giver
                              ? `${item.giver.first_name || ""} ${item.giver.last_name || ""}`.trim() || "ຜູ້ປະເມີນ"
                              : "ຜູ້ປະເມີນ";

                            return (
                              <React.Fragment key={item.id}>
                                <tr className="hover:bg-sky-50/50 transition-colors">
                                  <td className="py-3.5 px-5 font-bold text-slate-800">
                                    <div className="flex items-center gap-3">
                                      {item.giver?.empimg ? (
                                        <img
                                          src={item.giver.empimg}
                                          alt=""
                                          className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                                          {giverName.charAt(0)}
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-black text-slate-800">{giverName}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">
                                          {item.giver?.emp_code || `EMP-${item.giverId}`}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                    {item.s1_score}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                    {item.s2_score}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                    {item.s3_score}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                    {item.s4_score}
                                  </td>
                                  <td className="py-3.5 px-5 text-right font-black text-sky-700 text-sm">
                                    {item.total_score}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-black text-amber-600 text-sm">
                                    {item.percent_score != null ? `${item.percent_score}%` : "-"}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <button
                                      type="button"
                                      onClick={() => toggleItemExpand(item.id)}
                                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                                    >
                                      <span>{isExpanded ? "ຊ່ອນ" : "ເບິ່ງຍ່ອຍ"}</span>
                                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                  </td>
                                </tr>

                                {/* Expanded Itemized Detail Row */}
                                {isExpanded && (
                                  <tr className="bg-slate-50/80">
                                    <td colSpan={8} className="p-4 sm:p-6 border-t border-b border-slate-200">
                                      <div className="space-y-4 max-w-4xl mx-auto">
                                        <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                          ລາຍລະອຽດຄະແນນ:
                                        </h5>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                          {/* Section 1 Breakdown */}
                                          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                                            <p className="text-[11px] font-bold text-sky-700 border-b border-slate-100 pb-1">
                                              ຫົວຂໍ້ທີ I (6 ຂໍ້)
                                            </p>
                                            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                                              <span className="bg-slate-50 p-1 rounded font-mono">1: <b>{item.s1_1}</b></span>
                                              <span className="bg-slate-50 p-1 rounded font-mono">2: <b>{item.s1_2}</b></span>
                                              <span className="bg-slate-50 p-1 rounded font-mono">3: <b>{item.s1_3}</b></span>
                                              <span className="bg-slate-50 p-1 rounded font-mono">4: <b>{item.s1_4}</b></span>
                                              <span className="bg-slate-50 p-1 rounded font-mono">5: <b>{item.s1_5}</b></span>
                                              <span className="bg-slate-50 p-1 rounded font-mono">6: <b>{item.s1_6}</b></span>
                                            </div>
                                          </div>

                                          {/* Section 2 Breakdown */}
                                          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                                            <p className="text-[11px] font-bold text-sky-700 border-b border-slate-100 pb-1">
                                              ຫົວຂໍ້ທີ II (5 ຂໍ້)
                                            </p>
                                            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                                              <span className="bg-slate-50 p-1 rounded font-mono">1: <b>{item.s2_1}</b></span>
                                              <span className="bg-slate-50 p-1 rounded font-mono">2: <b>{item.s2_2}</b></span>
                                              <span className="bg-slate-50 p-1 rounded font-mono">3: <b>{item.s2_3}</b></span>
                                              <span className="bg-slate-50 p-1 rounded font-mono">4: <b>{item.s2_4}</b></span>
                                              <span className="bg-slate-50 p-1 rounded font-mono">5: <b>{item.s2_5}</b></span>
                                            </div>
                                          </div>

                                          {/* Section 3 Breakdown */}
                                          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                                            <p className="text-[11px] font-bold text-sky-700 border-b border-slate-100 pb-1">
                                              ຫົວຂໍ້ທີ III (3 ຂໍ້)
                                            </p>
                                            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                                              <span className="bg-slate-50 p-1 rounded font-mono">1: <b>{item.s3_1}</b></span>
                                              <span className="bg-slate-50 p-1 rounded font-mono">2: <b>{item.s3_2}</b></span>
                                              <span className="bg-slate-50 p-1 rounded font-mono">3: <b>{item.s3_3}</b></span>
                                            </div>
                                          </div>

                                          {/* Section 4 Breakdown */}
                                          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                                            <p className="text-[11px] font-bold text-sky-700 border-b border-slate-100 pb-1">
                                              ຫົວຂໍ້ທີ IV (2 ຂໍ້)
                                            </p>
                                            <div className="grid grid-cols-2 gap-1.5 text-center text-xs">
                                              <span className="bg-slate-50 p-1 rounded font-mono">1: <b>{item.s4_1}</b></span>
                                              <span className="bg-slate-50 p-1 rounded font-mono">2: <b>{item.s4_2}</b></span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                        {roleItems.length > 0 && (() => {
                          const count = roleItems.length;
                          const avgS1 = roleSummary ? roleSummary.avg_s1_score : (roleItems.reduce((s, i) => s + (i.s1_score || 0), 0) / count).toFixed(2);
                          const avgS2 = roleSummary ? roleSummary.avg_s2_score : (roleItems.reduce((s, i) => s + (i.s2_score || 0), 0) / count).toFixed(2);
                          const avgS3 = roleSummary ? roleSummary.avg_s3_score : (roleItems.reduce((s, i) => s + (i.s3_score || 0), 0) / count).toFixed(2);
                          const avgS4 = roleSummary ? roleSummary.avg_s4_score : (roleItems.reduce((s, i) => s + (i.s4_score || 0), 0) / count).toFixed(2);
                          const avgTotal = roleSummary ? roleSummary.avg_total_score : (roleItems.reduce((s, i) => s + (i.total_score || 0), 0) / count).toFixed(2);
                          const avgPercent = roleSummary ? roleSummary.avg_percent_score : (roleItems.reduce((s, i) => s + (i.percent_score || 0), 0) / count).toFixed(2);

                          return (
                            <tfoot className="bg-sky-100/70 border-t-2 border-sky-300 text-xs font-black">
                              <tr>
                                <td className="py-3 px-4 text-sky-900 font-black">
                                  ຄະແນນສະເລ່ຍກຸ່ມ {roleName}
                                </td>
                                <td className="py-3 px-3 text-center text-sky-900">{avgS1}</td>
                                <td className="py-3 px-3 text-center text-sky-900">{avgS2}</td>
                                <td className="py-3 px-3 text-center text-sky-900">{avgS3}</td>
                                <td className="py-3 px-3 text-center text-sky-900">{avgS4}</td>
                                <td className="py-3 px-3 text-right font-black text-sky-950 text-sm">{avgTotal}</td>
                                <td className="py-3 px-3 text-center font-black text-amber-700 text-sm">{avgPercent}%</td>
                                <td className="py-3 px-3 text-center text-slate-400">-</td>
                              </tr>
                            </tfoot>
                          );
                        })()}
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm max-w-xl mx-auto space-y-4">
          <Search className="w-12 h-12 text-sky-500 mx-auto animate-bounce" />
          <h3 className="text-lg font-black text-slate-800">
            ກະລຸນາເລືອກ ພະນັກງານ ເພື່ອເບິ່ງຜົນການປະເມີນ 360
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            ພິມຄົ້ນຫາ ລະຫັດພະນັກງານ ຈາກຊ່ອງຄົ້ນຫາດ້ານເທິງ ແລ້ວກົດປຸ່ມ "ຄົ້ນຫາ" ເພື່ອສະແດງຜົນການປະເມີນ ແລະ ສຫຼຸບຄະແນນແຍກຕາມບົດບາດຜູ້ປະເມີນ
          </p>
        </div>
      )}
    </div>
  );
}
