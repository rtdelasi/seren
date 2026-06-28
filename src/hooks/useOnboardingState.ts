"use client";

import { useReducer } from "react";

export interface OnboardingState {
  currentStep: number;
  formData: {
    goals: string[];
    concerns: string;
    preferredGender: string | null;
    language: string;
    availability: string[];
    shortlist: any[];
  };
}

export type OnboardingAction =
  | { type: "SET_GOALS"; payload: string[] }
  | { type: "SET_CONCERNS"; payload: string }
  | { type: "SET_PREFERENCES"; payload: { preferredGender: string | null; language: string } }
  | { type: "SET_AVAILABILITY"; payload: string[] }
  | { type: "SET_SHORTLIST"; payload: any[] }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "RESET" };

const initialState: OnboardingState = {
  currentStep: 1,
  formData: {
    goals: [],
    concerns: "",
    preferredGender: null,
    language: "English",
    availability: [],
    shortlist: [],
  },
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "SET_GOALS":
      return {
        ...state,
        formData: { ...state.formData, goals: action.payload },
      };
    case "SET_CONCERNS":
      return {
        ...state,
        formData: { ...state.formData, concerns: action.payload },
      };
    case "SET_PREFERENCES":
      return {
        ...state,
        formData: {
          ...state.formData,
          preferredGender: action.payload.preferredGender,
          language: action.payload.language,
        },
      };
    case "SET_AVAILABILITY":
      return {
        ...state,
        formData: { ...state.formData, availability: action.payload },
      };
    case "SET_SHORTLIST":
      return {
        ...state,
        formData: { ...state.formData, shortlist: action.payload },
      };
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 5),
      };
    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

/**
 * State machine hook managing multi-step client onboarding wizard values.
 */
export function useOnboardingState() {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  const setGoals = (goals: string[]) => dispatch({ type: "SET_GOALS", payload: goals });
  const setConcerns = (concerns: string) => dispatch({ type: "SET_CONCERNS", payload: concerns });
  const setPreferences = (preferredGender: string | null, language: string) =>
    dispatch({ type: "SET_PREFERENCES", payload: { preferredGender, language } });
  const setAvailability = (availability: string[]) => dispatch({ type: "SET_AVAILABILITY", payload: availability });
  const setShortlist = (shortlist: any[]) => dispatch({ type: "SET_SHORTLIST", payload: shortlist });
  const nextStep = () => dispatch({ type: "NEXT_STEP" });
  const prevStep = () => dispatch({ type: "PREV_STEP" });
  const reset = () => dispatch({ type: "RESET" });

  return {
    state,
    setGoals,
    setConcerns,
    setPreferences,
    setAvailability,
    setShortlist,
    nextStep,
    prevStep,
    reset,
  };
}
