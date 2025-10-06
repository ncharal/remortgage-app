// app/privacy/page.tsx
import OpenCookieSettingsButton from "@/components/OpenCookieSettingsButton";

export const metadata = {
  title: "Privacy Policy | Remortgage App",
  description:
    "Privacy policy for Remortgage App, including information about cookies, Google AdSense, consent, and contact details.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p><strong>Last updated:</strong> October 2025</p>

      <p>
        This Privacy Policy explains how <strong>Remortgage App</strong> (“we”, “us”, “our”)
        handles information when you use <strong>yourdomain.com</strong>.
      </p>

      <section>
        <h2 className="text-xl font-semibold mt-6">1) Data we collect</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Contact form data:</strong> Email address and message content you submit via our contact form (processed by Formspree).</li>
          <li><strong>Usage data:</strong> Basic technical details your browser provides (e.g., device, pages viewed, timestamps).</li>
          <li><strong>Cookies:</strong> Used for site functionality and advertising (see “Cookies & Ads”).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">2) How we use your data</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>To respond to enquiries you send us.</li>
          <li>To display and measure advertising using Google AdSense.</li>
          <li>To maintain and improve site performance and reliability.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">3) Cookies & Ads (Google AdSense)</h2>
        <p className="mb-2">
          We use Google AdSense to display ads. Google may use cookies and similar technologies to
          deliver personalised or non-personalised ads and to measure ad performance. In the UK/EEA,
          we run a cookie banner using Google Consent Mode v2. Ads that require consent will only
          run after you choose to allow them.
        </p>
        <p>
          You can change your choice at any time via{" "}
          <OpenCookieSettingsButton />
          {" "}in the footer.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">4) Legal bases (GDPR)</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Consent:</strong> for cookies/ads requiring consent.</li>
          <li><strong>Legitimate interests:</strong> site security and basic usage measurement.</li>
          <li><strong>Contract/Pre-contract:</strong> when you contact us and expect a reply.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">5) Data retention</h2>
        <p>
          We keep personal data only as long as needed for the purposes described above, then delete
          or anonymise it.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">6) Sharing</h2>
        <p>
          We share data with service providers to operate the site (e.g., hosting via Vercel,
          contact processing via Formspree, advertising via Google). They process data on our behalf
          under appropriate safeguards.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">7) Your rights</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Access, correct, or delete your personal data.</li>
          <li>Withdraw consent at any time (for consent-based processing).</li>
          <li>Object to or restrict certain processing.</li>
          <li>Complain to the ICO (UK) or your local authority.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">8) Your choices</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Manage cookie/ads consent via the <em>Cookie settings</em> link in the footer.</li>
          <li>Use your browser’s controls to block cookies (note: some features may not work fully).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">9) Children</h2>
        <p>This site is not directed to children under 13 and we do not knowingly collect their data.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">10) Changes</h2>
        <p>
          We may update this policy occasionally. We’ll change the “Last updated” date above and
          post the new version here.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">11) Contact</h2>
        <p>
          For privacy enquiries, email{" "}
          <a className="underline" href="mailto:your@email.com">
            your@email.com
          </a>.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Controller: <strong>Remortgage App</strong>, YOUR ADDRESS (if applicable).
        </p>
      </section>
    </main>
  );
}
