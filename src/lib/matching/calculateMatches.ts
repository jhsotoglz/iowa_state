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

export function calculateMatches(user: User, companies: Company[]): Company[] {
  if (!user?.workPreferences || !companies?.length) {
    return [];
  }

  // Pre-normalize user data once (moved outside the loop)
  const normalizedUserMajor = user.major.toUpperCase().replace(/\s+/g, "");
  const normalizedUserPrefs = user.workPreferences.map((p) =>
    p.toUpperCase().replace(/[-\s]/g, "")
  );
  const hasWorkAuth =
    user.workAuthorization.includes("US Citizen") ||
    user.workAuthorization.includes("Green Card");

  return companies.filter((company) => {
    // RULE 1: Major must match (absolute requirement)
    const hasMajorMatch = company.major.some(
      (companyMajor) =>
        companyMajor.toUpperCase().replace(/\s+/g, "") === normalizedUserMajor
    );

    if (!hasMajorMatch) {
      return false;
    }

    // RULE 2: Visa sponsorship must match user's needs (absolute requirement)
    if (!hasWorkAuth && !company.sponsorVisa) {
      return false;
    }

    // RULE 3: Employment type must match (absolute requirement)
    const normalizedCompanyTypes = company.employmentType.map((t) =>
      t.toUpperCase().replace(/[-\s]/g, "")
    );

    const hasMatchingWorkType = normalizedUserPrefs.some((userPref) =>
      normalizedCompanyTypes.includes(userPref)
    );

    if (!hasMatchingWorkType) {
      return false;
    }

    return true;
  });
}