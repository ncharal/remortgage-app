"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function ContactForm() {
  useEffect(() => {
    // reCAPTCHA v3 callback
    // @ts-ignore
    window.onRecaptchaSubmit = () => {
      const form = document.getElementById("contact-form") as HTMLFormElement | null;
      form?.submit();
    };
  }, []);

  return (
    <>
      {/* Load Google reCAPTCHA v3 */}
      <Script src="https://www.google.com/recaptcha/api.js" async defer />

      <form
        id="contact-form"
        action="https://formspree.io/f/YOUR_FORM_ID"
        method="POST"
        className="space-y-4 max-w-xl"
      >
        <div>
          <label className="block text-sm mb-1" htmlFor="email">
            Your email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border rounded-md p-2"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            className="w-full border rounded-md p-2"
            placeholder="Enter your message here..."
          />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" required />
          <span>
            I agree to the <a href="/privacy" className="underline">Privacy Policy</a> and allow you
            to use my details to respond to my enquiry.
          </span>
        </label>

        <button
          type="button"
          className="g-recaptcha px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          data-sitekey="YOUR_RECAPTCHA_SITE_KEY"
          data-callback="onRecaptchaSubmit"
          data-action="submit"
        >
          Send message
        </button>
      </form>

      <p className="text-sm text-muted-foreground">
        By submitting this form, you agree we can use the details you provide to respond to your enquiry.
      </p>
    </>
  );
}
