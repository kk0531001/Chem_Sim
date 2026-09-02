// Competition landing pages (ROADMAP I.3) — "CCC Study Guide", "USNCO Study
// Guide". These are the two phrases with real search demand, and the page they
// should land on is assembled entirely from content that already exists: the
// modules on that syllabus, the practice banks, the mock papers.
//
// PURE DATA, NO IMPORTS beyond a type. scripts/prerender.mjs loads this file in
// Node to bake the pages into dist/, and every value import would be another
// thing to stub there. Everything derived — which modules are in scope, how
// many questions — is derived where it is rendered, not stored here.
//
// What this file must NOT do is state exam mechanics that go stale: dates,
// scoring, time limits, qualification rules. Those change year to year, they
// are the organiser's to publish, and a study guide that quotes them wrongly is
// worse than one that doesn't. Every guide links to the official page instead.
import type { Comp } from './content/topicIds';

export interface Guide {
  comp: Comp;
  /** The URL: /guide/<slug>. Chosen to match what people actually search. */
  slug: string;
  /** <h1> and <title> — the search phrase, said back plainly. */
  title: string;
  /** <meta name="description">, and the page's own standfirst. */
  description: string;
  /** Opening paragraph. Inline markup allowed. */
  lede: string;
  /** What the contest is, in the site's own words. Inline markup allowed. */
  about: string;
  official: { label: string; href: string };
  /** How to use THIS site for THIS contest — the part a generic page can't give. */
  plan: { heading: string; body: string }[];
}

