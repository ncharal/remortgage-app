// app/contact/page.tsx
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Contact Us</h1>
      <p>Have a question, found a bug, or want to suggest a feature? Send us a message below.</p>
      <ContactForm />
    </main>
  );
}
