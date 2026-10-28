import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  loadItems: () => Promise<T[]>;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
};
type State<T> = { status: 'loading' } | { status: 'error' } | { status: 'success'; items: T[] };

export function CapabilityCard<T>({ title, loadItems, emptyText, renderItem }: Props<T>) {
  const [state, setState] = useState<State<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    loadItems()
      .then((items) => {
        if (active) setState({ status: 'success', items });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => { active = false; };
  }, [loadItems]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
    {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}.</p>}
    {state.status === 'success' && (state.items.length === 0
      ? <p>{emptyText}</p>
      : <ul className="list-group list-group-flush">{state.items.map((item, index) => <li className="list-group-item" key={index}>{renderItem(item)}</li>)}</ul>)}
  </div></section>;
}
