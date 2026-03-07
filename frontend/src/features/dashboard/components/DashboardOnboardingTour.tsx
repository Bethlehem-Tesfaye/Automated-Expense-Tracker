import { useEffect, useMemo, useState } from "react";

export interface OnboardingStep {
  targetId: string;
  title: string;
  description: string;
}

interface DashboardOnboardingTourProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onFinish: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function DashboardOnboardingTour({
  steps,
  isOpen,
  onFinish,
}: DashboardOnboardingTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      setTargetRect(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !currentStep) return;

    const updateRect = () => {
      const element = document.querySelector<HTMLElement>(
        `[data-tour-id="${currentStep.targetId}"]`,
      );

      if (!element) {
        setTargetRect(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen, currentStep]);

  const tooltipStyle = useMemo(() => {
    const cardWidth = 320;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!targetRect) {
      return {
        top: viewportHeight / 2 - 90,
        left: viewportWidth / 2 - cardWidth / 2,
      };
    }

    const defaultTop = targetRect.top + targetRect.height + 12;
    const placeAbove = defaultTop + 180 > viewportHeight;
    const top = placeAbove
      ? targetRect.top - 192
      : targetRect.top + targetRect.height + 12;

    const left = clamp(
      targetRect.left + targetRect.width / 2 - cardWidth / 2,
      12,
      Math.max(12, viewportWidth - cardWidth - 12),
    );

    return { top: Math.max(12, top), left };
  }, [targetRect]);

  if (!isOpen || !currentStep) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-60">
      <div className="absolute inset-0 bg-black/45" />

      {targetRect && (
        <div
          className="absolute rounded-lg border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.15)]"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      <div
        className="pointer-events-auto absolute w-80 rounded-xl border border-[#BDE8F5] bg-white p-4 shadow-xl"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-[#4988C4]">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <h3 className="mt-1 text-sm font-bold text-[#0F2854]">
              {currentStep.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onFinish}
            className="rounded-md px-1.5 py-0.5 text-xs font-bold text-[#0F2854] hover:bg-[#EAF3FF]"
            aria-label="Close onboarding"
          >
            ×
          </button>
        </div>

        <p className="mt-2 text-sm text-[#1C4D8D]">{currentStep.description}</p>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (isLastStep) {
                onFinish();
                return;
              }

              setStepIndex((current) => current + 1);
            }}
            className="text-sm font-semibold text-[#1C4D8D] underline underline-offset-2 hover:text-[#0F2854]"
          >
            {isLastStep ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardOnboardingTour;
