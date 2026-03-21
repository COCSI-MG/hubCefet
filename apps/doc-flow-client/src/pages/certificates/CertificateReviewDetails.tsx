import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { CertificateReviewDecisionSection } from "@/components/certificates/CertificateReviewDecisionSection";
import { CertificateReviewHistorySection } from "@/components/certificates/CertificateReviewHistorySection";
import { CertificateReviewersSection } from "@/components/certificates/CertificateReviewersSection";
import { InfoCard } from "@/components/InfoCard";
import { CertificateDocumentDataSection } from "@/components/certificates/CertificateDocumentDataSection";
import { CertificateStudentDataSection } from "@/components/certificates/CertificateStudentDataSection";
import { certificateService } from "@/api/services/certificate.service";
import { ApiError } from "@/api/errors/ApiError";
import {
  CertificateReviewDecision,
  CertificateReviewDetailsData,
  CertificateReviewUser,
  ReviewDialogState,
} from "@/lib/types/certificate-review.types";

const statusColorMap = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
} as const;

const statusLabelMap = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
} as const;

export default function CertificateReviewDetails() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<CertificateReviewDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState("");
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogState>({
    open: false,
    decision: null,
  });

  useEffect(() => {
    if (!activityId) {
      toast.error("Certificado não encontrado.");
      navigate("/docflow/certificates/review", { replace: true });
      return;
    }

    loadActivity(activityId);
  }, [activityId, navigate]);

  const loadActivity = async (id: string) => {
    try {
      setLoading(true);
      const response = await certificateService.getActivity(id);
      setActivity({
        ...response,
        reviewers: response.reviewers || [],
        reviews: response.reviews || [],
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao carregar os detalhes do certificado.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (user?: CertificateReviewUser | null) => {
    if (!user) return "Não informado";
    return user.full_name || user.fullName || "Não informado";
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Não informado";
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const handleDownloadCertificate = async () => {
    if (!activity) return;

    try {
      await certificateService.downloadCertificate(activity.id);
      toast.success("Download iniciado!");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Erro ao baixar certificado.");
    }
  };

  const openReviewDialog = (decision: CertificateReviewDecision) => {
    setReviewDialog({
      open: true,
      decision,
    });
  };

  const closeReviewDialog = () => {
    setReviewDialog({
      open: false,
      decision: null,
    });
    setComments("");
  };

  const handleSubmitReview = async () => {
    if (!activity || !reviewDialog.decision) return;

    try {
      setSubmitting(true);
      await certificateService.reviewActivity(
        activity.id,
        reviewDialog.decision,
        comments,
      );

      toast.success(
        reviewDialog.decision === "APPROVED"
          ? "Certificado aprovado com sucesso!"
          : "Certificado rejeitado com sucesso!",
      );

      navigate("/docflow/certificates/review", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Erro ao avaliar certificado.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!activity) {
    return (
      <Box className="ml-6 mr-6 mt-6 max-w-full">
        <Alert severity="error">
          Não foi possível carregar o certificado solicitado.
        </Alert>
      </Box>
    );
  }

  const activityStatusName = activity.status?.name || "PENDING";
  const activityStatusDescription =
    activity.status?.description || "Certificado aguardando avaliação.";
  const statusColor =
    statusColorMap[activityStatusName as keyof typeof statusColorMap] || "default";
  const activityStatusLabel =
    statusLabelMap[activityStatusName as keyof typeof statusLabelMap] || activityStatusName;
  const getDecisionLabel = (decision: CertificateReviewDecision) =>
    statusLabelMap[decision as keyof typeof statusLabelMap] || decision;

  return (
    <>
      <PageHeader
        title="Detalhes da Revisão"
        description="Visualize os dados completos do certificado, do aluno, dos revisores e do documento antes de avaliar"
      />

      <Box className="ml-6 mr-6 mt-6 max-w-full space-y-6">
        <Card className="border rounded-xl">
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              flexDirection={{ xs: "column", md: "row" }}
              gap={2}
              mb={3}
            >
              <Box>
                <Button
                  variant="text"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/docflow/certificates/review")}
                  sx={{ mb: 1, px: 0 }}
                >
                  Voltar para lista
                </Button>
                <Typography variant="h6" className="font-semibold">
                  {activity.course_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID do certificado: {activity.id}
                </Typography>
              </Box>

              <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
                <Chip
                  label={activityStatusLabel}
                  color={statusColor}
                  variant="outlined"
                />
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadCertificate}
                >
                  Baixar certificado
                </Button>
              </Box>
            </Box>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <InfoCard
                label="Tipo do Certificado"
                data={activity.activityType?.name || "Não informado"}
              />
              <InfoCard label="Horas" data={`${activity.hours}h`} />
              <InfoCard
                label="Criada em"
                data={formatDateTime(activity.created_at)}
              />
              <InfoCard
                label="Atualizada em"
                data={formatDateTime(activity.updated_at)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <CertificateStudentDataSection
            user={activity.user}
            studentName={getUserName(activity.user)}
          />

          <CertificateDocumentDataSection
            statusLabel={activityStatusLabel}
            statusDescription={activityStatusDescription}
            complementaryTypeDescription={
              activity.complementaryActivityType?.description
            }
          />
        </div>

        <CertificateReviewersSection
          reviewers={activity.reviewers}
          getUserName={getUserName}
          formatDateTime={formatDateTime}
        />

        <CertificateReviewHistorySection
          reviews={activity.reviews}
          getUserName={getUserName}
          formatDateTime={formatDateTime}
          getDecisionLabel={getDecisionLabel}
        />

        <CertificateReviewDecisionSection
          onDecision={openReviewDialog}
        />
      </Box>

      <Dialog
        open={reviewDialog.open}
        onClose={closeReviewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reviewDialog.decision === "APPROVED"
            ? "Confirmar aprovação"
            : "Confirmar rejeição"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" className="font-semibold">
              {activity.course_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aluno: {getUserName(activity.user)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Horas: {activity.hours}h
            </Typography>
          </Box>

          <TextField
            autoFocus
            margin="dense"
            label="Comentários (opcional)"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            placeholder={
              reviewDialog.decision === "APPROVED"
                ? "Adicione observações sobre a aprovação..."
                : "Explique o motivo da rejeição..."
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReviewDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color={reviewDialog.decision === "APPROVED" ? "success" : "error"}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting
              ? "Processando..."
              : reviewDialog.decision === "APPROVED"
                ? "Aprovar"
                : "Rejeitar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
