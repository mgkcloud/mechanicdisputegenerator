"use client"

import { CheckCircle } from "lucide-react"

/**
 * Step indicator component for multi-step forms
 * @param {Object} props - Component props
 * @param {Array} props.steps - Array of step objects with id, title, and icon
 * @param {number} props.currentStep - Current active step
 * @param {Function} props.goToStep - Function to navigate to a specific step
 */
export default function StepIndicator({ steps, currentStep, goToStep }) {
  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex flex-1 cursor-pointer items-center justify-center border-b-2 p-4 text-sm font-medium transition-all duration-200 ${
              currentStep === step.id
                ? "border-b-4 border-primary font-semibold text-primary bg-primary/10"
                : currentStep > step.id
                  ? "border-success text-success"
                  : "border-transparent text-muted-foreground"
            }`}
            onClick={() => step.id <= currentStep && goToStep(step.id)}
          >
            <div
              className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep === step.id
                  ? "bg-primary text-white"
                  : currentStep > step.id
                    ? "bg-success text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
            </div>
            <span className="hidden md:inline">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
