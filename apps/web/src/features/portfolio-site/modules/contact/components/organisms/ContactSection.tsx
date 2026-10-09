import React, { useState, useRef } from "react";
import { Lang } from "../../../../shared/types/i18n";
import {
  useSiteCopy,
  useSiteSettings,
} from "../../../../shared/constants/translations";
import { useContactForm } from "../../hooks/useContactForm";
import { useScrollReveal } from "../../../../shared/hooks/useScrollReveal";
import { SocialIcon } from "../../../../shared/components/atoms/SocialIcon";

interface ContactSectionProps {
  lang: Lang;
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
  type?: string;
  placeholder?: string;
  required?: boolean;
  dir?: string;
}

const FormField: React.FC<FieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required,
  dir,
}) => (
  <div>
    <label
      htmlFor={`contact-${name}`}
      style={{
        display: "block",
        fontSize: "0.72rem",
        color: "#475569",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 6,
      }}
    >
      {label}
    </label>
    <input
      id={`contact-${name}`}
      required={required ?? (name === "name" || name === "email")}
      minLength={name === "name" ? 2 : undefined}
      maxLength={
        name === "name"
          ? 160
          : name === "email"
            ? 320
            : name === "phone"
              ? 40
              : 200
      }
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="form-input"
      autoComplete={
        name === "email" ? "email" : name === "phone" ? "tel" : undefined
      }
      dir={dir}
    />
  </div>
);

