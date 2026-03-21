import { Alert, Typography } from "@mui/material";
import { CertificateActivityHistoryItem } from "@/lib/types/certificate-review.types";
import { CertificateDetailsSectionCard } from "./CertificateDetailsSectionCard";

interface CertificateReviewHistorySectionProps {
  history: CertificateActivityHistoryItem[];
  getUserName: (user?: CertificateActivityHistoryItem["user"] | null) => string;
  formatDateTime: (date?: string) => string;
}

const actionLabelMap: Record<string, string> = {
  CREATE: "CRIACAO",
  UPDATE: "ATUALIZAÇÃO",
  REVIEW: "AVALIAÇÃO",
};

const actionClassMap: Record<string, string> = {
  CREATE: "bg-blue-100 text-blue-700",
  UPDATE: "bg-amber-100 text-amber-800",
  REVIEW: "bg-emerald-100 text-emerald-700",
};

export function CertificateReviewHistorySection({
  history,
  getUserName,
  formatDateTime,
}: CertificateReviewHistorySectionProps) {
  return (
    <CertificateDetailsSectionCard title="Histórico da Atividade">
      {history.length === 0 ? (
        <Alert severity="info">
          Nenhum evento foi registrado até o momento.
        </Alert>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <Typography
              key={entry.id}
              component="div"
              variant="body2"
              className="font-mono rounded-md bg-neutral-100 px-3 py-2 break-words"
            >
              <span>{formatDateTime(entry.created_at)}</span>
              <span> - </span>
              <span>{entry.user_name || getUserName(entry.user)}</span>
              <span> - </span>
              <span
                className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${actionClassMap[entry.action] || "bg-neutral-200 text-neutral-700"}`}
              >
                {actionLabelMap[entry.action] || entry.action}
              </span>
              <span> - </span>
              <span>{entry.description}</span>
            </Typography>
          ))}
        </div>
      )}
    </CertificateDetailsSectionCard>
  );
}
