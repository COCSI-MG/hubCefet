import { Alert, Typography } from "@mui/material";
import { CertificateReviewReviewer } from "@/lib/types/certificate-review.types";
import { CertificateDetailsSectionCard } from "./CertificateDetailsSectionCard";

interface CertificateReviewersSectionProps {
  reviewers: CertificateReviewReviewer[];
  getUserName: (name?: CertificateReviewReviewer["reviewer"] | null) => string;
  formatDateTime: (date?: string) => string;
}

export function CertificateReviewersSection({
  reviewers,
  getUserName,
  formatDateTime,
}: CertificateReviewersSectionProps) {
  return (
    <CertificateDetailsSectionCard title="Revisores Designados">
      {reviewers.length === 0 ? (
        <Alert severity="info">
          Nenhum revisor foi encontrado para este certificado.
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {reviewers.map((reviewerAssignment) => (
            <div
              key={reviewerAssignment.id}
              className="rounded-xl border bg-sky-50 border-neutral-200 p-4 space-y-2"
            >
              <Typography className="font-semibold text-sky-900">
                {getUserName(reviewerAssignment.reviewer)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reviewerAssignment.reviewer.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Matrícula: {reviewerAssignment.reviewer.enrollment || "Não informado"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Designado em {formatDateTime(reviewerAssignment.assigned_at)}
              </Typography>
            </div>
          ))}
        </div>
      )}
    </CertificateDetailsSectionCard>
  );
}
