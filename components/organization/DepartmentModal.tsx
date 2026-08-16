"use client";

import { useState, useEffect } from "react";
import { Building2, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GenericOrgItem {
  id: number;
  code?: string;
  name: string;
  parentId?: number;
}

interface DepartmentModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: GenericOrgItem | null;
  onClose: () => void;
  onSubmit: (data: { department_name: string; department_code?: string }) => Promise<void>;
}

export function DepartmentModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}: DepartmentModalProps) {
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setDeptName(initialData.name || "");
        setDeptCode(initialData.code || "");
      } else {
        setDeptName("");
        setDeptCode("");
      }
      setErrorMsg("");
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!deptName.trim()) {
      setErrorMsg("ກະລຸນາປ້ອນຊື່ຝ່າຍ (Department Name)");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        department_name: deptName.trim(),
        department_code: deptCode.trim() || undefined,
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
              <Building2 className="w-4 h-4 text-yellow-300" />
            )}
            <span>
              {isEdit
                ? `ແກ້ໄຂຂໍ້ມູນຝ່າຍ (#${initialData?.id})`
                : "ເພີ່ມຝ່າຍໃໝ່ (Create Department)"}
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

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              ຊື່ຝ່າຍ <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="ເຊັ່ນ: ຝ່າຍເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              ລະຫັດຝ່າຍ (Code)
            </label>
            <Input
              type="text"
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value)}
              placeholder="ເຊັ່ນ: DEP-IT"
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
                : "ບັນທຶກຝ່າຍ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
