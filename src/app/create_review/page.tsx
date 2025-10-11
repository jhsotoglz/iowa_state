// app/create_review/page.tsx
"use client";
import { useState } from "react";

const ACTION_URL = "/backend/reviews";

// ISU College of Engineering majors (labels show the common ISU abbrev)
const MAJORS = [
  { value: "AER E", label: "Aerospace Engineering (AER E)" },
  { value: "AG E", label: "Agricultural Engineering (AG E)" },
  { value: "BSE", label: "Biological Systems Engineering (BSE)" },
  { value: "CH E", label: "Chemical Engineering (CH E)" },
  { value: "C E", label: "Civil Engineering (C E)" },
  { value: "CON E", label: "Construction Engineering (CON E)" },
  { value: "CPR E", label: "Computer Engineering (CPR E)" },
  { value: "CYB E", label: "Cybersecurity Engineering (CYB E)" },
  { value: "E E", label: "Electrical Engineering (E E)" },
  { value: "ENVE", label: "Environmental Engineering (ENVE)" },
  { value: "I E", label: "Industrial Engineering (I E)" },
  { value: "M S E", label: "Materials Engineering (M S E)" },
  { value: "M E", label: "Mechanical Engineering (M E)" },
  { value: "SE", label: "Software Engineering (SE)" },
];

export default function CreateReviewPage() {
  const [companyName, setCompanyName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const [major, setMajor] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const remaining = 200 - comment.length;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!companyName.trim() || !comment.trim() || rating === "") {
      setMsg({
        type: "err",
        text: "companyName, comment, rating are required.",
      });
      return;
    }
    if (comment.length > 200) {
      setMsg({ type: "err", text: "Comment must be ≤ 200 characters." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(ACTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          comment: comment.trim(),
          rating: Number(rating),
          // send only if chosen
          ...(major ? { major } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create review");

      setMsg({ type: "ok", text: "Review created 🎉" });
      setCompanyName("");
      setComment("");
      setRating("");
      setMajor("");
    } catch (err: any) {
      setMsg({ type: "err", text: err.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-xl card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title">Create Review</h1>

          {msg && (
            <div
              className={`alert ${
                msg.type === "ok" ? "alert-success" : "alert-error"
              } mt-2`}
            >
              <span>{msg.text}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Company Name *</span>
              </label>
              <input
                className="input input-bordered"
                placeholder="e.g., TMC Transportation"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Comment *(≤ 200)</span>
                <span
                  className={`label-text-alt ${
                    remaining < 0 ? "text-error" : ""
                  }`}
                >
                  {remaining}
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-28"
                placeholder="Share something helpful…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Rating *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={rating}
                  onChange={(e) =>
                    setRating(e.target.value ? Number(e.target.value) : "")
                  }
                  required
                >
                  <option value="">Select rating</option>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Major (optional)
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                >
                  <option value="">— Select Major —</option>
                  {MAJORS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="card-actions justify-end">
              <button
                className={`btn btn-primary ${
                  submitting ? "btn-disabled" : ""
                }`}
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
