"use client";

import { useEffect, useState } from "react";

export default function AnimatedWords({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 1800);

    return () => window.clearInterval(timer);
  }, [words.length]);

  return (
    <span className="animated-word" aria-live="polite">
      <span key={words[index]}>{words[index]}</span>
    </span>
  );
}
