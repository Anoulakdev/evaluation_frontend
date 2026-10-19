"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  count: number;
  targetNames?: string[];
  loading?: boolean;
}

export function ConfirmApproveModal({
  isOpen,
  onClose,
  onConfirm,
  count,
  targetNames = [],
  loading = false,
}: ConfirmApproveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-sky-50 via-white to-emerald-50/40 border-b border-slate-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">
                ຢືນຢັນການສົ່ງຄະແນນປະເມີນ
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                ອະນຸມັດ ແລະ ບັນທຶກຜົນການປະເມີນເຂົ້າສູ່ລະບົບ
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              ທ່ານກຳລັງຈະຢືນຢັນການປະເມີນຈຳນວນ:{" "}
              <span className="text-sky-600 font-bold text-base">
                {count} ລາຍການ
              </span>
            </p>

            {targetNames.length > 0 && (
              <div className="max-h-28 overflow-y-auto space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                {targetNames.slice(0, 5).map((name, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span className="truncate">{name}</span>
                  </div>
                ))}
                {targetNames.length > 5 && (
                  <p className="text-[11px] text-slate-400 font-medium italic">
                    ...ແລະ ອີກ {targetNames.length - 5} ທ່ານ
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>ຂໍ້ຄວນລະວັງ:</strong> ເມື່ອຢືນຢັນການປະເມີນແລ້ວ
              ຜົນຄະແນນຈະຖືກບັນທຶກເຂົ້າສູ່ລະບົບຢ່າງສົມບູນ ແລະ
              ຈະບໍ່ສາມາດແກ້ໄຂຄືນໄດ້ອີກ.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs rounded-xl font-bold cursor-pointer"
          >
            ຍົກເລີກ
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 text-xs rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                ກຳລັງບັນທຶກ...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                ຢືນຢັນການອະນຸມັດ
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
