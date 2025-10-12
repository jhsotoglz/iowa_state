"use client";

import { useMatching } from "@/lib/matching/useMatching";

export default function MatchAlgo() {
  const { user, matchedCompanies, loading, error } = useMatching();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Test Fetch</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold">User Data:</h3>
        <pre className=" p-4 rounded mt-2">{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div>
        <h3 className="text-xl font-semibold">Companies Data:</h3>
        <p>Total companies: {matchedCompanies.length}</p>
        <pre className=" p-4 rounded mt-2">
          {JSON.stringify(matchedCompanies, null, 2)}
        </pre>
      </div>
    </div>
  );
}
