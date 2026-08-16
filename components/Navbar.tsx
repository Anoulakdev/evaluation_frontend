"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  Users,
  Building2,
  Database,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useEvaluationStore } from "@/store/useEvaluationStore";
import Cookies from "js-cookie";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, fetchUser, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, []);

  const navItems =
    user?.roleId === 1
      ? [
        {
          laoName: "ຈັດການຜູ້ໃຊ້",
          href: "/users",
          icon: Users,
        },
        {
          laoName: "ຜົນການປະເມີນລວມ",
          href: "/alltotalscore",
          icon: Award,
        },
        {
          laoName: "ຜົນການປະເມີນບຸກຄົນ",
          href: "/totalscore",
          icon: Award,
        },
        {
          laoName: "ໂຄງຮ່າງການຈັດຕັ້ງ",
          href: "/organization",
          icon: Building2,
        },
        {
          laoName: "ຈັດການຂໍ້ມູນ",
          href: "/managedata",
          icon: Database,
        },
      ]
      : [];

  const handleLogout = async () => {
    try {
      useEvaluationStore.getState().resetEvaluation();
      Cookies.remove("token");
      Cookies.remove("access_token");
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
      await logout();
    } catch {
      // ignore
    } finally {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const displayName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username
    : "ຜູ້ໃຊ້ງານ";

  return (
    <header className="sticky top-0 z-50 glass-nav shadow-sm border-b border-sky-100 font-sans">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
              <Image
                src="/edl.png"
                alt="EDL Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain transform group-hover:scale-105 transition-transform duration-200"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                  EDL EVALUATION
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold border border-sky-200">
                    2026
                  </span>
                </span>
                <span className="text-xs text-sky-600 font-medium">
                  ລະບົບປະເມີນຜົນການປະຕິບັດງານ
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navbar Menu */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs lg:text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive
                    ? "bg-sky-50 text-sky-700 shadow-sm border border-sky-200/80 font-semibold"
                    : "text-slate-600 hover:text-sky-600 hover:bg-slate-100/70"
                    }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? "text-sky-600" : "text-slate-400"
                      }`}
                  />
                  <span className="whitespace-nowrap font-medium">{item.laoName}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions (Profile) */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                {user?.empimg ? (
                  <img
                    src={user.empimg}
                    alt={user.username}
                    className="w-8 h-8 rounded-lg object-cover object-top border border-slate-200 shadow-sm bg-slate-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-sm uppercase">
                    {(user?.first_name || user?.username || "AD").slice(0, 2)}
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-sky-600 leading-tight">
                    @{user?.username || "user"}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {user?.email || (user?.username ? `@${user.username}` : "user@edl.com.la")}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      {user?.roleId === 1
                        ? "ຜູ້ດູແລລະບົບສູງສຸດ"
                        : user?.roleId === 2
                          ? "ຜູ້ອຳນວຍການໃຫຍ່"
                          : "ຜູ້ໃຊ້ງານລະບົບ"}
                    </span>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> ອອກຈາກລະບົບ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-sky-600 rounded-xl"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600"
              >
                <Icon className="w-5 h-5 text-sky-600" />
                <div>
                  <p className="font-semibold">{item.laoName}</p>
                </div>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 font-semibold text-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> ອອກຈາກລະບົບ
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
