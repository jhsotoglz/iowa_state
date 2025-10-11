export type ReviewDoc = {
  _id: string;
  email: string;        // used internally to edit/delete reviews, not shown in UI
  companyName: string;
  comment: string;      // ≤ 200 chars
  rating: number;       // 1–5
  major?: string;       // e.g. "SE", "EE"
  createdAt: string;    // ISO date
};
