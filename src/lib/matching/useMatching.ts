import { useEffect, useState, useMemo, useRef, useCallback } from "react";
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

interface UseMatchingOptions {
  refreshInterval?: number;
  enableAutoRefresh?: boolean;
  debounceDelay?: number;
}

export function useMatching(options: UseMatchingOptions = {}) {
  const {
    refreshInterval = 60000, // Increased to 60 seconds
    enableAutoRefresh = true,
    debounceDelay = 2000, // Wait 2 seconds before updating DB
  } = options;

  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track previous matched companies to detect meaningful changes
  const prevMatchedCompaniesRef = useRef<string[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Fetch user data
  const fetchUser = useCallback(async () => {
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
  }, []);

  // Fetch companies data
  const fetchCompanies = useCallback(async () => {
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
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUser();
    fetchCompanies();
  }, [fetchUser, fetchCompanies]);

  // Auto-refresh companies (optional)
  useEffect(() => {
    if (!enableAutoRefresh) return;

    const interval = setInterval(() => {
      fetchCompanies();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, enableAutoRefresh, fetchCompanies]);

  // Calculate matches dynamically
  const matchedCompanies = useMemo(() => {
    if (!user || !companies.length) return [];
    const matches = calculateMatches(user, companies);
    return matches;
  }, [user, companies]);

  // Helper to check if matched companies have meaningfully changed
  const hasMatchesChanged = useCallback((newNames: string[]) => {
    const prev = prevMatchedCompaniesRef.current;

    if (prev.length !== newNames.length) return true;

    // Check if the same companies in the same order
    return !newNames.every((name, index) => name === prev[index]);
  }, []);

  // Debounced database update with change detection
  useEffect(() => {
    // Clear any pending update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    if (matchedCompanies.length === 0) return;

    const companyNames = matchedCompanies.map((c) => c.id);

    // Only update if there are actual changes
    if (!hasMatchesChanged(companyNames)) {
      console.log("No changes in matched companies, skipping DB update");
      return;
    }

    // Debounce the update
    updateTimeoutRef.current = setTimeout(async () => {
      try {
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

        // Update reference only after successful update
        prevMatchedCompaniesRef.current = companyNames;
      } catch (err) {
        console.error("Error updating matched companies:", err);
      }
    }, debounceDelay);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [matchedCompanies, debounceDelay, hasMatchesChanged]);

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
