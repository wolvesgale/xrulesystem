// Shared UI-friendly types for API responses.
export type VenueRecord = {
  id: string;
  name: string;
  address: string | null;
  rules: string | null;
  notes: string | null;
  referenceUrl: string | null;
  updatedAt: string;
};

export type AgencyUser = {
  id: string;
  loginId: string;
  name: string;
  displayName: string | null;
};

export type AgencyRecord = {
  id: string;
  name: string;
  color: string | null;
  agentUser: AgencyUser | null;
};
