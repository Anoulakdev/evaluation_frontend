"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  PaginationState,
} from "@tanstack/react-table";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  KeyRound,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance, isAxiosError } from "@/lib/axiosInstance";
import {
  UserItem,
  CreateUserData,
  UpdateUserData,
  ChangePasswordData,
  RoleItem,
  PositionItem,
} from "@/schemas/user.schema";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserModal } from "./EditUserModal";
import { DeleteUserModal } from "./DeleteUserModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { SyncUserModal } from "./SyncUserModal";

const columnHelper = createColumnHelper<UserItem>();

function UserAvatar({
  empimg,
  firstName,
  username,
}: {
  empimg?: string | null;
  firstName?: string | null;
  username: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (empimg && !imgError) {
    return (
      <img
        src={empimg}
        alt={username}
        loading="lazy"
        decoding="async"
        className="w-9 h-9 rounded-xl object-cover object-top border border-slate-200 shadow-sm shrink-0 bg-slate-100"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
      {(firstName || username).slice(0, 2)}
    </div>
  );
}

export function UserList() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input by 300ms to eliminate API spamming on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const [roleFilter, setRoleFilter] = useState<number | "ALL">("ALL");
  const [toastMsg, setToastMsg] = useState("");
  const [authError, setAuthError] = useState(false);

  // Cascading Organization Filter States: Department -> Division -> Office -> Unit
  const [deptFilter, setDeptFilter] = useState<number | "">("");
  const [deptList, setDeptList] = useState<{ id: number; name: string }[]>([]);

  // Sync Department State
  const [syncDeptId, setSyncDeptId] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [divisionFilter, setDivisionFilter] = useState<number | "">("");
  const [divisionList, setDivisionList] = useState<{ id: number; name: string; branch_id?: number }[]>([]);

  const [officeFilter, setOfficeFilter] = useState<number | "">("");
  const [officeList, setOfficeList] = useState<{ id: number; name: string }[]>([]);

  const [unitFilter, setUnitFilter] = useState<number | "">("");
  const [unitList, setUnitList] = useState<{ id: number; name: string }[]>([]);

  // Position Filter State
  const [posFilter, setPosFilter] = useState<number | "">("");
  const [positionList, setPositionList] = useState<PositionItem[]>([]);

  // Pagination State for TanStack Table
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal Visibility States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);

  // Selected User for Modals
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Fetch roles from Backend API (/roles/selectrole)
  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get("/roles/selectrole");
      if (Array.isArray(response.data)) {
        setRoles(response.data);
      }
    } catch (err) {
      console.warn("Failed to fetch roles:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Fetch positions from Backend API (/positions/selectposition)
  useEffect(() => {
    axiosInstance
      .get("/positions/selectposition")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setPositionList(list);
      })
      .catch((err) => {
        console.warn("Failed to fetch positions:", err);
      });
  }, []);

  // Cascading Step 1: Fetch Department List
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
          list.map((d: Record<string, unknown>) => ({
            id: Number(d.id),
            name: String(d.department_name || `Department #${d.id}`),
          }))
        );
      })
      .catch(() => { });
  }, []);

  // Cascading Step 2: Fetch Division List when Dept Filter changes
  useEffect(() => {
    setDivisionFilter("");
    setOfficeFilter("");
    setUnitFilter("");
    setDivisionList([]);
    setOfficeList([]);
    setUnitList([]);

    if (deptFilter) {
      axiosInstance
        .get(`/divisions/selectdivision?departmentId=${deptFilter}`)
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
              ? res.data.data
              : [];
          setDivisionList(
            list.map((d: Record<string, unknown>) => ({
              id: Number(d.id),
              name: String(d.division_name || `Division #${d.id}`),
              branch_id: d.branch_id ? Number(d.branch_id) : undefined,
            }))
          );
        })
        .catch(() => { });
    }
  }, [deptFilter]);

  // Cascading Step 3: Fetch Office or Unit List when Division Filter changes
  useEffect(() => {
    setOfficeFilter("");
    setUnitFilter("");
    setOfficeList([]);
    setUnitList([]);

    if (divisionFilter) {
      const selectedDiv = divisionList.find((d) => d.id === Number(divisionFilter));
      const branchId = selectedDiv?.branch_id;

      if (branchId === 1) {
        // Head Office (branch_id = 1): Disable office, fetch units directly for this Division
        axiosInstance
          .get(`/units/selectunit?divisionId=${divisionFilter}`)
          .then((res) => {
            const list = Array.isArray(res.data)
              ? res.data
              : Array.isArray(res.data?.data)
                ? res.data.data
                : [];
            setUnitList(
              list.map((u: Record<string, unknown>) => ({
                id: Number(u.id),
                name: String(u.unit_name || `Unit #${u.id}`),
              }))
            );
          })
          .catch(() => { });
      } else if (branchId === 2) {
        // Branch (branch_id = 2): Enable office, fetch offices for this Division
        axiosInstance
          .get(`/offices/selectoffice?divisionId=${divisionFilter}`)
          .then((res) => {
            const list = Array.isArray(res.data)
              ? res.data
              : Array.isArray(res.data?.data)
                ? res.data.data
                : [];
            setOfficeList(
              list.map((o: Record<string, unknown>) => ({
                id: Number(o.id),
                name: String(o.office_name || `Office #${o.id}`),
              }))
            );
          })
          .catch(() => { });
      } else {
        // Fallback: Fetch both offices & units if branch_id is unspecified
        axiosInstance
          .get(`/offices/selectoffice?divisionId=${divisionFilter}`)
          .then((res) => {
            const list = Array.isArray(res.data)
              ? res.data
              : Array.isArray(res.data?.data)
                ? res.data.data
                : [];
            setOfficeList(
              list.map((o: Record<string, unknown>) => ({
                id: Number(o.id),
                name: String(o.office_name || `Office #${o.id}`),
              }))
            );
          })
          .catch(() => { });

        axiosInstance
          .get(`/units/selectunit?divisionId=${divisionFilter}`)
          .then((res) => {
            const list = Array.isArray(res.data)
              ? res.data
              : Array.isArray(res.data?.data)
                ? res.data.data
                : [];
            setUnitList(
              list.map((u: Record<string, unknown>) => ({
                id: Number(u.id),
                name: String(u.unit_name || `Unit #${u.id}`),
              }))
            );
          })
          .catch(() => { });
      }
    }
  }, [divisionFilter, divisionList]);

  // Cascading Step 4: Fetch Unit List when Office Filter changes
  useEffect(() => {
    setUnitFilter("");
    setUnitList([]);

    if (officeFilter) {
      axiosInstance
        .get(`/units/selectunit?officeId=${officeFilter}`)
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
              ? res.data.data
              : [];
          setUnitList(
            list.map((u: Record<string, unknown>) => ({
              id: Number(u.id),
              name: String(u.unit_name || `Unit #${u.id}`),
            }))
          );
        })
        .catch(() => { });
    }
  }, [officeFilter]);

  // Fetch users directly from Backend API (findAllUser: /users) with pagination
  const fetchUsers = async () => {
    setLoading(true);
    setAuthError(false);
    try {
      const response = await axiosInstance.get("/users", {
        params: {
          page: pageIndex + 1,
          limit: pageSize,
          search: debouncedSearch || undefined,
          roleId: roleFilter !== "ALL" ? roleFilter : undefined,
          departmentId: deptFilter || undefined,
          divisionId: divisionFilter || undefined,
          officeId: officeFilter || undefined,
          unitId: unitFilter || undefined,
          posId: posFilter || undefined,
        },
      });

      if (response.data && typeof response.data === "object" && "data" in response.data) {
        // Paginated Response object
        setUsers(response.data.data || []);
        setTotalRecords(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      } else if (Array.isArray(response.data)) {
        // Direct Array Response
        setUsers(response.data);
        setTotalRecords(response.data.length);
        setTotalPages(1);
      } else {
        setUsers([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    } catch (err: unknown) {
      console.warn("Failed to fetch users from backend /users:", err);
      setUsers([]);
      if (isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
        setAuthError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [
    pageIndex,
    pageSize,
    roleFilter,
    debouncedSearch,
    deptFilter,
    divisionFilter,
    officeFilter,
    unitFilter,
    posFilter,
  ]);

  // Search Trigger Reset Page Index
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // CRUD Handlers connected to Backend API via axiosInstance
  const handleCreateUser = async (data: CreateUserData) => {
    await axiosInstance.post("/users", data);
    showToast("ເພີ່ມຜູ້ໃຊ້ໃໝ່ສຳເລັດ!");
    fetchUsers();
  };

  const handleUpdateUser = async (id: number, data: UpdateUserData) => {
    await axiosInstance.put(`/users/${id}`, data);
    showToast("ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ!");
    fetchUsers();
  };

  const handleDeleteUser = async (id: number) => {
    await axiosInstance.delete(`/users/${id}`);
    showToast("ລຶບຜູ້ໃຊ້ສຳເລັດ!");
    fetchUsers();
  };

  const handleUpdateStatus = async (user: UserItem) => {
    const nextStatus = user.status === "A" ? "C" : "A";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
    try {
      await axiosInstance.put(`/users/updatestatus/${user.id}?actived=${nextStatus}`);
      showToast(`ປ່ຽນສະຖານະເປັນ ${nextStatus === "A" ? "ໃຊ້ງານຢູ່" : "ປິດໃຊ້ງານ"} ສຳເລັດ!`);
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u))
      );
      showToast("ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະ");
    }
  };

  const handleResetPassword = async (id: number) => {
    await axiosInstance.put(`/users/resetpassword/${id}`);
    showToast("ຣີເຊັດລະຫັດຜ່ານສຳເລັດ!");
  };

  const handleChangePassword = async (id: number, data: ChangePasswordData) => {
    await axiosInstance.put(`/users/changepassword/${id}`, data);
    showToast("ປ່ຽນລະຫັດຜ່ານສຳເລັດ!");
  };

  const handleSyncUser = async (departmentId: number) => {
    await axiosInstance.post(`/users/syncuser?departmentId=${departmentId}`);
    showToast(`ຊິງຄ໌ຂໍ້ມູນພະນັກງານ Department ID: ${departmentId} ສຳເລັດ!`);
    fetchUsers();
  };

  // Check current division's branch_id
  const selectedDivObj = divisionList.find((d) => d.id === Number(divisionFilter));
  const isBranch1 = selectedDivObj?.branch_id === 1;

  // Define TanStack Table Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor("username", {
        header: "ຜູ້ໃຊ້ງານ",
        cell: (info) => {
          const u = info.row.original;
          return (
            <div className="flex items-center gap-3 py-1">
              <UserAvatar empimg={u.empimg} firstName={u.first_name} username={u.username} />
              <div>
                <p className="font-bold text-slate-800">
                  {u.first_name || u.username} {u.last_name || ""}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  @{u.username}
                </p>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor("roleId", {
        header: "ສິດຜູ້ໃຊ້",
        cell: (info) => {
          const u = info.row.original;
          const roleName =
            u.role?.name ||
            roles.find((r) => r.id === u.roleId)?.name ||
            `Role ${u.roleId}`;
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> {roleName}
            </span>
          );
        },
      }),

      columnHelper.accessor("departmentId", {
        header: "ຝ່າຍ",
        cell: (info) => {
          const u = info.row.original;
          const name = u.department?.department_name || (u.departmentId ? `Dept #${u.departmentId}` : "-");
          return <span className="font-semibold text-slate-700">{name}</span>;
        },
      }),

      columnHelper.accessor("divisionId", {
        header: "ພະແນກ",
        cell: (info) => {
          const u = info.row.original;
          const name = u.division?.division_name || (u.divisionId ? `Div #${u.divisionId}` : "-");
          return <span className="font-medium text-slate-700">{name}</span>;
        },
      }),

      columnHelper.accessor("officeId", {
        header: "ຫ້ອງການ",
        cell: (info) => {
          const u = info.row.original;
          const name = u.office?.office_name || (u.officeId ? `Office #${u.officeId}` : "-");
          return <span className="font-medium text-slate-700">{name}</span>;
        },
      }),

      columnHelper.accessor("unitId", {
        header: "ໜ່ວຍງານ",
        cell: (info) => {
          const u = info.row.original;
          const name = u.unit?.unit_name || (u.unitId ? `Unit #${u.unitId}` : "-");
          return <span className="font-medium text-slate-700">{name}</span>;
        },
      }),

      columnHelper.accessor("posId", {
        header: "ຕຳແໜ່ງ",
        cell: (info) => {
          const u = info.row.original;
          const name = u.position?.pos_name || u.position?.posnameId || (u.posId ? `Pos #${u.posId}` : "-");
          return <span className="font-medium text-slate-700">{name}</span>;
        },
      }),

      columnHelper.accessor("status", {
        header: "ສະຖານະ",
        cell: (info) => {
          const u = info.row.original;
          return (
            <div className="text-center">
              <button
                onClick={() => handleUpdateStatus(u)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {u.status === "A" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ໃຊ້ງານຢູ່
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <XCircle className="w-3 h-3 text-slate-400" /> ປິດໃຊ້ງານ
                  </span>
                )}
              </button>
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">ຈັດການ</div>,
        cell: (info) => {
          const u = info.row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                title="ແກ້ໄຂຂໍ້ມູນ"
                onClick={() => {
                  setSelectedUser(u);
                  setIsEditOpen(true);
                }}
              >
                <Edit3 className="w-4 h-4 text-sky-600" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                title="ຣີເຊັດລະຫັດຜ່ານ"
                onClick={() => {
                  setSelectedUser(u);
                  setIsResetPassOpen(true);
                }}
              >
                <KeyRound className="w-4 h-4 text-amber-600" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                title="ລຶບຜູ້ໃຊ້"
                onClick={() => {
                  setSelectedUser(u);
                  setIsDeleteOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [roles]
  );

  const paginationState = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // TanStack Table Instance
  const table = useReactTable({
    data: users,
    columns,
    pageCount: totalPages,
    state: {
      pagination: paginationState,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    autoResetPageIndex: false,
  });

  return (
    <div className="space-y-2.5 font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center justify-between gap-3 animate-slideDown z-50">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-4.5 h-4.5 text-yellow-300" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg("")} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="py-4 px-5 rounded-xl bg-edl-gradient text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            ຈັດການຜູ້ໃຊ້
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 font-medium">
            ຈັດການຂໍ້ມູນພະນັກງານ ແລະ ສິດທິການນຳໃຊ້ລະບົບ
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          {/* Department Select for Syncing */}
          <select
            value={syncDeptId}
            onChange={(e) => setSyncDeptId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white text-slate-800 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold h-9 max-w-[200px] truncate shadow-sm cursor-pointer"
          >
            <option value="">-- ເລືອກຝ່າຍ --</option>
            {deptList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <Button
            variant="yellow"
            size="sm"
            onClick={async () => {
              if (!syncDeptId) {
                showToast("ກະລຸນາເລືອກຝ່າຍກ່ອນຊິງຄ໌ຂໍ້ມູນ");
                return;
              }
              setIsSyncing(true);
              try {
                await handleSyncUser(Number(syncDeptId));
              } catch (err: unknown) {
                let msg = "ເກີດຂໍ້ຜິດພາດໃນການຊິງຄ໌ຂໍ້ມູນ";
                if (isAxiosError(err) && err.response?.data?.message) {
                  const respMsg = err.response.data.message;
                  msg = Array.isArray(respMsg) ? respMsg.join(", ") : respMsg;
                } else if (err instanceof Error) {
                  msg = err.message;
                }
                showToast(msg);
              } finally {
                setIsSyncing(false);
              }
            }}
            disabled={isSyncing || loading}
            className="text-xs font-bold h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>ຊິງຄ໌ຂໍ້ມູນພະນັກງານ</span>
          </Button>

          <Button
            variant="edl"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-white text-sky-800 hover:bg-sky-50 shadow-md text-xs font-bold h-9"
          >
            <Plus className="w-4 h-4" />
            <span>ເພີ່ມຜູ້ໃຊ້ໃໝ່</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-2.5 sm:p-3 rounded-xl glass-card flex flex-col gap-2.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5 flex-wrap">
          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ຄົ້ນຫາ"
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white h-9 text-xs"
            />
          </div>

          {/* Cascading Filter Dropdowns */}
          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
            {/* Role Filter */}
            <div className="flex items-center gap-1">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value));
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500 focus:outline-none font-medium text-slate-800 h-9 max-w-[150px] truncate"
              >
                <option value="ALL">-- ບົດບາດທັງໝົດ --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value ? Number(e.target.value) : "");
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500 focus:outline-none font-medium text-slate-800 h-9 max-w-[150px] truncate"
            >
              <option value="">-- ຝ່າຍທັງໝົດ --</option>
              {deptList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Division Filter */}
            <select
              value={divisionFilter}
              disabled={!deptFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value ? Number(e.target.value) : "");
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500 focus:outline-none font-medium text-slate-800 h-9 max-w-[160px] truncate disabled:opacity-50"
            >
              <option value="">-- ພະແນກ/ສາຂາທັງໝົດ --</option>
              {divisionList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.branch_id === 1 ? "(ສຳນັກງານໃຫຍ່)" : d.branch_id === 2 ? "(ສາຂາ)" : ""}
                </option>
              ))}
            </select>

            {/* Office Filter (Disabled if branch_id = 1) */}
            <select
              value={officeFilter}
              disabled={!divisionFilter || isBranch1}
              onChange={(e) => {
                setOfficeFilter(e.target.value ? Number(e.target.value) : "");
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500 focus:outline-none font-medium text-slate-800 h-9 max-w-[150px] truncate disabled:opacity-50"
            >
              <option value="">
                {isBranch1 ? "-- ບໍ່ມີຫ້ອງການ (ສຳນັກງານໃຫຍ່) --" : "-- ຫ້ອງການທັງໝົດ --"}
              </option>
              {officeList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            {/* Unit Filter */}
            <select
              value={unitFilter}
              disabled={!divisionFilter}
              onChange={(e) => {
                setUnitFilter(e.target.value ? Number(e.target.value) : "");
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500 focus:outline-none font-medium text-slate-800 h-9 max-w-[150px] truncate disabled:opacity-50"
            >
              <option value="">-- ໜ່ວຍງານທັງໝົດ --</option>
              {unitList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            {/* Position Filter */}
            <select
              value={posFilter}
              onChange={(e) => {
                setPosFilter(e.target.value ? Number(e.target.value) : "");
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500 focus:outline-none font-medium text-slate-800 h-9 max-w-[150px] truncate"
            >
              <option value="">-- ຕຳແໜ່ງທັງໝົດ --</option>
              {positionList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.pos_name || p.posnameId || `Position #${p.id}`}
                </option>
              ))}
            </select>

            <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="h-9 text-xs shrink-0">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>ໂຫຼດໃໝ່</span>
            </Button>
          </div>
        </div>
      </div>

      {/* TanStack Data Table */}
      <div className="rounded-xl glass-card overflow-hidden border border-slate-200/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-2.5 px-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-600" />
                    <span>ກຳລັງໂຫຼດຂໍ້ມູນຜູ້ໃຊ້...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-8 text-center text-slate-400">
                    <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <span>ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້</span>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-sky-50/50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-2.5 px-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!loading && totalRecords > 0 && (
          <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span>ສະແດງ:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPagination((prev) => ({
                      ...prev,
                      pageSize: Number(e.target.value),
                      pageIndex: 0,
                    }));
                  }}
                  className="py-1 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-sky-500 font-bold"
                >
                  {[8, 15, 25, 50].map((size) => (
                    <option key={size} value={size}>
                      {size} ແຖວ
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                ທັງໝົດ <span className="font-bold text-slate-800">{totalRecords}</span> ລາຍການ
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="mr-2">
                ໜ້າທີ <span className="font-bold text-slate-800">{pageIndex + 1}</span> ຈາກ{" "}
                <span className="font-bold text-slate-800">{totalPages}</span>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
                disabled={pageIndex === 0}
                className="h-8 w-8 p-0 rounded-lg"
                title="ໜ້າທຳອິດ"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                disabled={pageIndex === 0}
                className="h-8 w-8 p-0 rounded-lg"
                title="ໜ້າກ່ອນໜ້າ"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                disabled={pageIndex + 1 >= totalPages}
                className="h-8 w-8 p-0 rounded-lg"
                title="ໜ້າຖັດໄປ"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, pageIndex: totalPages - 1 }))}
                disabled={pageIndex + 1 >= totalPages}
                className="h-8 w-8 p-0 rounded-lg"
                title="ໜ້າສຸດທ້າຍ"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateUser}
        roles={roles}
      />

      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdateUser}
        roles={roles}
        user={selectedUser}
      />

      <DeleteUserModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteUser}
        user={selectedUser}
      />

      <ResetPasswordModal
        isOpen={isResetPassOpen}
        onClose={() => setIsResetPassOpen(false)}
        onConfirm={handleResetPassword}
        user={selectedUser}
      />

      <ChangePasswordModal
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(false)}
        onSubmit={handleChangePassword}
        user={selectedUser}
      />

      <SyncUserModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        onConfirm={handleSyncUser}
      />
    </div>
  );
}
