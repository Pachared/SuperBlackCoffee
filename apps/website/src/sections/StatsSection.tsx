import { highlights } from '../data/landing';
export function StatsSection() { return <section className="stats">{highlights.map(([number, label]) => <div key={label}><strong>{number}</strong><span>{label}</span></div>)}</section>; }
