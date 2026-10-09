import { useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import TravelAnalysis, { useTravelData } from './components/TravelAnalysis';
import { sources } from './data/sources';
import { clubCards } from './data/selection';
import ClubBoard from './components/ClubBoard';
import BeeControl, { BeeSwarm, BeeSlider } from './components/BeeNonsense';
import Dialog from './components/Dialog';

const tabs = ['All in', 'Big six', 'Travel', 'Brains', 'Stress', 'Nearly', 'Brentford'];
const stageSummaries = [
  'I wanted a Premier League club I could watch down the pub and occasionally visit from Exeter.',
  'I ruled out the big six because progress at a smaller club appealed to me more.',
  'I kept six destinations I would consider visiting from Exeter, comparing all fourteen options below.',
  'I favoured clubs whose recruitment, player development and use of analysis interested me.',
  'I kept the three clubs I felt most interested in following each week.',
  'Brentford and Brighton’s approaches to recruitment and development made them my final two.',
  'Brentford brought together the journey, the football and the way the club works that appealed to me.',
];
function SourceRef({ id }: { id: string }) {
  const source = sources.find(s => s.id === id)!;
  return <a className="source-ref" href={source.url} target="_blank" rel="noreferrer" aria-label={source.title}><ExternalLink size={14}/></a>;
}
function Explanation({ stage }: { stage: number }) {
  return <div className="stage-explanation">
    {stage === 0 && <><p>I wanted a Premier League club I could follow regularly, watch down the pub and occasionally visit from Exeter. That gives me twenty options, which is rather too many teams to develop strong opinions about at once.</p><p>The tabs follow my reasoning: start outside the big six, consider the journey, then look at how the clubs operate and which one I would enjoy supporting. The grey badges carry each decision forward. This is a structured account of a personal choice, with slightly more bees than the methodology strictly requires.</p></>}
    {stage === 1 && <><p>I ruled out Arsenal, Chelsea, Liverpool, Manchester City, Manchester United and Tottenham first. I was drawn to a smaller club, where progress against better-resourced opponents would feel especially worthwhile.</p><p>This is a preference about the experience of supporting a team. The big six have plenty to offer; I just wanted ambition with a little more uncertainty attached. Their international fanbases should survive my absence.</p></>}
    {stage === 2 && <><p>Living in Exeter makes travel a fairly substantial part of the decision. The map and table above show train-and-walk benchmarks for all fourteen clubs left after the big-six cut, including the eight I exclude here. I kept Villa, Bournemouth, Brentford, Brighton, Palace and Fulham as my geographic shortlist.</p><p>The comparison uses published fastest rail times plus an approximate stadium walk. It helps show the scale of each journey, but my shortlist also reflects which destinations appealed to me; there is no automatic time threshold. Coventry being quicker than some retained clubs is therefore quite allowed.</p><p>Actual matchday journeys can take considerably longer. Brentford’s published rail average is about 4h53 before walking, so the kick-off and return train matter. Supporting a club should involve some commitment, preferably without requiring a second address.</p></>}
    {stage === 3 && <><p>I am interested in clubs that try to make their resources go further through recruitment, player development and analysis. Ollie Watkins moving from Exeter to Brentford in 2017, then to Villa in 2020, is a useful example of the development pathway that appeals to me. The Exeter connection also counted slightly in Brentford’s favour; it gave me a familiar link to the club. <SourceRef id="watkins-in"/><SourceRef id="watkins-out"/></p><p>Matthew Benham’s analytical approach and Brentford’s willingness to experiment are part of the attraction. The B team began in 2016, with an academy reopening alongside it later. I like the idea of testing an approach and revising it when circumstances change; apparently this can also be applied to football. <SourceRef id="benham"/><SourceRef id="b-team"/><SourceRef id="academy"/></p><p>Villa’s travel time was competitive, but the destination mattered too: I can’t say I’ve really enjoyed my time in Birmingham, and would rather avoid another trip there if I can. I’ll take the extra nine minutes to Brentford in this comparison. Palace also drops out here because the other clubs interested me more.</p></>}
    {stage === 4 && <><p>A sensible operating model is appealing, but I also need to care about what happens on the pitch. I wanted a club where beating a stronger opponent would feel like a proper event, with enough ambition to make the next season interesting.</p><p>Fulham remained a plausible choice. I found myself more curious about Brentford, Brighton and Bournemouth, so those three stayed. This is the point at which the analysis has to admit that emotional investment is rather difficult to put in a spreadsheet.</p></>}
    {stage === 5 && <><p>Bournemouth came close: a smaller club competing at this level fits much of what I was looking for. In the end, Brentford and Brighton’s approaches to recruitment and development held my attention more.</p><p>Both felt like clubs whose next chapter I would enjoy following. The appeal is the possibility of further progress, rather than an expectation of winning everything. I would quite like a cup, but I recognise that this is not a particularly original contribution to football analysis.</p></>}
    {stage === 6 && <><p>Brighton were a serious contender. Brentford brought together the things that mattered most to me: a journey I could contemplate from Exeter, an interesting approach to finding and developing players, and the prospect of achievements that would feel significant. Ollie Watkins’ move from Exeter also gave me a small, familiar connection to the club.</p><p>There is no formula that makes Brentford the correct answer for everyone. They were the club I kept wanting to read more about, which is probably the most useful result of the whole exercise. The bee helps, although I have resisted assigning it a formal weighting.</p><a href="https://www.nationalrail.co.uk/journey-planner/" target="_blank" rel="noreferrer">Check trains for a match</a></>}

  </div>;
}

export default function App() {
  const [buzzing, setBuzzing] = useState(true);
  const [beeCount, setBeeCount] = useState(3);
  const [stage, setStage] = useState(0);
  const [dialog, setDialog] = useState<'sources' | 'bees' | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { clubs, routes, error } = useTravelData();
  const selectStage = (next: number, focus = false) => {
    setStage(next);
    if (focus) tabRefs.current[next]?.focus({ preventScroll: true });
    const main = document.getElementById('main');
    if (main && main.getBoundingClientRect().top < 0) main.scrollIntoView({ block: 'start' });
  };
  return <div className={`bee-site selection-workspace ${buzzing ? '' : 'bees-paused'}`}>
    <BeeSwarm count={beeCount}/>
    <a className="skip-link" href="#main">Skip to the clubs</a>
    <header id="top" className="compact-header"><h1>Why <em>Brentford?</em></h1><div className="compact-bee-controls"><BeeSlider buzzing={buzzing} beeCount={beeCount} onBeeCountChange={setBeeCount} compact/><button className="bee-pause" onClick={() => setBuzzing(!buzzing)} aria-pressed={!buzzing}>{buzzing ? 'Pause the bees' : 'Release the bees'}</button></div></header>
    <main id="main" className="selection-main" tabIndex={-1}>
      <div className="selection-controls"><p id="tab-instructions" className="tab-instructions">Pick a tab to make the next cut <span aria-hidden="true">↓</span></p><div className="selection-tabs" role="tablist" aria-label="Choose a selection stage" aria-describedby="tab-instructions">{tabs.map((label, index) => <button key={label} ref={el => { tabRefs.current[index] = el; }} id={`stage-tab-${index}`} role="tab" aria-selected={stage === index} aria-controls={`stage-panel-${index}`} tabIndex={stage === index ? 0 : -1} className={stage === index ? 'active' : index < stage ? 'visited' : ''} onClick={() => selectStage(index)} onKeyDown={e => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        selectStage(next, true);
      }}><span className="tab-step">{index === 0 ? '★' : index}</span><span>{label}</span><span className="tab-count">{clubCards.filter(c => c.out > index).length}</span></button>)}</div></div>
      {tabs.map((label, index) => <div key={label} role="tabpanel" id={`stage-panel-${index}`} aria-labelledby={`stage-tab-${index}`} hidden={stage !== index} tabIndex={0} className="selection-panel">
        {stage === index && <><section className="stage-summary" aria-labelledby={`thinking-heading-${stage}`}><h2 id={`thinking-heading-${stage}`}>My thinking</h2><p>{stageSummaries[stage]}</p></section><ClubBoard key={stage} stage={stage} compact/><aside className={`stage-context ${stage === 2 ? 'travel-context' : ''}`} aria-label={`${label} reason`}>
          {stage === 2 && <TravelAnalysis clubs={clubs} routes={routes} error={error} embedded/>}
          <Explanation stage={stage}/>
        </aside></>}
      </div>)}
      <div className="workspace-bottom"><div className="workspace-links"><button onClick={() => setDialog('sources')}>Receipts ↗</button><button onClick={() => setDialog('bees')}>More bees?</button></div><div className="stage-navigation"><button disabled={stage === 0} onClick={() => selectStage(stage - 1, true)} aria-label="Previous selection stage">← Back</button><button className="next-stage" onClick={() => selectStage(stage === 6 ? 0 : stage + 1, true)}>{stage === 6 ? 'Again? ↺' : `${tabs[stage + 1]} →`}</button></div></div>
    </main>
    {dialog && <Dialog title={dialog === 'sources' ? 'Receipts.' : 'More bees. Obviously.'} onClose={() => setDialog(null)}>
      {dialog === 'bees' && <BeeControl buzzing={buzzing} beeCount={beeCount} onBeeCountChange={setBeeCount}/>}
      {dialog === 'sources' && <div className="receipts"><p>My choice. The 2026/27 clubs, checked 8 October 2026. The player and ownership examples are historical.</p><ol>{sources.map(s => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a><small>{s.publisher}</small><p>{s.note}</p></li>)}</ol><p>Badges: official Premier League CDN; owned by the clubs. Map: <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Natural Earth, public domain</a>. Approximate coordinates and schematic routes. All fourteen clubs remaining after the big-six cut have sourced travel benchmarks. The full CSV also includes Chelsea; the other five excluded big-six clubs have blank timings.</p><p>Archived photo: <a href="https://commons.wikimedia.org/wiki/File:Brentford_Community_Stadium_2020.jpg" target="_blank" rel="noreferrer">AndyScott, May 2020</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>. Cropped and colour-adjusted.</p></div>}
    </Dialog>}
  </div>;
}