export const GUIDES: Guide[] = [
  {
    comp: 'ccc',
    slug: 'ccc-study-guide',
    title: 'CCC Study Guide — Canadian Chemistry Contest',
    description: 'A free, interactive study guide for the Canadian Chemistry Contest: the modules that cover the syllabus, hundreds of worked practice questions, and full-length mock papers.',
    lede: 'Everything on this site that is in scope for the <b>Canadian Chemistry Contest</b>, in the order worth working through it — with the simulations, worked answers and mock papers attached.',
    about: 'The CCC is the Chemistry Institute of Canada\'s national high-school contest, and the route into the Canadian Chemistry Olympiad and eventually the IChO team. It rewards a solid command of the core — stoichiometry, gases, thermochemistry, equilibrium, acids and bases, redox, bonding and introductory organic — far more than it rewards exotic topics. Depth in the fundamentals is what moves a score.',
    official: { label: 'Contest details and past papers (Chemistry Institute of Canada)', href: 'https://www.cheminst.ca/awards/ncw/chemistry-contest/' },
    plan: [
      {
        heading: 'Switch the site into CCC mode first',
        body: 'The button below sets the competition mode, which filters questions, practice ladders and the recommended next lesson to what is actually in scope. Modules beyond the syllabus stay visible and get marked "Beyond CCC" rather than disappearing — you should know what is out of scope, not be unable to find it.',
      },
      {
        heading: 'Work the foundations until the simulations are boring',
        body: 'Start at Moles & Solutions and work along the Foundations and Physical Chemistry groups. Every module has a simulation with missions attached; when you can predict what the sim will do before you drag the slider, that topic is done. That is a better completion test than a score.',
      },
      {
        heading: 'Then practise in exam format, not in topic order',
        body: 'The Question Bank holds Part I multiple choice and Part II written problems, split the way the paper is. Mixing topics is the point — recognising which idea a question is about is most of the difficulty, and a topic-by-topic drill quietly does that step for you.',
      },
      {
        heading: 'Finish with whole papers, timed',
        body: 'Five original full-length mock papers live under Olympiad Questions, each with Part A multiple choice and Part B written. Sit one under time before you look at anything, then use Your Progress to find the weak topics and go back to those modules. The real past papers are linked there too.',
      },
    ],
  },
  {
    comp: 'usnco',
    slug: 'usnco-study-guide',
    title: 'USNCO Study Guide — U.S. National Chemistry Olympiad',
    description: 'A free, interactive study guide for the U.S. National Chemistry Olympiad: syllabus modules with simulations, exam-format practice including lab scenarios, and full mock papers.',
    lede: 'Everything on this site that is in scope for the <b>U.S. National Chemistry Olympiad</b>, in a workable order — with simulations, worked answers, lab-practical scenarios and mock papers attached.',
    about: 'The USNCO is the American Chemical Society\'s olympiad programme, run in stages from a local exam through the national exam to the study camp and the IChO team. Its national exam is unusual in testing three different things separately — multiple choice, extended written problems, and a laboratory practical — so preparation that is only "more problems" leaves a third of it untouched.',
    official: { label: 'Program details, past exams and study materials (ACS)', href: 'https://www.acs.org/education/olympiad.html' },
    plan: [
      {
        heading: 'Switch the site into USNCO mode first',
        body: 'The button below sets the competition mode, which filters questions and practice ladders to what is in scope. USNCO reaches further than the CCC into kinetics, electrochemistry and organic mechanism, and the mode is what keeps the harder CCO-level material from crowding your practice.',
      },
      {
        heading: 'Cover the physical chemistry properly',
        body: 'Thermodynamics, equilibrium, kinetics and electrochemistry carry disproportionate weight, and they are where a shaky mental model shows up fastest. Each of those modules has a simulation: use it until the sign conventions and the limiting cases are something you can reason about rather than recall.',
      },
      {
        heading: 'Do not skip the lab practical',
        body: 'Part III is a laboratory exam, and it is the part most self-study misses entirely. Laboratory Skills and Analytical Chemistry cover the technique, and the Question Bank has a Part III section of lab scenarios — titration errors, gravimetry, spectrophotometry, uncertainty — written in the same shape as the real thing.',
      },
      {
        heading: 'Then whole papers, timed, and follow the weak topics back',
        body: 'Five original full-length mock papers sit under Olympiad Questions. Sit one under time, then let Your Progress point at the topics you actually lost marks in — personalised review is built from your own wrong answers rather than from a generic revision list.',
      },
    ],
  },
  {
    comp: 'cco',
    slug: 'cco-study-guide',
    title: 'CCO Study Guide — Canadian Chemistry Olympiad',
    description: 'A free, interactive study guide for the Canadian Chemistry Olympiad: the advanced modules, multi-step problem sets with full worked solutions, and integrated challenges that mix two areas at once.',
    lede: 'Everything on this site that is in scope for the <b>Canadian Chemistry Olympiad</b>, in the order worth working through it — the advanced modules, the problem sets, and the challenges that deliberately cross topic boundaries.',
    about: 'The CCO is the selection round beyond the Canadian Chemistry Contest, and the step up is not simply more questions. Where the CCC asks whether you know a thing, the CCO asks you to carry a result through several stages — a formation constant into a solubility, a rate law into a mechanism, a lattice energy into a Born–Haber cycle — and to write the reasoning down. Recall gets you into the room; chaining gets you a mark.',
    official: { label: 'Canadian Chemistry Olympiad — official page (CIC)', href: 'https://www.cheminst.ca/programs/national-chemistry-olympiad/' },
    plan: [
      {
        heading: 'Switch the site into CCO mode first',
        body: 'The button below sets the competition mode, which widens the practice to the CCO-level material and keeps the ladders pitched there. Everything in scope for the CCC is in scope for the CCO too — the mode adds, it does not swap — so the foundations stay available when a gap shows up.',
      },
      {
        heading: 'Work the advanced modules, not just the core ones',
        body: 'Advanced Physical Chemistry, Coordination &amp; Organometallic, Advanced Inorganic, Organic III and Structure Determination exist for this level. They are where the CCO actually lives: term symbols, the trans effect, Woodward–Hoffmann, retrosynthesis, and reading a structure out of combined spectra rather than being handed it.',
      },
      {
        heading: 'Then the problem sets, with the solutions covered',
        body: 'The Question Bank has CCO Problem Sets — multi-part written problems with a worked solution for every part. Cover the solution and write yours out in full first. The marks at this level are in the working, and a part you can follow when you read it is not the same as one you can produce.',
      },
      {
        heading: 'Finish with the Integrated Challenges',
        body: 'These deliberately mix two areas in one problem — thermodynamics with equilibrium, electrochemistry with solubility, crystal field with magnetism. They are the closest thing here to how an olympiad problem is actually built, and they are the fastest way to find out that two topics you know separately do not yet connect.',
      },
    ],
  },
  {
    comp: 'icho',
    slug: 'icho-study-guide',
    title: 'IChO Study Guide — International Chemistry Olympiad',
    description: 'A free, interactive study guide for the International Chemistry Olympiad: the advanced physical, inorganic and organic modules, quantitative problem sets, and the laboratory technique the practical exam assumes.',
    lede: 'Everything on this site pitched at <b>International Chemistry Olympiad</b> level — the advanced modules, the hardest problem sets, and the technique the practical assumes you already have.',
    about: 'The IChO is the international final, reached through a national programme, and its published preparatory problems are the honest measure of the level. Two things separate it from national rounds: the theoretical paper expects you to work inside an unfamiliar system that the problem itself defines, and there is a full laboratory examination. Neither rewards recall on its own.',
    official: { label: 'International Chemistry Olympiad — official site', href: 'https://www.ichosc.org/' },
    plan: [
      {
        heading: 'Be honest about the prerequisite',
        body: 'This site is built for the CCC, USNCO and CCO, and its IChO-level material is the top of that range rather than a complete preparation. It is a good place to make the advanced foundations solid and a poor substitute for the official preparatory problems, which are the only thing pitched exactly at the exam. Use both, in that order.',
      },
      {
        heading: 'Make the physical chemistry properly quantitative',
        body: 'Advanced Physical Chemistry and Physical &amp; Biochemistry carry the material an IChO problem assumes without stating: activity against concentration, van \'t Hoff and Kirchhoff, Eyring, enzyme and multi-step kinetics. Work them until the algebra is something you can rearrange under pressure rather than recognise.',
      },
      {
        heading: 'Structure determination, from data alone',
        body: 'The Structure Determination and Spectroscopy modules build the one skill the written papers use most: taking a molecular formula, an IR band, a coupling pattern and a fragment mass, and arriving at a structure nobody has named for you. The Integrated Challenges pair it with synthesis.',
      },
      {
        heading: 'Do not treat the practical as an afterthought',
        body: 'A full laboratory exam is half of what the IChO measures and cannot be learned from a screen. Laboratory Techniques and Analytical &amp; Quantitative cover the reasoning behind the technique — why a burette is rinsed with titrant, where a gravimetric result drifts, how uncertainties combine — so that time at a real bench is spent on the hands rather than on the theory.',
      },
    ],
  },
];

