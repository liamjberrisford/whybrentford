import { publicAsset } from '../assets';
import { useEffect, useRef, useState } from 'react';
import { MapPin, Download, ChevronDown, ChevronUp } from 'lucide-react';
import ClubBoard from './ClubBoard';
import { bigSixClubNames, clubCards } from '../data/selection';
import Dialog from './Dialog';
import TravelMap from './TravelMap';

export interface TravelClub {
  club: string; stadium: string; city: string; latitude: number; longitude: number;
  rail_minutes: number | null; onward_minutes: number | null; total_minutes: number | null;
  changes: number | null; notes: string; source: string; station: string; status: string;
  season: string; time_basis: string; origin: string;
}
export const duration = (minutes: number) => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
export interface TravelRoute { club: string; id: string; color: string; via: string[]; summary: string; sources: string[]; note: string; }

export function useTravelData() {
  const [clubs, setClubs] = useState<TravelClub[]>([]);
  const [error, setError] = useState(false);
  const [routes, setRoutes] = useState<TravelRoute[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(publicAsset('/generated/travel-data.json'), { signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error('Travel data unavailable'); return res.json(); })
      .then(data => { if (!Array.isArray(data.clubs) || !Array.isArray(data.routes)) throw new Error('Invalid travel data'); setClubs(data.clubs); setRoutes(data.routes); })
      .catch(e => { if (e.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, []);
  return { clubs, routes, error };
}

export default function TravelAnalysis({ clubs, routes, error, embedded = false }: { clubs: TravelClub[]; routes: TravelRoute[]; error: boolean; embedded?: boolean }) {
  const [tab, setTab] = useState<'ranking' | 'map'>('map');
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [expanded, setExpanded] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const allSourced = clubs.filter(c => c.total_minutes !== null);
  const candidates = clubs.filter(c => !bigSixClubNames.has(c.club));
  const sourced = candidates.filter(c => c.total_minutes !== null).sort((a, b) => a.total_minutes! - b.total_minutes!);
  const candidateRoutes = routes.filter(r => !bigSixClubNames.has(r.club));
  const route = candidateRoutes.find(r => r.id === selectedRoute);
  const routeClub = route ? clubs.find(c => c.club === route.club) : undefined;
  const mapSrc = publicAsset(selectedRoute === 'all' ? '/generated/travel-map-shortlist.svg' : `/generated/travel-map-shortlist-${selectedRoute}.svg`);
  return <section id="getting-there" className={`chapter travel-chapter ${embedded ? 'embedded-travel' : ''}`}>
    {!embedded && <div className="chapter-heading"><span className="eyebrow">02 / TRAINS 🚂</span><h2>Can I get there?<br/><em>And back, ideally.</em></h2></div>}
    <div className="travel-layout">
      {!embedded && <div className="travel-copy"><div className="origin"><MapPin size={17} /><span>START HERE<br/><strong>Exeter St Davids</strong></span></div>
        <p>Kew Bridge → short walk → football.<br/>Yep, doable.</p>
        <p className="joke-aside">Sadly I am not a bee. So, trains.</p>
        <a className="text-link" href={publicAsset('/generated/club_travel_from_exeter.csv')} download><Download size={15}/> The spreadsheet. Obviously.</a>
      </div>}
      <div className="travel-panel">

        <div className="panel-header"><span className="eyebrow">THE TRAIN BIT</span><div className="tabs" role="tablist" aria-label="Travel graphic">
          {(['map', 'ranking'] as const).map((value, i) => <button key={value} ref={el => { tabRefs.current[i] = el; }} role="tab" id={`tab-${value}`} aria-controls={`panel-${value}`} aria-selected={tab === value} tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={e => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? 1 : 1-i; setTab(next === 0 ? 'map' : 'ranking'); tabRefs.current[next]?.focus(); } }}>{value === 'ranking' ? 'The numbers' : 'UK route map'}</button>)}
        </div></div>
        <div id="panel-ranking" role="tabpanel" aria-labelledby="tab-ranking" hidden={tab !== 'ranking'} tabIndex={0}><img className="ranking-chart" src={publicAsset('/generated/travel-ranking-shortlist.svg')} alt={sourced.length ? `Comparison of published fastest rail connections plus approximate stadium walks from Exeter St Davids. ${sourced.map(c => `${c.club}: about ${duration(c.total_minutes!)}`).join('; ')}. All fourteen clubs left after the big-six cut are included.` : 'Comparison of sourced faster rail connections plus approximate stadium walks from Exeter St Davids. The numerical dataset is available below.'} /></div>
        <div id="panel-map" role="tabpanel" aria-labelledby="tab-map" hidden={tab !== 'map'} tabIndex={0}>
          <label className="route-picker" htmlFor="route-picker"><span>Follow a club’s journey</span><select id="route-picker" value={selectedRoute} onChange={e => setSelectedRoute(e.target.value)}><option value="all">All 14 routes from Exeter</option>{sourced.map((c, i) => { const r = candidateRoutes.find(r => r.club === c.club); return r && <option key={r.id} value={r.id}>{i + 1}. {clubCards.find(card => card.name === c.club)?.short ?? c.club} · ~{duration(c.total_minutes!)}</option>; })}</select></label>
          <TravelMap src={mapSrc} club={route?.club}/>
          <div className="route-verdict" aria-live="polite" hidden={!route}>{route ? <><h3>{route.club} {routeClub?.total_minutes != null && <span>~{duration(routeClub.total_minutes)}</span>}</h3><p className="route-summary">{route.via[0]} → {route.via.at(-1)}</p><details className="short-details"><summary>Route details</summary><p>{route.via.join(' → ')}</p><p>{route.note}</p><p>{routeClub?.total_minutes != null ? `${duration(routeClub.rail_minutes!)} fastest rail + ~${routeClub.onward_minutes} minutes walking. A separate benchmark, not this route’s itinerary.` : 'Travel time awaiting verified data.'}</p><div className="route-source-links">{route.sources.map((url,i) => <a href={url} key={url} target="_blank" rel="noreferrer">Network source {i+1}</a>)}</div></details></> : null}</div>
        </div>
        <button className="enlarge-chart" onClick={() => setEnlarged(true)}>Enlarge {tab === 'map' ? 'map' : 'chart'} ↗</button>
        <div className="travel-comparison">
          <h3>All 14 remaining options</h3>
          {error ? <p role="alert">Travel times could not load. <a href={publicAsset('/generated/club_travel_from_exeter.csv')} download>Download the travel table</a>.</p> : clubs.length === 0 ? <p role="status">Loading travel times…</p> : <table className="travel-times">
            <caption className="sr-only">Travel from Exeter St Davids to each of the fourteen clubs left after the big-six cut. Published fastest rail benchmark plus an approximate walk, ordered by total.</caption>
            <thead><tr><th scope="col">Club / arrival station</th><th scope="col" className="time-leg">Train</th><th scope="col" className="time-leg">Walk</th><th scope="col">Total</th></tr></thead>
            <tbody>{[...sourced, ...candidates.filter(c => c.total_minutes === null)].map((c, index) => {
              const card = clubCards.find(card => card.name === c.club);
              return <tr key={c.club}><th scope="row"><span className="travel-club"><span className="map-number" aria-label={`Map marker ${index + 1}`}>{index + 1}</span><img src={publicAsset(`/images/badges/${card?.id}.svg`)} alt="" width="28" height="28"/>{card?.short ?? c.club}</span><small>{c.station || 'Station awaiting research'}</small><span className="row-sources">{c.source.split(' | ').map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer" aria-label={`${c.club}: ${i === 0 ? 'rail' : 'walk'} source`}>{i === 0 ? 'Train source' : 'Walk source'}</a>)}</span></th><td className="time-leg">{c.rail_minutes !== null ? duration(c.rail_minutes) : 'Awaiting data'}</td><td className="time-leg">{c.onward_minutes !== null ? `~${c.onward_minutes}m` : 'Awaiting data'}</td><td><span className="total-time">{c.total_minutes !== null ? `~${duration(c.total_minutes)}` : 'Awaiting data'}</span><small className="mobile-breakdown">{c.rail_minutes !== null && `${duration(c.rail_minutes)} train + ~${c.onward_minutes}m walk`}</small></td></tr>;
            })}</tbody>
          </table>}
          <p className="travel-basis">Published fastest rail + approximate walk · checked 8 October 2026. Everton uses a walk from Lime Street; a local rail connection may suit you better. Sources and station choices are shown for each club.</p>
        </div>

        <details className="travel-research"><summary>Timings & caveats</summary><p>Schematic routes · fastest rail + walk benchmarks.</p>
        <div className="data-note"><strong>Published connection benchmarks.</strong> {sourced.length} of the {candidates.length} clubs remaining after the big-six cut have sourced times. The map, chart and table cover all fourteen destinations.</div>
        <details className="methodology"><summary>How the times are calculated <ChevronDown size={16}/></summary><p>These are published faster-connection benchmarks, not typical journeys. Brentford’s reported rail average is about 4h53 before walking. Check your date, kick-off, return train and ticket. Allow for queues and engineering works.</p><p>Each total adds a separately sourced walk to the rail time. Lines join approximate station locations; they don’t trace actual tracks. The benchmark doesn’t time the drawn route. Interchange counts are reported by the source page and can vary by departure. Where a walking range is given, the upper end is used. Walking time depends on your entrance.</p></details>
        <button className="dataset-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="travel-dataset">{expanded ? 'Hide' : 'All'} {clubs.length || 20} clubs & timings {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>
        <div id="travel-dataset" className="dataset" hidden={!expanded}>
          {error ? <p role="alert">The travel details could not load. You can still download the CSV above.</p> : clubs.length === 0 ? <p role="status">Loading travel details…</p> : <><p className="small-text">{allSourced.length} sourced benchmarks · {clubs.length-allSourced.length} timings awaiting research. Unverified journeys are never ranked.</p><div className="table-scroll" tabIndex={0} role="region" aria-label="Travel dataset"><table><caption className="sr-only">2026/27 club travel dataset, all journeys start at Exeter St Davids and finish at the stadium.</caption><thead><tr><th>Club / stadium</th><th>Total</th><th>Basis & sources</th></tr></thead><tbody>{clubs.map(c => <tr key={c.club}><th scope="row">{c.club}<small>{c.stadium}</small></th><td>{c.total_minutes !== null ? `~${duration(c.total_minutes)}` : 'Awaiting data'}</td><td>{c.notes}<span className="row-sources">{c.source.split(' | ').map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer">{c.total_minutes === null ? 'Club source' : i === 0 ? 'Rail source' : 'Walk source'}</a>)}</span></td></tr>)}</tbody></table></div></>}
        </div>
        <a className="text-link" href={publicAsset('/generated/club_travel_from_exeter.csv')} download><Download size={15}/> Download the spreadsheet</a>
        </details>
      </div>
    </div>
    {!embedded && <ClubBoard stage={2}/>}
    {enlarged && <Dialog title={tab === 'map' ? 'The train map' : 'The travel times'} onClose={() => setEnlarged(false)} wide><div className="enlarged-chart"><img src={tab === 'map' ? mapSrc : publicAsset('/generated/travel-ranking-shortlist.svg')} alt={tab === 'map' ? `UK rail corridors from Exeter${route ? ` to ${route.club}` : ''}, with station stops and separate journey benchmarks.` : 'Sourced fastest rail and walking benchmarks for all fourteen clubs left after the big-six cut.'}/></div><p>Schematic routes. Separate fastest rail + walking benchmarks; check your actual trains.</p></Dialog>}
  </section>;
}
