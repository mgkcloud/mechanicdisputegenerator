import { Star } from "lucide-react"
import Image from "next/image"

/**
 * Testimonials section component
 */
export default function Testimonials() {
  return (
    <section className="bg-muted py-16">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">What Our Customers Say</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Join thousands of Australians who have successfully resolved their mechanic disputes using our service.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Testimonial 1 */}
          <div className="testimonial-card">
            <div className="mb-4 flex text-warning">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="mb-4 text-muted-foreground">
              "The letter of demand worked perfectly. The mechanic responded within a week and agreed to pay for the
              repairs. The document was professional and clearly outlined my rights."
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 overflow-hidden rounded-full relative">
                <Image 
                  src="https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-20806a1a-adff-48bf-8a59-37897a071aee.png" 
                  alt="Matt T." 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Matt T.</p>
                <p className="text-xs text-muted-foreground">Sydney, NSW</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="testimonial-card">
            <div className="mb-4 flex text-warning">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="mb-4 text-muted-foreground">
              "I was at a loss about what to do when my car was damaged during servicing. This service made it easy to
              create a professional document that got results fast."
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 overflow-hidden rounded-full relative">
                <Image 
                  src="https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-fb527744-40da-481b-b92a-353b2675e9cb.png" 
                  alt="Mia R." 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Mia R.</p>
                <p className="text-xs text-muted-foreground">Melbourne, VIC</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="testimonial-card">
            <div className="mb-4 flex text-warning">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="mb-4 text-muted-foreground">
              "Worth every cent! The mechanic initially refused to take responsibility, but after receiving my
              professionally drafted letter, they quickly changed their tune."
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 overflow-hidden rounded-full relative">
                <Image 
                  src="https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-8691a9e1-3484-4f50-a97f-737fd0acbcb8.png" 
                  alt="Helen L." 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Helen L.</p>
                <p className="text-xs text-muted-foreground">Brisbane, QLD</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
