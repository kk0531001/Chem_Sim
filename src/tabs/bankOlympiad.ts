// Olympiad Questions — five full-length ORIGINAL mock papers written to match the
// structure and difficulty of the Canadian Chemistry Contest (Part A: 25 multiple
// choice; Part B: written multi-part), plus a sorted link panel to the OFFICIAL
// past papers hosted by the Chemical Institute of Canada. Nothing here is copied
// from real papers — the official questions remain copyright of the CIC and are
// only LINKED, never reproduced. Match format/difficulty only.
import type { QuizQ } from './framework';
import type { FRQ } from './bankPart2';
import { paper1 } from './olympiadPaper1';
import { paper2 } from './olympiadPaper2';
import { paper3 } from './olympiadPaper3';
import { paper4 } from './olympiadPaper4';
import { paper5 } from './olympiadPaper5';

export interface OlympiadPaper {
  id: string;
  label: string;
  blurb: string;
  partA: QuizQ[];   // 25 multiple-choice
  partB: FRQ[];     // written, multi-part with worked solutions
}

export const OLYMPIAD_PAPERS: OlympiadPaper[] = [paper1, paper2, paper3, paper4, paper5];

// ---- official past papers (LINKS ONLY — copyright CIC) ----
export interface OfficialPaper {
  competition: 'CCC' | 'CCO';
  year: number;
  part: string;   // 'A' | 'B' | 'C' | 'Full'
  url: string;
}

export const OFFICIAL_PAPERS: OfficialPaper[] = [
  { competition: 'CCO', year: 2022, part: 'Full', url: 'https://www.cheminst.ca/wp-content/uploads/2022/12/Canadian-Chemistry-Olympiad-2022-EN.pdf' },
  { competition: 'CCC', year: 2016, part: 'A', url: 'https://www.cheminst.ca/wp-content/uploads/2019/11/CCC-2016-PtA-EN.pdf' },
  { competition: 'CCC', year: 2016, part: 'B', url: 'https://www.cheminst.ca/wp-content/uploads/2019/11/CCC-2016-PtB-EN.pdf' },
  { competition: 'CCC', year: 2016, part: 'C', url: 'https://www.cheminst.ca/wp-content/uploads/2019/11/CCC-2016-PtC-EN.pdf' },
  { competition: 'CCC', year: 2017, part: 'A', url: 'https://www.cheminst.ca/wp-content/uploads/2019/11/CCC-2017-PtA-EN.pdf' },
  { competition: 'CCC', year: 2017, part: 'B', url: 'https://www.cheminst.ca/wp-content/uploads/2019/11/CCC-2017-PtB-EN.pdf' },
  { competition: 'CCC', year: 2017, part: 'C', url: 'https://www.cheminst.ca/wp-content/uploads/2019/11/CCC-2017-PtC-EN.pdf' },
  { competition: 'CCC', year: 2018, part: 'A', url: 'https://www.cheminst.ca/wp-content/uploads/2019/11/CCC-2018-PtA-EN.pdf' },
  { competition: 'CCC', year: 2018, part: 'B', url: 'https://www.cheminst.ca/wp-content/uploads/2019/11/CCC-2018-PtB-EN.pdf' },
  { competition: 'CCC', year: 2018, part: 'Full', url: 'https://www.cheminst.ca/wp-content/uploads/2021/03/Canadian-Chemistry-Contest-2018-EN.pdf' },
  { competition: 'CCC', year: 2019, part: 'A', url: 'https://www.cheminst.ca/wp-content/uploads/2019/11/CCC-2019-PtA-EN.pdf' },
  { competition: 'CCC', year: 2019, part: 'B', url: 'https://www.cheminst.ca/wp-content/uploads/2019/11/CCC-2019-PtB-EN.pdf' },
  { competition: 'CCC', year: 2019, part: 'Full', url: 'https://www.cheminst.ca/wp-content/uploads/2021/03/Canadian-Chemistry-Contest-2019-EN.pdf' },
  { competition: 'CCC', year: 2020, part: 'A', url: 'https://www.cheminst.ca/wp-content/uploads/2021/01/CCC-PtA-2020-ENG-revised-COVID19.pdf' },
  { competition: 'CCC', year: 2020, part: 'B', url: 'https://www.cheminst.ca/wp-content/uploads/2021/01/CCC-PtB-2020-ENG-final.pdf' },
  { competition: 'CCC', year: 2020, part: 'C', url: 'https://www.cheminst.ca/wp-content/uploads/2021/03/Canadian-Chemistry-Contest-2020-EN-Part-C.pdf' },
  { competition: 'CCC', year: 2021, part: 'A', url: 'https://www.cheminst.ca/wp-content/uploads/2022/01/CCC-PtA-2021-ENG-final.pdf' },
  { competition: 'CCC', year: 2021, part: 'B', url: 'https://www.cheminst.ca/wp-content/uploads/2022/01/CCC-PtB-2021-ENG-final.pdf' },
  { competition: 'CCC', year: 2021, part: 'Full', url: 'https://www.cheminst.ca/wp-content/uploads/2022/01/Canadian-Chemistry-Contest-2021-EN.pdf' },
  { competition: 'CCC', year: 2022, part: 'A', url: 'https://www.cheminst.ca/wp-content/uploads/2022/11/CCC-PtA-2022-ENG-final.pdf' },
  { competition: 'CCC', year: 2022, part: 'B', url: 'https://www.cheminst.ca/wp-content/uploads/2022/11/CCC-PtB-2022-ENG-final.pdf' },
];

const PART_ORDER: Record<string, number> = { A: 0, B: 1, C: 2, Full: 3 };

// Grouped by year (descending), then competition (CCO before CCC), then part.
export function officialByYear(): { year: number; papers: OfficialPaper[] }[] {
  const years = [...new Set(OFFICIAL_PAPERS.map(p => p.year))].sort((a, b) => b - a);
  return years.map(year => ({
    year,
    papers: OFFICIAL_PAPERS.filter(p => p.year === year).sort((a, b) =>
      a.competition === b.competition
        ? (PART_ORDER[a.part] ?? 9) - (PART_ORDER[b.part] ?? 9)
        : a.competition === 'CCO' ? -1 : 1),
  }));
}

export type { FRQ };
