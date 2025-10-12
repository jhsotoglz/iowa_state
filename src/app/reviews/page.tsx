"use client";

import { useEffect, useRef, useState } from "react";

/* ---------- Types ---------- */
type Review = {
  _id: string;
  companyName: string;
  comment: string;
  rating: number; // 1–5
  major?: string;
  createdAt: string;
};

type CompanySummary = { companyName: string; avgRating: number; count: number };

/* ---------- Page ---------- */
export default function ReviewsPage() {
  const [q, setQ] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const seen = useRef<Set<string>>(new Set());

  /* ---- data fetchers ---- */
  async function fetchReviews(query: string) {
    const params = new URLSearchParams();
    params.set("limit", "50");
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/backend/reviews?${params.toString()}`, { cache: "no-store" });
    const data = await res.json();
    const list: Review[] = data?.reviews ?? [];
    setReviews(list);
    seen.current = new Set(list.map((r) => r._id));
  }

  async function fetchTopCompanies() {
    const res = await fetch("/backend/reviews/summary", { cache: "no-store" });
    const data = await res.json();

    // Normalize and coerce avgRating to number
    const list: CompanySummary[] = (data?.companies ?? []).map((c: any) => ({
      companyName: String(c.companyName ?? ""),
      avgRating: Number(c.avgRating),
      count: Number(c.count ?? 0),
    }));

    setCompanies(list);
  }

  /* ---- initial load ---- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await Promise.all([fetchReviews(""), fetchTopCompanies()]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---- refetch on search ---- */
  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(true);
      fetchReviews(q).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  /* ---- realtime stream ---- */
  useEffect(() => {
    const es = new EventSource("/backend/reviews/stream");
    es.onmessage = async (evt) => {
      try {
        const r: Review = JSON.parse(evt.data);
        if (seen.current.has(r._id)) return;

        const needle = q.trim().toLowerCase();
        const matches =
          !needle ||
          r.companyName.toLowerCase().includes(needle) ||
          (r.major ?? "").toLowerCase().includes(needle);

        if (matches) {
          seen.current.add(r._id);
          setReviews((old) => [r, ...old]);
        }

        // keep Top Companies live
        fetchTopCompanies();
      } catch {}
    };
    return () => es.close();
  }, [q]);

  return (
    <main className="min-h-screen bg-base-200">
      <div className="mx-auto max-w-5xl p-6 space-y-4">
        {/* Header */}
        <header className="flex items-center gap-3">
          <div>
            <h1 className="text-4xl font-bold mb-1">Student Reviews</h1>
            <p className="opacity-70">Real-time feedback from the career fair</p>
          </div>
        </header>

        {/* Search */}
        <div className="card bg-base-100 shadow">
          <div className="card-body gap-3">
            <input
              className="input input-bordered w-full"
              placeholder="Search by Company or Major"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Top Companies */}
        <section className="grid md:grid-cols-1 gap-4">
          <InsightsCard
            title="Top Companies"
            rows={companies.map((c) => ({
              key: c.companyName,
              left: c.companyName,
              avg: c.avgRating,
              count: c.count,
            }))}
          />
        </section>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="alert">
            <span>No reviews match your search.</span>
          </div>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
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

/* ---------- Insights table card (Top Companies) ---------- */
function InsightsCard({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; left: string; avg: number; count: number }[];
}) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title text-lg mb-2">{title}</h3>
        {rows.length === 0 ? (
          <p className="text-sm opacity-60">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm text-sm">
              <thead>
                <tr className="text-left">
                  <th className="w-full">Company</th>
                  <th className="text-right pr-4">Avg Rating</th>
                  <th className="text-right">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key}>
                    <td className="whitespace-nowrap">{r.left}</td>
                    <td className="text-right font-medium tabular-nums pr-4">
                      {Number(r.avg).toFixed(2)}
                    </td>
                    <td className="text-right tabular-nums">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Stars for individual reviews ---------- */
function StarRating({ value }: { value: number }) {
  const v = Math.max(1, Math.min(5, Math.round(value)));
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          aria-label={`${n} star`}
          className={`mask mask-star w-5 h-5 ${n <= v ? "bg-gray-300" : "bg-gray-100"}`}
          aria-current={n === v ? "true" : undefined}
        />
      ))}
    </div>
  );
}

/* ---------- Review card ---------- */
function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
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
      </div>
    </article>
  );
}
