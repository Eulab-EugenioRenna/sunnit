import Image from "next/image";
import Link from "next/link";
import NewsletterSignupForm from "@/components/newsletter-signup-form";
import type { Dictionary } from "@/lib/dictionaries";
import TextLines from "@/components/text-lines";

export default function Footer({ dict, lang }: { dict: Dictionary; lang: string }) {
  return (
    <footer className="footer-shell">
      <div className="newsletter">
        <p>{dict.common.footer.newsletterSub}</p>
        <h2>{dict.common.footer.newsletterTitle}</h2>
        <TextLines text={dict.common.footer.newsletterDesc} as="span" />
        <NewsletterSignupForm
          lang={lang}
          placeholder={dict.common.footer.emailPlaceholder}
          buttonLabel={dict.common.footer.signUp}
        />
      </div>

      <div className="footer-card">
        <div className="footer-brand">
          <Link href={`/${lang}`} className="brand light" aria-label="SUNNIT home">
            <Image src="/logo.png" alt="SUNNIT" width={152} height={44} className="brand-logo brand-logo--footer" />
          </Link>
          <TextLines text={dict.common.footer.brandDesc} />
        </div>

        <div>
          <h3>{dict.common.footer.community}</h3>
          <Link href={`/${lang}/services`}>Our Product</Link>
          <Link href={`/${lang}/sunnitai`}>SunnitAI</Link>
          <Link href={`/${lang}/about`}>Company</Link>
          <Link href={`/${lang}/contact`}>What We Do?</Link>
        </div>

        <div>
          <h3>{dict.common.footer.quickLinks}</h3>
          <Link href={`/${lang}`}>Home</Link>
          <Link href={`/${lang}/about`}>About Us</Link>
          <Link href={`/${lang}/services`}>Services</Link>
          <Link href={`/${lang}/blog`}>Blog</Link>
        </div>

        <div>
          <h3>{dict.common.footer.contact}</h3>
          <a href="mailto:info@sunnit.it">info@sunnit.it</a>
          <a href="tel:+390645251300">+39 06 45251 300</a>
          <span>Via Stamira 63, Roma</span>
        </div>
      </div>

      <div className="copyright">© 2026 - SUNNIT. {dict.common.footer.rights}.</div>
    </footer>
  );
}
