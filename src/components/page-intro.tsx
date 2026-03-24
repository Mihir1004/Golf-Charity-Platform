type PageIntroProps = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export function PageIntro({ title, subtitle, children }: PageIntroProps) {
  return (
    <section className="surface-card animate-rise motion-delay-1 bg-gradient-to-br from-white to-[#f7fbff] p-6">
      <h1 className="text-3xl font-bold text-[#102742]">{title}</h1>
      <p className="mt-2 text-sm text-[#5b7085]">{subtitle}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
