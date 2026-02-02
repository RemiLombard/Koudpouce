export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
  /** Nombre de sanctions reçues par l'utilisateur */
  sanctionCount?: number;
  /** ID Google pour les comptes connectés via Google OAuth */
  googleId?: string;
}

export interface DbListing {
  id: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;

  type: "demande" | "proposition";
  status: "active" | "closed";
  title: string;
  description: string;
  serviceTypeIds: string[];

  // Localisation publique
  cityName: string;
  postalCode: string;
  departmentCode: string;
  inseeCode: string | null;

  // Localisation privée (JAMAIS exposée)
  addressRaw: string;
  geoLatRounded: number | null;
  geoLngRounded: number | null;
  geoSource: "geocoded" | "manual_fallback";
}

/**
 * Conversation entre deux utilisateurs à propos d'une annonce.
 * Une seule conversation par couple (contacter + annonce).
 */
export interface DbConversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingAuthorId: string;
  contacterId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Message dans une conversation.
 */
export interface DbMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readBy: string[]; // userIds qui ont lu ce message
}

/**
 * Signalement d'une annonce.
 */
export interface DbReport {
  id: string;
  listingId: string;
  reportedByUserId: string;
  reason: "spam" | "professional" | "inappropriate" | "scam" | "other";
  message: string | null;
  status: "pending" | "dismissed" | "actioned";
  createdAt: string;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
}

/**
 * Signalement d'un utilisateur.
 */
export interface DbUserReport {
  id: string;
  reportedUserId: string;
  reportedByUserId: string;
  conversationId: string;
  reason: "harassment" | "spam" | "scam" | "inappropriate" | "other";
  message: string | null;
  status: "pending" | "dismissed" | "actioned";
  createdAt: string;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
}

export interface DbData {
  users: DbUser[];
  listings: DbListing[];
  conversations: DbConversation[];
  messages: DbMessage[];
  reports: DbReport[];
  userReports: DbUserReport[];
}
