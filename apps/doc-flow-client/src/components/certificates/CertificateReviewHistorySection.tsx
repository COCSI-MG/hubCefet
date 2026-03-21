import { Alert, Box, Chip, Typography } from "@mui/material";
import { CertificateReviewHistoryItem } from "@/lib/types/certificate-review.types";
import { CertificateDetailsSectionCard } from "./CertificateDetailsSectionCard";

interface CertificateReviewHistorySectionProps {
  reviews: CertificateReviewHistoryItem[];
  getUserName: (user?: CertificateReviewHistoryItem["reviewer"] | null) => string;
  formatDateTime: (date?: string) => string;
  getDecisionLabel: (decision: CertificateReviewHistoryItem["decision"]) => string;
}

export function CertificateReviewHistorySection({
  reviews,
  getUserName,
  formatDateTime,
  getDecisionLabel,
}: CertificateReviewHistorySectionProps) {
  return (
    <CertificateDetailsSectionCard title="Histórico de Avaliações">
      {reviews.length === 0 ? (
        <Alert severity="info">
          Nenhuma avaliação foi registrada até o momento.
        </Alert>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-neutral-200 p-4 space-y-2"
            >
              <Box display="flex" justifyContent="space-between" gap={2} flexWrap="wrap">
                <Typography className="font-semibold">
                  {getUserName(review.reviewer)}
                </Typography>
                <Chip
                  label={getDecisionLabel(review.decision)}
                  color={review.decision === "APPROVED" ? "success" : "error"}
                  variant="outlined"
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {review.reviewer?.email || "Email não informado"}
              </Typography>
              <Typography variant="body2">
                {review.comments || "Sem comentários informados."}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avaliado em {formatDateTime(review.created_at)}
              </Typography>
            </div>
          ))}
        </div>
      )}
    </CertificateDetailsSectionCard>
  );
}
