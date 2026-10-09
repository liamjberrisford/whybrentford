#!/usr/bin/env python3
"""Rebuild accessible travel SVGs and site data from the CSV, without dependencies."""
import argparse
import csv
import html
import json
import math
from pathlib import Path
from travel_map import create_route_map, read_routes

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = {'club', 'stadium', 'city', 'latitude', 'longitude', 'rail_minutes',
            'onward_minutes', 'total_minutes', 'changes', 'notes', 'source',
            'station', 'status', 'season', 'time_basis'}
RED, INK, MUTED = '#b8202d', '#222923', '#687069'

def read_clubs(path):
    with path.open(encoding='utf-8', newline='') as file:
        reader = csv.DictReader(file)
        missing = REQUIRED - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f'Missing CSV fields: {", ".join(sorted(missing))}')
        clubs, seen = [], set()
        for line, raw in enumerate(reader, start=2):
            row = {key: value.strip() for key, value in raw.items()}
            if not row['club'] or row['club'] in seen:
                raise ValueError(f'Line {line}: missing or duplicate club')
            seen.add(row['club'])
            for key in ('stadium', 'city', 'notes', 'season', 'time_basis'):
                if not row[key]:
                    raise ValueError(f'Line {line}: {key} is required')
            for key, low, high in [('latitude', 49, 56), ('longitude', -7, 2)]:
                value = float(row[key])
                if not math.isfinite(value) or not low <= value <= high:
                    raise ValueError(f'Line {line}: invalid {key}')
                row[key] = value
            for key in ('rail_minutes', 'onward_minutes', 'total_minutes', 'changes'):
                value = row[key]
                if value and (not value.isdigit() or int(value) < 0):
                    raise ValueError(f'Line {line}: {key} must be a nonnegative integer or blank')
                row[key] = int(value) if value else None
            if row['status'] == 'placeholder':
                if any(row[key] is not None for key in ('rail_minutes', 'onward_minutes', 'total_minutes', 'changes')):
                    raise ValueError(f'Line {line}: placeholders must leave timings and changes blank')
            elif row['status'] == 'sourced_benchmark':
                if any(row[key] is None for key in ('rail_minutes', 'onward_minutes', 'total_minutes', 'changes')):
                    raise ValueError(f'Line {line}: sourced journeys need complete timings')
                if row['rail_minutes'] <= 0 or row['total_minutes'] != row['rail_minutes'] + row['onward_minutes']:
                    raise ValueError(f'Line {line}: total must equal rail + onward and rail must be positive')
                if not row['station'] or not row['source'].startswith('https://'):
                    raise ValueError(f'Line {line}: sourced journeys need station and HTTPS sources')
            else:
                raise ValueError(f'Line {line}: unknown status {row["status"]}')
            row['origin'] = 'Exeter St Davids'
            clubs.append(row)
    if not clubs:
        raise ValueError('CSV has no clubs')
    return sorted(clubs, key=lambda club: (club['total_minutes'] is None, club['total_minutes'] or 0, club['club']))

def label(minutes):
    return f'{minutes // 60}h {minutes % 60:02d}m'

def svg(width, height, title, description, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" '
            f'aria-labelledby="title desc"><title id="title">{html.escape(title)}</title>'
            f'<desc id="desc">{html.escape(description)}</desc>'
            '<style>text{font-family:Arial,sans-serif} .small{font-size:13px;fill:#687069}</style>' + body + '</svg>')

