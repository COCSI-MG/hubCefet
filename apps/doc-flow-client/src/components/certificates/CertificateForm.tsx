import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Award } from "lucide-react";
import { Box, Typography } from "@mui/material";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

import { ActivityTypeEnum, CertificateFormData } from "@/lib/types/certificate.types";
import CertificateFileUpload from "./CertificateFileUpload";
import HoursInput from "./HoursInput";
import { useActivityTypes } from "@/hooks/useActivityTypes";

const certificateFormSchema = z.object({
  activityType: z.string().min(1, "Selecione o tipo de atividade"),
  hours: z.number().min(1, "Quantidade de horas deve ser maior que 0").max(999, "Quantidade máxima é 999 horas"),
  courseName: z.string().min(2, "Nome do curso deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  complementaryHoursType: z.string().min(1, "Selecione o tipo de atividade complementar").optional(),

});

type CertificateFormSchema = z.infer<typeof certificateFormSchema>;

interface CertificateFormProps {
  onSubmit: (data: CertificateFormData) => Promise<void>;
  disabled?: boolean;
}

export default function CertificateForm({ onSubmit, disabled = false }: CertificateFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { activityTypes, loading: typesLoading, error: typesError, refetch } = useActivityTypes();

  const form = useForm<CertificateFormSchema>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: {
      activityType: undefined,
      hours: 1,
      courseName: "",
      complementaryHoursType: undefined
    },
  });

  const handleFormSubmit = async (data: CertificateFormSchema) => {
    if (!selectedFile) {
      toast.error("Por favor, selecione um arquivo de certificado");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData: CertificateFormData = {
        ...data,
        certificateFile: selectedFile,
      };

      await onSubmit(formData);

      form.reset();
      setSelectedFile(null);

      toast.success("Certificado enviado com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar certificado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHoursChange = (value: number) => {
    form.setValue("hours", value, { shouldValidate: true });
  };

  const isFormDisabled = disabled || isSubmitting || typesLoading;

  const activityTypeValue = form.watch('activityType')

  if (typesError) {
    return (
      <Box className="text-center p-8 space-y-4">
        <Typography variant="body1" color="error">
          Erro ao carregar tipos de atividades
        </Typography>
        <Button onClick={refetch} variant="outline">
          Tentar novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      <Box className="flex items-center space-x-3 mb-6">
        <Award className="h-6 w-6 text-sky-700" />
        <Typography variant="h5" className="text-xl font-semibold text-sky-900">
          Cadastro de Certificado
        </Typography>
      </Box>

      <Form {...form}>
        <Box component="form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="activityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Atividade</FormLabel>
                <FormControl>
                  <SearchableSelect
                    options={activityTypes.map(type => ({
                      value: type.id,
                      label: type.name,
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Selecione o tipo de atividade"
                    searchPlaceholder="Buscar tipos de atividade..."
                    emptyText="Nenhum tipo encontrado"
                    disabled={isFormDisabled}
                    className={cn(
                      form.formState.errors.activityType && "border-destructive"
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {activityTypeValue === ActivityTypeEnum.COMPLEMENTARY.toString() && (
            <FormField
              control={form.control}
              name="complementaryHoursType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Atividade Complementar</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={activityTypes.map(type => ({
                        value: type.id,
                        label: type.name,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione o tipo de atividade complementar"
                      searchPlaceholder="Buscar tipos de atividades complementares..."
                      emptyText="Nenhum tipo encontrado"
                      disabled={isFormDisabled}
                      className={cn(
                        form.formState.errors.complementaryHoursType && "border-destructive"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}


          <FormField
            control={form.control}
            name="hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade de Horas</FormLabel>
                <FormControl>
                  <HoursInput
                    value={field.value}
                    onChange={handleHoursChange}
                    disabled={isFormDisabled}
                    error={form.formState.errors.hours?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Curso</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex: Curso de React Avançado"
                    disabled={isFormDisabled}
                    className={cn(
                      "rounded-2xl bg-white bg-opacity-60",
                      form.formState.errors.courseName && "border-destructive"
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Box className="space-y-2">
            <Typography
              component="label"
              variant="body2"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Certificado (PDF)
            </Typography>
            <CertificateFileUpload
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              disabled={isFormDisabled}
            />
          </Box>

          <Button
            type="submit"
            disabled={isFormDisabled || !selectedFile}
            className="w-full rounded-2xl bg-sky-700 hover:bg-sky-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Cadastrar Certificado"
            )}
          </Button>
        </Box>
      </Form>
    </Box>
  );
}


