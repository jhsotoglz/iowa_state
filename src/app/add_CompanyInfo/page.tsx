// app/add_employer/page.tsx
"use client";
import { useState } from "react";

const ACTION_URL = "/api/companyInfo";
const INDUSTRIES = [
  "Software Development",
  "Information Technology",
  "Cybersecurity",
  "Finance",
  "Consulting",
  "Manufacturing",
  "Healthcare",
  "Biotechnology",
  "Aerospace",
  "Energy",
  "Construction",
  "Education",
  "Transportation",
  "Telecommunications",
  "Retail",
  "Government",
  "Agriculture",
  "Automotive",
  "Marketing & Advertising",
  "Other",
];
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
] as const;

const EMP_TYPES = ["Internship", "Co-op", "Full-time", "Part-time"] as const;

type Recruiter = { name: string; email: string; phone: string };

export default function NewCompanyPage() {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [sponsorVisa, setSponsorVisa] = useState(false);
  const [url, setUrl] = useState("");

  // majors (select + Add -> chips)
  const [majors, setMajors] = useState<string[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<string>("");

  // employment type (checkbox group)
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);

  // recruiter being edited in the form
  const [recruiterDraft, setRecruiterDraft] = useState<Recruiter>({
    name: "",
    email: "",
    phone: "",
  });

  // list shown BELOW the form
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  function addMajor() {
    if (!selectedMajor) return;
    if (!majors.includes(selectedMajor))
      setMajors((p) => [...p, selectedMajor]);
    setSelectedMajor("");
  }
  function removeMajor(v: string) {
    setMajors((p) => p.filter((m) => m !== v));
  }

  function toggleEmpType(t: string) {
    setEmploymentTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  const isEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s.trim());

  function addRecruiter() {
    const { name, email, phone } = recruiterDraft;
    if (!name.trim()) {
      setMsg({ type: "err", text: "Recruiter name is required." });
      return;
    }
    if (!isEmail(email)) {
      setMsg({ type: "err", text: "Enter a valid recruiter email." });
      return;
    }
    setRecruiters((prev) => [
      ...prev,
      { name: name.trim(), email: email.trim(), phone: phone.trim() },
    ]);
    setRecruiterDraft({ name: "", email: "", phone: "" });
    setMsg(null);
  }

  function removeRecruiterAt(i: number) {
    setRecruiters((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!companyName.trim()) {
      setMsg({ type: "err", text: "Company name is required." });
      return;
    }

    // If there are added recruiters, use the first one as primary recruiterInfo.
    // Otherwise fall back to whatever is in the draft fields.
    const primary: Recruiter =
      recruiters[0] ??
      ({
        name: recruiterDraft.name.trim(),
        email: recruiterDraft.email.trim(),
        phone: recruiterDraft.phone.trim(),
      } as Recruiter);

    if (!primary.name) {
      setMsg({
        type: "err",
        text: "At least one recruiter (name) is required.",
      });
      return;
    }
    if (!isEmail(primary.email)) {
      setMsg({ type: "err", text: "Primary recruiter needs a valid email." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(ACTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          website: url.trim() || null,
          industry: industry || null,
          sponsorVisa,
          boothNumber: null, // or whatever you collect later
          majors,
          employmentTypes,
          recruiters, // array from your scroll list
          count: 0, // optional; server will default to 0
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to save.");

      setMsg({ type: "ok", text: "Saved ✅" });

      // reset
      setCompanyName("");
      setUrl("");
      setMajors([]);
      setSelectedMajor("");
      setEmploymentTypes([]);
      setRecruiterDraft({ name: "", email: "", phone: "" });
      setRecruiters([]);
    } catch (err: any) {
      setMsg({ type: "err", text: err.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-base-200 flex items-start justify-center p-6">
      <div className="w-full max-w-2xl card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title">Add Company</h1>

          {msg && (
            <div
              className={`alert ${
                msg.type === "ok" ? "alert-success" : "alert-error"
              } my-2`}
            >
              <span>{msg.text}</span>
            </div>
          )}

          {/* --------------------- FORM --------------------- */}
          <form className="space-y-4" onSubmit={onSubmit}>
            <input
              className="input input-bordered w-full"
              placeholder="Company Name…"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />

            {/* Majors select + Add */}
            <div className="space-y-2">
              <div className="join w-full">
                <select
                  className="select select-bordered join-item w-full"
                  value={selectedMajor}
                  onChange={(e) => setSelectedMajor(e.target.value)}
                >
                  <option value="">— Select Major —</option>
                  {MAJORS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn join-item"
                  onClick={addMajor}
                  disabled={!selectedMajor}
                >
                  Add
                </button>
              </div>

              <div className="p-3 rounded-lg border bg-base-200">
                <div className="font-semibold mb-2">Majors</div>
                <div className="flex flex-wrap gap-2">
                  {majors.length === 0 && (
                    <span className="opacity-60">None yet</span>
                  )}
                  {majors.map((m) => (
                    <div key={m} className="badge badge-neutral gap-2">
                      {m}
                      <button
                        type="button"
                        className="btn btn-xs btn-circle"
                        onClick={() => removeMajor(m)}
                        aria-label={`Remove ${m}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recruiter Info (entry form; stays enabled) */}
            <div className="p-3 rounded-lg border bg-base-200">
              <div className="font-semibold mb-3">Recruiter Info</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="input input-bordered w-full"
                  placeholder="Name (e.g., Robert Kim)"
                  value={recruiterDraft.name}
                  onChange={(e) =>
                    setRecruiterDraft((p) => ({ ...p, name: e.target.value }))
                  }
                />
                <input
                  className="input input-bordered w-full"
                  type="email"
                  placeholder="Email (e.g., r.kim@cybershield.com)"
                  value={recruiterDraft.email}
                  onChange={(e) =>
                    setRecruiterDraft((p) => ({ ...p, email: e.target.value }))
                  }
                />
                <input
                  className="input input-bordered w-full sm:col-span-2"
                  type="tel"
                  placeholder="Phone (e.g., (555) 789-0123)"
                  value={recruiterDraft.phone}
                  onChange={(e) =>
                    setRecruiterDraft((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={addRecruiter}
                >
                  Add recruiter
                </button>
              </div>
            </div>
            <div className="mt-6 p-3 rounded-lg border bg-base-200">
              <div className="font-semibold mb-2">Recruiters</div>
              <div className="max-h-56 overflow-y-auto pr-1">
                {recruiters.length === 0 ? (
                  <div className="opacity-60">No recruiters added yet</div>
                ) : (
                  <ul className="space-y-2">
                    {recruiters.map((r, i) => (
                      <li
                        key={`${r.email}-${i}`}
                        className="flex items-start justify-between bg-base-100 px-3 py-2 rounded"
                      >
                        <div className="text-sm leading-5">
                          <div className="font-medium">{r.name}</div>
                          <div className="opacity-80 break-all">{r.email}</div>
                          {r.phone && (
                            <div className="opacity-80">{r.phone}</div>
                          )}
                        </div>
                        <button
                          className="btn btn-xs"
                          onClick={() => removeRecruiterAt(i)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {/* Employment Types (checkbox group) */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">Employment Type</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EMP_TYPES.map((t) => (
                  <label
                    key={t}
                    className="label cursor-pointer justify-start gap-3 px-2 py-2 rounded-lg border"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={employmentTypes.includes(t)}
                      onChange={() => toggleEmpType(t)}
                    />
                    <span className="label-text">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Industry select */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">Industry</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">— Select Industry —</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Sponsor Visa checkbox */}
            <div className="form-control mt-3">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={sponsorVisa}
                  onChange={(e) => setSponsorVisa(e.target.checked)}
                />
                <span className="label-text font-medium">
                  Sponsorship Available
                </span>
              </label>
            </div>

            {/* URL */}
            <input
              className="input input-bordered w-full"
              placeholder="Company Website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
            />

            <div className="card-actions justify-end">
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
          {/* ------------------- /FORM ------------------- */}

          {/* Recruiters list BELOW the form (scrollable) */}
          {/* --------------------------------------------- */}
        </div>
      </div>
    </main>
  );
}
