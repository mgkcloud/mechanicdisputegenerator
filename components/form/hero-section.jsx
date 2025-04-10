"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Shield, Star } from "lucide-react"
import Link from 'next/link'

/**
 * Hero section component that adapts based on claim status
 * @param {Object} props - Component props
 * @param {boolean} props.claimStarted - Whether a claim has been started
 * @param {Function} props.startClaim - Function to start a new claim
 * @param {Function} props.handleStartOver - Function to reset the form
 * @param {number} props.currentStep - Current step in the form
 * @param {Array} props.steps - Array of step objects
 */
export default function HeroSection({ claimStarted, startClaim, handleStartOver, currentStep, steps }) {
  return (
    <section className={`bg-gradient-hero transition-all duration-300 ${claimStarted ? "py-6" : "py-16 md:py-24"}`}>
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className={`mb-6 font-bold tracking-tight text-gray-900 transition-all duration-300 ${
              claimStarted ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl lg:text-6xl"
            }`}
          >
            {claimStarted ? (
              "Complete Your Mechanic Dispute Claim"
            ) : (
              <>
                Resolve Your Mechanic Dispute <span className="text-primary">Professionally</span>
              </>
            )}
          </h1>

          {!claimStarted && (
            <>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                Generate legally-sound documents to resolve disputes with mechanics in Australia. No legal expertise
                required.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="primary" onClick={startClaim}>
                  Start Your Claim Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline">
                    Learn How It Works
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-primary" />
                  <span>Secure & Confidential</span>
                </div>
                <div className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-primary" />
                  <span>4.9/5 Customer Rating</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                  <span>10,000+ Documents Generated</span>
                </div>
              </div>
            </>
          )}

          {claimStarted && (
            <div className="flex items-center justify-center">
              <Button size="sm" variant="ghost" onClick={handleStartOver} className="mr-4">
                Start Over
              </Button>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}:{" "}
                <span className="font-medium">{steps[currentStep - 1].title}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
