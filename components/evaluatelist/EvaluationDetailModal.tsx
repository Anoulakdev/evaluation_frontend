"use client";

import React, { useState } from "react";
import {
  X,
  Award,
  Calendar,
  CheckCircle2,
  Building,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ReceiverDetail {
  id: number;
  first_name: string | null;
  last_name: string | null;
  emp_code: string | null;
  empimg: string | null;
  gender: string | null;
  roleId: number | null;
  role?: { id: number; name: string } | null;
  department?: { id: number; department_name: string } | null;
  division?: { id: number; division_name: string } | null;
  office?: { id: number; office_name: string } | null;
  unit?: { id: number; unit_name: string } | null;
  position?: { id: number; pos_name: string } | null;
}

export interface EvaluationItem {
  id: number;
  roleId: number;
  giverId: number;
  receiverId: number;
  together: boolean;
  s1_1: number;
  s1_2: number;
  s1_3: number;
  s1_4: number;
  s1_5: number;
  s1_6: number;
  s1_score: number;
  s2_1: number;
  s2_2: number;
  s2_3: number;
  s2_4: number;
  s2_5: number;
  s2_score: number;
  s3_1: number;
  s3_2: number;
  s3_3: number;
  s3_score: number;
  s4_1: number;
  s4_2: number;
  s4_score: number;
  total_score: number;
  percent_score: number;
  approve: boolean;
  createdAt: string;
  updatedAt: string;
  receiver: ReceiverDetail;
  role: {
    id: number;
    name: string;
  };
}

interface EvaluationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: EvaluationItem | null;
  onApproveSingle?: (item: EvaluationItem) => void;
}

