"use client";

import { useState } from "react";
import TextLines from "@/components/text-lines";

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
            <TextLines text={item.text} />
          </div>
        </div>
      ))}
    </div>
  );
}
