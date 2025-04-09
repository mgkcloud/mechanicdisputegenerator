"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

/**
 * Call to Action section component
 * @param {Object} props - Component props
 * @param {Function} props.startClaim - Function to start a new claim
 */
export default function CTASection({ startClaim }) {
  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Resolve Your Mechanic Dispute?</h2>
          <p className="mb-8 text-lg opacity-90">
            Our professional document generator makes it easy to stand up for your rights and get the resolution you
            deserve.
          </p>
          <Button size="lg" variant="secondary" onClick={startClaim}>
            Start Your Claim Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
