"""Geographical UK and southern-detail SVGs for the deliberately silly rail investigation."""
import html
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def read_routes(clubs):
    data = json.loads((ROOT / 'data/travel_routes.json').read_text())
    names = {club['club'] for club in clubs}
    ids = set()
    for route in data['routes']:
        if route['club'] not in names or route['id'] in ids:
            raise ValueError('Route refers to an unknown club or duplicate route ID')
        ids.add(route['id'])
        if len(route['via']) < 2 or route['via'][0] != 'Exeter St Davids':
            raise ValueError('Every route must start at Exeter St Davids')
        for station in route['via']:
            if station not in data['stations']:
                raise ValueError(f'Unknown route station: {station}')
            lon, lat = data['stations'][station]
            if not -9 <= lon <= 2 or not 49 <= lat <= 61.2:
                raise ValueError(f'Invalid station coordinates: {station}')
    return data

def merc(lat):
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))

def projector(bounds, box):
    west, south, east, north = bounds
    x, y, width, height = box
    dx, dy = math.radians(east-west), merc(north)-merc(south)
    scale = min(width/dx, height/dy)
    ox, oy = x+(width-dx*scale)/2, y+(height-dy*scale)/2
    return lambda lon, lat: (ox + math.radians(lon-west)*scale, oy+(merc(north)-merc(lat))*scale)

def text(x, y, content, size=16, color='#171719', weight='400', anchor='start'):
    return f'<text x="{x:.2f}" y="{y:.2f}" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}">{html.escape(content)}</text>'

