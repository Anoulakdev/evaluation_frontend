"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Network,
  Building,
  Layers,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";

import { CategoryMeta, OrgCategoryCard } from "./OrgCategoryCard";
import { OrgDataTable, GenericOrgItem } from "./OrgDataTable";
import { DepartmentModal } from "./DepartmentModal";
import { DivisionModal } from "./DivisionModal";
import { OfficeModal } from "./OfficeModal";
import { UnitModal } from "./UnitModal";

type OrgCategory = "department" | "division" | "office" | "unit";

const CATEGORIES: CategoryMeta[] = [
  {
    key: "department",
    titleLao: "ຝ່າຍ",
    titleEng: "Department",
    endpoint: "/departments",
    icon: Building2,
    bgGradient: "from-sky-500/10 to-blue-600/10 hover:from-sky-500/20 hover:to-blue-600/20",
    badgeColor: "bg-sky-100 text-sky-700 border-sky-200",
    textColor: "text-sky-700",
    borderColor: "border-sky-300",
  },
  {
    key: "division",
    titleLao: "ພະແນກ/ສາຂາ",
    titleEng: "Division",
    endpoint: "/divisions",
    icon: Network,
    bgGradient: "from-indigo-500/10 to-purple-600/10 hover:from-indigo-500/20 hover:to-purple-600/20",
    badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-300",
  },
  {
    key: "office",
    titleLao: "ຫ້ອງການ",
    titleEng: "Office",
    endpoint: "/offices",
    icon: Building,
    bgGradient: "from-emerald-500/10 to-teal-600/10 hover:from-emerald-500/20 hover:to-teal-600/20",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-300",
  },
  {
    key: "unit",
    titleLao: "ໜ່ວຍງານ",
    titleEng: "Unit",
    endpoint: "/units",
    icon: Layers,
    bgGradient: "from-amber-500/10 to-orange-600/10 hover:from-amber-500/20 hover:to-orange-600/20",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    textColor: "text-amber-700",
    borderColor: "border-amber-300",
  },
];

