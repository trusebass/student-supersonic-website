# Student Supersonic · ETH Zürich

Website of a student team at ETH Zürich building a sub-25 kg jet that flies faster than sound in level flight, lands, and flies again the same day. Static [Astro](https://astro.build) site, hosted on Cloudflare Workers. Same stack as thesunwilldie.com.

## First run

```sh
npm install
npm run dev        # http://localhost:4321
```

`npm run build` writes the site to `dist/`; `npm run preview` serves that build. Measure anything performance-related on the build, not on `npm run dev`.

## Layout

```
src/
  pages/index.astro       the front page: hero + five sections (mission, race, problems, roadmap, join)
  pages/404.astro         not-found page
  data/home.ts            the lists on the front page: target specs, teams, disciplines, roadmap
  site.config.ts          name, domain, email address, mailto templates, outside links
  components/Hero.astro   the hero: headline, instrument strip, throttle; wires up the simulation
  components/Header.astro, Footer.astro, Mark.astro (the logo mark)
  scripts/mach-cone.js    the live Mach-cone simulation behind the hero (all tuning in DEFAULTS)
  styles/global.css       tokens (colours, type, spacing) and all layout
  layouts/Base.astro      <head>, fonts, frame
public/
  favicon.svg, og.png (link preview, 1200 x 630), robots.txt
design-inspiration/       Etienne's brand guide and recruiting poster (PDF, internal)
```

## Changing the copy

- Headline and lede: `src/components/Hero.astro`.
- Section text: `src/pages/index.astro`.
- Specs, teams, disciplines, roadmap: `src/data/home.ts`.
- Email address and the email templates: `src/site.config.ts`.

Open questions are marked `TODO(Sebastian)` in the source. They are invisible on the page; clear them before going live.

## Deploying on Cloudflare

1. Push this folder to a new GitHub repository.
2. Cloudflare dashboard > Workers & Pages > Create application > Import a repository. Pick the repository.
3. Build command `npx astro build`, deploy command `npx wrangler deploy`. Save and deploy.
4. Domain: once the domain is a zone in the same Cloudflare account, open the Worker > Settings > Domains & Routes > Add > Custom domain. (Or uncomment the `routes` block in `wrangler.jsonc`.)
5. Email: Cloudflare > the domain > Email > Email Routing. Forward the address in `src/site.config.ts` (`join@…`) to your inboxes.

After that, every push to `main` deploys. `npm run deploy` deploys from the terminal instead.

## The hero

`src/scripts/mach-cone.js` draws sound wavefronts from a point moving at Mach M on a 2D canvas. Below Mach 1 they bunch up ahead of the aircraft; above Mach 1 their envelope is the Mach cone, half-angle μ = arcsin(1/M). The page loads at Mach 0.6, accelerates through Mach 1 (slowing near it, like the transonic drag rise), and holds at 1.4. The throttle in the instrument strip sets the speed.

| Constant in `DEFAULTS` | Effect |
| --- | --- |
| `sound` | speed of sound on screen, in screen lengths per second |
| `emitEvery`, `life`, `ringAlpha` | how often a wavefront is sent, how long it lives, how bright it starts |
| `startMach`, `cruiseMach`, `runUpAfter` | the run-up on load |
| `accel`, `ease`, `dragRise`, `dragWidth` | how Mach follows the throttle, and how much it hesitates at Mach 1 |
| `minMach`, `maxMach` | throttle range |
| `apex` | where the aircraft sits, for wide and narrow screens |

It pauses when the hero is off screen or the tab is hidden. With reduced motion turned on, it draws one still frame and redraws only when the throttle moves.
