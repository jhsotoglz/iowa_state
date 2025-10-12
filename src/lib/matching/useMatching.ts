import { useEffect, useState, useMemo } from "react";
import { calculateMatches } from "./calculateMatches";

interface User {
  workAuthorization: string[];
  workPreferences: string[];
  major: string;
}

interface Company {
  id: string;
  name: string;
  employmentType: string[];
  sponsorVisa: boolean;
  major: string[];
}

export function useMatching(refreshInterval = 10000) {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      console.log("User data:", data);

      const mappedUser = {
        workAuthorization: data.user.workAuthorization,
        workPreferences: data.user.workPreference,
        major: data.user.major,
      };

      setUser(mappedUser);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to load user data");
    }
  };

  // Fetch companies data
  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companyInfo");
      if (!res.ok) throw new Error("Failed to fetch companies");
      const data = await res.json();
      console.log("Companies data:", data);

      const mappedCompanies = data.companies.map((company: any) => ({
        id: company._id,
        name: company.companyName,
        employmentType: company.employmentType,
        sponsorVisa: company.sponsorVisa,
        major: company.majors,
      }));

      setCompanies(mappedCompanies);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUser();
    fetchCompanies();
  }, []);

  // Auto-refresh companies
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCompanies();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Calculate matches dynamically
  const matchedCompanies = useMemo(() => {
    if (!user || !companies.length) return [];
    const matches = calculateMatches(user, companies);
    return matches;
  }, [user, companies]);

  // Update matchedCompanies in database whenever matches change
  useEffect(() => {
    const updateMatchesInDB = async () => {
      if (matchedCompanies.length === 0) return;

      try {
        // Extract company names instead of IDs
        const companyNames = matchedCompanies.map((c) => c.name);
        console.log("Updating matchedCompanies in DB:", companyNames);

        const res = await fetch("/api/matchingAlgo", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchedCompanies: companyNames,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to update matched companies");
        }

        const result = await res.json();
        console.log("Successfully updated matchedCompanies:", result);
      } catch (err) {
        console.error("Error updating matched companies:", err);
      }
    };

    updateMatchesInDB();
  }, [matchedCompanies]);

  return {
    matchedCompanies,
    loading,
    error,
    user,
    refetch: () => {
      fetchUser();
      fetchCompanies();
    },
  };
}