import { Box, Button, Typography } from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from "@mui/icons-material";
import { CertificateReviewDecision } from "@/lib/types/certificate-review.types";
import { CertificateDetailsSectionCard } from "./CertificateDetailsSectionCard";

interface CertificateReviewDecisionSectionProps {
  onDecision: (decision: CertificateReviewDecision) => void;
}

export function CertificateReviewDecisionSection({
  onDecision,
}: CertificateReviewDecisionSectionProps) {
  return (
    <CertificateDetailsSectionCard title="Decisão da Revisão">
      <Typography variant="body2" color="text.secondary" mb={3}>
        Após conferir os dados do aluno, os revisores e o documento, escolha a decisão para este certificado.
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap">
        <Button
          variant="contained"
          color="success"
          startIcon={<ApproveIcon />}
          onClick={() => onDecision("APPROVED")}
        >
          Aprovar certificado
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<RejectIcon />}
          onClick={() => onDecision("REJECTED")}
        >
          Rejeitar certificado
        </Button>
      </Box>
    </CertificateDetailsSectionCard>
  );
}
