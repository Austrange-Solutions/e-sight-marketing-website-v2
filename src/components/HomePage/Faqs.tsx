"use client"
import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react"

type FAQ = { q: string; a: React.ReactNode }

const sections: { id: string; title: string; faqs: FAQ[] }[] = [
  {
    id: "general",
    title: "General FAQs",
    faqs: [
      {
        q: "What is Maceazy?",
        a:
          "Maceazy is an inclusive innovation platform by Austrange Solutions, dedicated to creating smart assistive products that empower differently-abled individuals. Our flagship product, E-Kaathi, is a smart mobility device designed to enhance independence and safety for the visually impaired.",
      },
      {
        q: "Maceazy is for?",
        a:
          "Maceazy is open to everyone — individuals who wish to buy our assistive products, organizations looking to collaborate, and donors who want to contribute toward empowering differently-abled individuals.",
      },
      { q: "Where are you based?", a: "We’re based in Mumbai, India, with operations expanding across the country through our partner foundations and NGOs." },
      {
        q: "Is Maceazy a non-profit organization?",
        a:
          "No, Maceazy is a social enterprise. While we sell innovative assistive products, a major part of our work focuses on social impact through donations, partnerships, and accessibility initiatives.",
      },
      { 
        q: "How can I contact the Maceazy team?",
        a: <>You can reach us through the <a href="/contact" className="text-primary underline">Contact page</a>, email at support@maceazy.com, or via our social media channels listed on the website footer.</>,
      },
    ],
  },
  {
    id: "product",
    title: "Product FAQs",
    faqs: [
      { q: "What is E-Kaathi?", a: "E-Kaathi is a smart mobility device for visually impaired individuals. It uses sensors, buzzers, and smart feedback mechanisms to detect obstacles and assist in safe navigation." },
      { q: "Is E-Kaathi available for purchase?", a: (
          <>
            Yes. You can buy E-Kaathi directly from our <a href="/products" className="text-primary underline">Shop page</a> on the website. We deliver across India.
          </>
        ) },
      { q: "How does E-Kaathi work?", a: "E-Kaathi uses ultrasonic sensors to detect obstacles and provides vibration or buzzer feedback to alert the user. It’s designed to work both indoors and outdoors." },
      { q: "Is there a warranty on E-Kaathi?", a: "Yes, each device comes with a 12-month warranty covering manufacturing defects." },
      { q: "Can I return or replace my E-Kaathi device?", a: "Returns and replacements are accepted within 7 days of delivery in case of a manufacturing defect or damage during transit. Please refer to our Return Policy page for details." },
      { q: "Is there customer support for setup or assistance?", a: "Absolutely. Our support team can guide you via phone or video call to ensure you set up and use your device correctly." },
    ],
  },
  {
    id: "donation",
    title: "Donation & Sponsorship FAQs",
    faqs: [
      { q: "How does the donation process work?", a: (
          <>
            You can visit our Donate page and choose to either:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Donate a full or partial amount for an E-Kaathi unit, which will be gifted to a registered blind individual.</li>
              <li>Donate directly through our payment gateway, or via a partner foundation listed on the website.</li>
            </ul>
          </>
        ) },
      { q: "How do I know my donation is genuine and reaches the right person?", a: "Every donation is tracked and verified. Donors receive confirmation with the recipient’s details and delivery proof once the E-Kaathi is handed over." },
      { q: "Can companies or NGOs partner for bulk donations?", a: "Yes. We collaborate with CSR initiatives, foundations, and organizations for large-scale impact programs. Visit our Collaborate page or contact us directly for partnership proposals." },
      { q: "Is my donation tax-deductible?", a: "Currently, we’re in the process of registering under sections 12A/80G for tax-exempt donations. Once approved, all donors will receive the appropriate receipts for claiming tax benefits." },
    ],
  },
  {
    id: "registration",
    title: "Disabled Individual Registration FAQs",
    faqs: [
      { q: "Who can register on Maceazy?", a: "Any visually impaired individual or differently-abled person can register through our Registration section to become eligible for receiving a donated E-Kaathi." },
      { q: "What documents are required for registration?", a: "You’ll need a valid Disability Certificate and Government ID proof (Aadhaar card or similar) for verification." },
      { q: "How will I be notified if I am selected for a donated product?", a: "Once your application is verified, our team or a partner foundation will contact you via phone or email when a donor sponsors your device." },
      { q: "Do I have to pay anything to receive E-Kaathi as a registered beneficiary?", a: "No. Devices donated through our platform are 100% free for the beneficiaries." },
    ],
  },
  {
    id: "partnership",
    title: "Partnership & Collaboration FAQs",
    faqs: [
      { q: "How can foundations or NGOs collaborate with Maceazy?", a: "We partner with registered NGOs and foundations working for the visually impaired. You can fill out the Collaboration Form or email us your details to initiate a partnership." },
      { q: "Can educational institutions or companies host E-Kaathi demos or workshops?", a: "Yes, we frequently conduct awareness drives, exhibitions, and demo sessions. Contact us to schedule one at your campus or organization." },
    ],
  },
  {
    id: "shipping",
    title: "Shipping & Payment FAQs",
    faqs: [
      { q: "How long does delivery take?", a: "Delivery typically takes 7–10 business days within India, depending on your location." },
      { q: "What payment methods are accepted?", a: "UPI, Debit/Credit cards, Net Banking, and Wallets." },
      { q: "Is international shipping available?", a: "Currently, we only ship within India, but we’re working on enabling international orders soon." },
    ],
  },
  {
    id: "privacy",
    title: "Privacy & Security FAQs",
    faqs: [
      { q: "How is my data protected?", a: "All personal information and donations are handled securely under data protection and privacy laws. We do not share user data with third parties without consent." },
      { q: "Is the payment gateway secure?", a: "Yes. All transactions are encrypted using SSL security and processed through trusted payment partners." },
    ],
  },
  {
    id: "future",
    title: "Future Vision FAQs",
    faqs: [
      { q: "What other products are coming after E-Kaathi?", a: "We’re working on two more assistive products — E-Band (a wearable smart band for the visually impaired) and E-Vision (AI-powered object detection glasses). Stay tuned for updates on our website and social media." },
      { q: "How does Maceazy ensure real social impact?", a: "We actively collaborate with blind foundations, conduct real-world trials with users, and reinvest a portion of our revenue to support accessibility initiatives and device donations." },
    ],
  },
  {
    id: "feedback",
    title: "Feedback & Support FAQs",
    faqs: [
      { q: "How can I give feedback or report an issue?", a: <>Use the <a href="/contact" className="text-primary underline">Contact Us form</a> or email us directly at <a href="mailto:contact.austrange@gmail.com" className="text-primary underline">contact.austrange@gmail.com</a>. We value every suggestion to help improve our products and platform.</> },
    ],
  },
]

