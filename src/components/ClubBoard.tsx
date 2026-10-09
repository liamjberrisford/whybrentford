import { publicAsset } from '../assets';
import { useId, useState, type CSSProperties } from 'react';
import { clubCards, selectionStages } from '../data/selection';

export default function ClubBoard({ stage, initial = false, compact = false }: { stage: number; initial?: boolean; compact?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const descriptionId = useId();
  const current = selectionStages[stage];
  const finalStage = selectionStages.length - 1;
  const remaining = clubCards.filter(c => c.out > stage).length;
  const selectedClub = clubCards.find(c => c.id === selected);
  const rows = Array.from({ length: 4 }, (_, index) => clubCards.slice(index * 5, index * 5 + 5));
  return <section className={`club-board ${initial ? 'initial-board' : ''} ${stage === finalStage ? 'final-board' : ''}`} aria-label={`${current.label}: ${remaining} clubs remaining`}>
    <div className="board-heading"><div><span className="eyebrow">THE SHORTLIST</span><h3>{current.title}</h3>{!compact && <p>{current.subtitle}</p>}</div><div className="remaining-counter"><strong>{String(remaining).padStart(2, '0')}</strong><span>STILL IN</span></div></div>
    {!compact && <div className="board-progress" aria-label="Elimination stages">{selectionStages.map((s, i) => <span key={s.label} className={i === stage ? 'current-stage' : i < stage ? 'past-stage' : ''}><b>{i < stage ? '✓' : i === 0 ? '•' : `0${i}`}</b>{s.label}</span>)}</div>}
    <table className="badge-table"><caption className="sr-only">{current.label}. {remaining} of 20 clubs remain. Excluded clubs are grey with an OUT stamp. Choose a badge to read its status.</caption><tbody>{rows.map((row, index) => <tr key={index}>{row.map(club => {
      const excluded = club.out <= stage;
      const winner = stage === finalStage && !excluded;
      const isSelected = selected === club.id;
      return <td key={club.id}><button className={`badge-card ${excluded ? 'excluded' : 'surviving'} ${winner ? 'winner' : ''} ${isSelected ? 'selected-badge' : ''}`} style={{ '--club-color': club.color, '--club-text': 'darkText' in club ? '#161616' : '#fff' } as CSSProperties} onClick={() => setSelected(isSelected ? null : club.id)} aria-expanded={isSelected} aria-controls={descriptionId} aria-label={`${club.name}. ${winner ? 'Winner' : excluded ? `Excluded at ${selectionStages.find((_, index) => index === club.out)?.label ?? 'the final choice'}` : 'Still in contention'}. Read the reason.`}><span className="badge-status">{winner ? 'WINNER!' : excluded ? 'OUT' : 'IN'}</span><img src={publicAsset(`/images/badges/${club.id}.svg`)} alt="" width="72" height="72" loading="lazy"/><span className="badge-name"><span className="badge-name-full">{club.short}</span><span className="badge-name-small" aria-hidden="true">{club.id === 'bournemouth' ? 'B’mouth' : club.id === 'sunderland' ? 'S’land' : club.short}</span></span>{winner && <span className="winner-bee" aria-hidden="true">🐝</span>}</button></td>;
    })}</tr>)}</tbody></table>
    <div id={descriptionId} className="badge-explanation" aria-live="polite" hidden={compact && !selectedClub}>{selectedClub ? <p><strong>{selectedClub.name} {selectedClub.out <= stage ? '— excluded.' : stage === finalStage ? '— selected.' : '— under consideration.'}</strong> {selectedClub.out <= stage || stage === finalStage ? selectedClub.reason : 'This club remains in the shortlist at this stage; the later tabs apply the remaining preferences.'}</p> : <p>Tap a badge. I’ll explain.</p>}</div>
    {!compact && <p className="board-note">{current.note}</p>}
  </section>;
}
