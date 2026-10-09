import bigSix from '../../data/big_six.json';

export const bigSixClubNames = new Set(bigSix.map(club => club.name));

export const clubCards = [
  { id: 'arsenal', name: 'Arsenal', short: 'Arsenal', color: '#d80721', out: 1, reason: 'I wanted to start outside the traditional big six, with a club where progress against better-resourced opponents would feel particularly rewarding.' },
  { id: 'aston-villa', name: 'Aston Villa', short: 'Aston Villa', color: '#650c32', out: 3, reason: 'Villa survived the travel stage, but Birmingham was a drawback: I can’t say I’ve really enjoyed my time there, and would rather avoid another visit if I can. I’ll take the extra nine minutes to Brentford in this comparison.' },
  { id: 'bournemouth', name: 'Bournemouth', short: 'Bournemouth', color: '#c60b20', out: 5, reason: 'Bournemouth came close. Brentford and Brighton’s approaches to recruitment and development were ultimately the stronger draw for me.' },
  { id: 'brentford', name: 'Brentford', short: 'Brentford', color: '#d20a17', out: 99, reason: 'Brentford combined a journey I could contemplate from Exeter with an approach to recruitment and development I wanted to follow. The bee was an agreeable additional finding.' },
  { id: 'brighton', name: 'Brighton & Hove Albion', short: 'Brighton', color: '#0064ac', out: 6, reason: 'Brighton were a serious contender for similar reasons. I found myself more interested in following Brentford, which settled a choice that was never entirely numerical.' },
  { id: 'chelsea', name: 'Chelsea', short: 'Chelsea', color: '#151184', out: 1, reason: 'I wanted to start outside the traditional big six, with a club where progress against better-resourced opponents would feel particularly rewarding.' },
  { id: 'coventry-city', name: 'Coventry City', short: 'Coventry', color: '#83c4ed', darkText: true, out: 2, reason: 'Coventry has a relatively competitive travel benchmark. I retained Villa as my Midlands option because it interested me more; the travel shortlist combines geography with personal preference.' },
  { id: 'crystal-palace', name: 'Crystal Palace', short: 'Palace', color: '#db3329', out: 3, reason: 'Palace remained practical enough to consider at the travel stage, but the other four clubs held more of my interest when comparing their approaches.' },
  { id: 'everton', name: 'Everton', short: 'Everton', color: '#064b95', out: 2, reason: 'The journey to Liverpool felt less suited to occasional visits from Exeter. I preferred to focus on southern destinations and one Midlands option.' },
  { id: 'fulham', name: 'Fulham', short: 'Fulham', color: '#f5f5f2', darkText: true, out: 4, reason: 'Fulham was a plausible choice, but I felt more invested in the prospect of following Brentford, Brighton or Bournemouth.' },
  { id: 'hull-city', name: 'Hull City', short: 'Hull', color: '#f5a623', darkText: true, out: 2, reason: 'The length of the journey from Exeter made occasional match visits less appealing. I narrowed the search towards destinations I would be more inclined to visit.' },
  { id: 'ipswich-town', name: 'Ipswich Town', short: 'Ipswich', color: '#0057b8', out: 2, reason: 'Ipswich requires a substantial journey across the country from Exeter. Although its benchmark overlaps with retained clubs, I preferred the destinations in my geographic shortlist.' },
  { id: 'leeds', name: 'Leeds United', short: 'Leeds', color: '#fff2a3', darkText: true, out: 2, reason: 'The journey to Leeds felt less suited to the occasional match visits I had in mind. I focused on southern clubs and retained Villa as a Midlands option.' },
  { id: 'liverpool', name: 'Liverpool', short: 'Liverpool', color: '#ce0926', out: 1, reason: 'I wanted to start outside the traditional big six, with a club where progress against better-resourced opponents would feel particularly rewarding.' },
  { id: 'man-city', name: 'Manchester City', short: 'Man City', color: '#65a4d2', darkText: true, out: 1, reason: 'I wanted to start outside the traditional big six, with a club where progress against better-resourced opponents would feel particularly rewarding.' },
  { id: 'man-utd', name: 'Manchester United', short: 'Man Utd', color: '#c4081c', out: 1, reason: 'I wanted to start outside the traditional big six, with a club where progress against better-resourced opponents would feel particularly rewarding.' },
  { id: 'newcastle', name: 'Newcastle United', short: 'Newcastle', color: '#303030', out: 2, reason: 'The length of the journey from Exeter made occasional match visits less appealing. I narrowed the search towards destinations I would be more inclined to visit.' },
  { id: 'nottingham-forest', name: 'Nottingham Forest', short: 'Forest', color: '#d60023', out: 2, reason: 'Forest has a journey worth comparing, but I preferred the destinations in my six-club shortlist. This cut is a personal geographic preference rather than a timed rule.' },
  { id: 'sunderland', name: 'Sunderland', short: 'Sunderland', color: '#c51c38', out: 2, reason: 'The journey to Sunderland would make a match a substantial trip from Exeter. I wanted a club I would be more likely to visit occasionally.' },
  { id: 'spurs', name: 'Tottenham Hotspur', short: 'Spurs', color: '#efedf4', darkText: true, out: 1, reason: 'I wanted to start outside the traditional big six, with a club where progress against better-resourced opponents would feel particularly rewarding.' },
] as const;

export const selectionStages = [
  { label: 'All in', title: 'What are the options for easily watching someone down the pub?', subtitle: 'Everyone, for now.', note: '2026/27 clubs. My choice, my rules.' },
  { label: 'Big six', title: 'Starting outside the big six', subtitle: 'They’ve got enough fans.', note: 'Arsenal, Chelsea, Liverpool, City, United and Spurs.' },
  { label: 'Trains', title: 'Can I get to a match?', subtitle: 'I do need to get home.', note: 'My geographic shortlist, not a timed cutoff.' },
  { label: 'Brains', title: 'How the club works', subtitle: 'I like doing more with less.', note: 'Personal preferences. No scoring system.' },
  { label: 'Stress', title: 'A club I would care about', subtitle: 'Sorry, Fulham.', note: 'The others grabbed me more.' },
  { label: 'Nearly', title: 'The final two', subtitle: 'Bournemouth nearly had me.', note: 'Still a good choice. Just not mine.' },
  { label: 'Bees', title: 'Why Brentford fits', subtitle: 'Sorry, seagull.', note: 'Brentford felt right for me.' },
] as const;
