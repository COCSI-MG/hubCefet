import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CertificateDetailsHeaderInfo } from "@/components/certificates/CertificateDetailsHeaderInfo";
import PageHeader from "@/components/PageHeader";
import { CertificateDocumentDataSection } from "@/components/certificates/CertificateDocumentDataSection";
import { CertificatePendingEditForm } from "@/components/certificates/CertificatePendingEditForm";
import { certificateService } from "@/api/services/certificate.service";
import { ApiError } from "@/api/errors/ApiError";
import { CertificateReviewDetailsData } from "@/lib/types/certificate-review.types";

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

export default function CertificateDetails() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<CertificateReviewDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activityId) {
      toast.error("Certificado não encontrado.");
      navigate("/docflow/certificates/dashboard", { replace: true });
      return;
    }

    loadCertificate(activityId);
  }, [activityId, navigate]);

  const loadCertificate = async (id: string) => {
    try {
      setLoading(true);
      const response = await certificateService.getActivity(id);
      setCertificate(response);
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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Não informado";
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const handleDownloadCertificate = async () => {
    if (!certificate) return;

    try {
      await certificateService.downloadCertificate(certificate.id);
      toast.success("Download iniciado!");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Erro ao baixar certificado.");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!certificate) {
    return (
      <Box className="ml-6 mr-6 mt-6 max-w-full">
        <Alert severity="error">
          Não foi possível carregar o certificado solicitado.
        </Alert>
      </Box>
    );
  }

  const certificateStatusName = certificate.status?.name || "PENDING";
  const certificateStatusDescription =
    certificate.status?.description || "Certificado aguardando avaliação.";
  const statusColor =
    statusColorMap[certificateStatusName as keyof typeof statusColorMap] || "default";
  const certificateStatusLabel =
    statusLabelMap[certificateStatusName as keyof typeof statusLabelMap] || certificateStatusName;
  const isPendingCertificate = certificate.status_id === 1;

  return (
    <>
      <PageHeader
        title="Detalhes do Certificado"
        description="Visualize os dados do certificado e acompanhe o status atual do documento"
      />

      <Box className="ml-6 mr-6 mt-6 max-w-full space-y-6">
        <CertificateDetailsHeaderInfo
          backLabel="Voltar para dashboard"
          backTo="/docflow/certificates/dashboard"
          onNavigate={navigate}
          onDownload={handleDownloadCertificate}
          title={certificate.course_name}
          certificateId={certificate.id}
          statusLabel={certificateStatusLabel}
          statusColor={statusColor}
          certificateType={certificate.activityType?.name || "Não informado"}
          hours={certificate.hours}
          createdAt={formatDateTime(certificate.created_at)}
          updatedAt={formatDateTime(certificate.updated_at)}
        />

        <CertificateDocumentDataSection
          statusLabel={certificateStatusLabel}
          statusDescription={certificateStatusDescription}
          complementaryTypeDescription={
            certificate.complementaryActivityType?.description
          }
        />

        {isPendingCertificate && (
          <CertificatePendingEditForm
            certificate={certificate}
            onUpdated={() => loadCertificate(certificate.id)}
          />
        )}
      </Box>
    </>
  );
}
