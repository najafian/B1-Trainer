/**
 * The offline corpus, one file per station per kind.
 *
 * Metro cannot glob at build time, so every station file is listed explicitly.
 * When you add a station, add its three imports and spread them below.
 *
 * Target: 10 variants per station per kind. `npm run check:content` reports
 * the gap.
 */
import type {
  PictureTask,
  ReadingTask,
  WritingTask,
} from '../../../2-domain/models/content';

import station01Picture from './stations/01-picture.json';
import station01Reading from './stations/01-reading.json';
import station01Writing from './stations/01-writing.json';

export const readingSeed: ReadingTask[] = [...station01Reading];
export const writingSeed: WritingTask[] = [...station01Writing];
export const pictureSeed: PictureTask[] = [...station01Picture];
