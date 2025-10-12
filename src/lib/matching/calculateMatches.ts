interface User {
  workAuthorization: string[];
  workPreferences: string[];
}

interface Company {
  id: string;
  name: string;
  employmentType: string[];
  sponsorVisa: boolean;
}

export function calculateMatches(user: User, companies: Company[]): Company[] {
  if (!user?.workPreferences || !companies?.length) {
    //either user work preference or companies have to exist
    return [];
  }

  return companies.filter((company) => {
    const userPrefs = user.workPreferences;
    const userWorkAuth = user.workAuthorization;
    const employmentType = company.employmentType;

    // Check if user needs visa sponsorship
    const needsVisa =
      userWorkAuth.includes("H1B Visa") ||
      userWorkAuth.includes("F1 Visa") ||
      !userWorkAuth.includes("US Citizen") ||
      !userWorkAuth.includes("Green Card");

    // Check if user is authorized to work without sponsorship
    const hasWorkAuth =
      userWorkAuth.includes("US Citizen") ||
      userWorkAuth.includes("Green Card");

    // Strict check: if user needs visa but company doesn't sponsor
    if (needsVisa && !hasWorkAuth && !company.sponsorVisa) {
      return false;
    }

    // Strict check: work type must match
    const hasMatchingWorkType = userPrefs.some((userPref) =>
      employmentType.includes(userPref)
    );

    if (!hasMatchingWorkType) {
      return false;
    }

    return true;
  });
}
