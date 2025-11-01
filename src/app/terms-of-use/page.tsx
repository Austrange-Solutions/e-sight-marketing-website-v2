import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use & Refund and Cancellation Policy - Maceazy",
  description: "Complete terms of use and refund policy for Maceazy customers.",
};

export default function TermsOfUse() {
  return (
    <div className="pt-20 pb-16 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-bold mb-2">Terms of Use & Refund and Cancellation Policy</h1>
        <p className="text-sm text-muted-foreground mb-8"><strong>Last Updated:</strong> October 24, 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Maceazy, operated by Austrange Solutions Private Limited. By accessing or using our website, mobile application, or any related services (collectively, the "Platform"), you agree to be bound by these Terms of Use and our Refund and Cancellation Policy. Please read these terms carefully before using our services.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              By accessing, browsing, or using the Maceazy Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use, our Privacy Policy, and any additional terms and conditions that may apply to specific sections of the Platform or to products and services available through the Platform. If you do not agree to these terms, please do not use our Platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              These terms constitute a legally binding agreement between you (the "User" or "you") and Austrange Solutions Private Limited (the "Company," "we," "us," or "our"). We reserve the right to modify, amend, or update these terms at any time without prior notice. Your continued use of the Platform after such changes constitutes your acceptance of the modified terms.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-3">2. Eligibility and User Account</h2>
            
            <h3 className="text-xl font-semibold mb-2">2.1 Age Requirements</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You must be at least 18 years of age to use our Platform and place orders. By using the Platform, you represent and warrant that you are of legal age to form a binding contract with the Company. If you are under 18 years of age, you may use the Platform only with the involvement and consent of a parent or legal guardian.
            </p>

            <h3 className="text-xl font-semibold mb-2">2.2 Account Registration</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To access certain features of the Platform, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h3 className="text-xl font-semibold mb-2">2.3 Account Security</h3>
            <p className="text-muted-foreground leading-relaxed">
              You agree to immediately notify us of any unauthorized use of your account or any other breach of security. We will not be liable for any loss or damage arising from your failure to comply with these security obligations. You may not use another user's account without permission.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-3">3. Use of the Platform</h2>
            
            <h3 className="text-xl font-semibold mb-2">3.1 Permitted Use</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree to use the Platform only for lawful purposes and in accordance with these Terms of Use. You agree not to use the Platform in any way that violates any applicable federal, state, local, or international law or regulation, or for any fraudulent or malicious purpose.
            </p>

            <h3 className="text-xl font-semibold mb-2">3.2 Prohibited Activities</h3>
            <p className="text-muted-foreground mb-2">You may not:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Use the Platform in any manner that could disable, overburden, damage, or impair the Platform or interfere with any other party's use of the Platform</li>
              <li>Use any robot, spider, or other automatic device, process, or means to access the Platform for any purpose</li>
              <li>Use any manual process to monitor or copy any of the material on the Platform or for any other unauthorized purpose</li>
              <li>Introduce any viruses, trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful</li>
              <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Platform, the server on which the Platform is stored, or any server, computer, or database connected to the Platform</li>
              <li>Attack the Platform via a denial-of-service attack or a distributed denial-of-service attack</li>
              <li>Take any action that may damage or falsify the Company's rating or reputation</li>
              <li>Otherwise attempt to interfere with the proper working of the Platform</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.3 Content Standards</h3>
            <p className="text-muted-foreground leading-relaxed">
              You are prohibited from posting or transmitting any unlawful, threatening, defamatory, obscene, pornographic, or profane material or any material that could constitute or encourage conduct that would be considered a criminal offense or give rise to civil liability, or otherwise violate any law.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-3">4. Product Information and Availability</h2>
            
            <h3 className="text-xl font-semibold mb-2">4.1 Product Descriptions</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We strive to provide accurate product descriptions, images, and pricing information. However, we do not warrant that product descriptions, images, pricing, or other content on the Platform is accurate, complete, reliable, current, or error-free. If a product offered by us is not as described, your sole remedy is to return it in accordance with our Refund Policy.
            </p>

            <h3 className="text-xl font-semibold mb-2">4.2 Pricing</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise stated. We reserve the right to change prices for products displayed on the Platform at any time without prior notice. The price charged for a product will be the price in effect at the time the order is placed, subject to our acceptance of the order.
            </p>

            <h3 className="text-xl font-semibold mb-2">4.3 Product Availability</h3>
            <p className="text-muted-foreground leading-relaxed">
              We make every effort to ensure that products shown on the Platform are available. However, we cannot guarantee that all products will be in stock at all times. We reserve the right to limit the quantity of items purchased per person, household, or order. We may, in our sole discretion, refuse or cancel orders that appear to be placed by dealers, resellers, or distributors.
            </p>
          </section>

          {/* Sections 5-20 continue in similar format... Due to length, showing pattern */}
          
          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-3">5. Orders and Payments</h2>
            
            <h3 className="text-xl font-semibold mb-2">5.1 Order Placement</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you place an order through the Platform, you are making an offer to purchase the products in your order. All orders are subject to acceptance by us. We may, at our sole discretion, refuse or cancel any order for any reason, including but not limited to product availability, errors in product or pricing information, or suspected fraudulent or unauthorized transactions.
            </p>

            <h3 className="text-xl font-semibold mb-2">5.2 Order Confirmation</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              After placing an order, you will receive an email acknowledgment confirming receipt of your order. This acknowledgment does not constitute acceptance of your order. Your order will be deemed accepted only when we send you a confirmation email indicating that the product has been dispatched.
            </p>

            <h3 className="text-xl font-semibold mb-2">5.3 Payment Methods</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We accept various payment methods including credit cards, debit cards, net banking, UPI, and digital wallets through our authorized payment gateway providers. Payment must be received by us prior to our acceptance of an order. All payment transactions are processed through secure payment gateways that comply with applicable security standards.
            </p>

            <h3 className="text-xl font-semibold mb-2">5.4 Payment Security</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement industry-standard security measures to protect your payment information. However, you acknowledge that no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security of your payment information.
            </p>

            <h3 className="text-xl font-semibold mb-2">5.5 Pricing Errors</h3>
            <p className="text-muted-foreground leading-relaxed">
              In the event of a pricing error, we reserve the right to cancel the order and provide you with a full refund. We will notify you if such cancellation is necessary.
            </p>
          </section>

          {/* Continue with remaining sections... */}
          
          <section>
            <h2 className="text-2xl font-bold mb-3">6. Shipping and Delivery</h2>
            
            <h3 className="text-xl font-semibold mb-2">6.1 Shipping Policy</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We will arrange for shipment of the products to you. Please check the individual product pages for specific delivery options and estimated delivery times. Delivery times are estimates and are not guaranteed. We are not liable for any delays in shipment or delivery.
            </p>

            <h3 className="text-xl font-semibold mb-2">6.2 Shipping Charges</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Shipping charges, if applicable, will be displayed during checkout before you complete your order. Shipping charges are non-refundable except in cases where we have made an error or shipped a defective product.
            </p>

            <h3 className="text-xl font-semibold mb-2">6.3 Delivery Verification</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              At the time of delivery, please verify that the package is intact and undamaged. If you notice any damage to the package, please refuse delivery or note the damage on the delivery receipt before accepting the package.
            </p>

            <h3 className="text-xl font-semibold mb-2">6.4 Risk of Loss</h3>
            <p className="text-muted-foreground leading-relaxed">
              The risk of loss and title for products purchased from us pass to you upon delivery to the carrier.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">7. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold mb-2">7.1 Ownership</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All content on the Platform, including but not limited to text, graphics, logos, images, audio clips, digital downloads, data compilations, software, and the compilation thereof (collectively, the "Content"), is the property of Austrange Solutions Private Limited, its affiliates, or its content suppliers and is protected by Indian and international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold mb-2">7.2 Limited License</h3>
            <p className="text-muted-foreground mb-2">
              Subject to your compliance with these Terms of Use, we grant you a limited, non-exclusive, non-transferable, non-sublicensable license to access and use the Platform and Content for your personal, non-commercial use only. This license does not include any right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
              <li>Modify or copy the Content</li>
              <li>Use the Content for any commercial purpose or for any public display</li>
              <li>Remove any copyright or other proprietary notations from the Content</li>
              <li>Transfer the Content to another person or "mirror" the Content on any other server</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">7.3 Trademarks</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Company name, the Company logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Austrange Solutions Private Limited or its affiliates or licensors. You must not use such marks without our prior written permission.
            </p>

            <h3 className="text-xl font-semibold mb-2">7.4 User-Generated Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you submit any content to the Platform, including reviews, comments, or feedback, you grant us a worldwide, perpetual, irrevocable, royalty-free, sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content in any media.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">8. Privacy and Data Protection</h2>
            
            <h3 className="text-xl font-semibold mb-2">8.1 Privacy Policy</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms of Use by reference. Please review our Privacy Policy to understand our practices regarding the collection, use, and disclosure of your personal information.
            </p>

            <h3 className="text-xl font-semibold mb-2">8.2 Data Security</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, you acknowledge that no security measures are perfect or impenetrable, and we cannot guarantee the security of your information.
            </p>

            <h3 className="text-xl font-semibold mb-2">8.3 Consent to Data Processing</h3>
            <p className="text-muted-foreground leading-relaxed">
              By using the Platform, you consent to the collection, use, and processing of your personal information as described in our Privacy Policy and as required to provide our services to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">9. User Reviews and Feedback</h2>
            
            <h3 className="text-xl font-semibold mb-2">9.1 Review Submission</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Users may submit reviews and ratings for products purchased through the Platform. By submitting a review, you grant us the right to use, reproduce, and publish your review in connection with our business.
            </p>

            <h3 className="text-xl font-semibold mb-2">9.2 Review Guidelines</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Reviews must be honest, accurate, and based on your personal experience with the product. Reviews must not contain offensive, defamatory, or illegal content. We reserve the right to remove any review that violates these guidelines.
            </p>

            <h3 className="text-xl font-semibold mb-2">9.3 No Obligation to Monitor</h3>
            <p className="text-muted-foreground leading-relaxed">
              We are under no obligation to monitor or review user-generated content but reserve the right to do so at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">10. Limitation of Liability</h2>
            
            <h3 className="text-xl font-semibold mb-2">10.1 Disclaimer of Warranties</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Platform and all content, products, and services provided through the Platform are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. To the fullest extent permitted by applicable law, we disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>

            <h3 className="text-xl font-semibold mb-2">10.2 Limitation of Damages</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To the fullest extent permitted by applicable law, in no event shall Austrange Solutions Private Limited, its affiliates, directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Platform.
            </p>

            <h3 className="text-xl font-semibold mb-2">10.3 Cap on Liability</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our total liability to you for any claims arising out of or related to these Terms of Use or your use of the Platform shall not exceed the amount you paid to us for the product or service that is the subject of the claim, or INR 1,000, whichever is less.
            </p>

            <h3 className="text-xl font-semibold mb-2">10.4 Exceptions</h3>
            <p className="text-muted-foreground leading-relaxed">
              Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities, so some of the above limitations may not apply to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">11. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to defend, indemnify, and hold harmless Austrange Solutions Private Limited, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms of Use or your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">12. Dispute Resolution and Governing Law</h2>
            
            <h3 className="text-xl font-semibold mb-2">12.1 Governing Law</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These Terms of Use and any dispute or claim arising out of or in connection with them or their subject matter shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold mb-2">12.2 Jurisdiction</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Any legal action or proceeding arising out of or relating to these Terms of Use shall be instituted exclusively in the courts located in Mumbai, Maharashtra, India, and you irrevocably submit to the jurisdiction of such courts.
            </p>

            <h3 className="text-xl font-semibold mb-2">12.3 Dispute Resolution</h3>
            <p className="text-muted-foreground leading-relaxed">
              In the event of any dispute arising out of or in connection with these Terms of Use, the parties shall first attempt to resolve the dispute through good faith negotiations. If the dispute cannot be resolved through negotiation within 30 days, either party may initiate formal legal proceedings.
            </p>
          </section>

          <section className="border-t-2 pt-8">
            <h2 className="text-3xl font-bold mb-4">13. Refund and Cancellation Policy</h2>
            
            <h3 className="text-2xl font-semibold mb-3">13.1 Order Cancellation</h3>
            
            <h4 className="text-lg font-semibold mb-2">13.1.1 Cancellation by User</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You may cancel your order within 24 hours of placing it, provided that the order has not been shipped. To cancel an order, please contact our customer support team at austrange.india@gmail.com with your order number and reason for cancellation. Once we receive your cancellation request, we will process it within 24-48 hours and send you a confirmation email.
            </p>

            <h4 className="text-lg font-semibold mb-2">13.1.2 Cancellation by Company</h4>
            <p className="text-muted-foreground mb-2">
              We reserve the right to cancel any order at our sole discretion for reasons including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-3">
              <li>Product unavailability</li>
              <li>Pricing or product description errors</li>
              <li>Suspected fraudulent transactions</li>
              <li>Inability to verify customer information</li>
              <li>Force majeure events</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If we cancel your order, we will notify you promptly and process a full refund to your original payment method within 5-7 working days.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-6">13.2 Refund Eligibility</h3>
            
            <h4 className="text-lg font-semibold mb-2">13.2.1 Defective or Damaged Products</h4>
            <p className="text-muted-foreground mb-2">
              We stand behind the quality of our products. If you receive a product that is defective, damaged, or not as described, you are eligible for a full refund or replacement. To request a refund for a defective or damaged product, you must:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
              <li>Contact us within 7 days of receiving the product</li>
              <li>Provide photographic evidence of the defect or damage</li>
              <li>Return the product in its original packaging with all accessories and documentation</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2">13.2.2 Wrong Product Delivered</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you receive a product that is different from what you ordered, you are eligible for a full refund or replacement. Please contact us within 7 days of receiving the product to initiate the return process.
            </p>

            <h4 className="text-lg font-semibold mb-2">13.2.3 Change of Mind</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Refunds for change of mind or buyer's remorse are considered on a case-by-case basis. Such requests must be made within 7 days of receiving the product, and the product must be unused, in its original packaging, and in resalable condition. A restocking fee of 15% may apply.
            </p>

            <h4 className="text-lg font-semibold mb-2">13.2.4 Non-Refundable Items</h4>
            <p className="text-muted-foreground mb-2">Certain products are non-refundable, including but not limited to:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
              <li>Products that have been used beyond reasonable inspection</li>
              <li>Products without original packaging, tags, or accessories</li>
              <li>Customized or personalized products</li>
              <li>Perishable goods</li>
              <li>Digital products or downloadable software</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-3 mt-6">13.3 Return Process</h3>
            
            <h4 className="text-lg font-semibold mb-2">13.3.1 Return Authorization</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Before returning any product, you must obtain a Return Authorization (RA) number from our customer support team. Returns without an RA number will not be accepted.
            </p>

            <h4 className="text-lg font-semibold mb-2">13.3.2 Return Shipping</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For defective or damaged products, we will provide a prepaid return shipping label. For returns due to change of mind, the customer is responsible for return shipping costs. We recommend using a trackable shipping method, as we are not responsible for returns that are lost in transit.
            </p>

            <h4 className="text-lg font-semibold mb-2">13.3.3 Return Inspection</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Upon receiving your returned product, we will inspect it to verify that it meets our return eligibility criteria. This inspection process typically takes 3-5 working days.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-6">13.4 Refund Process and Timeline</h3>
            
            <h4 className="text-lg font-semibold mb-2">13.4.1 Refund Approval</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Once your return is received and inspected, we will send you an email notification regarding the approval or rejection of your refund. If approved, your refund will be processed within 5-7 working days.
            </p>

            <h4 className="text-lg font-semibold mb-2">13.4.2 Refund Method</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Refunds will be issued to the original payment method used for the purchase. If the original payment method is no longer available, we may issue the refund via bank transfer or store credit at our discretion.
            </p>

            <h4 className="text-lg font-semibold mb-2">13.4.3 Refund Timeline</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The time it takes for the refund to appear in your account depends on your payment provider. Credit card refunds typically take 5-10 working days, while bank transfers may take up to 14 working days. UPI and digital wallet refunds are usually processed within 3-5 working days.
            </p>

            <h4 className="text-lg font-semibold mb-2">13.4.4 Partial Refunds</h4>
            <p className="text-muted-foreground mb-2">In certain situations, only partial refunds may be granted, such as:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
              <li>Products with obvious signs of use beyond reasonable inspection</li>
              <li>Products returned more than 30 days after delivery</li>
              <li>Products missing parts or accessories not due to our error</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-3 mt-6">13.5 Exchanges</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you wish to exchange a product for a different size, color, or variant, please contact our customer support team. Exchanges are subject to product availability and must meet the same eligibility criteria as returns. We will process the exchange once we receive and inspect the returned product.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-6">13.6 Late or Missing Refunds</h3>
            <p className="text-muted-foreground mb-2">If you have not received your refund within the expected timeframe:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-3">
              <li>Check your bank account or credit card statement again</li>
              <li>Contact your credit card company or bank, as it may take some time for the refund to be officially posted</li>
              <li>If you have done all of this and still have not received your refund, please contact us at austrange.india@gmail.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">14. Customer Support</h2>
            
            <h3 className="text-xl font-semibold mb-2">14.1 Contact Information</h3>
            <p className="text-muted-foreground mb-2">
              For any questions, concerns, or issues regarding your order, our products, or these Terms of Use, please contact our customer support team:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
              <li>Email: austrange.india@gmail.com</li>
              <li>Business Hours: Monday to Saturday, 10:00 AM to 6:00 PM IST</li>
              <li>Response Time: We aim to respond to all inquiries within 24-48 hours</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">14.2 Complaint Resolution</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you have a complaint about our products or services, please contact us with details of your concern. We take all complaints seriously and will work to resolve them promptly and fairly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">15. Force Majeure</h2>
            <p className="text-muted-foreground leading-relaxed">
              We shall not be liable for any failure or delay in performance of our obligations under these Terms of Use arising out of any cause beyond our reasonable control, including but not limited to acts of God, war, riot, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">16. Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms of Use is held to be invalid, illegal, or unenforceable, the validity, legality, and enforceability of the remaining provisions shall not be affected or impaired.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">17. Waiver</h2>
            <p className="text-muted-foreground leading-relaxed">
              No waiver by us of any term or condition set forth in these Terms of Use shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure by us to assert a right or provision under these Terms of Use shall not constitute a waiver of such right or provision.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">18. Entire Agreement</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Use, together with our Privacy Policy and any other legal notices or agreements published by us on the Platform, constitute the entire agreement between you and Austrange Solutions Private Limited regarding your use of the Platform and supersede all prior agreements and understandings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">19. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms of Use at any time. We will notify you of material changes by posting the updated terms on the Platform and updating the "Last Updated" date at the top of this page. Your continued use of the Platform after such modifications constitutes your acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">20. Contact Information</h2>
            <p className="text-muted-foreground mb-3">
              For legal inquiries, questions about these Terms of Use, or to exercise your rights under these terms, please contact us at:
            </p>
            <div className="bg-accent p-4 rounded-lg">
              <p className="font-semibold mb-1">Austrange Solutions Private Limited</p>
              <p className="text-muted-foreground">Email: austrange.india@gmail.com</p>
            </div>
          </section>

          <div className="border-t-2 pt-6 mt-8 text-center">
            <p className="text-muted-foreground italic">
              By using Maceazy, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and our Refund and Cancellation Policy. Thank you for choosing Maceazy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

