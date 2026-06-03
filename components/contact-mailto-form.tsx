"use client";

import { useState } from "react";

type FieldLabels = {
  name: string;
  email: string;
  company?: string;
  service?: string;
  services?: string[];
  message: string;
  submit: string;
};

function getMailtoCopy(lang: string, context: "home" | "contact") {
  if (lang === "it") {
    return {
      subject: context === "home" ? "Richiesta contatto dal sito SUNNIT" : "Richiesta consulenza dal form contatti SUNNIT",
      missing: "Compila almeno nome, email e messaggio.",
    };
  }

  if (lang === "es") {
    return {
      subject: context === "home" ? "Solicitud de contacto desde el sitio SUNNIT" : "Solicitud de consultoria desde el formulario de contacto de SUNNIT",
      missing: "Completa al menos nombre, email y mensaje.",
    };
  }

  return {
    subject: context === "home" ? "Contact request from SUNNIT website" : "Consulting request from SUNNIT contact form",
    missing: "Please fill in at least name, email and message.",
  };
}

export default function ContactMailtoForm({
  lang,
  context,
  labels,
  className,
}: {
  lang: string;
  context: "home" | "contact";
  labels: FieldLabels;
  className: string;
}) {
  const [error, setError] = useState("");

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const company = String(formData.get("company") || "").trim();
        const service = String(formData.get("service") || "").trim();
        const message = String(formData.get("message") || "").trim();
        const copy = getMailtoCopy(lang, context);

        if (!name || !email || !message) {
          setError(copy.missing);
          return;
        }

        setError("");

        const body = [
          `Name: ${name}`,
          `Email: ${email}`,
          company ? `Company: ${company}` : "",
          service ? `Service: ${service}` : "",
          "",
          "Message:",
          message,
        ]
          .filter(Boolean)
          .join("\n");

        window.location.href = `mailto:info@sunnit.it?subject=${encodeURIComponent(copy.subject)}&body=${encodeURIComponent(body)}`;
      }}
    >
      <input name="name" placeholder={labels.name} aria-label={labels.name} required />
      <input name="email" type="email" placeholder={labels.email} aria-label={labels.email} required />
      {labels.company ? <input name="company" placeholder={labels.company} aria-label={labels.company} /> : null}
      {labels.service ? (
        <select name="service" defaultValue="" aria-label={labels.service}>
          <option value="" disabled>
            {labels.service}
          </option>
          {(labels.services || []).map((svc) => (
            <option key={svc} value={svc}>
              {svc}
            </option>
          ))}
        </select>
      ) : null}
      <textarea name="message" placeholder={labels.message} aria-label={labels.message} required />
      <button type="submit" className="dark-btn">
        {labels.submit}
      </button>
      {error ? <p className="form-feedback form-feedback-error">{error}</p> : null}
    </form>
  );
}
