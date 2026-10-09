import { useState } from 'react';

// Reuse the existing, sourced map artwork at a readable scale on a phone.
export default function TravelMap({ src, club }: { src: string; club?: string }) {
  const [view, setView] = useState<'england' | 'uk'>('england');
  return <div className="travel-map">
    <div className="map-view-controls" role="group" aria-label="Map area">
      <button aria-pressed={view === 'england'} onClick={() => setView('england')}>England detail</button>
      <button aria-pressed={view === 'uk'} onClick={() => setView('uk')}>Whole UK</button>
    </div>
    <svg className={`phone-map ${view}`} viewBox={view === 'england' ? '480 80 702 470' : '20 85 445 925'} role="img" aria-label={`${view === 'england' ? 'England rail corridors' : 'Map of the United Kingdom'} from Exeter, ${club ? `with ${club} highlighted` : 'showing all fourteen remaining clubs'}. Numbered destination markers match the travel table below. Routes are schematic; dotted final legs are walks.`}>
      <image href={src} width="1200" height="1080"/>
    </svg>
    <p className="map-caption">Exeter → stadium · numbers match the table below</p>
  </div>;
}