const Faqs: React.FC = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mt-2">Answers grouped by topic — click any section to view its FAQs.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sections list */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="!px-4 !py-4">
                <CardTitle className="text-base font-semibold">Sections</CardTitle>
              </CardHeader>
              <CardContent className="!px-4 !py-3 space-y-2">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSection(s.id)
                      setOpenQuestion(null)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                      activeSection === s.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* FAQs list */}
          <div className="md:col-span-3">
            <div className="space-y-4">
              {sections
                .find((s) => s.id === activeSection)!
                .faqs.map((f, idx) => {
                  const qId = `${activeSection}-${idx}`
                  const open = openQuestion === qId
                  return (
                    <Card key={qId} className="!p-0">
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex-1">
                          <button
                            onClick={() => setOpenQuestion(open ? null : qId)}
                            className="w-full text-left text-base font-medium text-foreground"
                            aria-expanded={open}
                            aria-controls={`${qId}-content`}
                          >
                            {f.q}
                          </button>
                        </div>
                        <div className="ml-4">
                          <Button
                            variant={open ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setOpenQuestion(open ? null : qId)}
                            aria-label={open ? "Collapse answer" : "Expand answer"}
                          >
                            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      {open && (
                        <CardContent id={`${qId}-content`} className="!px-4 !py-3 text-sm text-muted-foreground">
                          {f.a}
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Faqs