export const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  const copy = useSiteCopy(lang);
  const settings = useSiteSettings();
  const { formData, handleChange, resetForm } = useContactForm();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const submissionKey = useRef<string | null>(null);
  useScrollReveal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      submissionKey.current ??= crypto.randomUUID();
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": submissionKey.current,
        },
        body: JSON.stringify({ ...formData, locale: lang, consent: true }),
      });
      if (!response.ok) throw new Error("submission_failed");
      resetForm();
      submissionKey.current = null;
      setSent(true);
    } catch {
      setError(
        lang === "ar"
          ? "تعذر إرسال الرسالة. حاول مرة أخرى."
          : "We could not send your message. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      className="section-surface contact-surface"
      style={{
        padding: "clamp(64px, 8vw, 120px) 24px",
        background: "#fffdfa",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw",
          height: "60vw",
          maxWidth: 600,
          maxHeight: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,149,46,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="section-container contact-container"
        style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}
      >
        <div
          className="reveal section-heading-block"
          style={{ marginBottom: 56 }}
        >
          <div className="section-label" style={{ marginBottom: 16 }}>
            {copy.contact.label}
          </div>
          <div className="gold-line" />
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#0f172a",
            }}
          >
            {copy.contact.heading}
          </h2>
        </div>

        <div
          className="contact-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 64,
          }}
        >
          {/* Info Side */}
          <div className="reveal-left contact-info-panel">
            <div style={{ marginBottom: 36 }}>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "#b8861e",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  fontFamily: "var(--font-display)",
                }}
              >
                {lang === "ar" ? "المقر الرئيسي" : "Headquarters"}
              </div>
              <p
                style={{
                  color: "#475569",
                  lineHeight: 1.8,
                  fontSize: "0.95rem",
                  margin: 0,
                }}
              >
                {copy.contact.address}
              </p>
            </div>

            <div style={{ marginBottom: 36 }}>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "#b8861e",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 14,
                  fontFamily: "var(--font-display)",
                }}
              >
                {copy.contact.contactsHeading}
              </div>
              {settings.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone}`}
                  style={{
                    color: "#0f172a",
                    textDecoration: "none",
                    fontSize: "1rem",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "0.05em",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#d4a84b")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#0f172a")
                  }
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d4a84b"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.55 10.8 19.79 19.79 0 01.48 2.18 2 2 0 012.46 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.36 6.36l1.27-.8a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  {phone}
                </a>
              ))}
            </div>

            <div className="contact-social-links">
              {settings.socialLinks
                .filter((social) => social.url)
                .map((social, index) => {
                  const isExternal = /^https?:\/\//i.test(social.url);
                  return (
                    <a
                      key={`${social.type}-${social.url}-${index}`}
                      href={social.url}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      data-social={social.type}
                    >
                      <SocialIcon type={social.type} />
                      <span>
                        {lang === "ar" ? social.labelAr : social.labelEn}
                      </span>
                    </a>
                  );
                })}
            </div>
          </div>

          {/* Form Side */}
          <div
            className="reveal-right glass-card contact-form-card"
            style={{ padding: "36px 32px", borderRadius: 2 }}
          >
            <h3
              className="font-display"
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 28,
                letterSpacing: "0.02em",
              }}
            >
              {copy.contact.formHeading}
            </h3>

            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
                <div
                  className="font-display"
                  style={{
                    fontSize: "1.2rem",
                    color: "#b8861e",
                    letterSpacing: "0.06em",
                  }}
                >
                  {lang === "ar" ? "تم إرسال رسالتك!" : "Message Sent!"}
                </div>
                <p style={{ color: "#475569", marginTop: 8 }}>
                  {lang === "ar"
                    ? "سنتواصل معك قريباً."
                    : "We'll get back to you shortly."}
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {error && (
                  <p role="alert" style={{ margin: 0, color: "#dc2626" }}>
                    {error}
                  </p>
                )}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <FormField
                    label={copy.contact.fields.name}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={lang === "ar" ? "أدخل اسمك" : "Your full name"}
                  />
                  <FormField
                    label={copy.contact.fields.company}
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={lang === "ar" ? "اسم شركتك" : "Company name"}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.72rem",
                        color: "#475569",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {copy.contact.fields.service}
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="form-input"
                    >
                      {copy.contact.fields.serviceOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.72rem",
                        color: "#475569",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {copy.contact.fields.budget}
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="form-input"
                    >
                      {copy.contact.fields.budgetOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.72rem",
                      color: "#475569",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    {copy.contact.fields.message}
                  </label>
                  <textarea
                    required
                    minLength={10}
                    maxLength={5000}
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={
                      lang === "ar"
                        ? "صف مشروعك ومتطلباتك..."
                        : "Describe your project, timeline, requirements..."
                    }
                    className="form-input"
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <FormField
                    label={copy.contact.fields.email}
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={
                      lang === "ar" ? "name@example.com" : "name@example.com"
                    }
                  />
                  <FormField
                    label={copy.contact.fields.phone}
                    name="phone"
                    type="tel"
                    required={false}
                    dir="ltr"
                    value={formData.phone ?? ""}
                    onChange={handleChange}
                    placeholder={
                      lang === "ar" ? "010 1234 5678" : "+20 10 1234 5678"
                    }
                  />
                </div>
                <label
                  style={{
                    display: "flex",
                    gap: 10,
                    fontSize: "0.85rem",
                    color: "#475569",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input type="checkbox" name="consent" required />
                  {lang === "ar"
                    ? "أوافق على استخدام بياناتي للرد على طلب المشروع."
                    : "I agree to the use of my details to respond to this project inquiry."}
                </label>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={sending}
                  style={{
                    padding: "14px 28px",
                    border: "none",
                    cursor: sending ? "wait" : "pointer",
                    fontSize: "0.85rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    borderRadius: 2,
                    fontFamily: "inherit",
                    position: "relative",
                    zIndex: 1,
                    marginTop: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    opacity: sending ? 0.8 : 1,
                  }}
                >
                  {sending ? (
                    <>
                      <svg
                        className="animate-spin-slow"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          opacity="0.3"
                        />
                        <path d="M21 12a9 9 0 00-9-9" />
                      </svg>
                      <span style={{ position: "relative", zIndex: 1 }}>
                        {lang === "ar" ? "جاري الإرسال..." : "Sending..."}
                      </span>
                    </>
                  ) : (
                    <span style={{ position: "relative", zIndex: 1 }}>
                      {copy.contact.fields.send}
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
