export interface CertificateReviewUser {
  id: string;
  full_name?: string;
  fullName?: string;
  email: string;
  enrollment?: string;
}

export interface CertificateReviewActivityType {
  id: number;
  name: string;
}

export interface CertificateReviewComplementaryType {
  id: number;
  name: string;
  description?: string;
}

export interface CertificateReviewStatus {
  id: number;
  name: string;
  description: string;
}

export interface CertificateReviewReviewer {
  id: string;
  activity_id: string;
  reviewer_user_id: string;
  assigned_at: string;
  reviewer: CertificateReviewUser;
}

export type CertificateReviewDecision = "APPROVED" | "REJECTED";

export type CertificateActivityHistoryType = "created" | "edited" | "reviewed";

export interface CertificateActivityHistoryItem {
  id: string;
  activity_id: string;
  user_id: string;
  user_name?: string | null;
  type: CertificateActivityHistoryType;
  action: string;
  description: string;
  created_at: string;
  user?: CertificateReviewUser;
}

export interface CertificateReviewListItem {
  id: string;
  course_name: string;
  hours: number;
  certificate_url: string;
  activity_type_id: number;
  status_id: number;
  created_at: string;
  user: CertificateReviewUser;
  activityType: CertificateReviewActivityType;
}

export interface CertificateReviewDetailsData {
  id: string;
  course_name: string;
  hours: number;
  certificate_url: string;
  user_id: string;
  activity_type_id: number;
  status_id: number;
  created_at: string;
  updated_at: string;
  complementary_activity_type_id?: number | null;
  complementaryActivityType?: CertificateReviewComplementaryType | null;
  extension_activity_type_id?: number | null;
  extensionActivityType?: CertificateReviewComplementaryType | null;
  activityType?: CertificateReviewActivityType;
  status?: CertificateReviewStatus;
  user: CertificateReviewUser;
  reviewers: CertificateReviewReviewer[];
  history: CertificateActivityHistoryItem[];
}

export interface ReviewDialogState {
  open: boolean;
  decision: CertificateReviewDecision | null;
}
