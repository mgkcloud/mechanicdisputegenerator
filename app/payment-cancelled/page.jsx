import Link from "next/link"
import BackButton from "@/components/form/back-button"

export const metadata = {
  title: "Payment Cancelled | Australian Mechanic Dispute Resolution",
  description: "Your payment has been cancelled.",
}

/**
 * Page shown when payment is cancelled
 */
export default async function PaymentCancelledPage() {
  return (
    <>
      <header className="bg-[#0D2750] text-white py-10 px-4 text-center shadow-lg">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Australian Mechanic Dispute Resolution</h1>
          <p className="text-xl">Payment Cancelled</p>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl py-16 px-4">
        <div className="card max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 text-[#0D2750]">Payment Process Cancelled</h2>

          <div className="alert alert-warning mb-8">
            <p>Your payment was cancelled. Your document has not been processed and you have not been charged.</p>
          </div>

          <p className="mb-8">
            You can return to the document generator to try again or contact our support team if you need assistance.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <BackButton className="btn">
              Return to Form
            </BackButton>
            <Link href="mailto:support@australianmechanicdispute.com" className="btn-secondary">
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[#0D2750] text-white py-10 px-4 text-center mt-16 shadow-inner">
        <div className="container mx-auto max-w-7xl">
          <p className="mb-2">
            &copy; {new Date().getFullYear()} Australian Mechanic Dispute Resolution. All rights reserved.
          </p>
          <p>This service provides legal document templates and is not a substitute for professional legal advice.</p>
        </div>
      </footer>
    </>
  )
}
