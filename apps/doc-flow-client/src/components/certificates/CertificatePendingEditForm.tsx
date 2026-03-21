import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { Award, Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { CertificateDetailsSectionCard } from "./CertificateDetailsSectionCard";
import CertificateFileUpload from "./CertificateFileUpload";
import { useActivityTypes } from "@/hooks/useActivityTypes";
import {
  ComplementaryActivityType,
  complementaryActivityTypeService,
} from "@/api/services/complementary-activity-type.service";
import { certificateService } from "@/api/services/certificate.service";
import { ApiError } from "@/api/errors/ApiError";
import { ActivityTypeEnum, UpdateCertificateData } from "@/lib/types/certificate.types";
import { CertificateReviewDetailsData } from "@/lib/types/certificate-review.types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CertificatePendingEditFormProps {
  certificate: CertificateReviewDetailsData;
  onUpdated: () => Promise<void> | void;
}

interface PendingEditFormState {
  activityType: string;
  complementaryHoursType: string;
  hours: string;
  courseName: string;
}

const initialFormState: PendingEditFormState = {
  activityType: "",
  complementaryHoursType: "",
  hours: "",
  courseName: "",
};

export function CertificatePendingEditForm({
  certificate,
  onUpdated,
}: CertificatePendingEditFormProps) {
  const [formData, setFormData] = useState<PendingEditFormState>(initialFormState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingComplementaryTypes, setLoadingComplementaryTypes] = useState(false);
  const [complementaryActivityTypes, setComplementaryActivityTypes] = useState<
    ComplementaryActivityType[]
  >([]);

  const {
    activityTypes,
    loading: loadingActivityTypes,
    error: activityTypesError,
    refetch,
  } = useActivityTypes();

  const effectiveActivityType = formData.activityType || certificate.activity_type_id.toString();
  const shouldShowComplementaryType =
    effectiveActivityType === ActivityTypeEnum.COMPLEMENTARY.toString();

  const currentComplementaryTypeName = useMemo(() => {
    return certificate.complementaryActivityType?.name || "Não informado";
  }, [certificate.complementaryActivityType?.name]);

  useEffect(() => {
    if (!shouldShowComplementaryType || complementaryActivityTypes.length > 0) {
      return;
    }

    const loadComplementaryTypes = async () => {
      try {
        setLoadingComplementaryTypes(true);
        const response = await complementaryActivityTypeService.findAll();
        setComplementaryActivityTypes(response.rows);
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
          return;
        }

        toast.error("Erro ao carregar tipos de atividades complementares.");
      } finally {
        setLoadingComplementaryTypes(false);
      }
    };

    void loadComplementaryTypes();
  }, [complementaryActivityTypes.length, shouldShowComplementaryType]);

  const handleChange = (field: keyof PendingEditFormState, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
      ...(field === "activityType" && value !== ActivityTypeEnum.COMPLEMENTARY.toString()
        ? { complementaryHoursType: "" }
        : {}),
    }));
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    const payload: UpdateCertificateData = {};
    const trimmedCourseName = formData.courseName.trim();
    const trimmedHours = formData.hours.trim();

    if (trimmedCourseName) {
      payload.courseName = trimmedCourseName;
    }

    if (trimmedHours) {
      const parsedHours = Number(trimmedHours);

      if (!Number.isInteger(parsedHours) || parsedHours < 1 || parsedHours > 999) {
        toast.error("Informe uma quantidade de horas entre 1 e 999.");
        return;
      }

      payload.hours = parsedHours;
    }

    if (formData.activityType) {
      payload.activityType = formData.activityType;

      if (formData.activityType !== ActivityTypeEnum.COMPLEMENTARY.toString()) {
        payload.complementaryHoursType = null;
      }
    }

    if (formData.complementaryHoursType) {
      payload.complementaryHoursType = formData.complementaryHoursType;
    }

    if (selectedFile) {
      payload.certificateFile = selectedFile;
    }

    if (Object.keys(payload).length === 0) {
      toast.error("Preencha pelo menos um campo ou envie outro arquivo para editar o certificado.");
      return;
    }

    try {
      setIsSubmitting(true);
      await certificateService.updateActivity(certificate.id, payload);
      toast.success("Certificado atualizado com sucesso.");
      handleReset();
      await onUpdated();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Erro ao atualizar certificado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CertificateDetailsSectionCard title="Editar Certificado">
      <Box className="space-y-6">
        <Box className="flex items-center space-x-3 mb-6">
          <Award className="h-6 w-6 text-sky-700" />
          <Typography variant="h5" className="text-xl font-semibold text-sky-900">
            Edição de Certificado
          </Typography>
        </Box>

        <Alert severity="info" className="rounded-2xl">
          Deixe em branco os campos que não deseja alterar. Se quiser, envie outro PDF
          junto com a edição enquanto o certificado estiver pendente.
        </Alert>

        {activityTypesError ? (
          <Box className="space-y-3">
            <Alert severity="error">Erro ao carregar tipos de atividade.</Alert>
            <Button type="button" variant="outline" onClick={refetch}>
              Tentar novamente
            </Button>
          </Box>
        ) : (
          <>
            <Box className="space-y-6">
              <Box className="space-y-2">
                <Typography variant="body2" className="font-medium">
                  Tipo de Atividade
                </Typography>
                <SearchableSelect
                  options={activityTypes.map((type) => ({
                    value: type.id,
                    label: type.name,
                  }))}
                  value={formData.activityType}
                  onValueChange={(value) => handleChange("activityType", value)}
                  placeholder={`Atual: ${certificate.activityType?.name || "Não informado"}`}
                  searchPlaceholder="Buscar tipos de atividade..."
                  emptyText="Nenhum tipo encontrado"
                  disabled={loadingActivityTypes || isSubmitting}
                  className={cn("rounded-2xl bg-white bg-opacity-60")}
                />
              </Box>

              <Box className="space-y-2">
                <Typography variant="body2" className="font-medium">
                  Quantidade de Horas
                </Typography>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={formData.hours}
                  onChange={(event) => handleChange("hours", event.target.value)}
                  placeholder={`Atual: ${certificate.hours}`}
                  disabled={isSubmitting}
                  className="rounded-2xl bg-white bg-opacity-60"
                />
              </Box>

              <Box className="space-y-2">
                <Typography variant="body2" className="font-medium">
                  Nome do Curso
                </Typography>
                <Input
                  value={formData.courseName}
                  onChange={(event) => handleChange("courseName", event.target.value)}
                  placeholder={`Atual: ${certificate.course_name}`}
                  disabled={isSubmitting}
                  className="rounded-2xl bg-white bg-opacity-60"
                />
              </Box>

              {shouldShowComplementaryType && (
                <Box className="space-y-2">
                  <Typography variant="body2" className="font-medium">
                    Tipo de Atividade Complementar
                  </Typography>
                  <SearchableSelect
                    options={complementaryActivityTypes.map((type) => ({
                      value: type.id.toString(),
                      label: type.name,
                      description: type.description,
                    }))}
                    value={formData.complementaryHoursType}
                    onValueChange={(value) => handleChange("complementaryHoursType", value)}
                    placeholder={`Atual: ${currentComplementaryTypeName}`}
                    searchPlaceholder="Buscar tipos complementares..."
                    emptyText="Nenhum tipo encontrado"
                    disabled={loadingComplementaryTypes || isSubmitting}
                    className={cn("rounded-2xl bg-white bg-opacity-60")}
                  />
                </Box>
              )}

              <Box className="space-y-2">
                <Typography
                  component="label"
                  variant="body2"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Novo Certificado (PDF)
                </Typography>
                <CertificateFileUpload
                  onFileSelect={setSelectedFile}
                  selectedFile={selectedFile}
                  disabled={isSubmitting}
                />
              </Box>
            </Box>

            <Box className="space-y-3">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || loadingActivityTypes}
                className="w-full rounded-2xl bg-sky-700 hover:bg-sky-800"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
                className="w-full rounded-2xl"
              >
                Limpar Formulário
              </Button>
            </Box>
          </>
        )}
      </Box>
    </CertificateDetailsSectionCard>
  );
}
