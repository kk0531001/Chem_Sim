// TOPICS, loaded into plain Node.
//
// src/topics.ts is the single source of topic metadata, and build-time tools
// (scripts/prerender.mjs) need it outside a browser. It cannot simply be
// imported: renderTopicCard() pulls in framework.ts, which imports KaTeX's
// stylesheet, and Node cannot load a .css file. So transpile it with the
// compiler API and stub the DOM-facing imports — the same trick as
// scripts/test-router.mjs, and sound for the same reason: none of those
// imports RUNS at module load, so a stub is enough to reach the data.
//
// If topics.ts grows a new import, add it to the rewrite list below or this
// throws at load with the missing specifier named — never a silent empty list.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import ts from 'typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = mkdtempSync(join(tmpdir(), 'chemprep-topics-'));

writeFileSync(join(scratch, 'stub.mjs'),
  'export const h = () => ({});\nexport const topicIconSVG = () => "";\nexport const CLOCK_ICON = "";\n' +
  'export const ID_PREFIX = {};\nexport const MODULE_QUIZ_SIZE = {};\n' +
  'export const PAGE_QUESTION_IDS = {};\nexport const solvedOf = () => 0;\n' +
  'export const solvedWithPrefix = () => 0;\nexport const onProgressChange = () => {};\n' +
  'export const activeMode = () => "all";\nexport const inScope = () => true;\n' +
  'export const onModeChange = () => {};\nexport const MODE_SHORT = {};\n');

function transpile(srcPath, outName, rewrites = {}) {
  let src = ts.transpileModule(readFileSync(join(ROOT, srcPath), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  for (const [from, to] of Object.entries(rewrites)) src = src.split(`'${from}'`).join(`'${to}'`);
  writeFileSync(join(scratch, outName), src);
  return import(pathToFileURL(join(scratch, outName)).href);
}

export const { TOPICS } = await transpile('src/topics.ts', 'topics.mjs', Object.fromEntries(
  ['./tabs/framework', './icons', './content/topicIds', './content/counts', './content/pageQuestions', './progress', './mode']
    .map(m => [m, './stub.mjs'])));

// topicIds.ts and guides.ts import nothing at all (guides.ts's one import is a
// TYPE, which transpiles away), so they load as they are. `compsForDifficulty`
// is the scope rule the guide pages filter modules with — imported rather than
// re-implemented here, because two copies of "is this module on that syllabus"
// would drift apart silently.
export const { compsForDifficulty } = await transpile('src/content/topicIds.ts', 'topicIds.mjs');
export const { GUIDES, guideNoscript } = await transpile('src/guides.ts', 'guides.mjs');
