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

export interface CertificateReviewHistoryItem {
  id: string;
  activity_id: string;
  reviewer_user_id: string;
  decision: CertificateReviewDecision;
  comments?: string;
  created_at: string;
  updated_at: string;
  reviewer?: CertificateReviewUser;
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
  activityType?: CertificateReviewActivityType;
  status?: CertificateReviewStatus;
  user: CertificateReviewUser;
  reviewers: CertificateReviewReviewer[];
  reviews: CertificateReviewHistoryItem[];
}

export interface ReviewDialogState {
  open: boolean;
  decision: CertificateReviewDecision | null;
}
