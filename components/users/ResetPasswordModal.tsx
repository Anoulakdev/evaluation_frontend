"use client";

import { useState } from "react";
import { KeyRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserItem } from "@/schemas/user.schema";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
  onConfirm: (id: number) => Promise<void>;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  user,
  onConfirm,
}: ResetPasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !user) return null;

  const handleReset = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      await onConfirm(user.id);
      onClose();
    } catch (err: unknown) {
      let msg = "ເກີດຂໍ້ຜິດພາດໃນການຣີເຊັດລະຫັດຜ່ານ";
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
        <div className="bg-amber-500 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">
                ຣີເຊັດລະຫັດຜ່ານ (Reset Password)
              </h3>
              <p className="text-xs text-amber-100">
                ຣີເຊັດລະຫັດຜ່ານກັບເປັນຄ່າເລີ່ມຕົ້ນ
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
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຣີເຊັດລະຫັດຜ່ານຂອງຜູ້ໃຊ້ນີ້ ກັບເປັນຄ່າເລີ່ມຕົ້ນ (DEFAULT_PASSWORD)?
          </p>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
            <p className="text-xs font-bold text-amber-900">
              {user.first_name || user.username} {user.last_name || ""}
            </p>
            <p className="text-[11px] text-amber-700 font-mono">
              Username: @{user.username}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ຍົກເລີກ
            </Button>
            <Button
              type="button"
              variant="yellow"
              disabled={isLoading}
              onClick={handleReset}
            >
              {isLoading ? "ກຳລັງຣີເຊັດ..." : "ຣີເຊັດລະຫັດຜ່ານ"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
