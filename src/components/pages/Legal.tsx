import PageShell from "@/components/PageShell";

type Props = {
  title: string;
  sections: { heading: string; text: string }[];
};

const Legal = ({ title, sections }: Props) => (
  <PageShell>
    <section className="py-14 container mx-auto px-4 max-w-3xl">
      <h1 className="font-heading font-bold text-3xl">{title}</h1>
      <div className="space-y-6 mt-6">
        {sections.map((s) => (
          <article key={s.heading}>
            <h2 className="font-heading font-semibold text-xl">{s.heading}</h2>
            <p className="text-muted-foreground mt-2">{s.text}</p>
          </article>
        ))}
      </div>
    </section>
  </PageShell>
);

export default Legal;
