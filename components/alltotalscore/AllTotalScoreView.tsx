"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  Users,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Layers,
  Info,
  FileSpreadsheet,
  FileText,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
} from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";

export interface WeightedGroup {
  label: string;
  weight_percent: number;
  avg_score: number;
  weighted_score: number;
}

export interface WeightedCalculation {
  receiver_roleId: number;
  branch_id?: number | null;
  groupA?: WeightedGroup;
  groupB?: WeightedGroup;
  groupC?: WeightedGroup;
  groupD?: WeightedGroup;
  groupE?: WeightedGroup;
  final_weighted_total: number;
}

export interface ReceiverScoreItem {
  receiverId: number;
  emp_code: string | null;
  first_name: string | null;
  last_name: string | null;
  empimg: string | null;
  roleId: number | null;
  posId?: number | null;
  departmentId: number | null;
  divisionId: number | null;
  position?: {
    id: number;
    name?: string | null;
    pos_name?: string | null;
  } | null;
  department?: {
    id: number;
    name?: string | null;
    department_name?: string | null;
  } | null;
  division?: {
    id: number;
    name?: string | null;
    division_name?: string | null;
  } | null;
  finalTotal: number;
  _weightedCalculation?: WeightedCalculation;
}

const roleMap: Record<number, string> = {
  1: "Admin",
  2: "ຜູ້ອຳນວຍການໃຫຍ່",
  3: "ຮອງຜູ້ອຳນວຍການໃຫ່ຍ",
  4: "ຄະນະຝ່າຍ/ສະຖາບັນ/ຫ້ອງການ",
  5: "ຄະນະພະແນກ/ສູນ/ສາຂາ",
  6: "ຄະນະຫ້ອງການ",
  7: "ຄະນະໜ່ວຍງານ",
  8: "ວິຊາການ",
  9: "ປະເມີນຕົນເອງ",
};

export const getRoleName = (roleId?: number | null): string => {
  if (!roleId) return "ບໍ່ລະບຸ";
  return roleMap[roleId] || `Role ${roleId}`;
};

