import { useEffect, useState } from 'react';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

function distribute(items, columnCount) {
  const columns = Array.from({ length: columnCount }, () => ({
    items: [],
    weight: 0,
  }));
  for (const item of items) {
    let target = columns[0];
    for (const c of columns) if (c.weight < target.weight) target = c;
    target.items.push(item);
    target.weight += item.weight ?? 1;
  }
  return columns.map((c) => c.items);
}

function Card({ title, children }) {
  return (
    <section className="panel">
      <h3 className="panel-header">{title}</h3>
      <div className="panel-body">{children}</div>
    </section>
  );
}

export default function CardColumns({ items }) {
  const isWide = useMediaQuery('(min-width: 640px)');

  if (!isWide) {
    return (
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <Card key={item.key} title={item.label}>
            {item.content}
          </Card>
        ))}
      </div>
    );
  }

  const [colA, colB] = distribute(items, 2);
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        {colA.map((item) => (
          <Card key={item.key} title={item.label}>
            {item.content}
          </Card>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {colB.map((item) => (
          <Card key={item.key} title={item.label}>
            {item.content}
          </Card>
        ))}
      </div>
    </div>
  );
}
