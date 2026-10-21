// Lists shown on the front page. Prose lives in src/pages/index.astro.
// Rule for every line here (from the brand guide): keep targets, simulations
// and results apart. Nothing has flown yet, so everything is a target.

import { SITE, MAIL } from '../site.config';

/** The flight we are building toward. These are the Boom Prize rules
 *  (boomsupersonic.com/prize, sections 3.1 to 3.6), which we hold ourselves to. */
export const TARGET = [
  { label: 'Takeoff mass', value: '≤ 25 kg', note: 'Everything that leaves the ground, fuel and landing gear included.' },
  { label: 'Speed', value: 'Mach ≥ 1.0', note: 'True Mach, net of measurement error. Around 1,225 km/h at sea level.' },
  { label: 'Duration', value: '≥ 5 s', note: 'Sustained, in level or climbing flight. Diving to gain speed does not count.' },
  { label: 'Propulsion', value: 'Air-breathing', note: 'Turbojet, turbofan, ramjet, pulsejet or ducted fan. No rockets.' },
  { label: 'Reuse', value: '2 flights, 1 day', note: 'Same aircraft, opposite headings, a controlled landing in between.' },
  { label: 'Control', value: 'Remote pilot', note: 'A human in the loop, able to abort at any moment.' },
];

/** The problem split into the parts a person can own. */
export const DISCIPLINES = [
  {
    id: 'AERO',
    title: 'Aerodynamics',
    text: 'Drag climbs steeply as the airflow approaches Mach 1. Shape an airframe that pushes through the transonic drag rise and stays stable on the other side.',
    tags: ['CFD', 'area rule', 'stability'],
  },
  {
    id: 'PROP',
    title: 'Propulsion',
    text: 'Find or build a turbojet light enough to carry and strong enough to get there. Then the inlet, the nozzle, and perhaps an afterburner.',
    tags: ['turbojets', 'inlets', 'nozzles'],
  },
  {
    id: 'STRUCT',
    title: 'Structures',
    text: 'Engine, fuel, airframe and landing gear share 25 kg. Build it light, build it to survive a landing, build it to fly twice in one day.',
    tags: ['composites', 'loads', 'manufacturing'],
  },
  {
    id: 'AVIONICS',
    title: 'Avionics & control',
    text: 'Fly it remotely at over 1,200 km/h and prove the number afterwards: air data, telemetry, flight control and a ground station.',
    tags: ['air data', 'telemetry', 'flight control'],
  },
  {
    id: 'OPS',
    title: 'Operations & partners',
    text: 'Nothing flies supersonic without airspace, permits, a safety case and money. Find the range, the sponsors and the story.',
    tags: ['permits', 'sponsors', 'media'],
  },
];

/** Teams in the race. `status` drives the dot: forming, flying, open. */
export const TEAMS = [
  {
    where: 'ETH Zürich',
    name: SITE.name,
    status: 'forming',
    text: 'That is us. Building the core team this semester.',
    href: '#join',
    cta: 'get involved',
  },
  {
    // TODO(Sebastian): talk to Phantum before going live; they may want different wording.
    where: 'TU München',
    name: 'Phantum',
    status: 'flying',
    text: 'Flying Weasel, a 9 kg electric aircraft. A jet version is in development.',
    href: SITE.links.phantum,
    cta: 'phantum.eu',
  },
  {
    where: 'Your university',
    name: 'Open',
    status: 'open',
    text: 'Start a team. Same rules, same bar. We share what we learn.',
    href: MAIL.university,
    cta: 'start a team',
  },
];

/** Where we are. The left column always holds time; later phases have none yet. */
export const ROADMAP = [
  { when: 'Autumn 2026', phase: 'Team', text: 'Form the core team at ETH. Talk to teams at other universities.', now: true },
  { when: 'Next', phase: 'Concept', text: 'Trade studies: engine, airframe, mass budget. First partners and a workshop.' },
  { when: 'Then', phase: 'Subsonic testbed', text: 'Fly the avionics, the ground station and the procedures on a slower aircraft.' },
  { when: 'Then', phase: 'Transonic', text: 'Push toward Mach 0.9 and measure the drag rise we designed for.' },
  { when: 'Goal', phase: 'Mach 1, twice', text: 'Supersonic in level flight for five seconds, land, refuel, and do it again.' },
];
