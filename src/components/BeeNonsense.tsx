import { useEffect, useId, useState, type CSSProperties } from 'react';

const dispatches = [
  'There. Bees. Happy now?',
  'Yep. More bees. Really helping, this.',
  'Still pressing it then?',
  'This is why we can’t have nice things.',
  'No ticket yet. Loads of bees though.',
];

export function BeeMemo({ question, answer }: { question: string; answer: string }) {
  return <aside className="bee-memo"><span className="memo-bee" aria-hidden="true">🐝</span><div><span className="eyebrow">FAIR QUESTION</span><p><strong>You:</strong> “{question}”</p><p><strong>Me:</strong> “{answer}”</p></div><span className="memo-stamp" aria-hidden="true">WHY<br/>THOUGH?</span></aside>;
}

export function BeeSwarm({ count }: { count: number }) {
  return <div className="bee-flight" aria-hidden="true">{Array.from({ length: count }, (_, i) => {
    // Independent bounded flight paths: hover briefly, dart to a new spot, then turn.
    const startX = 5 + (i * 43) % 89;
    const startY = 7 + (i * 31) % 81;
    const style: Record<string, string> = {
      left: `${startX}vw`, top: `${startY}vh`,
      animationDuration: `${22 + (i * 7) % 19}s`, animationDelay: `-${(i * 11) % 37}s`,
      fontSize: `${1.25 + ((i * 7) % 8) / 10}rem`,
    };
    let previousX = startX;
    for (let point = 1; point <= 5; point++) {
      const x = 5 + (i * 43 + point * (17 + i % 13)) % 89;
      const y = 7 + (i * 31 + point * (13 + i % 17)) % 81;
      style[`--flight-x${point}`] = `${x - startX}vw`;
      style[`--flight-y${point}`] = `${y - startY}vh`;
      style[`--flight-face${point}`] = x > previousX ? '-1' : '1';
      previousX = x;
    }
    return <span key={i} className="roaming-bee" style={style as CSSProperties}><span className="bee-body">🐝</span></span>;
  })}</div>;
}

type BeeSliderProps = { buzzing: boolean; beeCount: number; onBeeCountChange: (count: number) => void; compact?: boolean };

export function BeeSlider({ buzzing, beeCount, onBeeCountChange, compact = false }: BeeSliderProps) {
  const sliderId = useId();
  return <div className={`bee-level${compact ? ' bee-level-compact' : ''}`}><div className="bee-level-heading"><label htmlFor={sliderId}>Flying bees</label><output htmlFor={sliderId} aria-live="off">{compact ? beeCount : `${beeCount} bees`}{!buzzing ? ' · paused' : compact ? '' : beeCount >= 75 ? '. Oh dear.' : beeCount >= 25 ? '. Bit much.' : '.'}</output></div><input id={sliderId} type="range" min="0" max="100" step="1" value={beeCount} aria-valuetext={`${beeCount} flying bees`} onChange={event => onBeeCountChange(Number(event.currentTarget.value))}/>{!compact && <div className="bee-level-ends" aria-hidden="true"><span>0 · Peace and quiet</span><span>100 · Bee problem</span></div>}</div>;
}

export default function BeeControl({ buzzing, beeCount, onBeeCountChange }: { buzzing: boolean; beeCount: number; onBeeCountChange: (count: number) => void }) {
  const [presses, setPresses] = useState(0);
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    if (!burst) return;
    const timer = window.setTimeout(() => setBurst(0), 2200);
    return () => window.clearTimeout(timer);
  }, [burst]);
  function deployBees() {
    setPresses(p => p + 1);
    if (buzzing) setBurst(presses + 1);
  }
  return <aside className="bee-control" aria-label="Unnecessary bee control panel">
    <div className="bee-control-label"><span aria-hidden="true">🚨</span><div><span className="eyebrow">IMPORTANT STUFF</span><h2>Needs more bees.</h2><p>Go on.</p></div></div>
    <div className="bee-control-action"><button className="deploy-bees" onClick={deployBees}><span aria-hidden="true">🐝</span> MORE BEES <span aria-hidden="true">🐝</span></button><span className="bee-dose">{presses === 0 ? 'Obviously press it.' : `${presses} pointless click${presses === 1 ? '' : 's'} this visit`}</span></div>
    <BeeSlider buzzing={buzzing} beeCount={beeCount} onBeeCountChange={onBeeCountChange}/>
    <p className="bee-dispatch" role="status">{presses === 0 ? 'No, this doesn’t help.' : `${dispatches[(presses - 1) % dispatches.length]}${!buzzing ? ' Bees paused. Having a sit down.' : ''}`}</p>
    {buzzing && burst > 0 && <div key={burst} className="bee-burst" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ '--bee-x': `${7 + (i * 19) % 88}%`, '--bee-drift': `${i % 2 ? -65 : 65}px`, '--bee-delay': `${i * 45}ms`, '--bee-turn': `${i % 2 ? -35 : 35}deg` } as CSSProperties}>🐝</span>)}</div>}
  </aside>;
}
