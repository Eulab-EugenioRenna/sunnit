"use client";

import { useState, useEffect } from "react";

function getNewsletterCopy(lang: string) {
  if (lang === "it") {
    return {
      invalid: "Inserisci un indirizzo email valido.",
      success: "Iscrizione salvata correttamente.",
      error: "Impossibile salvare l'iscrizione. Riprova tra poco.",
      loading: "Invio...",
    };
  }

  if (lang === "es") {
    return {
      invalid: "Introduce un email valido.",
      success: "Suscripcion guardada correctamente.",
      error: "No se pudo guardar la suscripcion. Intentalo de nuevo en breve.",
      loading: "Enviando...",
    };
  }

  return {
    invalid: "Enter a valid email address.",
    success: "Subscription saved successfully.",
    error: "Could not save the subscription. Please try again shortly.",
    loading: "Sending...",
  };
}

export default function NewsletterSignupForm({
  lang,
  placeholder,
  buttonLabel,
}: {
  lang: string;
  placeholder: string;
  buttonLabel: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const copy = getNewsletterCopy(lang);

  // Reset status and feedback message after a short timeout so the UI returns
  // to the idle state (e.g. "Iscrizione salvata" -> hide after 3s).
  useEffect(() => {
    if (status === "success" || status === "error") {
      const t = setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
      return () => clearTimeout(t);
    }
    return;
  }, [status]);

  return (
    <form
      className="newsletter-form"
      onSubmit={async (event) => {
        event.preventDefault();

        const normalizedEmail = email.trim();

        if (!normalizedEmail || !normalizedEmail.includes("@")) {
          setStatus("error");
          setMessage(copy.invalid);
          return;
        }

        setStatus("loading");
        setMessage("");

        try {
          const response = await fetch("/api/newsletter", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: normalizedEmail, lang, source: "footer-newsletter" }),
          });

          if (!response.ok) {
            throw new Error("Newsletter request failed");
          }

          setEmail("");
          setStatus("success");
          setMessage(copy.success);
        } catch {
          setStatus("error");
          setMessage(copy.error);
        }
      }}
    >
      <input
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        required
      />
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? copy.loading : buttonLabel}
      </button>
      {message ? <p className={`form-feedback ${status === "success" ? "form-feedback-success" : "form-feedback-error"}`}>{message}</p> : null}
    </form>
  );
}
