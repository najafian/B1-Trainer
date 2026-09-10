/** A single stop on Linie B1 - one topic day of the 45-day plan. */
export type Station = {
  /** 1..45, in travel order. */
  number: number;
  titleDe: string;
  /** Every 5th station is a review day (`--wiederholung`). */
  isReview: boolean;
  /** Days 15, 30 and 45 run the full `--simulation`. */
  isExamDay: boolean;
  /**
   * False while the title is still placeholder text. The real 45 topics come
   * from OIF_B1_Day_Feature_Overview.md, which is not yet in this repo.
   */
  titleConfirmed: boolean;
};

/** Where the passenger is, relative to a station. */
export type StationStatus = 'reached' | 'current' | 'ahead';

export const TOTAL_STATIONS = 45;
