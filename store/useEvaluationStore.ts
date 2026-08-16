import { create } from "zustand";

export interface EvaluationState {
  currentStep: number; // 1 to 4
  receiverId: number | null;
  roleId: number | null;
  // Field scores: s1_1 to s1_6, s2_1 to s2_5, s3_1 to s3_3, s4_1 to s4_2
  scores: Record<string, number>;

  setScore: (field: string, score: number) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  initEvaluation: (receiverId: number, roleId: number) => void;
  resetEvaluation: () => void;
}

export const useEvaluationStore = create<EvaluationState>((set, get) => ({
  currentStep: 1,
  receiverId: null,
  roleId: null,
  scores: {},

  setScore: (field, score) =>
    set((state) => ({
      scores: {
        ...state.scores,
        [field]: score,
      },
    })),

  setCurrentStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 4),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  initEvaluation: (receiverId, roleId) =>
    set({
      receiverId,
      roleId,
      currentStep: 1,
      scores: {},
    }),

  resetEvaluation: () =>
    set({
      currentStep: 1,
      receiverId: null,
      roleId: null,
      scores: {},
    }),
}));
