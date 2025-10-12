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

    const nonVisa =
      userWorkAuth.includes("US Citizen") ||
      userWorkAuth.includes("Green Card");
    const needsVisa =
      userWorkAuth.includes("H1B Visa") ||
      userWorkAuth.includes("F1 Visa") ||
      !userWorkAuth.includes("US Citizen");

    // Strict check: sponsorship requirement
    if (userPrefs.requiresSponsorship && !companyReqs.sponsorsVisa) {
      return false;
    }

    // Strict check: work type must match
    const hasMatchingWorkType = userPrefs.workPreferences.some((userPref) =>
      companyReqs.employmentTypes.includes(userPref)
    );

    if (!hasMatchingWorkType) {
      return false;
    }

    return true;
  });
}