export function OrganizationView() {
  const [activeCategory, setActiveCategory] = useState<OrgCategory>("department");
  const [counts, setCounts] = useState<Record<OrgCategory, number>>({
    department: 0,
    division: 0,
    office: 0,
    unit: 0,
  });

  const [items, setItems] = useState<GenericOrgItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string>("");

  // Department filter for Division table view
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<number | "">("");
  const [deptFilterList, setDeptFilterList] = useState<{ id: number; name: string }[]>([]);

  // Division filter for Office table view
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<number | "">("");
  const [divisionFilterList, setDivisionFilterList] = useState<{ id: number; name: string }[]>([]);

  // Cascading filters for Unit table view (Department -> Division -> Office)
  const [selectedUnitDeptFilter, setSelectedUnitDeptFilter] = useState<number | "">("");
  const [unitDeptFilterList, setUnitDeptFilterList] = useState<{ id: number; name: string }[]>([]);

  const [selectedUnitDivisionFilter, setSelectedUnitDivisionFilter] = useState<number | "">("");
  const [unitDivisionFilterList, setUnitDivisionFilterList] = useState<{ id: number; name: string }[]>([]);

  const [selectedUnitOfficeFilter, setSelectedUnitOfficeFilter] = useState<number | "">("");
  const [unitOfficeFilterList, setUnitOfficeFilterList] = useState<{ id: number; name: string }[]>([]);

  // Department Modal States
  const [deptModalState, setDeptModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    initialData?: GenericOrgItem | null;
  }>({
    isOpen: false,
    mode: "create",
    initialData: null,
  });

  // Division Modal States
  const [divisionModalState, setDivisionModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    initialData?: GenericOrgItem | null;
  }>({
    isOpen: false,
    mode: "create",
    initialData: null,
  });

  // Office Modal States
  const [officeModalState, setOfficeModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    initialData?: GenericOrgItem | null;
  }>({
    isOpen: false,
    mode: "create",
    initialData: null,
  });

  // Unit Modal States
  const [unitModalState, setUnitModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    initialData?: GenericOrgItem | null;
  }>({
    isOpen: false,
    mode: "create",
    initialData: null,
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch departments list for filter when category is division
  useEffect(() => {
    if (activeCategory === "division") {
      axiosInstance
        .get("/departments/selectdepartment")
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          setDeptFilterList(
            list.map((d: Record<string, unknown>) => ({
              id: Number(d.id),
              name: String(d.department_name || `Department #${d.id}`),
            }))
          );
        })
        .catch(() => {});
    } else {
      setSelectedDeptFilter("");
    }
  }, [activeCategory]);

  // Fetch divisions list for filter when category is office (only branch_id = 2)
  useEffect(() => {
    if (activeCategory === "office") {
      axiosInstance
        .get("/divisions/selectdivision")
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          const branch2Only = list.filter(
            (d: Record<string, unknown>) => Number(d.branch_id) === 2
          );
          setDivisionFilterList(
            branch2Only.map((d: Record<string, unknown>) => ({
              id: Number(d.id),
              name: String(d.division_name || `Division #${d.id}`),
            }))
          );
        })
        .catch(() => {});
    } else {
      setSelectedDivisionFilter("");
    }
  }, [activeCategory]);

  // Setup Unit Filter 1: Department List when category is unit
  useEffect(() => {
    if (activeCategory === "unit") {
      axiosInstance
        .get("/departments/selectdepartment")
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          setUnitDeptFilterList(
            list.map((d: Record<string, unknown>) => ({
              id: Number(d.id),
              name: String(d.department_name || `Department #${d.id}`),
            }))
          );
        })
        .catch(() => {});
    } else {
      setSelectedUnitDeptFilter("");
      setSelectedUnitDivisionFilter("");
      setSelectedUnitOfficeFilter("");
    }
  }, [activeCategory]);

  // Setup Unit Filter 2: Division List when selectedUnitDeptFilter changes
  useEffect(() => {
    if (activeCategory === "unit" && selectedUnitDeptFilter) {
      axiosInstance
        .get(`/divisions/selectdivision?departmentId=${selectedUnitDeptFilter}`)
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          setUnitDivisionFilterList(
            list.map((d: Record<string, unknown>) => ({
              id: Number(d.id),
              name: String(d.division_name || `Division #${d.id}`),
            }))
          );
        })
        .catch(() => {});
    } else {
      setUnitDivisionFilterList([]);
      setSelectedUnitDivisionFilter("");
      setUnitOfficeFilterList([]);
      setSelectedUnitOfficeFilter("");
    }
  }, [activeCategory, selectedUnitDeptFilter]);

  // Setup Unit Filter 3: Office List when selectedUnitDivisionFilter changes
  useEffect(() => {
    if (activeCategory === "unit" && selectedUnitDivisionFilter) {
      axiosInstance
        .get(`/offices/selectoffice?divisionId=${selectedUnitDivisionFilter}`)
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          setUnitOfficeFilterList(
            list.map((o: Record<string, unknown>) => ({
              id: Number(o.id),
              name: String(o.office_name || `Office #${o.id}`),
            }))
          );
        })
        .catch(() => {});
    } else {
      setUnitOfficeFilterList([]);
      setSelectedUnitOfficeFilter("");
    }
  }, [activeCategory, selectedUnitDivisionFilter]);

  // Fetch counts for all 4 cards in parallel
  const fetchCounts = async () => {
    try {
      const results = await Promise.all(
        CATEGORIES.map(async (cat) => {
          try {
            const res = await axiosInstance.get(cat.endpoint, {
              params: { limit: 1, page: 1 },
            });
            const total =
              res.data?.total !== undefined
                ? res.data.total
                : Array.isArray(res.data?.data)
                ? res.data.data.length
                : Array.isArray(res.data)
                ? res.data.length
                : 0;
            return { key: cat.key, total };
          } catch {
            return { key: cat.key, total: 0 };
          }
        })
      );

      setCounts((prev) => {
        const updated = { ...prev };
        results.forEach((r) => {
          updated[r.key as OrgCategory] = r.total;
        });
        return updated;
      });
    } catch {
      // silence error on initial badge fetch
    }
  };

  // Fetch items for active category
  const fetchActiveItems = async () => {
    setLoading(true);
    setErrorMsg("");
    const catMeta = CATEGORIES.find((c) => c.key === activeCategory);
    if (!catMeta) return;

    try {
      let baseUrl = catMeta.endpoint;
      const params: string[] = [];

      if (debouncedSearch.trim()) {
        params.push(`search=${encodeURIComponent(debouncedSearch.trim())}`);
      }

      if (activeCategory === "division" && selectedDeptFilter) {
        params.push(`departmentId=${selectedDeptFilter}`);
      } else if (activeCategory === "office" && selectedDivisionFilter) {
        params.push(`divisionId=${selectedDivisionFilter}`);
      } else if (activeCategory === "unit") {
        if (selectedUnitDeptFilter) params.push(`departmentId=${selectedUnitDeptFilter}`);
        if (selectedUnitDivisionFilter) params.push(`divisionId=${selectedUnitDivisionFilter}`);
        if (selectedUnitOfficeFilter) params.push(`officeId=${selectedUnitOfficeFilter}`);
      }

      const endpoint = params.length > 0 ? `${baseUrl}?${params.join("&")}` : baseUrl;

      const res = await axiosInstance.get(endpoint);
      const rawList: Record<string, unknown>[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      if (rawList.length >= 0) {
        const mapped: GenericOrgItem[] = rawList.map((raw: Record<string, unknown>) => {
          const id = Number(raw.id || raw.ID || 0);
          const code =
            (raw.department_code as string) ||
            (raw.division_code as string) ||
            (raw.office_code as string) ||
            (raw.unit_code as string) ||
            (raw.posnameId ? String(raw.posnameId) : undefined);

          const name =
            (raw.department_name as string) ||
            (raw.division_name as string) ||
            (raw.office_name as string) ||
            (raw.unit_name as string) ||
            (raw.pos_name as string) ||
            `Item #${id}`;

          const parentId =
            (raw.departmentId as number) ||
            (raw.divisionId as number) ||
            (raw.officeId as number) ||
            undefined;

          const parentName =
            (raw.department as { department_name?: string })?.department_name ||
            (raw.division as { division_name?: string })?.division_name ||
            (raw.office as { office_name?: string })?.office_name ||
            undefined;

          const branchId = (raw.branch_id as number) ?? undefined;
          const divisionId = (raw.divisionId as number) || undefined;
          const officeId = (raw.officeId as number) || undefined;

          const divisionName =
            (raw.division as { division_name?: string })?.division_name ||
            (raw.office as { division?: { division_name?: string } })?.division?.division_name ||
            undefined;

          const officeName = (raw.office as { office_name?: string })?.office_name || undefined;
          const unitType = (raw.unit_type as string) || undefined;

          return {
            id,
            code,
            name,
            parentId,
            parentName,
            branchId,
            divisionId,
            divisionName,
            officeId,
            officeName,
            unitType,
          };
        });

        const totalCount = res.data?.total !== undefined ? res.data.total : mapped.length;
        setItems(mapped);
        setCounts((prev) => ({ ...prev, [activeCategory]: totalCount }));
      } else {
        setItems([]);
      }
    } catch (err: unknown) {
      console.warn(`Failed to fetch ${activeCategory}:`, err);
      setErrorMsg(`ບໍ່ສາມາດດຶງຂໍ້ມູນ ${catMeta.titleLao} ໄດ້`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    fetchActiveItems();
  }, [
    activeCategory,
    debouncedSearch,
    selectedDeptFilter,
    selectedDivisionFilter,
    selectedUnitDeptFilter,
    selectedUnitDivisionFilter,
    selectedUnitOfficeFilter,
  ]);

  const activeMeta = CATEGORIES.find((c) => c.key === activeCategory)!;

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    const matchName = item.name.toLowerCase().includes(q);
    const matchCode = item.code ? item.code.toLowerCase().includes(q) : false;
    const matchId = String(item.id).includes(q);
    const matchParent = item.parentName ? item.parentName.toLowerCase().includes(q) : false;
    const matchDivision = item.divisionName ? item.divisionName.toLowerCase().includes(q) : false;
    const matchOffice = item.officeName ? item.officeName.toLowerCase().includes(q) : false;
    return matchName || matchCode || matchId || matchParent || matchDivision || matchOffice;
  });

  // Handle Department Create/Edit Submit
  const handleDepartmentModalSubmit = async (data: {
    department_name: string;
    department_code?: string;
  }) => {
    if (deptModalState.mode === "create") {
      await axiosInstance.post("/departments", data);
      setToastMsg("ເພີ່ມຝ່າຍສຳເລັດ!");
    } else if (deptModalState.mode === "edit" && deptModalState.initialData) {
      await axiosInstance.put(`/departments/${deptModalState.initialData.id}`, data);
      setToastMsg("ແກ້ໄຂຂໍ້ມູນຝ່າຍສຳເລັດ!");
    }
    setTimeout(() => setToastMsg(""), 4000);
    fetchActiveItems();
    fetchCounts();
  };

  // Handle Division Create/Edit Submit
  const handleDivisionModalSubmit = async (data: {
    division_name: string;
    division_code?: string;
    departmentId: number;
    branch_id?: number;
  }) => {
    if (divisionModalState.mode === "create") {
      await axiosInstance.post("/divisions", data);
      setToastMsg("ເພີ່ມພະແນກ/ສາຂາສຳເລັດ!");
    } else if (divisionModalState.mode === "edit" && divisionModalState.initialData) {
      await axiosInstance.put(`/divisions/${divisionModalState.initialData.id}`, data);
      setToastMsg("ແກ້ໄຂຂໍ້ມູນພະແນກ/ສາຂາສຳເລັດ!");
    }
    setTimeout(() => setToastMsg(""), 4000);
    fetchActiveItems();
    fetchCounts();
  };

  // Handle Office Create/Edit Submit
  const handleOfficeModalSubmit = async (data: {
    office_name: string;
    office_code?: string;
    divisionId: number;
  }) => {
    if (officeModalState.mode === "create") {
      await axiosInstance.post("/offices", data);
      setToastMsg("ເພີ່ມຫ້ອງການສຳເລັດ!");
    } else if (officeModalState.mode === "edit" && officeModalState.initialData) {
      await axiosInstance.put(`/offices/${officeModalState.initialData.id}`, data);
      setToastMsg("ແກ້ໄຂຂໍ້ມູນຫ້ອງການສຳເລັດ!");
    }
    setTimeout(() => setToastMsg(""), 4000);
    fetchActiveItems();
    fetchCounts();
  };

  // Handle Unit Create/Edit Submit
  const handleUnitModalSubmit = async (data: {
    unit_name: string;
    unit_code?: string;
    unit_type?: string;
    divisionId?: number;
    officeId?: number;
  }) => {
    if (unitModalState.mode === "create") {
      await axiosInstance.post("/units", data);
      setToastMsg("ເພີ່ມໜ່ວຍງານສຳເລັດ!");
    } else if (unitModalState.mode === "edit" && unitModalState.initialData) {
      await axiosInstance.put(`/units/${unitModalState.initialData.id}`, data);
      setToastMsg("ແກ້ໄຂຂໍ້ມູນໜ່ວຍງານສຳເລັດ!");
    }
    setTimeout(() => setToastMsg(""), 4000);
    fetchActiveItems();
    fetchCounts();
  };

  // Handle Sync Department
  const handleSyncDept = async () => {
    setIsSyncing(true);
    setErrorMsg("");
    try {
      await axiosInstance.post("/departments/sync");
      setToastMsg("ຊິງຄ໌ຂໍ້ມູນຝ່າຍຈາກ External API ສຳເລັດ!");
      setTimeout(() => setToastMsg(""), 4000);
      fetchActiveItems();
      fetchCounts();
    } catch (err: unknown) {
      let msg = "ເກີດຂໍ້ຜິດພາດໃນການຊິງຄ໌ຂໍ້ມູນຝ່າຍ";
      if (err instanceof Error) msg = err.message;
      setErrorMsg(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Sync Division
  const handleSyncDivision = async () => {
    setIsSyncing(true);
    setErrorMsg("");
    try {
      await axiosInstance.post("/divisions/sync");
      setToastMsg("ຊິງຄ໌ຂໍ້ມູນພະແນກ/ສາຂາຈາກ External API ສຳເລັດ!");
      setTimeout(() => setToastMsg(""), 4000);
      fetchActiveItems();
      fetchCounts();
    } catch (err: unknown) {
      let msg = "ເກີດຂໍ້ຜິດພາດໃນການຊິງຄ໌ຂໍ້ມູນພະແນກ/ສາຂາ";
      if (err instanceof Error) msg = err.message;
      setErrorMsg(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Sync Office
  const handleSyncOffice = async () => {
    setIsSyncing(true);
    setErrorMsg("");
    try {
      await axiosInstance.post("/offices/sync");
      setToastMsg("ຊິງຄ໌ຂໍ້ມູນຫ້ອງການຈາກ External API ສຳເລັດ!");
      setTimeout(() => setToastMsg(""), 4000);
      fetchActiveItems();
      fetchCounts();
    } catch (err: unknown) {
      let msg = "ເກີດຂໍ້ຜິດພາດໃນການຊິງຄ໌ຂໍ້ມູນຫ້ອງການ";
      if (err instanceof Error) msg = err.message;
      setErrorMsg(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Sync Unit
  const handleSyncUnit = async () => {
    setIsSyncing(true);
    setErrorMsg("");
    try {
      await axiosInstance.post("/units/sync");
      setToastMsg("ຊິງຄ໌ຂໍ້ມູນໜ່ວຍງານຈາກ External API ສຳເລັດ!");
      setTimeout(() => setToastMsg(""), 4000);
      fetchActiveItems();
      fetchCounts();
    } catch (err: unknown) {
      let msg = "ເກີດຂໍ້ຜິດພາດໃນການຊິງຄ໌ຂໍ້ມູນໜ່ວຍງານ";
      if (err instanceof Error) msg = err.message;
      setErrorMsg(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center justify-between gap-3 text-xs font-bold animate-slideDown">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-yellow-300" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg("")} className="hover:opacity-80">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="py-4 px-5 rounded-xl bg-edl-gradient text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            ໂຄງຮ່າງການຈັດຕັ້ງ
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 font-medium">
            ຈັດການຂໍ້ມູນ ຝ່າຍ, ພະແນກ/ສາຂາ, ຫ້ອງການ ແລະ ໜ່ວຍງານ
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          {activeCategory === "department" && (
            <Button
              variant="yellow"
              size="sm"
              onClick={handleSyncDept}
              disabled={isSyncing}
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>ຊິງຄ໌ຂໍ້ມູນຝ່າຍ</span>
            </Button>
          )}

          {activeCategory === "division" && (
            <Button
              variant="yellow"
              size="sm"
              onClick={handleSyncDivision}
              disabled={isSyncing}
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>ຊິງຄ໌ຂໍ້ມູນພະແນກ/ສາຂາ</span>
            </Button>
          )}

          {activeCategory === "office" && (
            <Button
              variant="yellow"
              size="sm"
              onClick={handleSyncOffice}
              disabled={isSyncing}
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>ຊິງຄ໌ຂໍ້ມູນຫ້ອງການ</span>
            </Button>
          )}

          {activeCategory === "unit" && (
            <Button
              variant="yellow"
              size="sm"
              onClick={handleSyncUnit}
              disabled={isSyncing}
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>ຊິງຄ໌ຂໍ້ມູນໜ່ວຍງານ</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchCounts();
              fetchActiveItems();
            }}
            disabled={loading}
            className="bg-white/15 hover:bg-white/25 text-white border-white/20 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>ໂຫຼດຂໍ້ມູນໃໝ່</span>
          </Button>
        </div>
      </div>

      {/* 4 Organization Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {CATEGORIES.map((cat) => (
          <OrgCategoryCard
            key={cat.key}
            cat={cat}
            isSelected={activeCategory === cat.key}
            count={counts[cat.key as OrgCategory] || 0}
            onSelect={(key) => {
              setActiveCategory(key as OrgCategory);
              setSearch("");
            }}
          />
        ))}
      </div>

      {/* Active Category Data Table Component */}
      <OrgDataTable
        activeMeta={activeMeta}
        activeCategory={activeCategory}
        items={items}
        filteredItems={filteredItems}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        errorMsg={errorMsg}
        onOpenCreateDept={() =>
          setDeptModalState({ isOpen: true, mode: "create", initialData: null })
        }
        onOpenEditDept={(item) =>
          setDeptModalState({ isOpen: true, mode: "edit", initialData: item })
        }
        onOpenCreateDivision={() =>
          setDivisionModalState({ isOpen: true, mode: "create", initialData: null })
        }
        onOpenEditDivision={(item) =>
          setDivisionModalState({ isOpen: true, mode: "edit", initialData: item })
        }
        onOpenCreateOffice={() =>
          setOfficeModalState({ isOpen: true, mode: "create", initialData: null })
        }
        onOpenEditOffice={(item) =>
          setOfficeModalState({ isOpen: true, mode: "edit", initialData: item })
        }
        onOpenCreateUnit={() =>
          setUnitModalState({ isOpen: true, mode: "create", initialData: null })
        }
        onOpenEditUnit={(item) =>
          setUnitModalState({ isOpen: true, mode: "edit", initialData: item })
        }
        departmentFilterOptions={deptFilterList}
        selectedDeptFilter={selectedDeptFilter}
        onDeptFilterChange={setSelectedDeptFilter}
        divisionFilterOptions={divisionFilterList}
        selectedDivisionFilter={selectedDivisionFilter}
        onDivisionFilterChange={setSelectedDivisionFilter}
        unitDeptFilterOptions={unitDeptFilterList}
        selectedUnitDeptFilter={selectedUnitDeptFilter}
        onUnitDeptFilterChange={setSelectedUnitDeptFilter}
        unitDivisionFilterOptions={unitDivisionFilterList}
        selectedUnitDivisionFilter={selectedUnitDivisionFilter}
        onUnitDivisionFilterChange={setSelectedUnitDivisionFilter}
        unitOfficeFilterOptions={unitOfficeFilterList}
        selectedUnitOfficeFilter={selectedUnitOfficeFilter}
        onUnitOfficeFilterChange={setSelectedUnitOfficeFilter}
      />

      {/* Department Modal Component */}
      <DepartmentModal
        isOpen={deptModalState.isOpen}
        mode={deptModalState.mode}
        initialData={deptModalState.initialData}
        onClose={() => setDeptModalState((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleDepartmentModalSubmit}
      />

      {/* Division Modal Component */}
      <DivisionModal
        isOpen={divisionModalState.isOpen}
        mode={divisionModalState.mode}
        initialData={divisionModalState.initialData}
        onClose={() => setDivisionModalState((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleDivisionModalSubmit}
      />

      {/* Office Modal Component */}
      <OfficeModal
        isOpen={officeModalState.isOpen}
        mode={officeModalState.mode}
        initialData={officeModalState.initialData}
        onClose={() => setOfficeModalState((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleOfficeModalSubmit}
      />

      {/* Unit Modal Component */}
      <UnitModal
        isOpen={unitModalState.isOpen}
        mode={unitModalState.mode}
        initialData={unitModalState.initialData}
        onClose={() => setUnitModalState((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleUnitModalSubmit}
      />
    </div>
  );
}
