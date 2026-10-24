import type { Metadata } from "next";
import { A, H2, LegalPage, P, SellerLine, UL } from "../components/LegalPage";
import { legal } from "../legal";
import { site } from "../site";

export const metadata: Metadata = { title: `Privacy Policy | ${site.name}` };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" intro="This policy explains what personal data we collect when you use the Fight IQ website, why, and what your rights are.">
      <H2>1. Who is responsible</H2>
      <P>
        <SellerLine /> We are responsible for your personal data. For any privacy question or request, contact us through our{" "}
        <A href="/contact">contact page</A> or at <A href={`mailto:${site.contactEmail}`}>{site.contactEmail}</A>.
      </P>

      <H2>2. What we collect</H2>
      <UL
        items={[
          "When you order a report: the video you upload, the description of the fighter you give us, the report we create, and your order status.",
          "When you pay: your email address and payment status from Stripe. Stripe handles your card details. We never see or store them.",
          "When you contact us: your email address and your message.",
          "Technical data: like any website, our hosting provider records basic technical information such as your IP address and browser type to keep the site running and secure.",
        ]}
      />

      <H2>3. Why we use it</H2>
      <UL
        items={[
          "To create and deliver your report and handle your order, because it's necessary to carry out our agreement with you.",
          "To answer your messages, based on our legitimate interest in responding to you, or because you asked before buying.",
          "To keep payment and accounting records, because the law requires it.",
          "To keep the website secure and working, based on our legitimate interest.",
        ]}
      />
      <P>We don&apos;t sell your data, use it for advertising, or use your footage to train AI models.</P>

      <H2>4. Other people in your footage</H2>
      <P>
        Videos can show other people, such as a sparring partner or an opponent. We only process them to create the report you asked for, and we
        delete the video quickly (see below). If you appear in footage someone uploaded and you have a concern, contact us.
      </P>

      <H2>5. Who we share it with</H2>
      <P>We use these service providers, who process data on our behalf and only for the purposes above:</P>
      <UL
        items={[
          "Google (Firebase and Google Cloud), to store uploads, orders and messages.",
          "Google (Gemini API), the AI service that analyses your video. We use Google's paid service, under which Google doesn't use your content to train its models.",
          "Stripe, to process payments.",
          "Vercel, to host the website.",
          "Resend, to deliver contact form messages to our inbox.",
        ]}
      />
      <P>
        Some of these providers store or process data in the United States. When data leaves the European Economic Area, it&apos;s protected by
        the EU-US Data Privacy Framework or by the European Commission&apos;s Standard Contractual Clauses.
      </P>

      <H2>6. How long we keep it</H2>
      <UL
        items={[
          "Your video: deleted from our storage as soon as your report is made. The copy sent to Google's AI service is deleted right after the analysis, and any temporary copy expires within 48 hours.",
          "Uploads that aren't paid for: deleted within 24 hours.",
          "Your report and order details: kept so your report link keeps working, until you ask us to delete them.",
          "Payment records: kept for as long as accounting and tax law requires.",
          "Contact messages: kept for as long as we need to answer you and follow up, then deleted.",
        ]}
      />

      <H2>7. Cookies</H2>
      <P>
        We don&apos;t use advertising, analytics or tracking cookies. When you pay, Stripe&apos;s checkout page may use its own cookies to process
        the payment safely and prevent fraud.
      </P>

      <H2>8. Your rights</H2>
      <P>
        You can ask us to access, correct or delete your personal data, to limit how we use it, to object to its use, or to send you a copy in a
        common format. To do this, contact us and we&apos;ll reply within one month. You can also complain to {legal.dataAuthority}, or to the
        data protection authority in the country where you live.
      </P>

      <H2>9. Young people</H2>
      <P>Fight IQ is not meant for children under 13. If you&apos;re under 18, ask a parent or guardian before buying a report.</P>

      <H2>10. Changes</H2>
      <P>If we change this policy, we&apos;ll update the date at the top of this page.</P>
    </LegalPage>
  );
}