export function EvaluationDetailModal({
  isOpen,
  onClose,
  item,
  onApproveSingle,
}: EvaluationDetailModalProps) {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  if (!isOpen || !item) return null;

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections = [
    {
      id: 1,
      title: "ດ້ານທີ 1: ຄວາມເປັນຜູ້ນໍາ ແລະ ການສ້າງແຮງຈູງໃຈ",
      score: item.s1_score,
      maxScore: 30,
      subtitles: [
        { key: "s1_1", name: "ມີຄວາມຍຸດຕິທຳ, ຮັບຟັງຄວາມຄິດເຫັນຂອງທີມງານ.", val: item.s1_1 },
        { key: "s1_2", name: "ມີຄວາມຮັບຜິດຊອບຕໍ່ຄວາມຜິດພາດຂອງຕົນ ແລະ ຂອງທີມງານ.", val: item.s1_2 },
        { key: "s1_3", name: "ເສຍສະຫຼະເພື່ອສ່ວນລວມ ກໍຄືການຈັດຕັ້ງ ຟຟລ ຫຼາຍກວ່າສ່ວນຕົວ.", val: item.s1_3 },
        { key: "s1_4", name: "ສາມາດສ້າງແຮງຈູງໃຈ ແລະ ຊຸກຍູ້ໃຫ້ທີມງານຢາກພັດທະນາຕົນເອງ.", val: item.s1_4 },
        {
          key: "s1_5",
          name: "ມີການຍ້ອງຍໍຊົມເຊີຍຕໍ່ທີມງານ ກໍລະນີມີຜົນງານ ແລະ ມີການຄຳແນະນຳແນວທາງເພື່ອແກ້ໄຂຈຸດອ່ອນ ເປັນການກໍ່ສ້າງເຊິ່ງກັນ ແລະ ກັນ.",
          val: item.s1_5,
        },
        {
          key: "s1_6",
          name: "(ສໍາລັບລະດັບສູງ: ຮອງຜູ້ອໍານວຍການ-ຮອງຝ່າຍ) ມີວິໄສທັດ ສາມາດກຳນົດທິດທາງ ແລະ ເປົ້າໝາຍ ຍຸດທະສາດ ໄດ້ຢ່າງຊັດເຈນ.",
          val: item.s1_6,
        },
      ],
    },
    {
      id: 2,
      title: "ດ້ານທີ 2: ແນວທາງການປະຕິບັດວຽກງານ ແລະ ການບໍລິຫານ",
      score: item.s2_score,
      maxScore: 25,
      subtitles: [
        { key: "s2_1", name: "ມອບໝາຍວຽກງານຊັດເຈນ, ເໝາະສົມກັບຄວາມສາມາດຂອງບຸກຄະລາກອນ.", val: item.s2_1 },
        { key: "s2_2", name: "ການບໍລິຫານການປ່ຽນແປງວິທີການເຮັດວຽກ ເພື່ອໃຫ້ພັດທະນາການຈັດຕັ້ງຕົນ.", val: item.s2_2 },
        {
          key: "s2_3",
          name: "ມີຄວາມຫ້າວຫັນ, ຄວາມຄິດລິເລີ່ມ ແລະ ຫົວຄິດປະດິດສ້າງ ໃນການນໍາໃຊ້ເຄື່ອງມື ແລະ ເຕັກໂນໂລຊີ ເຂົ້າໃນວຽກງານ.",
          val: item.s2_3,
        },
        { key: "s2_4", name: "ການແກ້ໄຂບັນຫາສະເພາະໜ້າ ແລະ ຕັດສິນໃຈໃນວຽກງານໄດ້ຢ່າງເໝາະສົມ ທັນການ.", val: item.s2_4 },
        { key: "s2_5", name: "ຕິດຕາມ ແລະ ໃຫ້ຄຳແນະນຳ ເພື່ອຊ່ວຍເຫຼືອທິມງານໃນການແກ້ໄຂບັນຫາວຽກງານ.", val: item.s2_5 },
      ],
    },
    {
      id: 3,
      title: "ດ້ານທີ 3: ການສື່ສານ ແລະ ມະນຸດສຳພັນ",
      score: item.s3_score,
      maxScore: 15,
      subtitles: [
        {
          key: "s3_1",
          name: "ສື່ສານຄຳສັ່ງ ນະໂຍບາຍ ແລະ ຂໍ້ມູນຕ່າງໆ ຈາກຂັ້ນເທິງໃຫ້ທີມງານຮັບຊາບຢ່າງຄົບຖ້ວນ ແລະ ຊັດເຈນ.",
          val: item.s3_1,
        },
        { key: "s3_2", name: "ສາມາດຄວບຄຸມອາລົມໄດ້ດີໃນສະຖານະການທີ່ມີຄວາມກົດດັນ ຫຼື ເມື່ອເກີດຄວາມຂັດແຍ່ງ.", val: item.s3_2 },
        { key: "s3_3", name: "ມີມະນຸດສຳພັນດີ.", val: item.s3_3 },
      ],
    },
    {
      id: 4,
      title: "ດ້ານທີ 4: ປະຕິບັດລະບຽບ ແລະ ຈັນຍາບັນ",
      score: item.s4_score,
      maxScore: 10,
      subtitles: [
        {
          key: "s4_1",
          name: "ປະຕິບັດໂຕເປັນແບບຢ່າງທີ່ດີ ໃນການຮັກສາລະບຽບວິໃນ, ເຄົາລົບການຈັດຕັ້ງ ແລະ ຈັນຍາບັນຂອງບໍລິສັດ.",
          val: item.s4_1,
        },
        { key: "s4_2", name: "ມີຄວາມຊື່ສັດບໍລິສຸດ, ໂປ່ງໃສ ໃນການບໍລິຫານວຽກງານ ແລະ ບຸກຄະລາກອນ.", val: item.s4_2 },
      ],
    },
  ];

  const formattedDate = (() => {
    if (!item.createdAt) return "-";
    const d = new Date(item.createdAt);
    if (isNaN(d.getTime())) return "-";
    const laoMonths = [
      "ມັງກອນ",
      "ກຸມພາ",
      "ມີນາ",
      "ເມສາ",
      "ພຶດສະພາ",
      "ມິຖຸນາ",
      "ກໍລະກົດ",
      "ສິງຫາ",
      "ກັນຍາ",
      "ຕຸລາ",
      "ພະຈິກ",
      "ທັນວາ",
    ];
    const day = d.getDate();
    const month = laoMonths[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-800 via-sky-700 to-blue-900 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 pr-8">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                ລາຍລະອຽດຜົນການປະເມີນ
              </h2>
              <p className="text-xs text-sky-200 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                ວັນທີປະເມີນ: {formattedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
          {/* Receiver Profile Card */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              {item.receiver.empimg ? (
                <img
                  src={item.receiver.empimg}
                  alt={item.receiver.emp_code || ""}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover object-top border-2 border-white shadow-sm bg-white shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black flex items-center justify-center text-base shadow-sm shrink-0 uppercase">
                  {(
                    item.receiver.first_name ||
                    item.receiver.emp_code ||
                    "ED"
                  ).slice(0, 2)}
                </div>
              )}

              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-slate-800">
                    {item.receiver.first_name || ""} {item.receiver.last_name || ""}
                  </h3>
                  <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-sky-100 text-sky-700 border border-sky-200">
                    {item.receiver.emp_code || "ບໍ່ມີລະຫັດ"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold">
                  {item.receiver.position?.pos_name || "ບໍ່ລະບຸຕຳແໜ່ງ"}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {item.receiver.department?.department_name || "ບໍ່ລະບຸພະແນກ"}
                  </span>
                  {item.receiver.division?.division_name && (
                    <span>• {item.receiver.division.division_name}</span>
                  )}
                  {item.receiver.unit?.unit_name && (
                    <span>• {item.receiver.unit.unit_name}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Total Score Badge in Profile */}
            <div className="w-full md:w-auto px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm flex md:flex-col items-center justify-between md:justify-center text-center gap-0.5 shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                ຄະແນນລວມ
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-sky-600">
                  {item.total_score}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Score Section Summaries */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="p-2.5 sm:p-3 rounded-xl bg-sky-50/50 border border-sky-100 flex flex-col justify-between"
              >
                <span className="text-[11px] font-bold text-slate-600 truncate">
                  ດ້ານທີ {sec.id}
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-lg font-black text-sky-700">
                    {sec.score}
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-sky-600 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, (sec.score / sec.maxScore) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Accordion / Full breakdown for each category */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5 pt-0.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              ລາຍລະອຽດຄະແນນແຕ່ລະຂໍ້
            </h4>

            {sections.map((sec) => {
              const isExpanded = !!expandedSections[sec.id];
              return (
                <div
                  key={sec.id}
                  className="rounded-xl border border-slate-200/90 overflow-hidden bg-white shadow-sm"
                >
                  <button
                    onClick={() => toggleSection(sec.id)}
                    className="w-full py-2.5 px-3 sm:px-3.5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/60 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                        {sec.id}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {sec.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-lg">
                        {sec.score} ຄະແນນ
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-slate-100 px-2.5 sm:px-3.5 py-1">
                      {sec.subtitles.map((sub, idx) => (
                        <div
                          key={sub.key}
                          className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-slate-50/70 rounded-lg transition-colors px-1"
                        >
                          <div className="flex items-start gap-2 flex-1 pr-2">
                            <span className="text-xs font-bold text-slate-400 shrink-0 mt-0.5">
                              {idx + 1}.
                            </span>
                            <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                              {sub.name}
                            </span>
                          </div>

                          <div className="flex items-center shrink-0 self-end sm:self-center">
                            <span className="min-w-8 text-center text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                              {sub.val}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-4 py-1.5 text-xs rounded-xl font-bold cursor-pointer h-8"
          >
            ປິດ
          </Button>

          {onApproveSingle && (
            <Button
              type="button"
              onClick={() => {
                onClose();
                onApproveSingle(item);
              }}
              className="px-4 py-1.5 text-xs rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer h-8"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              ຢືນຢັນການປະເມີນຄົນນີ້
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