export const guideBySlug = (slug: string): Guide | undefined => GUIDES.find(g => g.slug === slug);
export const guideForComp = (comp: Comp): Guide | undefined => GUIDES.find(g => g.comp === comp);

/**
 * The `<noscript>` body prerendered into the page (I.1), so a crawler that
 * runs no JavaScript still gets the guide rather than an empty document.
 *
 * Lives here, in the data file, rather than next to the DOM builder in
 * guide.ts: scripts/prerender.mjs has to call it in Node, and guide.ts reaches
 * KaTeX's stylesheet through framework.ts. `modules` is passed in because the
 * scope rule belongs to topicIds.ts, not here.
 */
export function guideNoscript(
  g: Guide, modules: readonly { slug: string; title: string; blurb: string }[],
): string {
  return `<h1>${g.title}</h1>
<p>${g.lede}</p>
<h2>About the contest</h2>
<p>${g.about}</p>
<p><a href="${g.official.href}">${g.official.label}</a></p>
<h2>How to prepare</h2>
<ol>${g.plan.map(s => `<li><b>${s.heading}</b> — ${s.body}</li>`).join('\n')}</ol>
<h2>Modules in scope (${modules.length})</h2>
<ul>${modules.map(m => `<li><a href="/topic/${m.slug}">${m.title}</a> — ${m.blurb}</li>`).join('\n')}</ul>`;
}
