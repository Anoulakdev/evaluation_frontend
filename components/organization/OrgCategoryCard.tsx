"use client";

import { LucideIcon } from "lucide-react";

export interface CategoryMeta {
  key: string;
  titleLao: string;
  titleEng: string;
  endpoint: string;
  icon: LucideIcon;
  bgGradient: string;
  badgeColor: string;
  textColor: string;
  borderColor: string;
}

interface OrgCategoryCardProps {
  cat: CategoryMeta;
  isSelected: boolean;
  count: number;
  onSelect: (key: string) => void;
}

export function OrgCategoryCard({
  cat,
  isSelected,
  count,
  onSelect,
}: OrgCategoryCardProps) {
  const Icon = cat.icon;

  return (
    <button
      onClick={() => onSelect(cat.key)}
      className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden group ${
        isSelected
          ? `bg-white ${cat.borderColor} ring-2 ring-sky-500/20 shadow-md transform -translate-y-0.5`
          : `bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm`
      }`}
    >
      <div className="flex items-center justify-between pb-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cat.badgeColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${cat.badgeColor}`}>
          {count}
        </span>
      </div>

      <div className="space-y-0.5">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
          <span>{cat.titleLao}</span>
          <span className="text-[11px] font-normal text-slate-400">
            ({cat.titleEng})
          </span>
        </h3>
        <p className="text-[11px] text-slate-500 font-medium">
          {isSelected ? "ກຳລັງສະແດງ..." : "ຄລິກເພື່ອເບິ່ງ"}
        </p>
      </div>
    </button>
  );
}
