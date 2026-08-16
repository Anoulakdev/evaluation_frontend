"use client";

import { useState } from "react";
import { Lock, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserItem,
  ChangePasswordData,
  changePasswordSchema,
} from "@/schemas/user.schema";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
  onSubmit: (id: number, data: ChangePasswordData) => Promise<void>;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  user,
  onSubmit,
}: ChangePasswordModalProps) {
  const [oldpassword, setOldPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const payload: ChangePasswordData = {
      oldpassword,
      password1,
      password2,
    };

    const validation = changePasswordSchema.safeParse(payload);
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(user.id, payload);
      setOldPassword("");
      setPassword1("");
      setPassword2("");
      onClose();
    } catch (err: unknown) {
      let msg = "ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນລະຫັດຜ່ານ";
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
              <Lock className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">
                ປ່ຽນລະຫັດຜ່ານ (Change Password)
              </h3>
              <p className="text-xs text-sky-100">
                @{user.username} • {user.first_name} {user.last_name}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              ລະຫັດຜ່ານເກົ່າ (Old Password) <span className="text-rose-500">*</span>
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={oldpassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="ປ້ອນລະຫັດຜ່ານເກົ່າ..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              ລະຫັດຜ່ານໃໝ່ (New Password) <span className="text-rose-500">*</span>
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່..."
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">
                ຍືນຢັນລະຫັດຜ່ານໃໝ່ (Confirm New Password) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sky-600 font-semibold hover:underline flex items-center gap-1 text-[11px]"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? "ເຊື່ອງ" : "ສະແດງ"}</span>
              </button>
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="ຍືນຢັນລະຫັດຜ່ານໃໝ່..."
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ຍົກເລີກ
            </Button>
            <Button type="submit" variant="edl" disabled={isLoading}>
              {isLoading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກລະຫັດຜ່ານໃໝ່"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
