"use client";
import { useMatching } from "@/lib/matching/useMatching";

export default function MatchAlgo() {
  const { user, matchedCompanies, loading, error } = useMatching();

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Matching Algorithm Results</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold">User Data:</h3>
        <pre className="bg-gray-700 p-4 rounded mt-2 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div>
        <h3 className="text-xl font-semibold">Matched Companies:</h3>
        <p className="mt-2">Total matches: {matchedCompanies.length}</p>
        <pre className="bg-gray-700 p-4 rounded mt-2 overflow-auto">
          {JSON.stringify(matchedCompanies, null, 2)}
        </pre>
      </div>
    </div>
  );
}
