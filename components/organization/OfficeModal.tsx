"use client";

import { useState, useEffect } from "react";
import { Building, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axiosInstance";

interface DivisionItem {
  id: number;
  division_name?: string;
  division_code?: string;
  branch_id?: number;
}

interface GenericOrgItem {
  id: number;
  code?: string;
  name: string;
  parentId?: number;
}

interface OfficeModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: GenericOrgItem | null;
  onClose: () => void;
  onSubmit: (data: {
    office_name: string;
    office_code?: string;
    divisionId: number;
  }) => Promise<void>;
}

export function OfficeModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}: OfficeModalProps) {
  const [divisions, setDivisions] = useState<DivisionItem[]>([]);
  const [officeName, setOfficeName] = useState("");
  const [officeCode, setOfficeCode] = useState("");
  const [divisionId, setDivisionId] = useState<number | "">("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Fetch divisions for selection dropdown and filter only branch_id === 2
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
          setDivisions(branch2Only);
        })
        .catch(() => {});

      if (mode === "edit" && initialData) {
        setOfficeName(initialData.name || "");
        setOfficeCode(initialData.code || "");
        setDivisionId(initialData.parentId || "");
      } else {
        setOfficeName("");
        setOfficeCode("");
        setDivisionId("");
      }
      setErrorMsg("");
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!officeName.trim()) {
      setErrorMsg("ກະລຸນາປ້ອນຊື່ຫ້ອງການ (Office Name)");
      return;
    }

    if (!divisionId) {
      setErrorMsg("ກະລຸນາເລືອກພະແນກ/ສາຂາທີ່ສັງກັດ (Select Division)");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        office_name: officeName.trim(),
        office_code: officeCode.trim() || undefined,
        divisionId: Number(divisionId),
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
              <Building className="w-4 h-4 text-yellow-300" />
            )}
            <span>
              {isEdit
                ? `ແກ້ໄຂຂໍ້ມູນຫ້ອງການ (#${initialData?.id})`
                : "ເພີ່ມຫ້ອງການໃໝ່ (Create Office)"}
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

          {/* Division Select (Filtered branch_id = 2) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              ພະແນກ/ສາຂາທີ່ສັງກັດ (Division) <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={divisionId}
              onChange={(e) =>
                setDivisionId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800"
            >
              <option value="">-- ເລືອກພະແນກ/ສາຂາ (Select Division) --</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.division_name || `Division #${d.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Office Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              ຊື່ຫ້ອງການ <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
              placeholder="ເຊັ່ນ: ຫ້ອງການບໍລິຫານ"
              className="text-xs h-9"
            />
          </div>

          {/* Office Code */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              ລະຫັດຫ້ອງການ (Code)
            </label>
            <Input
              type="text"
              value={officeCode}
              onChange={(e) => setOfficeCode(e.target.value)}
              placeholder="ເຊັ່ນ: OFF-ADM"
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
                : "ບັນທຶກຫ້ອງການ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
