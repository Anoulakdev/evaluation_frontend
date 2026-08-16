"use client";

import { useState } from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserItem } from "@/schemas/user.schema";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
  onConfirm: (id: number) => Promise<void>;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  user,
  onConfirm,
}: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      await onConfirm(user.id);
      onClose();
    } catch (err: unknown) {
      let msg = "ເກີດຂໍ້ຜິດພາດໃນການລຶບຜູ້ໃຊ້";
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
        <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">
                ຢືນຢັນການລຶບຜູ້ໃຊ້ (Delete User)
              </h3>
              <p className="text-xs text-rose-100">
                ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກຄືນໄດ້
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

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <p className="text-xs text-slate-600">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຜູ້ໃຊ້ງານບັນຊີນີ້ອອກຈາກລະບົບ?
          </p>

          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 space-y-1">
            <p className="text-xs font-bold text-rose-900">
              {user.first_name || user.username} {user.last_name || ""}
            </p>
            <p className="text-[11px] text-rose-700 font-mono">
              Username: @{user.username} • Code: {user.emp_code || "-"}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ຍົກເລີກ
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              onClick={handleDelete}
            >
              {isLoading ? "ກຳລັງລຶບ..." : "ລຶບຜູ້ໃຊ້"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
