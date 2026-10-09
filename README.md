# Why Brentford?

A deliberately tacky, bee-filled, one-page joke website about choosing a football club as an adult. The serious reasons survive underneath a very unserious selection committee. The first cut removes the traditional big six (Arsenal, Chelsea, Liverpool, Manchester City, Manchester United and Tottenham), then the argument moves through attending matches from Exeter to value, analytical ownership, identity, competitiveness and an unfinished future. It is built with React, TypeScript, Vite and CSS, with Python-generated SVG travel graphics.

## Run locally

Requires Node.js 20.19+ or 22.12+ and Python 3.10+.

```bash
npm install
npm run dev
```

Vite prints the local address (normally http://127.0.0.1:5173). To inspect the production version:

```bash
npm run build
npm run preview
```

The build runs TypeScript checking before creating `dist/`. The site is a static application: no API keys, external maps, backend, tracking or account setup are needed. Typography, the licensed photograph and the map boundary are stored locally.

## Travel data and its limitations

Edit `data/club_travel_from_exeter.csv`. This is the single source of truth for journey data. Every row originates at **Exeter St Davids** and ends at the named stadium.

The dataset uses the **2026/27 Premier League club set**, checked on 8 October 2026 against the official Premier League list and its [season membership announcement](https://www.premierleague.com/en/news/4673099/the-202627-premier-league-season-officially-starts). Coventry City, Hull City and Ipswich Town replace Burnley, West Ham United and Wolverhampton Wanderers. This is a checked snapshot, not an automatically updating league feed. Fifteen rows contain sourced connection benchmarks, including all fourteen clubs left after the big-six cut; the other five big-six clubs have blank timings and an explicit `placeholder` status. Approximate stadium coordinates are for orientation, not navigation. They are distinct from the public-transport timing calculation.

The sourced values combine **published fastest station-to-station rail times** with **separately published approximate stadium walks**. These are indicative faster-connection comparisons, **not typical matchday times, guaranteed services or a complete league ranking**. For example, Exeter to Kew Bridge is published as fastest 3h05, with an all-day average of about 4h53. Adding a five-minute walk gives the displayed faster-connection benchmark of about 3h10; it does not establish that a Saturday trip takes 3h10. Check an actual date and kick-off before travelling. Add arrival time, connection resilience, queues, ticket availability, access needs and a feasible return service.

The final route via Clapham Junction is illustrative. It is not claimed to be the specific itinerary producing the 3h05 rail benchmark. The UK map outlines illustrative rail corridors through named station waypoints. An England inset enlarges the routes to all fourteen candidates. Solid coloured lines are schematic rail corridors and dotted final legs are approximate walks. These are not surveyed railway alignments. Route waypoints and sources are stored in `data/travel_routes.json`, and the published time benchmarks are independent of the exact drawn corridor.

### CSV fields

| Field | Meaning |
| --- | --- |
| `club`, `stadium`, `city` | Club and destination |
| `latitude`, `longitude` | Approximate stadium location, decimal degrees |
| `rail_minutes` | Sourced full rail journey to `station`, including interchanges |
| `onward_minutes` | Sourced approximate station-to-stadium walk |
| `total_minutes` | Must equal `rail_minutes + onward_minutes` |
| `changes` | Rail interchanges; do not count the final walk |
| `notes` | Route context, source caveats and what the estimate represents |
| `source` | HTTPS source URLs; separate rail and walking references with ` | ` |
| `station` | Final railway station |
| `status` | `sourced_benchmark` or `placeholder` |
| `season` | Explicit club-set snapshot, currently `2026/27` |
| `time_basis` | Describe the method used for the timing |

Benchmarks were researched on 8 October 2026. Everton uses rail to Liverpool Lime Street plus a visitor-guide walk; local Merseyrail connections can offer alternative access. Villa and Palace use TrainPal’s published outbound rail benchmarks; the other sourced rows use Trainline. For a missing journey, leave all four timing/change fields empty. Do not enter zero, fabricated values or a guessed rank. The generator excludes placeholders from the ranking but includes their open markers on the map and lists them as awaiting data in the accessible table.

Before updating the club set or changing from fastest-connection benchmarks to representative matchday itineraries, update the page’s season/methodology wording too. All comparable numeric rows should use the same timing basis. Record dates, departure times, interchange waits and source URLs if collecting actual itineraries.

## Regenerate travel graphics

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r analysis/requirements.txt
python analysis/create_travel_visualisations.py
```

The generator uses only the Python standard library; the requirements file documents that no packages are required. You can also run `npm run generate` without a virtual environment.

It validates required fields, unique club names, coordinates, timing types, source presence, placeholder rules and arithmetic, then sorts sourced journeys by total time. Invalid input fails before outputs are overwritten. Generated assets are saved in `public/generated/`:

- `travel-ranking.svg`: sourced faster-connection comparison with rail and walking segments.
- `travel-map.svg`: the whole UK, fifteen coloured rail corridors, an enlarged England inset, station labels and time benchmarks.
- `travel-map-{club}.svg`: fifteen focused versions for full-dataset reference.
- Route data is validated and included alongside club data in the generated JSON; coordinates and route definitions are editable in `data/travel_routes.json`.
- `travel-map-shortlist.svg`, `travel-map-shortlist-{club}.svg` and `travel-ranking-shortlist.svg`: the on-page travel comparison after the big six are removed. All fourteen remaining clubs have sourced benchmarks in the chart and always-visible table. The map illustrates all fourteen corridors, with a UK overview, England detail and numbered time labels. Full-dataset graphics and the complete CSV remain available as reference assets.
- `data/big_six.json`: the shared big-six list for the website and Python generator.
- `travel-data.json`: the same validated data for the table, chart descriptions and closing journey benchmark.
- `club_travel_from_exeter.csv`: the downloadable copy of the source CSV.

The page displays the Python-produced graphics directly and shows an always-visible table of all fourteen candidates, sorted by the same total. The route map is the default travel view, before the data table. A club picker selects any of the fourteen corridors, and numbered map markers match the travel table. England detail is shown first, with a Whole UK view and the complete poster available through Enlarge map; the numerical ranking remains on a secondary tab. Rebuild the site after regenerating before deploying.

Optional arguments:

```bash
python analysis/create_travel_visualisations.py --csv path/to/input.csv --output path/to/outputs
```

## Content, accessibility and assets

- `src/App.tsx`: the tabbed selection workspace. One stage and one badge table are visible at a time, with a short summary above the badges; top tabs and Back/Next controls move between all seven cuts without scrolling through a story. Tabs support arrow keys, Home and End. Badges and stage content occupy two full-width rows on laptops and phones. The swipeable tab selector stays visible while the selected stage is viewed, and selecting a stage brings its tab into view. Phones have fixed Back/Next controls above the safe area. Badges use three columns on narrow phones, four from 360px, five from 600px and ten from 960px. Default subheadings and unused hints are removed; badge explanations appear only after selection.
- `src/components/Dialog.tsx`: native modal dialogs for sources, extra bees and enlarged travel graphics, including Escape dismissal and focus restoration.
- `src/workspace.css`: the mobile-first tabbed layout, touch controls, badge board and dialog styles.
- A one-sentence summary is always visible above each badge board. Longer explanations remain visible below the stage content; the travel stage orders badges, map/chart, data table, then explanation. Route notes, detailed train methodology and credits remain expandable; badge verdicts stay available on click.
- `src/components/TravelAnalysis.tsx`: graphics, keyboard-accessible tabs, a native club picker, methodology, table and CSV download.
- `src/components/TravelMap.tsx`: responsive England and whole-UK map views using the existing sourced SVG artwork.
- The final tab’s explanation explains the personal criteria; these are personal reasons, not numerical scores.
- `src/data/sources.ts`: dated references, linked beside factual claims and in the sources section.
- `src/styles.css`: the base layout and accessibility styles.
- `src/bee.css`: the deliberately tacky theme: gold WordArt, checkerboard background, fluorescent panels, hazard stripes, animated bees, badge boards and responsive overrides.
- `src/components/BeeNonsense.tsx`: the compact bee slider and optional emergency bee button. The page starts with stage tabs and club badges; the former intro, ticker, awards and stadium photo are removed. The header’s bee-count control opens the slider and pause button; extra bee controls sit behind “More bees?”. The button releases a temporary burst of twelve decorative bees and cycles fictional committee announcements; its deployment count is local to the current page visit.
- The “Flying bees” slider adjusts the permanent decorative swarm from 0 to 100 bees immediately (default 3). It supports touch and keyboard controls. Its count lasts for the current page visit; pausing keeps the chosen count for when the bees resume.
- `src/components/ClubBoard.tsx`: the same 20 badges carried through seven stages, with cumulative greying-out, OUT/IN text stamps, a remaining count and clickable reasons.
- `src/data/selection.ts`: the editorial elimination sequence and personal comic explanations. Counts are 20 → 14 → 6 → 4 → 3 → 2 → 1: all clubs, big six removed, travel shortlist, brains, stress, nearly, Brentford. These are narrative preferences, not a calculated travel threshold or an objective judgement of clubs.
- `public/images/badges/`: twenty local SVG badges from the official Premier League badge CDN. The clubs retain their marks; the [current club list](https://www.premierleague.com/en/clubs) and [2026/27 membership announcement](https://www.premierleague.com/en/news/4673099/the-202627-premier-league-season-officially-starts) supply the lineup. The three promoted-club badges come from the official club pages’ `premierleague25/badges-alt/9.svg`, `88.svg` and `40.svg` assets.
- “Pause the bees” stops decorative animation, including button-triggered bee bursts. Reduced-motion preferences also suppress animation automatically; the button still updates its text response. The certificate and committee announcements are jokes, not real credentials or metrics.
- `analysis/uk_outline.geojson`: a vendored Natural Earth 1:10m United Kingdom outline, public domain. No network connection is needed to regenerate.

The image is **Brentford Community Stadium in May 2020**, by **AndyScott**, licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). [Original image and attribution](https://commons.wikimedia.org/wiki/File:Brentford_Community_Stadium_2020.jpg). The original is saved at `public/images/brentford-stadium.jpg`; CSS crops and adjusts its colour in the page. Preserve this credit and the ShareAlike licence for redistributed adaptations. Local fonts are DM Sans and DM Serif Display, under the SIL Open Font License; see `public/fonts/` for the licences.

## GitHub Pages

The website is published at https://liamjberrisford.github.io/whybrentford/.

The workflow in `.github/workflows/deploy.yml` regenerates travel graphics, checks TypeScript, builds the site and deploys `dist/` whenever `main` is updated. It can also be started manually from the Actions tab. Repository Settings → Pages must use **GitHub Actions** as the source.

Local development uses the normal root path. To check the GitHub Pages build locally:

```bash
npm run generate
VITE_BASE_PATH=/whybrentford/ npm run build
VITE_BASE_PATH=/whybrentford/ npm run preview
```

Open the preview address with `/whybrentford/` appended. `src/assets.ts` uses Vite’s configured base path for badges, maps, downloaded data and fetched travel data. Vite also adjusts fonts and other stylesheet assets. If you rename the repository or add a custom domain, update `VITE_BASE_PATH` in the workflow.

Journey updates are manual; no scheduled automation is created.

Decorative bees follow independent bounded paths with pauses, short darts, turns and a subtle body vibration. Pause and reduced-motion behavior remain available.
