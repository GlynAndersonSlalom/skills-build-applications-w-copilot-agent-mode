import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  path: string;
  dataKey: string;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
};
type State<T> = { status: 'loading' } | { status: 'error' } | { status: 'success'; items: T[] };

export function CapabilityCard<T>({ title, path, dataKey, emptyText, renderItem }: Props<T>) {
  const [state, setState] = useState<State<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getJson<Record<string, T[]>>(path)
      .then((data) => {
        if (active) setState({ status: 'success', items: data[dataKey] });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => { active = false; };
  }, [path, dataKey]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
    {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}.</p>}
    {state.status === 'success' && (state.items.length === 0
      ? <p>{emptyText}</p>
      : <ul className="list-group list-group-flush">{state.items.map((item, index) => <li className="list-group-item" key={index}>{renderItem(item)}</li>)}</ul>)}
  </div></section>;
}
