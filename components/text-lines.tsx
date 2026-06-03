import { Fragment } from "react";

type TextLinesProps = {
  text?: string | null;
  as?: "p" | "span" | "div";
  className?: string;
};

function splitTextLines(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function TextLines({
  text,
  as = "p",
  className,
}: TextLinesProps) {
  if (!text) return null;

  const lines = splitTextLines(text);
  const Tag = as;

  return (
    <Tag className={className}>
      {lines.map((line, index) => (
        <Fragment key={`${index}-${line}`}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </Tag>
  );
}
