// app/create_review/page.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import StarRating from "../frontend_components/star_rating";

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

type CompanyLite = { _id: string; companyName: string };

export default function CreateReviewPage() {
  // form state
  const [companyName, setCompanyName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const [major, setMajor] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  // --- Autocomplete state ---
  const [allCompanies, setAllCompanies] = useState<CompanyLite[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const blurTimeout = useRef<number | null>(null);

  // fetch companies once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/companyInfo", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const list: CompanyLite[] = (data?.companies ?? [])
          .map((c: { _id?: string; companyName?: string }) => ({
            _id: String(c._id ?? ""),
            companyName: String(c.companyName ?? ""),
          }))
          .filter((c: CompanyLite) => c.companyName.trim().length > 0);

        setAllCompanies(list);
      } catch {}
    })();
  }, []);

  // filter suggestions (case-insensitive, substring)
  const suggestions = useMemo(() => {
    const q = companyName.trim().toLowerCase();
    if (!q) return [];
    const matches = allCompanies.filter((c) =>
      c.companyName.toLowerCase().includes(q)
    );
    // de-dupe by name and limit to 8
    const seen = new Set<string>();
    const unique = [];
    for (const m of matches) {
      if (seen.has(m.companyName.toLowerCase())) continue;
      seen.add(m.companyName.toLowerCase());
      unique.push(m);
      if (unique.length >= 8) break;
    }
    return unique;
  }, [companyName, allCompanies]);

  // handle keyboard in the input
  function onCompanyKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = suggestions[highlight];
      if (pick) {
        setCompanyName(pick.companyName);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function pickCompany(name: string) {
    setCompanyName(name);
    setOpen(false);
  }

  function onInputFocus() {
    if (blurTimeout.current) {
      window.clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
    if (suggestions.length > 0) setOpen(true);
  }

  function onInputBlur() {
    // small delay so a click in the menu can register
    blurTimeout.current = window.setTimeout(
      () => setOpen(false),
      120
    ) as unknown as number;
  }

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
          ...(major ? { major } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg({
          type: "err",
          text:
            res.status === 401
              ? "Please log in to submit a review."
              : data?.error || "Failed to create review",
        });
        return;
      }

      setMsg({ type: "ok", text: "Review created 🎉" });
      setCompanyName("");
      setComment("");
      setRating("");
      setMajor("");
      setOpen(false);
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Something went wrong" });
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

          {/* FORM */}
          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Company Name with autocomplete */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Company Name *</span>
              </label>

              <div className="relative">
                <input
                  className="input input-bordered w-full"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setHighlight(0);
                    if (e.target.value.trim()) setOpen(true);
                    else setOpen(false);
                  }}
                  onKeyDown={onCompanyKeyDown}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                  placeholder="Start typing…"
                  autoComplete="off"
                />

                {/* Dropdown */}
                {open && suggestions.length > 0 && (
                  <ul className="menu bg-base-100 w-full rounded-box shadow-lg border border-base-200 absolute z-20 mt-2">
                    {suggestions.map((s, i) => (
                      <li key={s._id}>
                        <button
                          type="button"
                          className={i === highlight ? "active" : ""}
                          onMouseEnter={() => setHighlight(i)}
                          onMouseDown={(e) => e.preventDefault()} // keep focus
                          onClick={() => pickCompany(s.companyName)}
                        >
                          {s.companyName}
                        </button>
                      </li>
                    ))}
                    {/* Optional: allow keeping custom name */}
                    {!suggestions.some(
                      (s) =>
                        s.companyName.toLowerCase() ===
                        companyName.trim().toLowerCase()
                    ) && (
                      <li className="menu-title px-4 py-2 text-xs opacity-60">
                        Press Enter to keep “{companyName.trim()}”
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Comment</span>
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

            {/* Major */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Major</span>
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

            {/* Rating */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Rating *</span>
                {rating !== "" && (
                  <span className="label-text-alt">({rating} / 5)</span>
                )}
              </label>

              <StarRating value={rating} onChange={(n) => setRating(n)} />
              <input
                type="hidden"
                name="rating"
                value={rating === "" ? "" : String(rating)}
              />
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
