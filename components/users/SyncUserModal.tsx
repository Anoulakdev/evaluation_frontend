"use client";

import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axiosInstance";

interface SyncUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (departmentId: number) => Promise<void>;
}

export function SyncUserModal({
  isOpen,
  onClose,
  onConfirm,
}: SyncUserModalProps) {
  const [departmentId, setDepartmentId] = useState("");
  const [deptList, setDeptList] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
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
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!departmentId || Number(departmentId) <= 0) {
      setErrorMsg("ກະລຸນາເລືອກຝ່າຍ (Department) ທີ່ຕ້ອງການຊິງຄ໌");
      return;
    }

    setIsLoading(true);

    try {
      await onConfirm(Number(departmentId));
      onClose();
    } catch (err: unknown) {
      let msg = "ເກີດຂໍ້ຜິດພາດໃນການຊິງຄ໌ຂໍ້ມູນພະນັກງານ";
      if (err instanceof Error) msg = err.message;
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-sky-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">
                ຊິງຄ໌ຂໍ້ມູນພະນັກງານ (Sync Users)
              </h3>
              <p className="text-xs text-sky-100">
                ດຶງຂໍ້ມູນພະນັກງານຕາມ Department ຈາກລະບົບ HRM EDL
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
        <form onSubmit={handleSync} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              ເລືອກຝ່າຍ (Department) <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none font-bold text-slate-800"
            >
              <option value="">-- ເລືອກຝ່າຍ (Department) --</option>
              {deptList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              ລະບົບຈະກວດສອບວ່າ Department ID ນີ້ມີຢູ່ໃນ Local DB ຫຼື ບໍ່ ກ່ອນດຶງຂໍ້ມູນຈາກ API ພາຍນອກ
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ຍົກເລີກ
            </Button>
            <Button type="submit" variant="edl" disabled={isLoading}>
              {isLoading ? "ກຳລັງຊິງຄ໌..." : "ເລີ່ມຊິງຄ໌ຂໍ້ມູນ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