function UserAvatar({
  empimg,
  firstName,
  empCode,
}: {
  empimg?: string | null;
  firstName?: string | null;
  empCode?: string | null;
}) {
  const [imgError, setImgError] = useState(false);

  if (empimg && !imgError) {
    return (
      <img
        src={empimg}
        alt={empCode || ""}
        loading="lazy"
        decoding="async"
        className="w-10 h-10 rounded-2xl object-cover object-top border border-slate-200 shadow-sm shrink-0 bg-slate-100"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0 uppercase">
      {(firstName || empCode || "ED").slice(0, 2)}
    </div>
  );
}

export function AllTotalScoreView() {
  // Main Data States
  const [results, setResults] = useState<ReceiverScoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Departments & Divisions
  const [deptList, setDeptList] = useState<{ id: number; name: string }[]>([]);
  const [divisionList, setDivisionList] = useState<{ id: number; name: string }[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("ROLE_ASC");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Detail Modal State
  const [detailModalItem, setDetailModalItem] = useState<ReceiverScoreItem | null>(null);

  // Fetch Departments
  useEffect(() => {
    axiosInstance
      .get("/departments/selectdepartment")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setDeptList(
          list.map((d: any) => ({
            id: Number(d.id),
            name: String(d.department_name || `Department #${d.id}`),
          }))
        );
      })
      .catch((err) => console.warn("Failed to fetch departments:", err));
  }, []);

  // Fetch Divisions when Department changes
  useEffect(() => {
    setSelectedDivisionId("");
    setDivisionList([]);
    if (selectedDeptId) {
      axiosInstance
        .get(`/divisions/selectdivision?departmentId=${selectedDeptId}`)
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
              ? res.data.data
              : [];
          setDivisionList(
            list.map((d: any) => ({
              id: Number(d.id),
              name: String(d.division_name || `Division #${d.id}`),
            }))
          );
        })
        .catch((err) => console.warn("Failed to fetch divisions:", err));
    }
  }, [selectedDeptId]);

  // Fetch All Total Scores
  const fetchAllScores = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {};
      if (selectedDeptId) params.departmentId = Number(selectedDeptId);
      if (selectedDivisionId) params.divisionId = Number(selectedDivisionId);

      const res = await axiosInstance.get<ReceiverScoreItem[]>("/totals/resultall", {
        params,
      });

      const resData = res.data as any;
      const data = Array.isArray(resData)
        ? resData
        : Array.isArray(resData?.data)
          ? resData.data
          : [];
      setResults(data);
    } catch (err: any) {
      console.error("Failed to fetch all total scores:", err);
      setError(
        err?.response?.data?.message ||
        "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນຜົນການປະເມີນລວມ"
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllScores();
  }, [selectedDeptId, selectedDivisionId]);

  // Department / Division lookup maps
  const deptMap = useMemo(() => {
    const map = new Map<number, string>();
    deptList.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [deptList]);

  const divisionMap = useMemo(() => {
    const map = new Map<number, string>();
    divisionList.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [divisionList]);

  // Filtered and Sorted Data
  const filteredResults = useMemo(() => {
    let list = [...results];

    // Search query filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.emp_code?.toLowerCase().includes(q) ||
          item.first_name?.toLowerCase().includes(q) ||
          item.last_name?.toLowerCase().includes(q) ||
          `${item.first_name || ""} ${item.last_name || ""}`.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (roleFilter !== "ALL") {
      const targetRoleId = Number(roleFilter);
      list = list.filter((item) => item.roleId === targetRoleId);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "SCORE_DESC") {
        return (b.finalTotal || 0) - (a.finalTotal || 0);
      }
      if (sortBy === "SCORE_ASC") {
        return (a.finalTotal || 0) - (b.finalTotal || 0);
      }
      if (sortBy === "ROLE_ASC") {
        return (a.roleId || 0) - (b.roleId || 0) || a.receiverId - b.receiverId;
      }
      if (sortBy === "ROLE_DESC") {
        return (b.roleId || 0) - (a.roleId || 0) || a.receiverId - b.receiverId;
      }
      if (sortBy === "CODE_ASC") {
        return (a.emp_code || "").localeCompare(b.emp_code || "");
      }
      if (sortBy === "NAME_ASC") {
        return (a.first_name || "").localeCompare(b.first_name || "");
      }
      return 0;
    });

    return list;
  }, [results, debouncedSearch, roleFilter, sortBy]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, page, pageSize]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedDeptId("");
    setSelectedDivisionId("");
    setRoleFilter("ALL");
    setSortBy("ROLE_ASC");
    setPage(1);
  };

  // Export Excel
  const handleExportExcel = async () => {
    if (filteredResults.length === 0) return;

    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const sheetData: any[] = [];

    sheetData.push(["ລາຍງານຜົນການປະເມີນ 360 ອົງສາລວມທັງໝົດ (EDL EVALUATION)"]);
    sheetData.push([`ວັນທີສ້າງລາຍງານ: ${new Date().toLocaleDateString("lo-LA")}`]);
    if (selectedDeptId) {
      sheetData.push([`ພາກສ່ວນ/ຝ່າຍ: ${deptMap.get(Number(selectedDeptId)) || ""}`]);
    }
    sheetData.push([]);

    sheetData.push([
      "ລຳດັບ",
      "ລະຫັດພະນັກງານ",
      "ຊື່ ແລະ ນາມສະກຸນ",
      "ຕຳແໜ່ງ",
      "ບົດບາດ",
      "ຝ່າຍ/ສະຖາບັນ/ຫ້ອງການ",
      "ພະແນກ/ສູນ/ສາຂາ",
      "ສັດສ່ວນເປີເຊັນ",
      "ຄະແນນສຸດທິ (100%)",
    ]);

    filteredResults.forEach((item, index) => {
      const posName =
        item.position?.name || item.position?.pos_name || "-";
      const deptName =
        item.department?.name ||
        item.department?.department_name ||
        (item.departmentId ? deptMap.get(item.departmentId) || `Dept #${item.departmentId}` : "-");
      const divName =
        item.division?.name ||
        item.division?.division_name ||
        (item.divisionId ? divisionMap.get(item.divisionId) || `Div #${item.divisionId}` : "-");

      const wc = item._weightedCalculation;
      const groups = wc
        ? [wc.groupA, wc.groupB, wc.groupC, wc.groupD, wc.groupE].filter(Boolean)
        : [];
      const breakdownText =
        groups.length > 0
          ? groups.map((g: any) => `${g.label || ""}: ${g.weighted_score}%`).join(", ")
          : "-";

      sheetData.push([
        index + 1,
        item.emp_code || "",
        `${item.first_name || ""} ${item.last_name || ""}`.trim(),
        posName,
        getRoleName(item.roleId),
        deptName,
        divName,
        breakdownText,
        item.finalTotal,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "ຜົນການປະເມີນລວມ");
    XLSX.writeFile(wb, `EDL_Evaluation_Overall_${new Date().getTime()}.xlsx`);
  };

  // Export PDF using @react-pdf/renderer
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleExportPDF = async () => {
    if (filteredResults.length === 0 || exportingPDF) return;

    try {
      setExportingPDF(true);

      const [{ pdf }, { AllTotalScorePDFDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./AllTotalScorePDF"),
      ]);

      const formattedData = filteredResults.map((item) => {
        const deptName =
          item.department?.name ||
          item.department?.department_name ||
          (item.departmentId ? deptMap.get(item.departmentId) || `Dept #${item.departmentId}` : "-");
        const divName =
          item.division?.name ||
          item.division?.division_name ||
          (item.divisionId ? divisionMap.get(item.divisionId) || `Div #${item.divisionId}` : "");
        const deptDivText = divName && divName !== "-" ? `${deptName} / ${divName}` : deptName;

        const wc = item._weightedCalculation;
        const groups = wc
          ? [wc.groupA, wc.groupB, wc.groupC, wc.groupD, wc.groupE].filter(Boolean)
          : [];
        const breakdownText =
          groups.length > 0
            ? groups.map((g: any) => `${g.label || ""}: ${g.weighted_score}%`).join(", ")
            : "-";

        const posName =
          item.position?.name || item.position?.pos_name || "-";

        return {
          receiverId: item.receiverId,
          emp_code: item.emp_code,
          first_name: item.first_name,
          last_name: item.last_name,
          posName,
          roleName: getRoleName(item.roleId),
          deptDivText,
          breakdownText,
          finalTotal: item.finalTotal,
        };
      });

      const docBlob = await pdf(
        <AllTotalScorePDFDocument
          data={formattedData}
          reportDate={new Date().toLocaleDateString("lo-LA")}
          departmentFilterName={
            selectedDeptId ? deptMap.get(Number(selectedDeptId)) : undefined
          }
        />
      ).toBlob();

      const url = URL.createObjectURL(docBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `EDL_Evaluation_Overall_${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Export error:", err);
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-sky-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden print:bg-white print:text-black print:p-0 print:shadow-none">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              ຜົນການປະເມີນລວມ
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
              ສະແດງຜົນການຄິດໄລ່ຄະແນນລວມ ຕາມສັດສ່ວນນ້ຳໜັກຂອງແຕ່ລະບົດບາດ
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <button
              onClick={fetchAllScores}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 backdrop-blur-md shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              title="ໂຫຼດຂໍ້ມູນຄືນໃໝ່"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>ຣີເຟຣຊ</span>
            </button>

            <button
              onClick={handleExportExcel}
              disabled={results.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={results.length === 0 || exportingPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <FileText className={`w-4 h-4 ${exportingPDF ? "animate-spin" : ""}`} />
              <span>{exportingPDF ? "ກຳລັງສ້າງ PDF..." : "PDF"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-black text-slate-800">ຕົວກັ່ນຕອງ & ຄົ້ນຫາ</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle (Table / Grid) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === "table"
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ຕາຕະລາງ</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === "grid"
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ກາດ</span>
              </button>
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
            >
              ລ້າງຕົວກັ່ນຕອງ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ຄົ້ນຫາ ລະຫັດ ຫຼື ຊື່ພະນັກງານ..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
            >
              <option value="">-- ທຸກຝ່າຍ / ສະຖາບັນ / ຫ້ອງການ --</option>
              {deptList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Division Filter */}
          <div>
            <select
              value={selectedDivisionId}
              onChange={(e) => {
                setSelectedDivisionId(e.target.value);
                setPage(1);
              }}
              disabled={!selectedDeptId}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-50 cursor-pointer"
            >
              <option value="">-- ທຸກພະແນກ / ສາຂາ --</option>
              {divisionList.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
            >
              <option value="ALL">-- ທຸກບົດບາດ (All Roles) --</option>
              <option value="2">Role 2: ຜູ້ອຳນວຍການໃຫຍ່</option>
              <option value="3">Role 3: ຮອງຜູ້ອຳນວຍການໃຫ່ຍ</option>
              <option value="4">Role 4: ຄະນະຝ່າຍ/ສະຖາບັນ/ຫ້ອງການ</option>
              <option value="5">Role 5: ຄະນະພະແນກ/ສູນ/ສາຂາ</option>
              <option value="6">Role 6: ຄະນະຫ້ອງການ</option>
              <option value="7">Role 7: ຄະນະໜ່ວຍງານ</option>
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">ຈັດຮຽງຕາມ:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "ROLE_ASC", label: "ບົດບາດ (2 &rarr; 7)" },
                { id: "ROLE_DESC", label: "ບົດບາດ (7 &rarr; 2)" },
                { id: "SCORE_DESC", label: "ຄະແນນສູງ &rarr; ຕ່ຳ" },
                { id: "SCORE_ASC", label: "ຄະແນນຕ່ຳ &rarr; ສູງ" },
                { id: "CODE_ASC", label: "ລະຫັດພະນັກງານ" },
                { id: "NAME_ASC", label: "ຊື່ພະນັກງານ" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${sortBy === s.id
                    ? "bg-sky-100 text-sky-800 border border-sky-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60"
                    }`}
                  dangerouslySetInnerHTML={{ __html: s.label }}
                />
              ))}
            </div>
          </div>

          <div className="text-slate-500 font-semibold">
            ພົບເຫັນທັງໝົດ <strong className="text-slate-800">{filteredResults.length}</strong> ທ່ານ
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
          <p className="font-bold text-sm text-slate-600">ກຳລັງໂຫຼດຂໍ້ມູນຜົນການປະເມີນລວມ...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200 text-rose-700 space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="font-bold text-sm">{error}</p>
          <button
            onClick={fetchAllScores}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm hover:bg-rose-500 cursor-pointer"
          >
            ລອງໃໝ່ອີກຄັ້ງ
          </button>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <Info className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-base text-slate-700">ບໍ່ພົບຂໍ້ມູນຜົນການປະເມີນ</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            ບໍ່ມີຂໍ້ມູນທີ່ກົງກັບເງື່ອນໄຂການຄົ້ນຫາ ຫຼື ຍັງບໍ່ທັນມີການປະເມີນໃນພາກສ່ວນນີ້
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-2xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-all cursor-pointer"
          >
            ລ້າງຕົວກັ່ນຕອງທັງໝົດ
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ======================== TABLE VIEW ======================== */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-4 min-w-[200px]">ພະນັກງານ</th>
                  <th className="py-3.5 px-4 min-w-[160px]">ຕຳແໜ່ງ</th>
                  <th className="py-3.5 px-4 min-w-[170px]">ບົດບາດ</th>
                  <th className="py-3.5 px-4 min-w-[180px]">ພາກສ່ວນ</th>
                  <th className="py-3.5 px-4 min-w-[200px]">ສັດສ່ວນເປີເຊັນ</th>
                  <th className="py-3.5 px-4 text-center min-w-[130px]">ຄະແນນສຸດທິ</th>
                  <th className="py-3.5 px-4 text-center min-w-[120px]">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {paginatedData.map((item, idx) => {
                  const absoluteIndex = (page - 1) * pageSize + idx + 1;
                  const wc = item._weightedCalculation;
                  const groups = wc
                    ? [wc.groupA, wc.groupB, wc.groupC, wc.groupD, wc.groupE].filter(Boolean)
                    : [];

                  return (
                    <tr
                      key={item.receiverId}
                      className="hover:bg-sky-50/40 transition-colors group"
                    >
                      {/* # Index */}
                      <td className="py-3 px-4 text-center font-bold text-slate-400 font-mono">
                        {absoluteIndex}
                      </td>

                      {/* Employee Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            empimg={item.empimg}
                            firstName={item.first_name}
                            empCode={item.emp_code}
                          />
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 truncate">
                              {item.first_name || ""} {item.last_name || ""}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              @{item.emp_code}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">
                          {item.position?.name || item.position?.pos_name || "-"}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {getRoleName(item.roleId)}
                        </span>
                      </td>

                      {/* Department / Division */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">
                            {item.department?.name ||
                              item.department?.department_name ||
                              (item.departmentId
                                ? deptMap.get(item.departmentId) || `Dept #${item.departmentId}`
                                : "-")}
                          </p>
                          {(item.division?.name ||
                            item.division?.division_name ||
                            item.divisionId) && (
                              <p className="text-[10px] text-slate-400 line-clamp-1">
                                {item.division?.name ||
                                  item.division?.division_name ||
                                  (item.divisionId
                                    ? divisionMap.get(item.divisionId) || `Div #${item.divisionId}`
                                    : "")}
                              </p>
                            )}
                        </div>
                      </td>

                      {/* Mini 360 Breakdown Visual Pills */}
                      <td className="py-3 px-4">
                        {groups.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {groups.map((g: any, gIdx: number) => (
                              <div
                                key={gIdx}
                                title={g.label || ""}
                                className="relative group/tooltip inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-800 transition-all cursor-pointer"
                              >
                                <span className="text-slate-500">{g.weight_percent}%:</span>
                                <span className="font-mono text-sky-700 font-black">
                                  {g.weighted_score}%
                                </span>

                                {/* Instant Floating Tooltip */}
                                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-150 ease-out z-50 whitespace-nowrap drop-shadow-xl">
                                  <div className="bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg border border-slate-700 text-center">
                                    <span className="font-bold text-sky-300">{g.label}</span>
                                  </div>
                                  <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            ຄິດໄລ່ສະເລ່ຍທົ່ວໄປ
                          </span>
                        )}
                      </td>

                      {/* Final Total Score */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-3.5 py-1.5 rounded-2xl font-mono text-sm font-black bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 text-sky-800 shadow-sm">
                          {item.finalTotal}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick View Breakdown Modal Button */}
                          <button
                            onClick={() => setDetailModalItem(item)}
                            className="p-2 rounded-xl text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                            title="ເບິ່ງລາຍລະອຽດການຖ່ວງນ້ຳໜັກ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Link to Full Individual 360 Detail View */}
                          {item.emp_code && (
                            <Link
                              href={`/totalscore?emp_code=${encodeURIComponent(item.emp_code)}`}
                              className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors inline-block"
                              title="ເປີດໃບປະເມີນລະອຽດບຸກຄົນ"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span>ສະແດງຕໍ່ໜ້າ:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={8}>8</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>
                ຈາກທັງໝົດ <strong className="text-slate-800">{filteredResults.length}</strong> ລາຍການ
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                title="ໜ້າທຳອິດ"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                title="ໜ້າກ່ອນໜ້າ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-slate-700">
                ໜ້າ {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                title="ໜ້າຖັດໄປ"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                title="ໜ້າສຸດທ້າຍ"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ======================== GRID / CARDS VIEW ======================== */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedData.map((item) => {
              const wc = item._weightedCalculation;
              const groups = wc
                ? [wc.groupA, wc.groupB, wc.groupC, wc.groupD, wc.groupE].filter(Boolean)
                : [];

              return (
                <div
                  key={item.receiverId}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between space-y-4 group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        empimg={item.empimg}
                        firstName={item.first_name}
                        empCode={item.emp_code}
                      />
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          {item.first_name || ""} {item.last_name || ""}
                        </h4>
                        <span className="inline-block mt-0.5 text-[11px] font-bold font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {item.emp_code || `ID: ${item.receiverId}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role & Department */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5 text-slate-600">
                      <span className="font-bold text-[11px] px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {getRoleName(item.roleId)}
                      </span>
                      {(item.position?.name || item.position?.pos_name) && (
                        <span className="font-semibold text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                          {item.position?.name || item.position?.pos_name}
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-semibold text-slate-700 line-clamp-1">
                        {item.department?.name ||
                          item.department?.department_name ||
                          (item.departmentId
                            ? deptMap.get(item.departmentId) || `Dept #${item.departmentId}`
                            : "-")}
                      </p>
                      {(item.division?.name ||
                        item.division?.division_name ||
                        item.divisionId) && (
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {item.division?.name ||
                              item.division?.division_name ||
                              (item.divisionId
                                ? divisionMap.get(item.divisionId) || `Div #${item.divisionId}`
                                : "")}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Score Highlight Box */}
                  <div className="bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/40 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        ຄະແນນສຸດທິ
                      </p>
                      <p className="text-2xl font-black text-sky-900 font-mono">
                        {item.finalTotal}%
                      </p>
                    </div>
                  </div>

                  {/* 360 Mini Groups Preview */}
                  {groups.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400">ສັດສ່ວນນ້ຳໜັກ 360°:</p>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        {groups.map((g: any, gIdx: number) => (
                          <div
                            key={gIdx}
                            title={g.label || ""}
                            className="relative group/tooltip bg-slate-50 hover:bg-sky-50 hover:border-sky-200 px-2 py-1 rounded-lg border border-slate-100 flex justify-between items-center transition-all cursor-pointer"
                          >
                            <span className="font-bold text-slate-600">{g.weight_percent}%:</span>
                            <span className="font-black font-mono text-sky-700">
                              {g.weighted_score}%
                            </span>

                            {/* Instant Floating Tooltip */}
                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-150 ease-out z-50 whitespace-nowrap drop-shadow-xl">
                              <div className="bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg border border-slate-700 text-center">
                                <span className="font-bold text-sky-300">{g.label}</span>
                              </div>
                              <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setDetailModalItem(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ເບິ່ງນ້ຳໜັກ</span>
                    </button>

                    {item.emp_code && (
                      <Link
                        href={`/totalscore?emp_code=${encodeURIComponent(item.emp_code)}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-sm shadow-sky-500/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>ໃບປະເມີນ</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls for Grid View */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
            <div>
              ສະແດງ <strong className="text-slate-800">{paginatedData.length}</strong> ຈາກທັງໝົດ{" "}
              <strong className="text-slate-800">{filteredResults.length}</strong> ທ່ານ
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer font-bold"
              >
                ກ່ອນໜ້າ
              </button>
              <span className="font-bold text-slate-700">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer font-bold"
              >
                ຖັດໄປ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Breakdown Modal */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-sky-800 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar
                  empimg={detailModalItem.empimg}
                  firstName={detailModalItem.first_name}
                  empCode={detailModalItem.emp_code}
                />
                <div>
                  <h3 className="text-lg font-black text-white">
                    {detailModalItem.first_name || ""} {detailModalItem.last_name || ""}
                  </h3>
                  <p className="text-xs text-sky-200 font-mono">
                    ລະຫັດ: {detailModalItem.emp_code || "-"} | {getRoleName(detailModalItem.roleId)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDetailModalItem(null)}
                className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Score Highlight Header */}
              <div className="bg-gradient-to-br from-sky-50 via-indigo-50 to-amber-50/50 border border-sky-200 p-5 rounded-3xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-600">ຄະແນນລວມສຸດທິ (100%):</span>
                  <div className="text-3xl font-black text-sky-900 font-mono mt-0.5">
                    {detailModalItem.finalTotal}%
                  </div>
                </div>
              </div>

              {/* 360 Degree Groups Breakdown List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>ລາຍລະອຽດສັດສ່ວນນ້ຳໜັກແຕ່ລະກຸ່ມບົດບາດ:</span>
                </h4>

                {detailModalItem._weightedCalculation ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      detailModalItem._weightedCalculation.groupA,
                      detailModalItem._weightedCalculation.groupB,
                      detailModalItem._weightedCalculation.groupC,
                      detailModalItem._weightedCalculation.groupD,
                      detailModalItem._weightedCalculation.groupE,
                    ]
                      .filter(Boolean)
                      .map((g: any, idx: number) => (
                        <div
                          key={idx}
                          title={g.label}
                          className="bg-slate-50 hover:bg-sky-50/50 p-4 rounded-2xl border border-slate-200 space-y-2 transition-colors cursor-default"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg border border-sky-200">
                              ສັດສ່ວນ {g.weight_percent}%
                            </span>
                            <span className="text-xs font-black text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg font-mono">
                              +{g.weighted_score}%
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-800 line-clamp-2">
                            {g.label}
                          </p>
                          <div className="text-[11px] text-slate-500 font-bold pt-1 border-t border-slate-200/60 flex justify-between">
                            <span>ຄະແນນສະເລ່ຍກຸ່ມ:</span>
                            <span className="font-mono text-slate-900">{g.avg_score}%</span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    ບໍ່ມີຂໍ້ມູນລາຍລະອຽດການຖ່ວງນ້ຳໜັກ
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setDetailModalItem(null)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                ປິດໜ້າຕ່າງ
              </button>

              {detailModalItem.emp_code && (
                <Link
                  href={`/totalscore?emp_code=${encodeURIComponent(detailModalItem.emp_code)}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>ເບິ່ງໃບປະເມີນລະອຽດທັງໝົດ</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
