"use client";

import { useState, useEffect } from "react";
import { X, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axiosInstance";
import {
  UserItem,
  UpdateUserData,
  updateUserSchema,
  RoleItem,
  DepartmentItem,
  DivisionItem,
  OfficeItem,
  UnitItem,
  PositionItem,
} from "@/schemas/user.schema";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
  onSubmit: (id: number, data: UpdateUserData) => Promise<void>;
  roles?: RoleItem[];
}

export function EditUserModal({
  isOpen,
  onClose,
  user,
  onSubmit,
  roles: initialRoles = [],
}: EditUserModalProps) {
  const [fetchedRoles, setFetchedRoles] = useState<RoleItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [divisions, setDivisions] = useState<(DivisionItem & { branch_id?: number })[]>([]);
  const [offices, setOffices] = useState<OfficeItem[]>([]);
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [positions, setPositions] = useState<PositionItem[]>([]);

  const roles = initialRoles.length > 0 ? initialRoles : fetchedRoles;

  const [roleId, setRoleId] = useState<number>(8);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [divisionId, setDivisionId] = useState<string>("");
  const [officeId, setOfficeId] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [posId, setPosId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load User Data & Pre-populate Organization Dropdown Lists on Open
  useEffect(() => {
    if (isOpen && user) {
      const initDept = user.departmentId ? String(user.departmentId) : "";
      const initDiv = user.divisionId ? String(user.divisionId) : "";
      const initOff = user.officeId ? String(user.officeId) : "";
      const initUnit = user.unitId ? String(user.unitId) : "";
      const initPos = user.posId ? String(user.posId) : "";

      setRoleId(user.roleId || 8);
      setDepartmentId(initDept);
      setDivisionId(initDiv);
      setOfficeId(initOff);
      setUnitId(initUnit);
      setPosId(initPos);
      setErrorMsg("");

      // 1. Fetch Roles if not provided
      if (initialRoles.length === 0) {
        axiosInstance
          .get("/roles/selectrole")
          .then((res) => {
            if (Array.isArray(res.data) && res.data.length > 0) {
              setFetchedRoles(res.data);
            }
          })
          .catch(() => {});
      }

      // 2. Fetch Departments List
      axiosInstance
        .get("/departments/selectdepartment")
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          setDepartments(list);
        })
        .catch(() => {});

      // 3. Fetch Positions List
      axiosInstance
        .get("/positions")
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          setPositions(list);
        })
        .catch(() => {});

      // 4. Fetch Divisions List if user has departmentId
      if (initDept) {
        axiosInstance
          .get(`/divisions/selectdivision?departmentId=${initDept}`)
          .then((res) => {
            const list = Array.isArray(res.data)
              ? res.data
              : Array.isArray(res.data?.data)
              ? res.data.data
              : [];
            setDivisions(list);

            const divObj = list.find((d: Record<string, unknown>) => Number(d.id) === Number(initDiv));
            const isBranch1 = divObj?.branch_id === 1;

            if (initDiv) {
              if (isBranch1) {
                // Head Office (branch_id = 1): Load units for division directly
                axiosInstance
                  .get(`/units/selectunit?divisionId=${initDiv}`)
                  .then((uRes) => {
                    const uList = Array.isArray(uRes.data)
                      ? uRes.data
                      : Array.isArray(uRes.data?.data)
                      ? uRes.data.data
                      : [];
                    setUnits(uList);
                  })
                  .catch(() => {});
              } else {
                // Branch (branch_id = 2): Load offices for division
                axiosInstance
                  .get(`/offices/selectoffice?divisionId=${initDiv}`)
                  .then((oRes) => {
                    const oList = Array.isArray(oRes.data)
                      ? oRes.data
                      : Array.isArray(oRes.data?.data)
                      ? oRes.data.data
                      : [];
                    setOffices(oList);
                  })
                  .catch(() => {});

                if (initOff) {
                  axiosInstance
                    .get(`/units/selectunit?officeId=${initOff}`)
                    .then((uRes) => {
                      const uList = Array.isArray(uRes.data)
                        ? uRes.data
                        : Array.isArray(uRes.data?.data)
                        ? uRes.data.data
                        : [];
                      setUnits(uList);
                    })
                    .catch(() => {});
                }
              }
            }
          })
          .catch(() => {});
      } else {
        setDivisions([]);
        setOffices([]);
        setUnits([]);
      }
    }
  }, [isOpen, user, initialRoles]);

  // Handle Manual Department Change
  const handleDepartmentChange = (newDeptId: string) => {
    setDepartmentId(newDeptId);
    setDivisionId("");
    setOfficeId("");
    setUnitId("");
    setDivisions([]);
    setOffices([]);
    setUnits([]);

    if (newDeptId) {
      axiosInstance
        .get(`/divisions/selectdivision?departmentId=${newDeptId}`)
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          setDivisions(list);
        })
        .catch(() => {});
    }
  };

  // Handle Manual Division Change
  const handleDivisionChange = (newDivId: string) => {
    setDivisionId(newDivId);
    setOfficeId("");
    setUnitId("");
    setOffices([]);
    setUnits([]);

    if (newDivId) {
      const selectedDiv = divisions.find((d) => Number(d.id) === Number(newDivId));
      if (selectedDiv?.branch_id === 1) {
        axiosInstance
          .get(`/units/selectunit?divisionId=${newDivId}`)
          .then((res) => {
            const list = Array.isArray(res.data)
              ? res.data
              : Array.isArray(res.data?.data)
              ? res.data.data
              : [];
            setUnits(list);
          })
          .catch(() => {});
      } else {
        axiosInstance
          .get(`/offices/selectoffice?divisionId=${newDivId}`)
          .then((res) => {
            const list = Array.isArray(res.data)
              ? res.data
              : Array.isArray(res.data?.data)
              ? res.data.data
              : [];
            setOffices(list);
          })
          .catch(() => {});
      }
    }
  };

  // Handle Manual Office Change
  const handleOfficeChange = (newOfficeId: string) => {
    setOfficeId(newOfficeId);
    setUnitId("");
    setUnits([]);

    if (newOfficeId) {
      axiosInstance
        .get(`/units/selectunit?officeId=${newOfficeId}`)
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          setUnits(list);
        })
        .catch(() => {});
    }
  };

  const currentDivision = divisions.find((d) => Number(d.id) === Number(divisionId));
  const isBranch1 = currentDivision?.branch_id === 1;

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const payload: UpdateUserData = {
      roleId: Number(roleId),
      departmentId: departmentId ? Number(departmentId) : undefined,
      divisionId: divisionId ? Number(divisionId) : undefined,
      officeId: officeId ? Number(officeId) : undefined,
      unitId: unitId ? Number(unitId) : undefined,
      posId: posId ? Number(posId) : undefined,
    };

    const validation = updateUserSchema.safeParse(payload);
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(user.id, payload);
      onClose();
    } catch (err: unknown) {
      let msg = "ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ";
      if (err instanceof Error) msg = err.message;
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-sky-600 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Edit3 className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">
                ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້
              </h3>
              <p className="text-xs text-sky-100">
                @{user.username} • {user.first_name} {user.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Readonly User Info Banner */}
          <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">ຊື່ຜູ້ໃຊ້ / ລະຫັດພະນັກງານ</p>
              <p className="text-sm font-bold text-sky-800">
                {user.first_name} {user.last_name}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-sky-200 text-xs font-mono font-bold text-sky-700">
              @{user.username}
            </span>
          </div>

          {/* Role selection fetched from backend API */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              ບົດບາດສິດທິ (Role) <span className="text-rose-500">*</span>
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Organization Select Dropdowns Grid */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <p className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
              ອັບເດດໂຄງຮ່າງການຈັດຕັ້ງ
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Department Select */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Department (ຝ່າຍ)
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800"
                >
                  <option value="">-- ເລືອກຝ່າຍ (Department) --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.department_name || `Department #${d.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Division Select */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Division (ພະແນກ)
                </label>
                <select
                  value={divisionId}
                  disabled={!departmentId}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800 disabled:opacity-50"
                >
                  <option value="">-- ເລືອກພະແນກ (Division) --</option>
                  {divisions.map((dv) => (
                    <option key={dv.id} value={dv.id}>
                      {dv.division_name || `Division #${dv.id}`}{" "}
                      {dv.branch_id === 1 ? "(ສຳນັກງານໃຫຍ່)" : dv.branch_id === 2 ? "(ສາຂາ)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Office Select (Disabled if branch_id = 1) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Office (ຫ້ອງການ)
                </label>
                <select
                  value={officeId}
                  disabled={!divisionId || isBranch1}
                  onChange={(e) => handleOfficeChange(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800 disabled:opacity-50"
                >
                  <option value="">
                    {isBranch1 ? "-- ບໍ່ມີຫ້ອງການ (ສຳນັກງານໃຫຍ່) --" : "-- ເລືອກຫ້ອງການ (Office) --"}
                  </option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.office_name || `Office #${o.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit Select */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Unit (ໜ່ວຍງານ)
                </label>
                <select
                  value={unitId}
                  disabled={!divisionId || (!isBranch1 && !officeId)}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800 disabled:opacity-50"
                >
                  <option value="">
                    {isBranch1
                      ? "-- ເລືອກໜ່ວຍງານ (Unit) --"
                      : officeId
                      ? "-- ເລືອກໜ່ວຍງານ (Unit) --"
                      : "-- ເລືອກຫ້ອງການກ່ອນ --"}
                  </option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unit_name || `Unit #${u.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Position Select */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Position (ຕຳແໜ່ງ)
              </label>
              <select
                value={posId}
                onChange={(e) => setPosId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800"
              >
                <option value="">-- ເລືອກຕຳແໜ່ງ (Position) --</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.pos_name || p.posnameId || `Position #${p.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              ຍົກເລີກ
            </Button>
            <Button type="submit" variant="edl" disabled={isLoading}>
              {isLoading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກການແກ້ໄຂ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
