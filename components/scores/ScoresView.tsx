"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Send,
  Award,
  Sparkles,
  AlertCircle,
  UserCheck,
  Check,
  ShieldCheck,
  Building,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useEvaluationStore } from "@/store/useEvaluationStore";
import { axiosInstance } from "@/lib/axiosInstance";
import { decryptData, encryptData } from "@/lib/crypto";
import { toast } from "react-toastify";

export interface TargetReceiver {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  emp_code?: string | null;
  empimg?: string | null;
  position?: { pos_name?: string } | null;
  department?: { department_name?: string } | null;
}

export interface SubTitleData {
  id: number;
  titleId: number;
  fieldName: string;
  name: string;
}

export interface TitleData {
  id: number;
  name: string;
  subtitles: SubTitleData[];
}

export interface TitleApiItem {
  id: number;
  name: string;
}

export interface SubTitleApiItem {
  id: number;
  titleId: number;
  name: string;
}

export interface ScoreApiItem {
  id: number;
  sc_num: number;
}



export function ScoresView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const {
    currentStep,
    scores,
    setScore,
    nextStep,
    prevStep,
    initEvaluation,
    resetEvaluation,
  } = useEvaluationStore();

  const [receiver, setReceiver] = useState<TargetReceiver | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [evalId, setEvalId] = useState<number | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);

  const [titlesList, setTitlesList] = useState<TitleData[]>([]);
  const [scoreOptions, setScoreOptions] = useState<number[]>([]);

  // Fetch titles, subtitles, and scores from backend APIs concurrently
  useEffect(() => {
    const fetchFormMasterData = async () => {
      try {
        const [titlesRes, subtitlesRes, scoresRes] = await Promise.all([
          axiosInstance.get<TitleApiItem[]>("/titles/selecttitle"),
          axiosInstance.get<Array<{ id: number; titleId: number; name: string }>>("/subtitles"),
          axiosInstance.get<ScoreApiItem[]>("/scores/selectscore"),
        ]);

        const rawTitles = titlesRes.data || [];
        const rawSubtitles = subtitlesRes.data || [];
        const rawScores = scoresRes.data || [];

        const subsByTitleId = new Map<number, SubTitleData[]>();
        rawSubtitles.forEach((sub) => {
          if (!subsByTitleId.has(sub.titleId)) {
            subsByTitleId.set(sub.titleId, []);
          }
          const list = subsByTitleId.get(sub.titleId)!;
          list.push({
            id: sub.id,
            titleId: sub.titleId,
            name: sub.name,
            fieldName: `s${sub.titleId}_${list.length + 1}`,
          });
        });

        const titlesWithSubtitles: TitleData[] = rawTitles.map((t) => ({
          id: t.id,
          name: t.name,
          subtitles: subsByTitleId.get(t.id) || [],
        }));

        if (titlesWithSubtitles.length > 0) {
          setTitlesList(titlesWithSubtitles);
        }

        if (rawScores.length > 0) {
          setScoreOptions(rawScores.map((s) => s.sc_num));
        }
      } catch (err) {
        console.error("Failed to fetch evaluation form data:", err);
      }
    };

    fetchFormMasterData();
  }, []);

  const activeTitles = titlesList;
  const activeScoreOptions = scoreOptions;

  // Decrypt parameters from searchParams
  useEffect(() => {
    const rawEvalId = searchParams.get("evalId");
    const rawRoleId = searchParams.get("roleId");

    if (rawEvalId && rawRoleId) {
      const decEvalIdStr = decryptData(rawEvalId);
      const decRoleIdStr = decryptData(rawRoleId);

      const decEvalId = Number(decEvalIdStr);
      const decRoleId = Number(decRoleIdStr);

      if (!isNaN(decEvalId) && !isNaN(decRoleId)) {
        setEvalId(decEvalId);
        setRoleId(decRoleId);
        initEvaluation(decEvalId, decRoleId);
      } else {
        setError("ຂໍ້ມູນລະຫັດປະເມີນບໍ່ຖືກຕ້ອງ");
        setLoading(false);
      }
    } else {
      setError("ບໍ່ພົບຂໍ້ມູນການປະເມີນ");
      setLoading(false);
    }
  }, [searchParams]);

  // Fetch receiver info
  useEffect(() => {
    if (!evalId) return;
    const fetchReceiver = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(`/users/${evalId}`);
        setReceiver(res.data || null);
      } catch (err: any) {
        console.error("Failed to fetch receiver:", err);
        setError("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຜູ້ຖືກປະເມີນໄດ້");
      } finally {
        setLoading(false);
      }
    };
    fetchReceiver();
  }, [evalId]);

  const currentTitleData = activeTitles.find((t) => t.id === currentStep) || activeTitles[currentStep - 1];

  // Check if all SubTitles in current step are selected
  const isStepValid = () => {
    if (!currentTitleData) return false;
    for (const sub of currentTitleData.subtitles) {
      if (!scores[sub.fieldName] || scores[sub.fieldName] <= 0) {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!isStepValid()) {
      setValidationError("ກະລຸນາເລືອກຄະແນນໃຫ້ຄົບທຸກຫົວຂໍ້ກ່ອນໄປຂັ້ນຕອນຕໍ່ໄປ");
      return;
    }
    setValidationError(null);
    nextStep();
  };

  const handleScoreChange = (fieldName: string, value: number) => {
    setScore(fieldName, value);
    setValidationError(null);
  };

  // Submit complete evaluation at Step 4
  const handleSubmit = async () => {
    if (!isStepValid()) {
      setValidationError("ກະລຸນາເລືອກຄະແນນໃຫ້ຄົບທຸກຫົວຂໍ້ກ່ອນບັນທຶກ");
      return;
    }
    setValidationError(null);

    const payload = {
      receiverId: evalId,
      s1_1: scores.s1_1 || 0,
      s1_2: scores.s1_2 || 0,
      s1_3: scores.s1_3 || 0,
      s1_4: scores.s1_4 || 0,
      s1_5: scores.s1_5 || 0,
      s1_6: scores.s1_6 || 0,
      s2_1: scores.s2_1 || 0,
      s2_2: scores.s2_2 || 0,
      s2_3: scores.s2_3 || 0,
      s2_4: scores.s2_4 || 0,
      s2_5: scores.s2_5 || 0,
      s3_1: scores.s3_1 || 0,
      s3_2: scores.s3_2 || 0,
      s3_3: scores.s3_3 || 0,
      s4_1: scores.s4_1 || 0,
      s4_2: scores.s4_2 || 0,
    };

    try {
      setSubmitting(true);
      await axiosInstance.post("/totals", payload);
      resetEvaluation();
      toast.success("ບັນທຶກການປະເມີນຜົນສຳເລັດ!");
      if (roleId) {
        const encryptedRoleId = encryptData(roleId);
        router.push(`/evaluateuser?roleId=${encryptedRoleId}`);
      } else {
        router.push("/evaluaterole");
      }
    } catch (err: any) {
      console.error("Submit evaluation failed:", err);
      toast.error(
        err?.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການປະເມີນ"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const receiverName = receiver
    ? `${receiver.first_name || ""} ${receiver.last_name || ""}`.trim() || "ພະນັກງານ"
    : "ພະນັກງານ";
  const receiverInitials = receiverName.slice(0, 2).toUpperCase();

  const totalSteps = activeTitles.length || 4;

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner & Receiver Info */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-800 via-sky-700 to-blue-900 p-6 sm:p-8 text-white shadow-xl shadow-sky-900/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Award className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-bold transition-all border border-white/20 text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              ກັບຄືນ
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            {receiver?.empimg ? (
              <img
                src={receiver.empimg}
                alt={receiverName}
                className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-white/40 shadow-md bg-white/10 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/15 text-white font-black text-xl flex items-center justify-center border-2 border-white/30 shadow-md shrink-0">
                {receiverInitials}
              </div>
            )}

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2">
                {receiverName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-sky-200">
                <span className="bg-sky-950/60 px-2.5 py-0.5 rounded-lg border border-sky-400/30 font-mono font-bold">
                  {receiver?.emp_code || `EMP-${evalId}`}
                </span>
                {receiver?.position?.pos_name && (
                  <span className="bg-sky-950/60 px-2.5 py-0.5 rounded-lg border border-sky-400/30 flex items-center gap-1 font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-sky-300" />
                    {receiver.position.pos_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern ProgressBar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>ຂັ້ນຕອນການປະເມີນ: ຂັ້ນທີ {currentStep} / {totalSteps}</span>
          <span className="text-sky-600">
            {Math.round((currentStep / totalSteps) * 100)}% ສຳເລັດ
          </span>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Indicator Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {activeTitles.map((t, index) => {
            const stepNum = index + 1;
            const isDone = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;

            return (
              <div
                key={t.id}
                onClick={() => {
                  if (stepNum < currentStep) useEvaluationStore.getState().setCurrentStep(stepNum);
                }}
                className={`flex items-center space-x-2.5 p-3 rounded-2xl border transition-all ${isCurrent
                  ? "bg-sky-50 border-sky-400 shadow-sm ring-2 ring-sky-400/20"
                  : isDone
                    ? "bg-emerald-50/60 border-emerald-200 text-emerald-800 cursor-pointer"
                    : "bg-slate-50 border-slate-200/80 text-slate-400 opacity-70"
                  }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${isCurrent
                    ? "bg-sky-600 text-white"
                    : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                    }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold truncate leading-tight">
                    {t.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {t.subtitles.length} ຫົວຂໍ້
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Title / Questions Form Area */}
      {loading ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 rounded w-1/2" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-rose-50/80 border border-rose-200 text-rose-800 space-y-4 text-center max-w-lg mx-auto my-8 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-base">{error}</h3>
          <button
            onClick={() => router.push("/evaluaterole")}
            className="px-5 py-2.5 bg-rose-600 text-white text-xs font-extrabold rounded-2xl hover:bg-rose-700 transition-all shadow-md cursor-pointer"
          >
            ກັບຄືນ
          </button>
        </div>
      ) : currentTitleData ? (
        <div className="space-y-6">
          {/* Section Title Header */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                ຫົວຂໍ້ທີ {currentStep} / {totalSteps}
              </span>
              <h2 className="text-lg font-black text-slate-800 pt-1">
                {currentTitleData.name}
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              {currentTitleData.subtitles.length} ຂໍ້
            </span>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* SubTitles Questions List */}
          <div className="space-y-4">
            {currentTitleData.subtitles.map((sub, idx) => {
              const selectedValue = scores[sub.fieldName] || 0;

              return (
                <div
                  key={sub.id}
                  className={`p-5 rounded-3xl bg-white border transition-all shadow-sm ${selectedValue > 0
                    ? "border-sky-300 ring-1 ring-sky-300/30"
                    : "border-slate-200/90"
                    }`}
                >
                  <div className="space-y-3">
                    {/* SubTitle Text Header */}
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 leading-relaxed">
                        {sub.name}
                      </h3>
                    </div>

                    {/* Dynamic Radio Button Options */}
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase">
                        ເລືອກຄະແນນ ({activeScoreOptions[0]} - {activeScoreOptions[activeScoreOptions.length - 1]}):
                      </p>
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {activeScoreOptions.map((scoreNum) => {
                          const isChecked = selectedValue === scoreNum;

                          return (
                            <button
                              key={scoreNum}
                              type="button"
                              onClick={() => handleScoreChange(sub.fieldName, scoreNum)}
                              className={`h-11 rounded-2xl font-black text-xs transition-all duration-200 flex flex-col items-center justify-center border cursor-pointer ${isChecked
                                ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/30 scale-105"
                                : "bg-slate-50 hover:bg-sky-50 text-slate-700 border-slate-200 hover:border-sky-300"
                                }`}
                            >
                              <span>{scoreNum}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls Bar (Next / Prev / Submit) */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              ຂັ້ນຕອນກ່ອນໜ້າ
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-lg shadow-sky-600/25 hover:shadow-sky-600/35 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>ຂັ້ນຕອນຕໍ່ໄປ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-7 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    ກຳລັງບັນທຶກ...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    ບັນທຶກການປະເມີນ
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
