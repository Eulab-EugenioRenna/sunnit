"use client";

import { useState } from "react";

type FaqItem = {
  title: string;
  text: string;
};

export default function FAQ({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="faq-list">
      {items.map((item, index) => (
        <div className={`faq-item ${open === index ? "open" : ""}`} key={item.title}>
          <button type="button" onClick={() => setOpen(open === index ? -1 : index)}>
            <span>{item.title}</span>
            <i>{open === index ? "-" : "+"}</i>
          </button>
          <div className="faq-content">
            <p>{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
