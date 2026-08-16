"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Award,
  Users,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { loginSchema } from "@/schemas/login.schema";

export function LoginView() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Check if user is already logged in with active valid token
  useEffect(() => {
    let isMounted = true;

    const checkExistingSession = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        if (res.data?.success && res.data?.user) {
          if (!isMounted) return;
          setUser(res.data.user);
          if (res.data.user.roleId === 1) {
            router.replace("/users");
          } else {
            router.replace("/evaluaterole");
          }
        }
      } catch {
        // No active session or token expired
      }
    };

    checkExistingSession();

    return () => {
      isMounted = false;
    };
  }, [router, setUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate with Zod
    const validation = loginSchema.safeParse({ username, password });
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      // Post to Next.js API route (/api/auth/login) which sets httpOnly cookie
      const res = await axios.post("/api/auth/login", {
        username: username.trim(),
        password: password.trim(),
      });

      if (res.data.success) {
        if (res.data.token) {
          Cookies.set("token", res.data.token, { expires: 1 / 12, path: "/" });
          localStorage.setItem("token", res.data.token);
        }
        if (res.data.user) {
          setUser(res.data.user);
        }
        if (res.data.user?.roleId === 1) {
          router.push("/users");
        } else {
          router.push("/evaluaterole");
        }
      } else {
        setErrorMsg(res.data.message || "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
      }
    } catch (err: unknown) {
      let msg = "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message;
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-sky-500 selection:text-white">
      {/* Background Glowing Mesh & Dynamic Ambient Light Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.12] pointer-events-none" />

      {/* Animated Light Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/25 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 -right-32 w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Glassmorphic Card Container */}
      <div className="w-full max-w-md lg:max-w-5xl bg-white/95 backdrop-blur-3xl rounded-3xl border border-white/80 shadow-[0_32px_64px_-16px_rgba(2,132,199,0.22)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden z-10 transition-all">

        {/* Left Side: Modern Electric Blue Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-sky-600 via-sky-700 to-slate-950 p-6 sm:p-8 lg:p-11 flex flex-col justify-between relative text-white overflow-hidden">

          {/* Subtle Grid Pattern Overlay & Glow Effects */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />

          {/* Upper Section */}
          <div className="space-y-6 lg:space-y-9 relative z-10">

            {/* EDL Logo Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-sky-950/30">
              <Image
                src="/edl.png"
                alt="EDL Logo"
                width={28}
                height={28}
                className="w-7 h-7 object-contain shrink-0"
              />
              <span className="text-xs font-black tracking-widest text-white uppercase font-mono">
                ELECTRICITE DU LAOS
              </span>
            </div>

            {/* Main Title Section */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
                ລະບົບປະເມີນຜົນ{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-sky-100 to-white block mt-1">
                  ການປະຕິບັດງານ
                </span>
              </h1>
              <p className="text-sky-100/90 text-xs sm:text-sm font-medium leading-relaxed">
                EDL Evaluation System 2026
              </p>
            </div>

            {/* Feature Highlights Showcase */}
            <div className="hidden lg:flex flex-col space-y-3.5 pt-4 border-t border-white/15">

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm hover:bg-white/15 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">ເຊື່ອມໂຍງຂໍ້ມູນພະນັກງານ</p>
                  <p className="text-[11px] text-sky-200/80">ຊິງຄ໌ຂໍ້ມູນກົງຈາກລະບົບ HRM EDL</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm hover:bg-white/15 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">ປະເມີນຜົນການປະຕິບັດງານ</p>
                  <p className="text-[11px] text-sky-200/80">ປະເມີນຜົນຮອບດ້ານ ຕາມມາດຕະຖານ EDL</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Footer Info */}
          <div className="hidden lg:flex pt-6 relative z-10 text-[11px] text-sky-200/80 items-center justify-between border-t border-white/15 mt-8">
            <span>© 2026 Electricite du Laos</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-mono border border-white/15 text-amber-300">
              v1.0.0
            </span>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center bg-white relative">
          <div className="w-full space-y-6 sm:space-y-7 max-w-md mx-auto">

            {/* Form Header */}
            <div className="space-y-1.5 pb-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ເຂົ້າສູ່ລະບົບ{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-sky-500">
                  ປະເມີນຜົນ
                </span>
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                ປ້ອນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ ເພື່ອເຂົ້າສູ່ລະບົບປະເມີນຜົນ
              </p>
            </div>

            {/* Error Alert Box */}
            {errorMsg && (
              <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold animate-fadeIn shadow-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Username Input Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>ຊື່ຜູ້ໃຊ້</span>
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ປ້ອນຊື່ຜູ້ໃຊ້ງານ..."
                    className="pl-11 text-slate-800 bg-slate-50/90 border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 h-12 text-xs sm:text-sm rounded-xl transition-all shadow-sm group-hover:border-sky-300"
                  />
                  <User className="w-4 h-4 text-slate-400 group-focus-within:text-sky-600 absolute left-4 top-4 transition-colors" />
                </div>
              </div>

              {/* Password Input Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-700">
                    ລະຫັດຜ່ານ
                  </label>
                </div>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 pr-11 text-slate-800 bg-slate-50/90 border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 h-12 text-xs sm:text-sm rounded-xl transition-all shadow-sm group-hover:border-sky-300"
                  />
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-sky-600 absolute left-4 top-4 transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Submit Button */}
              <Button
                type="submit"
                variant="edl"
                size="lg"
                disabled={isLoading}
                className="w-full h-12 text-xs sm:text-sm font-extrabold tracking-wide rounded-xl shadow-xl shadow-sky-600/25 hover:shadow-sky-600/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2.5">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    ກຳລັງເຂົ້າສູ່ລະບົບ...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span>ເຂົ້າສູ່ລະບົບ</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

