"use client";

import { useState, useEffect } from "react";
import { Layers, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axiosInstance";

interface DepartmentItem {
  id: number;
  department_name?: string;
  department_code?: string;
}

interface DivisionItem {
  id: number;
  division_name?: string;
  division_code?: string;
  branch_id?: number;
  departmentId?: number;
}

interface OfficeItem {
  id: number;
  office_name?: string;
  office_code?: string;
  divisionId?: number;
}

interface GenericOrgItem {
  id: number;
  code?: string;
  name: string;
  parentId?: number;
  divisionId?: number;
  officeId?: number;
  unitType?: string;
}

interface UnitModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: GenericOrgItem | null;
  onClose: () => void;
  onSubmit: (data: {
    unit_name: string;
    unit_code?: string;
    unit_type?: string;
    divisionId?: number;
    officeId?: number;
  }) => Promise<void>;
}

export function UnitModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}: UnitModalProps) {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [divisions, setDivisions] = useState<DivisionItem[]>([]);
  const [offices, setOffices] = useState<OfficeItem[]>([]);

  const [unitName, setUnitName] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [unitType, setUnitType] = useState("");

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | "">("");
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | "">("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Fetch departments, divisions & offices for select dropdowns
      Promise.all([
        axiosInstance.get("/departments/selectdepartment"),
        axiosInstance.get("/divisions/selectdivision"),
        axiosInstance.get("/offices/selectoffice"),
      ])
        .then(([deptRes, divRes, offRes]) => {
          const deptList = Array.isArray(deptRes.data)
            ? deptRes.data
            : Array.isArray(deptRes.data?.data)
              ? deptRes.data.data
              : [];
          setDepartments(deptList);

          const divList = Array.isArray(divRes.data)
            ? divRes.data
            : Array.isArray(divRes.data?.data)
              ? divRes.data.data
              : [];
          setDivisions(divList);

          const offList = Array.isArray(offRes.data)
            ? offRes.data
            : Array.isArray(offRes.data?.data)
              ? offRes.data.data
              : [];
          setOffices(offList);

          if (mode === "edit" && initialData) {
            setUnitName(initialData.name || "");
            setUnitCode(initialData.code || "");
            setUnitType(initialData.unitType || "");

            if (initialData.officeId) {
              const matchedOffice = offList.find(
                (o: OfficeItem) => o.id === initialData.officeId
              );
              setSelectedOfficeId(initialData.officeId);

              if (matchedOffice?.divisionId) {
                setSelectedDivisionId(matchedOffice.divisionId);
                const matchedDiv = divList.find(
                  (d: DivisionItem) => d.id === matchedOffice.divisionId
                );
                if (matchedDiv?.departmentId) {
                  setSelectedDepartmentId(matchedDiv.departmentId);
                }
              }
            } else if (initialData.divisionId || initialData.parentId) {
              const divId = initialData.divisionId || initialData.parentId;
              setSelectedDivisionId(divId || "");
              setSelectedOfficeId("");

              const matchedDiv = divList.find(
                (d: DivisionItem) => d.id === divId
              );
              if (matchedDiv?.departmentId) {
                setSelectedDepartmentId(matchedDiv.departmentId);
              }
            }
          } else {
            setUnitName("");
            setUnitCode("");
            setUnitType("");
            setSelectedDepartmentId("");
            setSelectedDivisionId("");
            setSelectedOfficeId("");
          }
        })
        .catch(() => { });

      setErrorMsg("");
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  // Filter divisions by selected department
  const filteredDivisions = selectedDepartmentId
    ? divisions.filter(
      (d) => Number(d.departmentId) === Number(selectedDepartmentId)
    )
    : divisions;

  const currentDivision = divisions.find(
    (d) => d.id === Number(selectedDivisionId)
  );
  const isBranch2 = currentDivision?.branch_id === 2;
  const isBranch1 = currentDivision?.branch_id === 1;

  // Filter offices for selected division
  const filteredOffices = selectedDivisionId
    ? offices.filter(
      (o) => Number(o.divisionId) === Number(selectedDivisionId)
    )
    : offices;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!unitName.trim()) {
      setErrorMsg("ກະລຸນາປ້ອນຊື່ໜ່ວຍງານ (Unit Name)");
      return;
    }

    if (!selectedDepartmentId) {
      setErrorMsg("ກະລຸນາເລືອກຝ່າຍ (Select Department)");
      return;
    }

    if (!selectedDivisionId) {
      setErrorMsg("ກະລຸນາເລືອກພະແນກ/ສາຂາ (Select Division)");
      return;
    }

    if (isBranch2 && !selectedOfficeId) {
      setErrorMsg("ກະລຸນາເລືອກຫ້ອງການ (Select Office)");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        unit_name: unitName.trim(),
        unit_code: unitCode.trim() || undefined,
        unit_type: unitType.trim() || undefined,
        divisionId: isBranch1 && selectedDivisionId ? Number(selectedDivisionId) : undefined,
        officeId: isBranch2 && selectedOfficeId ? Number(selectedOfficeId) : undefined,
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
              <Layers className="w-4 h-4 text-yellow-300" />
            )}
            <span>
              {isEdit
                ? `ແກ້ໄຂຂໍ້ມູນໜ່ວຍງານ (#${initialData?.id})`
                : "ເພີ່ມໜ່ວຍງານໃໝ່ (Create Unit)"}
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

          {/* Step 1: Select Department */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              1. ຝ່າຍ (Department) <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedDepartmentId}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : "";
                setSelectedDepartmentId(val);
                setSelectedDivisionId("");
                setSelectedOfficeId("");
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800"
            >
              <option value="">-- ເລືອກຝ່າຍ (Select Department) --</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.department_name || `Department #${dep.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Division (filtered by selected Department) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              2. ພະແນກ/ສາຂາ (Division) <span className="text-rose-500">*</span>
            </label>
            <select
              required
              disabled={!selectedDepartmentId}
              value={selectedDivisionId}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : "";
                setSelectedDivisionId(val);
                setSelectedOfficeId("");
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-medium text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {selectedDepartmentId
                  ? "-- ເລືອກພະແນກ/ສາຂາ (Select Division) --"
                  : "-- ກະລຸນາເລືອກຝ່າຍກ່ອນ (Select Department First) --"}
              </option>
              {filteredDivisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.division_name || `Division #${d.id}`}{" "}
                  {d.branch_id === 1 ? "(ສຳນັກງານໃຫຍ່ - branch_id=1)" : "(ສາຂາ - branch_id=2)"}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: If Division is Branch (branch_id = 2), select Office */}
          {isBranch2 && (
            <div className="space-y-1 animate-fadeIn">
              <label className="text-xs font-bold text-amber-800 flex items-center justify-between">
                <span>3. ຫ້ອງການ (Office) <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-amber-600 font-normal">ສາຂາ (branch_id = 2) ຕ້ອງເລືອກຫ້ອງການ</span>
              </label>
              <select
                required
                value={selectedOfficeId}
                onChange={(e) =>
                  setSelectedOfficeId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:border-amber-500 focus:outline-none font-medium text-slate-800"
              >
                <option value="">-- ເລືອກຫ້ອງການ (Select Office) --</option>
                {filteredOffices.length > 0 ? (
                  filteredOffices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.office_name || `Office #${o.id}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    -- ບໍ່ມີຫ້ອງການໃນພະແນກ/ສາຂານີ້ --
                  </option>
                )}
              </select>
            </div>
          )}

          {/* Notice for Branch 1 */}
          {isBranch1 && (
            <div className="p-2.5 bg-sky-50 border border-sky-200 text-sky-800 text-[11px] rounded-xl font-medium">
              ℹ️ ພະແນກສຳນັກງານໃຫຍ່ (branch_id = 1): ໜ່ວຍງານຈະຂຶ້ນຕົງກັບ ພະແນກ ໂດຍກົງ
            </div>
          )}

          {/* Unit Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              ຊື່ໜ່ວຍງານ <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              placeholder="ເຊັ່ນ: ໜ່ວຍງານໄຟຟ້າ"
              className="text-xs h-9"
            />
          </div>

          {/* Unit Code */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              ລະຫັດໜ່ວຍງານ (Code)
            </label>
            <Input
              type="text"
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
              placeholder="ເຊັ່ນ: UNT-01"
              className="text-xs h-9"
            />
          </div>

          {/* Unit Type */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              ປະເພດໜ່ວຍງານ (Type)
            </label>
            <Input
              type="text"
              value={unitType}
              onChange={(e) => setUnitType(e.target.value)}
              placeholder="ເຊັ່ນ: ໜ່ວຍງານສຳນັກງານໃຫຍ່ ຫຼື ໜ່ວຍງານສາຂາ"
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
                  : "ບັນທຶກໜ່ວຍງານ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
