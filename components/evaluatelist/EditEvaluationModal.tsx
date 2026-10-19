"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Edit3,
  Building,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { axiosInstance, isAxiosError } from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { EvaluationItem } from "./EvaluationDetailModal";

interface EditEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: EvaluationItem | null;
  onSuccess: () => Promise<void> | void;
}

type ScoreKeys =
  | "s1_1"
  | "s1_2"
  | "s1_3"
  | "s1_4"
  | "s1_5"
  | "s1_6"
  | "s2_1"
  | "s2_2"
  | "s2_3"
  | "s2_4"
  | "s2_5"
  | "s3_1"
  | "s3_2"
  | "s3_3"
  | "s4_1"
  | "s4_2";

export function EditEvaluationModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: EditEvaluationModalProps) {
  const [scores, setScores] = useState<Record<ScoreKeys, number>>(() => ({
    s1_1: item?.s1_1 || 0,
    s1_2: item?.s1_2 || 0,
    s1_3: item?.s1_3 || 0,
    s1_4: item?.s1_4 || 0,
    s1_5: item?.s1_5 || 0,
    s1_6: item?.s1_6 || 0,
    s2_1: item?.s2_1 || 0,
    s2_2: item?.s2_2 || 0,
    s2_3: item?.s2_3 || 0,
    s2_4: item?.s2_4 || 0,
    s2_5: item?.s2_5 || 0,
    s3_1: item?.s3_1 || 0,
    s3_2: item?.s3_2 || 0,
    s3_3: item?.s3_3 || 0,
    s4_1: item?.s4_1 || 0,
    s4_2: item?.s4_2 || 0,
  }));

  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  const [saving, setSaving] = useState(false);

  // Sync scores if item changes
  useEffect(() => {
    if (item) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScores({
        s1_1: item.s1_1 || 0,
        s1_2: item.s1_2 || 0,
        s1_3: item.s1_3 || 0,
        s1_4: item.s1_4 || 0,
        s1_5: item.s1_5 || 0,
        s1_6: item.s1_6 || 0,
        s2_1: item.s2_1 || 0,
        s2_2: item.s2_2 || 0,
        s2_3: item.s2_3 || 0,
        s2_4: item.s2_4 || 0,
        s2_5: item.s2_5 || 0,
        s3_1: item.s3_1 || 0,
        s3_2: item.s3_2 || 0,
        s3_3: item.s3_3 || 0,
        s4_1: item.s4_1 || 0,
        s4_2: item.s4_2 || 0,
      });
    }
  }, [item]);

  const toggleSection = (id: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isAllExpanded = useMemo(() => {
    return Object.values(expandedSections).every(Boolean);
  }, [expandedSections]);

  const toggleAllSections = () => {
    const nextState = !isAllExpanded;
    setExpandedSections({
      1: nextState,
      2: nextState,
      3: nextState,
      4: nextState,
    });
  };

  const handleScoreChange = (key: ScoreKeys, val: number) => {
    if (item?.approve) return;
    setScores((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // Live calculations
  const { s1_score, s2_score, s3_score, s4_score, total_score, percent_score } =
    useMemo(() => {
      const s1 =
        scores.s1_1 +
        scores.s1_2 +
        scores.s1_3 +
        scores.s1_4 +
        scores.s1_5 +
        scores.s1_6;
      const s2 =
        scores.s2_1 +
        scores.s2_2 +
        scores.s2_3 +
        scores.s2_4 +
        scores.s2_5;
      const s3 = scores.s3_1 + scores.s3_2 + scores.s3_3;
      const s4 = scores.s4_1 + scores.s4_2;
      const tot = s1 + s2 + s3 + s4;
      const pct = Number(((tot / 160) * 100).toFixed(2));
      return {
        s1_score: s1,
        s2_score: s2,
        s3_score: s3,
        s4_score: s4,
        total_score: tot,
        percent_score: pct,
      };
    }, [scores]);

  const sections = [
    {
      id: 1,
      title: "ດ້ານທີ 1: ຄວາມເປັນຜູ້ນໍາ ແລະ ການສ້າງແຮງຈູງໃຈ",
      score: s1_score,
      maxScore: 60,
      subtitles: [
        {
          key: "s1_1" as ScoreKeys,
          name: "ມີຄວາມຍຸດຕິທຳ, ຮັບຟັງຄວາມຄິດເຫັນຂອງທີມງານ.",
        },
        {
          key: "s1_2" as ScoreKeys,
          name: "ມີຄວາມຮັບຜິດຊອບຕໍ່ຄວາມຜິດພາດຂອງຕົນ ແລະ ຂອງທີມງານ.",
        },
        {
          key: "s1_3" as ScoreKeys,
          name: "ເສຍສະຫຼະເພື່ອສ່ວນລວມ ກໍຄືການຈັດຕັ້ງ ຟຟລ ຫຼາຍກວ່າສ່ວນຕົວ.",
        },
        {
          key: "s1_4" as ScoreKeys,
          name: "ສາມາດສ້າງແຮງຈູງໃຈ ແລະ ຊຸກຍູ້ໃຫ້ທີມງານຢາກພັດທະນາຕົນເອງ.",
        },
        {
          key: "s1_5" as ScoreKeys,
          name: "ມີການຍ້ອງຍໍຊົມເຊີຍຕໍ່ທີມງານ ກໍລະນີມີຜົນງານ ແລະ ມີການຄຳແນະນຳແນວທາງເພື່ອແກ້ໄຂຈຸດອ່ອນ ເປັນການກໍ່ສ້າງເຊິ່ງກັນ ແລະ ກັນ.",
        },
        {
          key: "s1_6" as ScoreKeys,
          name: "(ສໍາລັບລະດັບສູງ: ຮອງຜູ້ອໍານວຍການ-ຮອງຝ່າຍ) ມີວິໄສທັດ ສາມາດກຳນົດທິດທາງ ແລະ ເປົ້າໝາຍ ຍຸດທະສາດ ໄດ້ຢ່າງຊັດເຈນ.",
        },
      ],
    },
    {
      id: 2,
      title: "ດ້ານທີ 2: ແນວທາງການປະຕິບັດວຽກງານ ແລະ ການບໍລິຫານ",
      score: s2_score,
      maxScore: 50,
      subtitles: [
        {
          key: "s2_1" as ScoreKeys,
          name: "ມອບໝາຍວຽກງານຊັດເຈນ, ເໝາະສົມກັບຄວາມສາມາດຂອງບຸກຄະລາກອນ.",
        },
        {
          key: "s2_2" as ScoreKeys,
          name: "ການບໍລິຫານການປ່ຽນແປງວິທີການເຮັດວຽກ ເພື່ອໃຫ້ພັດທະນາການຈັດຕັ້ງຕົນ.",
        },
        {
          key: "s2_3" as ScoreKeys,
          name: "ມີຄວາມຫ້າວຫັນ, ຄວາມຄິດລິເລີ່ມ ແລະ ຫົວຄິດປະດິດສ້າງ ໃນການນໍາໃຊ້ເຄື່ອງມື ແລະ ເຕັກໂນໂລຊີ ເຂົ້າໃນວຽກງານ.",
        },
        {
          key: "s2_4" as ScoreKeys,
          name: "ການແກ້ໄຂບັນຫາສະເພາະໜ້າ ແລະ ຕັດສິນໃຈໃນວຽກງານໄດ້ຢ່າງເໝາະສົມ ທັນການ.",
        },
        {
          key: "s2_5" as ScoreKeys,
          name: "ຕິດຕາມ ແລະ ໃຫ້ຄຳແນະນຳ ເພື່ອຊ່ວຍເຫຼືອທິມງານໃນການແກ້ໄຂບັນຫາວຽກງານ.",
        },
      ],
    },
    {
      id: 3,
      title: "ດ້ານທີ 3: ການສື່ສານ ແລະ ມະນຸດສຳພັນ",
      score: s3_score,
      maxScore: 30,
      subtitles: [
        {
          key: "s3_1" as ScoreKeys,
          name: "ສື່ສານຄຳສັ່ງ ນະໂຍບາຍ ແລະ ຂໍ້ມູນຕ່າງໆ ຈາກຂັ້ນເທິງໃຫ້ທີມງານຮັບຊາບຢ່າງຄົບຖ້ວນ ແລະ ຊັດເຈນ.",
        },
        {
          key: "s3_2" as ScoreKeys,
          name: "ສາມາດຄວບຄຸມອາລົມໄດ້ດີໃນສະຖານະການທີ່ມີຄວາມກົດດັນ ຫຼື ເມື່ອເກີດຄວາມຂັດແຍ່ງ.",
        },
        {
          key: "s3_3" as ScoreKeys,
          name: "ມີມະນຸດສຳພັນດີ.",
        },
      ],
    },
    {
      id: 4,
      title: "ດ້ານທີ 4: ປະຕິບັດລະບຽບ ແລະ ຈັນຍາບັນ",
      score: s4_score,
      maxScore: 20,
      subtitles: [
        {
          key: "s4_1" as ScoreKeys,
          name: "ປະຕິບັດໂຕເປັນແບບຢ່າງທີ່ດີ ໃນການຮັກສາລະບຽບວິໃນ, ເຄົາລົບການຈັດຕັ້ງ ແລະ ຈັນຍາບັນຂອງບໍລິສັດ.",
        },
        {
          key: "s4_2" as ScoreKeys,
          name: "ມີຄວາມຊື່ສັດບໍລິສຸດ, ໂປ່ງໃສ ໃນການບໍລິຫານວຽກງານ ແລະ ບຸກຄະລາກອນ.",
        },
      ],
    },
  ];

  if (!isOpen || !item) return null;

  const handleSave = async () => {
    if (item.approve) {
      toast.error("ການປະເມີນນີ້ຖືກຢືນຢັນແລ້ວ ບໍ່ສາມາດແກ້ໄຂໄດ້");
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.put(`/totals/${item.id}`, scores);
      toast.success("ແກ້ໄຂຄະແນນການປະເມີນສຳເລັດແລ້ວ!");
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Failed to update evaluation scores:", err);
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຄະແນນ ກະລຸນາລອງໃໝ່";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[96vh] sm:max-h-[92vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-sky-800 via-sky-700 to-blue-900 text-white relative shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 sm:gap-3 pr-8">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 backdrop-blur-md flex items-center justify-center shrink-0">
              <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-base sm:text-xl font-black tracking-tight text-white">
                  ແກ້ໄຂຄະແນນການປະເມີນ
                </h2>
                {item.approve && (
                  <span className="text-[10px] sm:text-xs bg-rose-500/80 text-white px-2 py-0.5 rounded-full font-bold">
                    ຢືນຢັນແລ້ວ (ອ່ານຢ່າງດຽວ)
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-sky-200 mt-0.5 line-clamp-1 sm:line-clamp-none">
                ປັບປ່ຽນຄະແນນຕາມແຕ່ລະດ້ານ ແລະ ບັນທຶກຜົນ
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 space-y-3">
          {/* Receiver Info & Live Score Card */}
          <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              {item.receiver.empimg ? (
                <img
                  src={item.receiver.empimg}
                  alt={item.receiver.emp_code || ""}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover object-top border-2 border-white shadow-xs bg-white shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm sm:text-base shadow-xs shrink-0 uppercase">
                  {(
                    item.receiver.first_name ||
                    item.receiver.emp_code ||
                    "ED"
                  ).slice(0, 2)}
                </div>
              )}

              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 className="text-sm sm:text-base font-black text-slate-800 truncate">
                    {item.receiver.first_name || ""}{" "}
                    {item.receiver.last_name || ""}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold rounded-md bg-sky-100 text-sky-700 border border-sky-200 shrink-0">
                    {item.receiver.emp_code || "ບໍ່ມີລະຫັດ"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold truncate">
                  {item.receiver.position?.pos_name || "ບໍ່ລະບຸຕຳແໜ່ງ"}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 min-w-0 truncate">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {item.receiver.department?.department_name || "ບໍ່ລະບຸພະແນກ"}
                    </span>
                  </span>
                  {item.receiver.division?.division_name && (
                    <span className="truncate hidden sm:inline">
                      • {item.receiver.division.division_name}
                    </span>
                  )}
                  {item.receiver.unit?.unit_name && (
                    <span className="truncate hidden sm:inline">
                      • {item.receiver.unit.unit_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Scores Preview: 2-column balanced grid on mobile */}
            <div className="grid grid-cols-2 gap-2 w-full md:w-auto pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-200/80 shrink-0">
              <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-center flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  ຄະແນນລວມ
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl sm:text-2xl font-black text-sky-600">
                    {total_score}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">
                    / 160
                  </span>
                </div>
              </div>

              <div className="px-3 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200/90 shadow-xs text-center flex flex-col justify-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  ເປີເຊັນ (%)
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600">
                  {percent_score}%
                </span>
              </div>
            </div>
          </div>

          {/* Warning if already approved */}
          {item.approve && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                ການປະເມີນນີ້ໄດ້ຮັບການຢືນຢັນແລ້ວ (approve = true)
                ຈຶ່ງບໍ່ສາມາດແກ້ໄຂຄະແນນໄດ້ອີກ.
              </span>
            </div>
          )}

          {/* Section List Header with Collapse/Expand All toggle */}
          <div className="flex items-center justify-between px-1 pt-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ລາຍການປະເມີນ (4 ດ້ານ)
            </span>
            <button
              type="button"
              onClick={toggleAllSections}
              className="text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {isAllExpanded ? "ຫຍໍ້ທັງໝົດ" : "ຂະຫຍາຍທັງໝົດ"}
            </button>
          </div>

          {/* 4 Sections with 10-score Selector Buttons */}
          <div className="space-y-2">
            {sections.map((sec) => {
              const isExpanded = !!expandedSections[sec.id];
              return (
                <div
                  key={sec.id}
                  className="rounded-xl border border-slate-200/90 overflow-hidden bg-white shadow-xs"
                >
                  {/* Category Header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    className="w-full py-2.5 px-3 sm:px-3.5 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/70 active:bg-slate-100 transition-colors cursor-pointer text-left gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                        {sec.id}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {sec.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] sm:text-[11px] font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-lg whitespace-nowrap">
                        {sec.score} / {sec.maxScore} ຄະແນນ
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Subtitles & Score buttons */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-100 px-2 sm:px-3.5 py-1">
                      {sec.subtitles.map((sub, idx) => {
                        const currentVal = scores[sub.key];
                        return (
                          <div
                            key={sub.key}
                            className="py-2.5 sm:py-3 px-1 sm:px-1.5 flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-2.5 hover:bg-slate-50/80 rounded-xl transition-colors"
                          >
                            {/* Question Title */}
                            <div className="flex items-start gap-2 flex-1 pr-1">
                              <span className="text-xs font-bold text-slate-400 shrink-0 mt-0.5 w-4">
                                {idx + 1}.
                              </span>
                              <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                                {sub.name}
                              </span>
                            </div>

                            {/* Score Selector Container */}
                            <div className="w-full md:w-auto flex flex-col md:flex-row md:items-center gap-1.5 shrink-0 pl-6 md:pl-0">
                              {/* Mobile Current Value Label */}
                              <div className="flex items-center justify-between md:hidden">
                                <span className="text-[11px] font-medium text-slate-400">
                                  ເລືອກຄະແນນ (1-10):
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200/70 px-2 py-0.5 rounded-md">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                  {currentVal > 0 ? `${currentVal} ຄະແນນ` : "ຍັງບໍ່ໄດ້ເລືອກ"}
                                </span>
                              </div>

                              {/* 1 to 10 Buttons: 10 equal columns on mobile, row on desktop */}
                              <div className="grid grid-cols-10 gap-0.5 sm:gap-1 w-full md:w-auto md:flex md:items-center">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                                  const isSelected = currentVal === num;
                                  return (
                                    <button
                                      key={num}
                                      type="button"
                                      disabled={item.approve}
                                      onClick={() =>
                                        handleScoreChange(sub.key, num)
                                      }
                                      className={`h-8 sm:h-7 w-full md:w-7 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center active:scale-95 px-0 ${
                                        isSelected
                                          ? "bg-sky-600 text-white shadow-xs ring-2 ring-sky-500/30 scale-105 font-black"
                                          : "bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 active:bg-slate-200"
                                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                      {num}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions: thumb-friendly full-width on mobile */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm rounded-xl font-bold cursor-pointer h-9 sm:h-8 border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            ຍົກເລີກ
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || item.approve}
            className="flex-1 sm:flex-initial px-5 py-2 text-xs sm:text-sm rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 cursor-pointer h-9 sm:h-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ກຳລັງບັນທຶກ...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                ບັນທຶກການແກ້ໄຂ
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
