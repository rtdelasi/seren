import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StepWizard from "@/components/onboarding/StepWizard";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/journal");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-teal-400 uppercase bg-teal-950/30 border border-teal-900/50 rounded-full px-4.5 py-1">
            Care Intake
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Let's Set Up Your Care
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Take a few moments to outline your clinical goals, symptoms, and schedules so we can pair you with optimal therapists.
          </p>
        </div>

        {/* Step Wizard Form Container */}
        <StepWizard />

      </div>
    </div>
  );
}
