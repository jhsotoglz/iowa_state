// src/app/view_reviews/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
// Interactive stars you already use on create_review:
import StarInput from "../frontend_components/star_rating";

/* ---------- Types ---------- */
type Review = {
  _id: string;
  companyName: string;
  comment: string;
  rating: number; // 1–5
  major?: string;
  createdAt: string;
  mine?: boolean; // server-provided ownership flag
};

type CompanySummary = { companyName: string; avgRating: number; count: number };

/* ---------- Page ---------- */
export default function ReviewsPage() {
  const [q, setQ] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const seen = useRef<Set<string>>(new Set());

  // local edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftComment, setDraftComment] = useState("");
  const [draftRating, setDraftRating] = useState<number>(3);

  /* ---- data fetchers ---- */
  async function fetchReviews(query: string) {
    const params = new URLSearchParams();
    params.set("limit", "50");
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/backend/reviews?${params.toString()}`, {
      cache: "no-store",
    });
    const data = await res.json();
    const list: Review[] = data?.reviews ?? [];
    setReviews(list);
    seen.current = new Set(list.map((r) => r._id));
  }

  async function fetchTopCompanies() {
    const res = await fetch("/backend/reviews/summary", { cache: "no-store" });
    const data = await res.json();
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

        fetchTopCompanies();
      } catch {}
    };
    return () => es.close();
  }, [q]);

  /* ---- actions ---- */
  function startEdit(review: Review) {
    setEditingId(review._id);
    setDraftComment(review.comment);
    setDraftRating(review.rating);
  }
  function cancelEdit() {
    setEditingId(null);
    setDraftComment("");
    setDraftRating(3);
  }
  async function saveEdit(id: string) {
    const comment = draftComment.trim();
    if (!comment) return;
    const res = await fetch("/backend/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id, comment, rating: draftRating }),
    });
    if (res.ok) {
      setReviews((old) =>
        old.map((r) =>
          r._id === id ? { ...r, comment, rating: draftRating } : r
        )
      );
      cancelEdit();
      fetchTopCompanies();
    }
  }
  async function removeReview(id: string) {
    const res = await fetch("/backend/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id }),
    });
    if (res.ok) {
      setReviews((old) => old.filter((r) => r._id !== id));
      fetchTopCompanies();
    }
  }

  return (
    <main className="min-h-screen bg-base-200">
      <div className="mx-auto max-w-5xl p-6 space-y-4">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 mt-[-0.5rem]">
          <div>
            <h1 className="text-5xl font-bold mb-1">Student Reviews</h1>
          </div>
          <Link
            href="/create_review"
            className="btn mt-6 px-6 text-base font-semibold shadow-md
             bg-[#13AA52] hover:bg-[#0f8a43] text-white border-none"
          >
            Leave a review
          </Link>
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
                <ReviewCard
                  review={r}
                  isEditing={editingId === r._id}
                  draftComment={draftComment}
                  draftRating={draftRating}
                  onStartEdit={() => startEdit(r)}
                  onCancelEdit={cancelEdit}
                  onChangeDraftComment={setDraftComment}
                  onChangeDraftRating={setDraftRating}
                  onSaveEdit={() => saveEdit(r._id)}
                  onDelete={() => removeReview(r._id)}
                />
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

/* ---------- Stars (read-only) for individual reviews ---------- */
function StarDisplay({ value }: { value: number }) {
  const v = Math.max(1, Math.min(5, Math.round(value)));
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

/* ---------- Review card with edit/delete ---------- */
function ReviewCard({
  review,
  isEditing,
  draftComment,
  draftRating,
  onStartEdit,
  onCancelEdit,
  onChangeDraftComment,
  onChangeDraftRating,
  onSaveEdit,
  onDelete,
}: {
  review: Review;
  isEditing: boolean;
  draftComment: string;
  draftRating: number;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onChangeDraftComment: (v: string) => void;
  onChangeDraftRating: (v: number) => void;
  onSaveEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
        <div className="flex items-center gap-2">
          <h2 className="card-title text-lg">{review.companyName}</h2>
          <div className="ml-auto">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <StarInput value={draftRating} onChange={onChangeDraftRating} />
                <span className="text-xs opacity-60">({draftRating}/5)</span>
              </div>
            ) : (
              <StarDisplay value={review.rating} />
            )}
          </div>
        </div>

        {review.major && (
          <p className="text-sm text-gray-500 mt-1">
            <strong>Major:</strong> {review.major}
          </p>
        )}

        {/* comment / edit mode */}
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              className="textarea textarea-bordered w-full h-24"
              value={draftComment}
              onChange={(e) => onChangeDraftComment(e.target.value)}
              maxLength={200}
            />
            <div className="flex gap-2 justify-end">
              <button className="btn btn-ghost" onClick={onCancelEdit}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={onSaveEdit}>
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-base leading-relaxed">{review.comment}</p>
        )}

        {/* actions only if it's mine and not already in edit mode */}
        {review.mine && !isEditing && (
          <div className="mt-3 flex gap-2 justify-end">
            <button className="btn btn-outline btn-sm" onClick={onStartEdit}>
              Edit
            </button>
            <button className="btn btn-error btn-sm" onClick={onDelete}>
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
