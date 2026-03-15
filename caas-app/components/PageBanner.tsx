import { Section } from "./section";

const PageBanner = ({
  heading,
  title,
  description,
}: {
  heading: string;
  title: string;
  description: string;
}) => {
  return (
    <Section className="bg-background py-14 md:py-20">
      <div className="mx-auto container text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
          {heading}
        </p>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {description}
        </p>
      </div>
    </Section>
  );
};

export default PageBanner;
