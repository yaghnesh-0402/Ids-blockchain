function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.38em] text-signal/80">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
          {title}
        </h2>
        {description ? <p className="mt-3 max-w-2xl text-emerald-100/65">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export default PageHeader;
