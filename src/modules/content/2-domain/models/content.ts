/**
 * Offline exam content. Everything a station needs is shipped with the app and
 * read from SQLite - no network call is required to study a day.
 */

/** Ten variants per station per kind, so a day can be repeated without repeats. */
export const VARIANTS_PER_STATION = 10;

export type ContentKind = 'reading' | 'writing' | 'picture';

export const CONTENT_KINDS: ContentKind[] = ['reading', 'writing', 'picture'];

type BaseTask = {
  id: string;
  station: number;
  /** 0..VARIANTS_PER_STATION-1 */
  variant: number;
};

export type ReadingQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type ReadingTask = BaseTask & {
  title: string;
  text: string;
  questions: ReadingQuestion[];
};

export type WritingTask = BaseTask & {
  prompt: string;
  /** Beschwerde, Bitte, Entschuldigung, Einladung ... */
  emailType: string;
  minWords: number;
  /** The model email shown after submission. */
  modelAnswer: string;
};

export type PictureTask = BaseTask & {
  /** Key of a bundled image asset, resolved by the presentation layer. */
  imageRef: string;
  /** The four-paragraph exam-style description. */
  description: string;
  attribution?: string;
};

/** What a station can offer today, one variant of each kind. */
export type DailyContent = {
  station: number;
  reading: ReadingTask | null;
  writing: WritingTask | null;
  picture: PictureTask | null;
};

/** How much of the required offline corpus actually exists. */
export type ContentCoverage = {
  kind: ContentKind;
  present: number;
  required: number;
};
