"use client";

import { useEffect, useState } from "react";
import { heroWords } from "@/lib/data";

export default function AnimatedWords() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroWords.length);
    }, 1800);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="animated-word" aria-live="polite">
      <span key={heroWords[index]}>{heroWords[index]}</span>
    </span>
  );
}
