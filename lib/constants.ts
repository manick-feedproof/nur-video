export const VIDEO_CATEGORIES = [
  "Semua",
  "Pernapasan",
  "Meditasi",
  "Yoga Lansia",
  "Senam Ringan",
  "Musik Relaksasi",
] as const;

export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];
