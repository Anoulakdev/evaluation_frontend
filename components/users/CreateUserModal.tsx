"use client";

import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance, isAxiosError } from "@/lib/axiosInstance";
import {
  CreateUserData,
  createUserSchema,
  RoleItem,
  DepartmentItem,
  DivisionItem,
} from "@/schemas/user.schema";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData) => Promise<void>;
  roles?: RoleItem[];
}

export function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  roles: initialRoles = [],
}: CreateUserModalProps) {
  const [fetchedRoles, setFetchedRoles] = useState<RoleItem[]>([]);
  const [username, setUsername] = useState("");
  const [roleId, setRoleId] = useState<number | "">("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [divisionId, setDivisionId] = useState<number | "">("");
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [divisions, setDivisions] = useState<
    (DivisionItem & { branch_id?: number | null })[]
  >([]);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const roles = initialRoles.length > 0 ? initialRoles : fetchedRoles;

  useEffect(() => {
    if (isOpen) {
      if (initialRoles.length === 0) {
        axiosInstance
          .get("/roles/selectrole")
          .then((res) => {
            if (Array.isArray(res.data)) {
              setFetchedRoles(res.data);
            }
          })
          .catch(() => { });
      }

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
        .catch(() => { });
    }
  }, [isOpen, initialRoles.length]);

  // Fetch divisions when roleId === 14 and departmentId changes
  useEffect(() => {
    setDivisionId("");
    if (Number(roleId) === 14 && departmentId) {
      setIsLoadingDivisions(true);
      axiosInstance
        .get(`/divisions/selectdivision?departmentId=${departmentId}`)
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
              ? res.data.data
              : [];
          const filtered = list.filter(
            (d: { branch_id?: number | null }) => Number(d.branch_id) === 2,
          );
          setDivisions(filtered);
        })
        .catch(() => {
          setDivisions([]);
        })
        .finally(() => {
          setIsLoadingDivisions(false);
        });
    } else {
      setDivisions([]);
    }
  }, [departmentId, roleId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim()) {
      setErrorMsg("ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ (Username)");
      return;
    }

    if (!roleId) {
      setErrorMsg("ກະລຸນາເລືອກບົດບາດສິດ");
      return;
    }

    const payload: CreateUserData = {
      username: username.trim(),
      roleId: Number(roleId),
    };

    if (Number(roleId) === 13) {
      if (!departmentId) {
        setErrorMsg("ກະລຸນາເລືອກຝ່າຍ");
        return;
      }
      payload.departmentId = Number(departmentId);
    } else if (Number(roleId) === 14) {
      if (!departmentId) {
        setErrorMsg("ກະລຸນາເລືອກຝ່າຍ");
        return;
      }
      if (!divisionId) {
        setErrorMsg("ກະລຸນາເລືອກພະແນກ / ສາຂາ (Division)");
        return;
      }
      payload.departmentId = Number(departmentId);
      payload.divisionId = Number(divisionId);
    }

    const validation = createUserSchema.safeParse(payload);
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(payload);

      // Reset form
      setUsername("");
      setRoleId("");
      setDepartmentId("");
      setDivisionId("");
      setDivisions([]);
      onClose();
    } catch (err: unknown) {
      let msg = "ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຜູ້ໃຊ້";
      if (isAxiosError(err) && err.response?.data?.message) {
        const respMsg = err.response.data.message;
        msg = Array.isArray(respMsg) ? respMsg.join(", ") : respMsg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-edl-gradient text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">
                ເພີ່ມຜູ້ໃຊ້ງານໃໝ່
              </h3>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              ຊື່ຜູ້ໃຊ້ / ລະຫັດພະນັກງານ <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ເຊັ່ນ admin ຫຼື 99999"
            />
          </div>

          {/* Role selection fetched from backend API (/roles/selectrole) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              ບົດບາດສິດ <span className="text-rose-500">*</span>
            </label>
            {roles.length > 0 ? (
              <select
                value={roleId}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : "";
                  setRoleId(val);
                  if (val !== 13 && val !== 14) {
                    setDepartmentId("");
                    setDivisionId("");
                  } else if (
                    val === 14 &&
                    departmentId &&
                    ![10, 11, 12].includes(Number(departmentId))
                  ) {
                    setDepartmentId("");
                    setDivisionId("");
                  } else if (val === 13) {
                    setDivisionId("");
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800"
              >
                <option value="">-- ເລືອກບົດບາດສິດ --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type="number"
                required
                value={roleId}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : "";
                  setRoleId(val);
                  if (val !== 13 && val !== 14) {
                    setDepartmentId("");
                    setDivisionId("");
                  } else if (
                    val === 14 &&
                    departmentId &&
                    ![10, 11, 12].includes(Number(departmentId))
                  ) {
                    setDepartmentId("");
                    setDivisionId("");
                  } else if (val === 13) {
                    setDivisionId("");
                  }
                }}
                placeholder="ປ້ອນ Role ID (ເຊັ່ນ 1, 2, 8)"
              />
            )}
          </div>

          {/* Department selection for AdminDepartment (roleId === 13) and roleId === 14 */}
          {(Number(roleId) === 13 || Number(roleId) === 14) && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-xs font-bold text-slate-700">
                ຝ່າຍ <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={departmentId}
                onChange={(e) =>
                  setDepartmentId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800"
              >
                <option value="">-- ເລືອກຝ່າຍ --</option>
                {(Number(roleId) === 14
                  ? departments.filter((d) =>
                    [10, 11, 12].includes(Number(d.id)),
                  )
                  : departments
                ).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name || `Department ${d.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Division selection for roleId === 14 */}
          {Number(roleId) === 14 && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-xs font-bold text-slate-700">
                ສາຂາ <span className="text-rose-500">*</span>
              </label>
              <select
                required
                disabled={!departmentId || isLoadingDivisions}
                value={divisionId}
                onChange={(e) =>
                  setDivisionId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {!departmentId
                    ? "-- ກະລຸນາເລືອກຝ່າຍກ່ອນ --"
                    : isLoadingDivisions
                      ? "-- ກຳລັງໂຫຼດສາຂາ... --"
                      : "-- ເລືອກສາຂາ --"}
                </option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.division_name || `Division ${d.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              ຍົກເລີກ
            </Button>
            <Button type="submit" variant="edl" disabled={isLoading}>
              {isLoading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກຜູ້ໃຊ້"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