def ranking(clubs):
    rows = [club for club in clubs if club['total_minutes'] is not None]
    height = 115 + len(rows) * 70
    max_time = max((club['total_minutes'] for club in rows), default=300)
    body = '<text x="24" y="28" font-size="13" fill="#687069">EXETER ST DAVIDS → STADIUM</text>'
    for i, club in enumerate(rows):
        y = 63 + i * 70
        highlight = club['club'] == 'Brentford'
        color = RED if highlight else '#788779'
        if highlight:
            body += f'<rect x="12" y="{y-22}" width="676" height="64" rx="4" fill="#b8202d" fill-opacity=".055"/>'
        name = 'Brighton & Hove Albion' if club['club'].startswith('Brighton') else club['club']
        body += f'<text x="24" y="{y}" font-size="17" font-weight="{700 if highlight else 400}" fill="{color if highlight else INK}">{html.escape(name)}</text>'
        x, width = 250, 325 * club['total_minutes'] / max_time
        rail_width = width * club['rail_minutes'] / club['total_minutes']
        body += f'<rect x="{x}" y="{y-13}" width="{rail_width:.2f}" height="20" rx="2" fill="{color}"/>'
        body += f'<rect x="{x+rail_width:.2f}" y="{y-13}" width="{width-rail_width:.2f}" height="20" fill="{color}" fill-opacity=".28"/>'
        body += f'<text x="663" y="{y+3}" text-anchor="end" font-size="17" fill="{INK}" font-weight="600">~{label(club["total_minutes"])}</text>'
        body += f'<text x="24" y="{y+23}" class="small">{html.escape(club["station"])} · {club["changes"]} rail change{"s" if club["changes"] != 1 else ""}</text>'
    if not rows:
        body += '<text x="24" y="70" font-size="18">No sourced journeys yet. Add complete CSV entries to generate a ranking.</text>'
    body += f'<rect x="24" y="{height-37}" width="12" height="12" fill="#788779"/><text x="43" y="{height-27}" class="small">Published fastest rail</text>'
    body += f'<rect x="228" y="{height-37}" width="12" height="12" fill="#788779" fill-opacity=".28"/><text x="247" y="{height-27}" class="small">Approximate walk</text>'
    return svg(700, height, 'Sourced faster-connection comparison from Exeter',
               f'{len(rows)}-club sourced sample, not an all-club ranking. Published fastest rail times plus approximate stadium walks. ' + '; '.join(f'{c["club"]}: {label(c["total_minutes"])}' for c in rows), body)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--csv', type=Path, default=ROOT / 'data/club_travel_from_exeter.csv')
    parser.add_argument('--output', type=Path, default=ROOT / 'public/generated')
    args = parser.parse_args()
    clubs = read_clubs(args.csv)
    routes = read_routes(clubs)
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / 'travel-ranking.svg').write_text(ranking(clubs), encoding='utf-8')
    (args.output / 'travel-map.svg').write_text(create_route_map(clubs, routes), encoding='utf-8')
    for route in routes['routes']:
        (args.output / f"travel-map-{route['id']}.svg").write_text(create_route_map(clubs, routes, route['id']), encoding='utf-8')
    big_six = {club['name'] for club in json.loads((ROOT / 'data/big_six.json').read_text(encoding='utf-8'))}
    candidates = [club for club in clubs if club['club'] not in big_six]
    candidate_routes = {**routes, 'routes': [route for route in routes['routes'] if route['club'] not in big_six]}
    (args.output / 'travel-ranking-shortlist.svg').write_text(ranking(candidates), encoding='utf-8')
    (args.output / 'travel-map-shortlist.svg').write_text(create_route_map(candidates, candidate_routes), encoding='utf-8')
    for route in candidate_routes['routes']:
        (args.output / f"travel-map-shortlist-{route['id']}.svg").write_text(create_route_map(candidates, candidate_routes, route['id']), encoding='utf-8')
    (args.output / 'travel-data.json').write_text(json.dumps({'origin':'Exeter St Davids','season':clubs[0]['season'], 'clubs':clubs, 'routes':routes['routes'], 'route_basis':routes['basis']}, ensure_ascii=False, indent=2), encoding='utf-8')
    (args.output / 'club_travel_from_exeter.csv').write_bytes(args.csv.read_bytes())
    print(f'Validated {len(clubs)} clubs; generated ranking, map, JSON and downloadable CSV in {args.output}')

if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError) as error:
        raise SystemExit(f'Travel data validation failed: {error}')
