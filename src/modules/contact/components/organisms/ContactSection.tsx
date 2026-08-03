import React, { useState } from 'react';
import { Lang } from '../../../../shared/types/i18n';
import { t } from '../../../../shared/constants/translations';
import { useContactForm } from '../../hooks/useContactForm';
import { useScrollReveal } from '../../../../shared/hooks/useScrollReveal';

interface ContactSectionProps {
  lang: Lang;
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  type?: string;
  placeholder?: string;
}

const FormField: React.FC<FieldProps> = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="form-input"
    />
  </div>
);

export const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  const copy = t[lang];
  const { formData, handleChange } = useContactForm();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  useScrollReveal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1500);
  };

  return (
    <section id="contact" style={{ padding: 'clamp(64px, 8vw, 120px) 24px', background: '#12242B', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '60vw', height: '60vw', maxWidth: 600, maxHeight: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,168,75,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        <div className="reveal" style={{ marginBottom: 56 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>{copy.contact.label}</div>
          <div className="gold-line" />
          <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#f1f5f9' }}>
            {copy.contact.heading}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64 }}>
          {/* Info Side */}
          <div className="reveal-left">
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: '0.72rem', color: '#d4a84b', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-display)' }}>
                {lang === 'ar' ? 'المقر الرئيسي' : 'Headquarters'}
              </div>
              <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '0.95rem', margin: 0 }}>
                {copy.contact.address}
              </p>
            </div>

            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: '0.72rem', color: '#d4a84b', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'var(--font-display)' }}>
                {copy.contact.contactsHeading}
              </div>
              {['01111666635', '01007788176'].map(phone => (
                <a key={phone} href={`tel:${phone}`}
                  style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#d4a84b')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a84b" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.55 10.8 19.79 19.79 0 01.48 2.18 2 2 0 012.46 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.36 6.36l1.27-.8a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  {phone}
                </a>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="https://wa.me/201111666635" target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80', textDecoration: 'none', fontSize: '0.82rem', letterSpacing: '0.06em', borderRadius: 2, fontFamily: 'var(--font-display)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.15)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.08)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.25)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.52 3.858 1.432 5.475L2 22l4.695-1.385A9.958 9.958 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.712 0-3.31-.48-4.674-1.311l-.334-.199-3.464 1.022.979-3.573-.217-.36A7.948 7.948 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
                {copy.contact.whatsapp}
              </a>
              <a href="https://www.facebook.com/share/1Bszbknj15/?mibextid=wwXIfr" target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa', textDecoration: 'none', fontSize: '0.82rem', letterSpacing: '0.06em', borderRadius: 2, fontFamily: 'var(--font-display)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                {copy.contact.facebook}
              </a>
            </div>
          </div>

          {/* Form Side */}
          <div className="reveal-right glass-card" style={{ padding: '36px 32px', borderRadius: 2 }}>
            <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 28, letterSpacing: '0.02em' }}>
              {copy.contact.formHeading}
            </h3>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                <div className="font-display" style={{ fontSize: '1.2rem', color: '#d4a84b', letterSpacing: '0.06em' }}>
                  {lang === 'ar' ? 'تم إرسال رسالتك!' : 'Message Sent!'}
                </div>
                <p style={{ color: '#94a3b8', marginTop: 8 }}>
                  {lang === 'ar' ? 'سنتواصل معك قريباً.' : "We'll get back to you shortly."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <FormField label={copy.contact.fields.name} name="name" value={formData.name} onChange={handleChange} placeholder={lang === 'ar' ? 'أدخل اسمك' : 'Your full name'} />
                  <FormField label={copy.contact.fields.company} name="company" value={formData.company} onChange={handleChange} placeholder={lang === 'ar' ? 'اسم شركتك' : 'Company name'} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{copy.contact.fields.service}</label>
                    <select name="service" value={formData.service} onChange={handleChange} className="form-input">
                      {copy.contact.fields.serviceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{copy.contact.fields.budget}</label>
                    <select name="budget" value={formData.budget} onChange={handleChange} className="form-input">
                      {copy.contact.fields.budgetOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{copy.contact.fields.message}</label>
                  <textarea name="message" rows={4} value={formData.message} onChange={handleChange}
                    placeholder={lang === 'ar' ? 'صف مشروعك ومتطلباتك...' : 'Describe your project, timeline, requirements...'}
                    className="form-input" style={{ resize: 'vertical' }} />
                </div>

                <button type="submit" className="btn-primary" disabled={sending}
                  style={{ padding: '14px 28px', border: 'none', cursor: sending ? 'wait' : 'pointer', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 2, fontFamily: 'inherit', position: 'relative', zIndex: 1, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: sending ? 0.8 : 1 }}
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/>
                        <path d="M21 12a9 9 0 00-9-9"/>
                      </svg>
                      <span style={{ position: 'relative', zIndex: 1 }}>{lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</span>
                    </>
                  ) : (
                    <span style={{ position: 'relative', zIndex: 1 }}>{copy.contact.fields.send}</span>
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
