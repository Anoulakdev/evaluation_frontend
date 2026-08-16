"use client";

import { useState, useEffect } from "react";
import { X, Save, RefreshCw, Star } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";

export interface ScoreItem {
  id: number;
  sc_num: number;
}

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoreToEdit?: ScoreItem | null;
  onSuccess: () => void;
}

export function ScoreModal({
  isOpen,
  onClose,
  scoreToEdit,
  onSuccess,
}: ScoreModalProps) {
  const [scNum, setScNum] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (scoreToEdit) {
      setScNum(scoreToEdit.sc_num);
    } else {
      setScNum("");
    }
    setErrorMsg(null);
  }, [scoreToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scNum === "" || isNaN(Number(scNum))) {
      setErrorMsg("ກະລຸນາປ້ອນຕົວເລກຄະແນນ (sc_num)");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const payload = {
        sc_num: Number(scNum),
      };

      if (scoreToEdit) {
        await axiosInstance.put(`/scores/${scoreToEdit.id}`, payload);
        toast.success("ແກ້ໄຂຄະແນນສຳເລັດ!");
      } else {
        await axiosInstance.post("/scores", payload);
        toast.success("ເພີ່ມຄະແນນສຳເລັດ!");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Save score failed:", err);
      const msg =
        err?.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ";
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-800 to-blue-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-base">
                {scoreToEdit ? "ແກ້ໄຂຄະແນນ" : "ເພີ່ມຄະແນນໃໝ່"}
              </h2>
              <p className="text-[11px] text-sky-200">
                {scoreToEdit ? `ID #${scoreToEdit.id}` : "ເພີ່ມຕົວເລກຄະແນນປະເມີນ (Score Number)"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              ຕົວເລກຄະແນນ (Score Number - sc_num) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={scNum}
              onChange={(e) => setScNum(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="ຕົວຢ່າງ: 1, 2, 3, 5, 10..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:border-sky-500 focus:bg-white focus:outline-none transition-all font-bold"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ກຳລັງບັນທຶກ...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  ບັນທຶກ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
