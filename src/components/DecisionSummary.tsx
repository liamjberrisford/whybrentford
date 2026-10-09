import { useState } from 'react';
import { Check, Plus, Minus } from 'lucide-react';
import ClubBoard from './ClubBoard';

const criteria = [
  ['Can get there', 'Exeter → Kew Bridge → short walk. Need a ticket, obviously.'],
  ['Clever with money', 'Find good players. Make them better. Don’t just buy the expensive one.'],
  ['A bit different', 'Numbers, experiments, changing their mind. I like that.'],
  ['Something to shout about', 'An upset should ruin someone else’s Saturday for a change.'],
  ['More to come', 'Europe? A cup? Who knows. That’s the point.'],
  ['Look at the bee', 'Come on. It’s a bee.'],
];

export default function DecisionSummary() {
  const [open, setOpen] = useState<number | null>(null);
  return <section id="the-choice" className="chapter decision-chapter">
    <div className="chapter-heading"><span className="eyebrow">06 / BEES 🐝</span><h2>Yeah.<br/><em>These lot.</em></h2></div>
    <div className="decision-layout"><div><p className="large-copy">Basically, it fits.</p><p>Can get there. Like how they think.<br/>Might win something. Might not.</p><span className="hand-note">And look at the bloody bee.</span></div>
      <div className="criteria-list">{criteria.map(([title, text], i) => <div className={`criterion ${open === i ? 'is-open' : ''}`} key={title}><button aria-expanded={open === i} aria-controls={`criterion-${i}`} onClick={() => setOpen(open === i ? null : i)}><Check size={16}/><span>{title}</span>{open === i ? <Minus size={15}/> : <Plus size={15}/>}</button><div id={`criterion-${i}`} hidden={open !== i}><p>{text}</p></div></div>)}</div>
    </div>
    <ClubBoard stage={6}/>
  </section>;
}
