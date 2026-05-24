// Standard "section card with header" used throughout the app: card chrome,
// h2 title on the left, optional actions cluster on the right (Edit links,
// Reset buttons, etc.), then children rendered in the body.
export default function SectionCard({
  title,
  actions,
  children,
  className = '',
}) {
  return (
    <section className={['card', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="h-section">{title}</h2>
        {actions}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