def create_route_map(clubs, route_data, selected=None):
    outline = json.loads((ROOT / 'analysis/uk_outline.geojson').read_text())
    by_name = {club['club']: club for club in clubs}
    routes = sorted(route_data['routes'], key=lambda r: by_name[r['club']]['total_minutes'] or 99999)
    numbers = {route['id']: i + 1 for i, route in enumerate(routes)}
    short_names = {'Brighton & Hove Albion': 'Brighton', 'Coventry City': 'Coventry',
                   'Crystal Palace': 'Palace', 'Hull City': 'Hull', 'Ipswich Town': 'Ipswich',
                   'Leeds United': 'Leeds', 'Newcastle United': 'Newcastle',
                   'Nottingham Forest': 'Forest'}
    width, height = 1200, max(1080, 660 + ((len(routes)+1)//2)*56)
    body = ['<style>text{font-family:Arial,sans-serif}.route{stroke-linecap:round;stroke-linejoin:round}</style>',
            f'<rect width="{width}" height="{height}" rx="16" fill="#d9f1ff"/>',
            '<defs><clipPath id="uk"><rect x="20" y="85" width="445" height="925" rx="12"/></clipPath><clipPath id="england"><rect x="486" y="105" width="690" height="440" rx="10"/></clipPath></defs>',
            text(30, 36, 'FROM EXETER TO THE FOOTBALL', 26, weight='900'),
            text(30, 63, f'United Kingdom · {len(routes)} routes · {clubs[0]["season"]}', 18, color='#334b5b'),
            '<rect x="480" y="79" width="702" height="470" rx="12" fill="#bce7fb" stroke="#171719" stroke-width="2"/>',
            text(495, 101, 'ENGLAND: ALL CLUB DESTINATIONS', 17, weight='800')]
    views = [('uk', (-8.8, 49.7, 2.1, 61.1), (25, 90, 433, 905)),
             ('england', (-5.8, 50.25, 1.9, 55.4), (490, 114, 680, 423))]
    offsets = {'brentford': (-28, -19), 'fulham': (-4, 15), 'crystal-palace': (27, 10),
               'chelsea': (13, -20), 'aston-villa': (-18, -12), 'coventry-city': (15, 10),
               'newcastle': (-16, -15), 'sunderland': (15, 12), 'brighton': (5, 18)}
    for name, bounds, box in views:
        project = projector(bounds, box)
        body.append(f'<g clip-path="url(#{name})">')
        for feature in outline['features']:
            geometry = feature['geometry']
            polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
            for polygon in polygons:
                points = [project(*point[:2]) for point in polygon[0]]
                path = 'M' + ' L'.join(f'{x:.2f},{y:.2f}' for x, y in points) + ' Z'
                body.append(f'<path d="{path}" fill="#fff2b3" stroke="#b9a771" stroke-width=".8"/>')
        # Render all corridors; the selected corridor is drawn last and the others recede.
        ordered = sorted(enumerate(routes), key=lambda item: item[1]['id'] == selected)
        for index, route in ordered:
            active = selected is None or route['id'] == selected
            color = route['color'] if active else '#91a8ae'
            offset = (index-(len(routes)-1)/2) * (0.7 if name == 'england' else .35)
            rail = [project(*route_data['stations'][station]) for station in route['via']]
            club = by_name[route['club']]
            ex, ey = project(club['longitude'], club['latitude'])
            path = 'M' + ' L'.join(f'{x:.2f},{y+offset:.2f}' for x, y in rail)
            body.append(f'<path class="route" data-club="{html.escape(route["club"])}" d="{path}" fill="none" stroke="{color}" stroke-width="{3 if name == "england" else 2}" opacity="{.85 if active else .15}"/>')
            sx, sy = rail[-1]
            body.append(f'<path class="route" d="M{sx:.2f},{sy+offset:.2f} L{ex:.2f},{ey:.2f}" fill="none" stroke="{color}" stroke-width="2.5" stroke-dasharray="3 4" opacity="{1 if active else .15}"/>')
        # Numbered pins use leaders where several destinations share a city.
        for route in routes:
            club = by_name[route['club']]
            ex, ey = project(club['longitude'], club['latitude'])
            active = selected is None or selected == route['id']
            total = club['total_minutes']
            timing = f'~{total//60}h {total%60:02d}m' if total is not None else 'Awaiting data'
            label = f'{club["club"]}: {timing}'
            body.append(f'<circle cx="{ex:.2f}" cy="{ey:.2f}" r="4" fill="{route["color"]}" stroke="#fff" stroke-width="1.5"><title>{html.escape(label)}</title></circle>')
            if name == 'england' and active:
                dx, dy = offsets.get(route['id'], (0, -12))
                px, py = ex + dx, ey + dy
                body.append(f'<path d="M{ex:.2f},{ey:.2f} L{px:.2f},{py:.2f}" stroke="{route["color"]}" stroke-width="1.5"/>')
                body.append(f'<circle cx="{px:.2f}" cy="{py:.2f}" r="10" fill="{route["color"]}" stroke="#fff" stroke-width="1.5"/>')
                body.append(text(px, py+4, str(numbers[route['id']]), 12, '#fff', '800', 'middle'))
        ox, oy = project(*route_data['stations']['Exeter St Davids'])
        body.append(f'<circle cx="{ox}" cy="{oy}" r="7" fill="#171719" stroke="#fff" stroke-width="2"/>')
        body.append(text(ox-10, oy+24, 'EXETER', 17, weight='900', anchor='middle'))
        if selected:
            route = next(r for r in routes if r['id'] == selected)
            # Limit labels to useful principal stops to keep a highlighted journey readable.
            stops = route['via'][1:-1]
            stops = stops[::max(1, len(stops)//4)]
            for station in stops:
                lon, lat = route_data['stations'][station]
                if bounds[0] <= lon <= bounds[2] and bounds[1] <= lat <= bounds[3]:
                    x, y = project(lon, lat)
                    body.append(f'<circle cx="{x}" cy="{y}" r="3" fill="#fff" stroke="#171719"/>')
                    body.append(text(x+7, y-7, station, 12, color='#334b5b'))
        elif name == 'uk':
            for label, lon, lat in [('SCOTLAND', -4.1, 57.8), ('N. IRELAND', -6.5, 54.5), ('WALES', -4.4, 52.1)]:
                x, y = project(lon, lat)
                body.append(text(x, y, label, 14, color='#425e65', anchor='middle'))
        body.append('</g>')
    body.append(text(488, 578, 'TRAIN + STADIUM WALK', 19, weight='800'))
    for index, route in enumerate(routes):
        club = by_name[route['club']]
        col, row = index % 2, index // 2
        x, y = 483 + col*352, 594 + row*56
        active = selected is None or route['id'] == selected
        color = route['color']
        body.append(f'<rect x="{x}" y="{y}" width="344" height="50" rx="6" fill="{"#fff" if active else "#e8eff0"}" stroke="{color if active else "#a8b6b9"}" stroke-width="{2 if active else 1}"/>')
        body.append(f'<circle cx="{x+18}" cy="{y+19}" r="11" fill="{color}"/>')
        body.append(text(x+18, y+23, str(numbers[route['id']]), 13, '#fff', '800', 'middle'))
        body.append(text(x+35, y+24, short_names.get(club['club'], club['club']), 16, weight='800'))
        if club['total_minutes'] is not None:
            total = club['total_minutes']
            body.append(text(x+332, y+24, f'~{total//60}h {total%60:02d}m', 18, color, '900', 'end'))
            body.append(text(x+35, y+42, f'{club["rail_minutes"]//60}h{club["rail_minutes"]%60:02d} train + ~{club["onward_minutes"]}m walk', 13, color='#425254'))
        else:
            body.append(text(x+332, y+24, 'Awaiting data', 15, anchor='end'))
    body += [text(30, height-50, 'Solid = illustrative rail corridor · dotted final leg = walk · numbered pins match the times.', 16),
             text(30, height-24, 'Published fastest train + approximate walk; check your actual matchday connections.', 16, color='#334b5b')]
    selected_name = next((route['club'] for route in routes if route['id']==selected), f'all {len(routes)} destinations')
    description = f'United Kingdom map and England enlargement showing rail corridors from Exeter St Davids to {selected_name}. Numbered destinations match published train-and-walk benchmarks. Routes are schematic, and the benchmarks do not time these exact illustrated corridors.'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">'
            f'<title id="title">Exeter to {html.escape(selected_name)}: rail corridors and travel benchmarks</title><desc id="desc">{html.escape(description)}</desc>'+''.join(body)+'</svg>')
