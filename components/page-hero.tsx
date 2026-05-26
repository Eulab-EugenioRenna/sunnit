type PageHeroProps = {
  title: string;
  crumb?: string;
  text?: string;
};

export default function PageHero({ title, crumb, text }: PageHeroProps) {
  return (
    <section className="page-hero container">
      <p>{crumb ? `Home - ${crumb}` : "Home"}</p>
      <h1>{title}</h1>
      {text ? <span>{text}</span> : null}
    </section>
  );
}
