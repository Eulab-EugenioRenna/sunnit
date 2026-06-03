import TextLines from "@/components/text-lines";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "left" | "center";
};

export default function SectionTitle({ eyebrow, title, text, align = "left" }: SectionTitleProps) {
  return (
    <div className={`section-title ${align === "center" ? "center" : ""}`}>
      {eyebrow ? <p>{eyebrow}</p> : null}
      <h2>{title}</h2>
      <TextLines text={text} as="span" />
    </div>
  );
}
