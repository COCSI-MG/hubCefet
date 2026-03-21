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
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { InfoCard } from "@/components/InfoCard";
import { certificateService } from "@/api/services/certificate.service";
import { ApiError } from "@/api/errors/ApiError";
import {
  CertificateReviewDecision,
  CertificateReviewDetailsData,
  CertificateReviewHistoryItem,
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
          <Card className="border rounded-xl">
            <CardContent>
              <Typography variant="h6" className="font-semibold" gutterBottom>
                Dados do Aluno
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Nome" data={getUserName(activity.user)} />
                <InfoCard label="Email" data={activity.user.email || "Não informado"} />
                <InfoCard
                  label="Matrícula"
                  data={activity.user.enrollment || "Não informado"}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border rounded-xl">
            <CardContent>
              <Typography variant="h6" className="font-semibold" gutterBottom>
                Dados do Documento
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  label="Status"
                  data={activityStatusLabel}
                />
                <InfoCard
                  label="Descrição do Status"
                  data={activityStatusDescription}
                />

                <InfoCard
                  label="Descrição do Tipo Complementar"
                  data={
                    activity.complementaryActivityType?.description ||
                    "Não se aplica"
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border rounded-xl">
          <CardContent>
            <Typography variant="h6" className="font-semibold" gutterBottom>
              Revisores Designados
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {activity.reviewers.length === 0 ? (
              <Alert severity="info">
                Nenhum revisor foi encontrado para este certificado.
              </Alert>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {activity.reviewers.map((reviewerAssignment) => (
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
          </CardContent>
        </Card>

        <Card className="border rounded-xl">
          <CardContent>
            <Typography variant="h6" className="font-semibold" gutterBottom>
              Histórico de Avaliações
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {activity.reviews.length === 0 ? (
              <Alert severity="info">
                Nenhuma avaliação foi registrada até o momento.
              </Alert>
            ) : (
              <div className="space-y-4">
                {activity.reviews.map((review: CertificateReviewHistoryItem) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-neutral-200 p-4 space-y-2"
                  >
                    <Box display="flex" justifyContent="space-between" gap={2} flexWrap="wrap">
                      <Typography className="font-semibold">
                        {getUserName(review.reviewer)}
                      </Typography>
                      <Chip
                        label={statusLabelMap[review.decision as keyof typeof statusLabelMap] || review.decision}
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
          </CardContent>
        </Card>

        <Card className="border rounded-xl">
          <CardContent>
            <Typography variant="h6" className="font-semibold" gutterBottom>
              Decisão da Revisão
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Após conferir os dados do aluno, os revisores e o documento, escolha a decisão para este certificado.
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => openReviewDialog("APPROVED")}
              >
                Aprovar certificado
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => openReviewDialog("REJECTED")}
              >
                Rejeitar certificado
              </Button>
            </Box>
          </CardContent>
        </Card>
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
