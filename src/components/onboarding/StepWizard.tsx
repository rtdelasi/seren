"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import GoalsStep from "./steps/GoalsStep";
import ConcernsStep from "./steps/ConcernsStep";
import PreferencesStep from "./steps/PreferencesStep";
import AvailabilityStep from "./steps/AvailabilityStep";
import ShortlistStep from "./steps/ShortlistStep";

export default function StepWizard() {
  const router = useRouter();
  const {
    state,
    setGoals,
    setConcerns,
    setPreferences,
    setAvailability,
    nextStep,
    prevStep,
  } = useOnboardingState();

  const handleFinish = () => {
    // Redirect to the main client dashboard once intake answers are finalized
    router.push("/dashboard");
  };

  const getProgressPercentage = (step: number) => {
    switch (step) {
      case 1:
        return 20;
      case 2:
        return 40;
      case 3:
        return 60;
      case 4:
        return 80;
      case 5:
        return 100;
      default:
        return 0;
    }
  };

  const percent = getProgressPercentage(state.currentStep);

  return (
    <div className="space-y-8">
      {/* Progress header */}
      <div className="space-y-2 select-none">
        <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          <span>Step {state.currentStep} of 5</span>
          <span>{percent}% Complete</span>
        </div>
        {/* Progress bar line */}
        <div className="w-full bg-zinc-900 border border-zinc-900/40 h-2 rounded-full overflow-hidden">
          <div
            className="bg-teal-500 h-full transition-all duration-350 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Steps Switcher workspace */}
      <div className="bg-zinc-950/20 border border-zinc-900/60 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        {state.currentStep === 1 && (
          <GoalsStep
            selectedGoals={state.formData.goals}
            onChange={setGoals}
            onNext={nextStep}
          />
        )}

        {state.currentStep === 2 && (
          <ConcernsStep
            concerns={state.formData.concerns}
            onChange={setConcerns}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.currentStep === 3 && (
          <PreferencesStep
            preferredGender={state.formData.preferredGender}
            language={state.formData.language}
            onGenderChange={(g) => setPreferences(g, state.formData.language)}
            onLanguageChange={(l) => setPreferences(state.formData.preferredGender, l)}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.currentStep === 4 && (
          <AvailabilityStep
            selectedTimes={state.formData.availability}
            onChange={setAvailability}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.currentStep === 5 && (
          <ShortlistStep
            formData={state.formData}
            onFinish={handleFinish}
            onBack={prevStep}
          />
        )}
      </div>
    </div>
  );
}
