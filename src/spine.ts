// The spine: one ordered walk through every section of every topic.
//
// ONE source of order, not two. Topic order is `TOPICS` (src/topics.ts), the
// same array the menu, the homepage and the breadcrumb footer already read.
// Section order inside a topic is whatever that topic's module declared when it
// built its blocks — declared where the blocks are, so there is no second copy
// of the sequence to keep in sync with the page.
//
// Deliberately PURE and SYNCHRONOUS: `resolve()` takes the current topic's
// section list as an argument rather than loading it. The router has already
// imported that module in order to mount it, so nothing here needs to be async,
// and none of it needs a DOM to be tested.
import { TOPICS, type TopicMeta } from './topics';

/** One section of one topic, as declared by the topic module. */
export interface SectionDef {
  /** Permanent, named, part of the URL — never an index. Renaming breaks links. */
  slug: string;
  title: string;
}

/**
 * A link target in the spine.
 *
 * `slug: null` means "that topic's entry point" — used for a neighbour in
 * ANOTHER topic, whose section list we deliberately do not load. The router
 * resolves a null slug to that topic's first section on arrival.
 *
 * ponytail: this makes a backwards step across a topic boundary land on the
 * previous topic's FIRST section rather than its last. Fixing that properly
 * means importing the neighbouring topic module just to read its section
 * titles — a megabyte of question bank to label one button. Upgrade path: if
 * students complain about the back-step, publish section lists as a static
 * generated map at build time.
 */
export interface SectionRef {
  topicId: string;
  slug: string | null;
  /** What the Prev/Next button says: a section title, or a topic title at a boundary. */
  title: string;
  /** True when this ref crosses into another topic — the button names the topic. */
  crossesTopic: boolean;
}

export interface Position {
  topic: TopicMeta;
  current: SectionDef;
  prev: SectionRef | null;
  next: SectionRef | null;
  /** 0-based, for "Section {indexInTopic + 1} of {topicLength}". */
  indexInTopic: number;
  topicLength: number;
  /** The whole topic's list, for the stepper. */
  sections: readonly SectionDef[];
}

function ref(topicId: string, s: SectionDef): SectionRef {
  return { topicId, slug: s.slug, title: s.title, crossesTopic: false };
}

function topicRef(t: TopicMeta): SectionRef {
  return { topicId: t.id, slug: null, title: t.title, crossesTopic: true };
}

/** The section a bare `/topic/<slug>` URL, or a stale stored slug, resolves to. */
export function firstSection(sections: readonly SectionDef[]): SectionDef | null {
  return sections[0] ?? null;
}

/**
 * Where am I, and what is either side of me.
 *
 * `slug` may be null (bare topic URL) or unknown (a stale bookmark from before
 * a section was renamed) — both fall back to the topic's first section rather
 * than 404ing, because the topic itself still exists.
 *
 * Returns null only when the topic id is unknown or declares no sections at
 * all; that is a genuine 404 for the router to handle.
 */
export function resolve(
  topicId: string,
  slug: string | null,
  sections: readonly SectionDef[],
): Position | null {
  const idx = TOPICS.findIndex(t => t.id === topicId);
  const topic = TOPICS[idx];
  if (!topic || !sections.length) return null;

  const found = slug ? sections.findIndex(s => s.slug === slug) : 0;
  const i = found < 0 ? 0 : found;

  const before = sections[i - 1];
  const after = sections[i + 1];
  const prevTopic = TOPICS[idx - 1];
  const nextTopic = TOPICS[idx + 1];

  return {
    topic,
    current: sections[i],
    prev: before ? ref(topicId, before) : prevTopic ? topicRef(prevTopic) : null,
    next: after ? ref(topicId, after) : nextTopic ? topicRef(nextTopic) : null,
    indexInTopic: i,
    topicLength: sections.length,
    sections,
  };
}
