"use client";

import { ReactNode, useEffect } from "react";

export default function PortfolioModal({
  closeLabel,
  detailsLabel,
  onClose,
  children,
}: {
  closeLabel: string;
  detailsLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="portfolio-modal" role="dialog" aria-modal="true" aria-label={detailsLabel}>
      <button type="button" className="portfolio-modal__backdrop" aria-label={closeLabel} onClick={onClose} />
      {children}
    </div>
  );
}
