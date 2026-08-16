"use client";

import { useState, useEffect } from "react";
import { Network, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axiosInstance";

interface DepartmentItem {
  id: number;
  department_name?: string;
  department_code?: string;
}

interface GenericOrgItem {
  id: number;
  code?: string;
  name: string;
  parentId?: number;
  branchId?: number;
}

interface DivisionModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: GenericOrgItem | null;
  onClose: () => void;
  onSubmit: (data: {
    division_name: string;
    division_code?: string;
    departmentId: number;
    branch_id?: number;
  }) => Promise<void>;
}

export function DivisionModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}: DivisionModalProps) {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [divisionName, setDivisionName] = useState("");
  const [divisionCode, setDivisionCode] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [branchId, setBranchId] = useState<number | "">("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Fetch departments for selection dropdown
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

      if (mode === "edit" && initialData) {
        setDivisionName(initialData.name || "");
        setDivisionCode(initialData.code || "");
        setDepartmentId(initialData.parentId || "");
        setBranchId(initialData.branchId ?? "");
      } else {
        setDivisionName("");
        setDivisionCode("");
        setDepartmentId("");
        setBranchId("");
      }
      setErrorMsg("");
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!divisionName.trim()) {
      setErrorMsg("ກະລຸນາປ້ອນຊື່ພະແນກ/ສາຂາ (Division Name)");
      return;
    }

    if (!departmentId) {
      setErrorMsg("ກະລຸນາເລືອກຝ່າຍທີ່ສັງກັດ (Select Department)");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        division_name: divisionName.trim(),
        division_code: divisionCode.trim() || undefined,
        departmentId: Number(departmentId),
        branch_id: branchId ? Number(branchId) : undefined,
      });
      onClose();
    } catch (err: unknown) {
      let msg = "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ";
      if (err instanceof Error) msg = err.message;
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const isEdit = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-edl-gradient text-white px-5 py-3.5 flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2">
            {isEdit ? (
              <Edit2 className="w-4 h-4 text-yellow-300" />
            ) : (
              <Network className="w-4 h-4 text-yellow-300" />
            )}
            <span>
              {isEdit
                ? `ແກ້ໄຂຂໍ້ມູນພະແນກ/ສາຂາ (#${initialData?.id})`
                : "ເພີ່ມພະແນກ/ສາຂາໃໝ່ (Create Division)"}
            </span>
          </h3>
          <button onClick={onClose} className="hover:opacity-80 transition-opacity">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Department Select */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              ຝ່າຍທີ່ສັງກັດ (Department) <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={departmentId}
              onChange={(e) =>
                setDepartmentId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800"
            >
              <option value="">-- ເລືອກຝ່າຍ (Select Department) --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name || `Department #${d.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Division Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              ຊື່ພະແນກ/ສາຂາ <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              placeholder="ເຊັ່ນ: ພະແນກພັດທະນາລະບົບ"
              className="text-xs h-9"
            />
          </div>

          {/* Division Code */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              ລະຫັດພະແນກ (Code)
            </label>
            <Input
              type="text"
              value={divisionCode}
              onChange={(e) => setDivisionCode(e.target.value)}
              placeholder="ເຊັ່ນ: DIV-DEV"
              className="text-xs h-9"
            />
          </div>

          {/* Branch ID */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              ຂຶ້ນກັບພະແນກ ຫຼື ສາຂາ
            </label>
            <Input
              type="number"
              value={branchId}
              onChange={(e) =>
                setBranchId(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="ເຊັ່ນ: 1 ຫຼື 2"
              className="text-xs h-9"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              ຍົກເລີກ
            </Button>
            <Button type="submit" variant="edl" size="sm" disabled={isSaving}>
              {isSaving
                ? "ກຳລັງບັນທຶກ..."
                : isEdit
                  ? "ບັນທຶກການແກ້ໄຂ"
                  : "ບັນທຶກພະແນກ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
