import type { Metadata } from "next";
import { A, H2, LegalPage, P, UL } from "../components/LegalPage";
import { site } from "../site";

export const metadata: Metadata = { title: `Refund Policy | ${site.name}` };

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro="Every report is made specifically from your footage, so the analysis starts as soon as you pay. Here's when you can get your money back."
    >
      <H2>Starting your analysis</H2>
      <P>
        Before you pay, you ask us to start the analysis straight away, and you agree that you lose your 14-day right of withdrawal once it has
        started. This is how digital content made for you works under EU consumer law, and it&apos;s explained in our{" "}
        <A href="/terms">Terms of Service</A>.
      </P>

      <H2>When you get a full refund</H2>
      <UL
        items={[
          "The analysis fails and we can't deliver your report.",
          "You were charged more than once for the same order.",
          "The report is clearly unusable because of a fault on our side, for example it's empty or about the wrong video.",
        ]}
      />
      <P>
        If your analysis fails, the order page tells you, and you can contact us straight from there. We&apos;ll either run it again or refund you,
        whichever you prefer.
      </P>

      <H2>When we can&apos;t refund</H2>
      <UL
        items={[
          "You changed your mind after the analysis started.",
          "The footage was too dark, too far away, too short or too unclear for a good analysis.",
          "The description you gave pointed to the wrong fighter.",
          "You disagree with the AI's assessment. Reports are a training aid, not an exact science.",
        ]}
      />
      <P>
        If you&apos;re unhappy for another reason, tell us anyway. We look at every request individually, and this policy doesn&apos;t affect your
        legal rights as a consumer.
      </P>

      <H2>How to ask for a refund</H2>
      <P>
        Contact us through our <A href="/contact">contact page</A> or at <A href={`mailto:${site.contactEmail}`}>{site.contactEmail}</A>{" "}
        within 14 days of your purchase, with your order link. Approved refunds go back to your original payment method, usually within 5 to 10
        working days.
      </P>
    </LegalPage>
  );
}
