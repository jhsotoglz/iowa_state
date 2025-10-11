"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ---------- Types ---------- */
type Review = {
  _id: string;
  companyName: string;
  comment: string;
  rating: number; // integer 1–5
  major?: string;
  createdAt: string;
};

export default function ReviewsPage() {
  const [q, setQ] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const seen = useRef<Set<string>>(new Set());

  // Load initial reviews
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/backend/reviews?limit=50", { cache: "no-store" });
        const data = await res.json();
        const list: Review[] = data?.reviews ?? [];
        setReviews(list);
        for (const r of list) seen.current.add(r._id);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Real-time stream
  useEffect(() => {
    const es = new EventSource("/backend/reviews/stream");
    es.onmessage = (evt) => {
      try {
        const r: Review = JSON.parse(evt.data);
        if (seen.current.has(r._id)) return;
        seen.current.add(r._id);
        setReviews((old) => [r, ...old]);
      } catch {
        /* ignore malformed */
      }
    };
    return () => es.close();
  }, []);

  // Local search/filter
  const filtered = useMemo(() => {
    if (!q.trim()) return reviews;
    const needle = q.trim().toLowerCase();
    return reviews.filter(
      (r) =>
        r.companyName.toLowerCase().includes(needle) ||
        (r.major ?? "").toLowerCase().includes(needle) ||
        r.comment.toLowerCase().includes(needle)
    );
  }, [q, reviews]);

  return (
    <main className="min-h-screen bg-base-200">
      <div className="mx-auto max-w-3xl p-6 space-y-4">
        <header>
          <h1 className="text-4xl font-bold mb-1">Student Reviews</h1>
          <p className="opacity-70">Real-time feedback from the career fair</p>
        </header>

        {/* Search */}
        <div className="card bg-base-100 shadow">
          <div className="card-body gap-3">
            <input
              className="input input-bordered w-full"
              placeholder="Search by company, major, or comment..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="alert">
            <span>No reviews yet.</span>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((r) => (
              <li key={r._id}>
                <ReviewCard review={r} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

/* ---------- Stars (read-only, gray) ---------- */
function StarRating({ value }: { value: number }) {
  const v = Math.max(1, Math.min(5, Math.round(value))); // clamp to 1..5

  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          aria-label={`${n} star`}
          className={`mask mask-star w-5 h-5 ${
            n <= v ? "bg-gray-300" : "bg-gray-100"
          }`}
          aria-current={n === v ? "true" : undefined}
        />
      ))}
    </div>
  );
}

/* ---------- Review Card ---------- */
function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
        {/* Company + rating stars */}
        <div className="flex items-center gap-2">
          <h2 className="card-title text-lg">{review.companyName}</h2>
          <div className="ml-auto">
            <StarRating value={review.rating} />
          </div>
        </div>

        {review.major && (
          <p className="text-sm text-gray-500 mt-1">
            <strong>Major:</strong> {review.major}
          </p>
        )}

        <p className="mt-2 text-base leading-relaxed">{review.comment}</p>
        <p className="text-xs opacity-60 mt-2">{date}</p>
      </div>
    </article>
  );
}
