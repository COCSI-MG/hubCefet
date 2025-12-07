import { useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import CertificateForm from "@/components/certificates/CertificateForm";
import { CertificateFormData } from "@/lib/types/certificate.types";
import { certificateService } from "@/api/services/certificate.service";
import { Box, Typography } from "@mui/material";
import { toast } from "sonner";
import { ApiError } from "@/api/errors/ApiError";

export default function CertificateCreate() {
  const handleSubmit = useCallback(async (data: CertificateFormData) => {
    try {
      await certificateService.uploadCertificate(data);

      toast.success("Certificado enviado com sucesso!");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }

      toast.error("Não foi possível enviar o certificado.");
    }
  }, []);

  return (
    <>
      <PageHeader
        title="Cadastro de Certificados"
        description="Cadastre seus certificados para validação acadêmica"
      />

      <Box className="ml-6 mr-6 mt-6 max-w-full p-6 border rounded-xl">
        <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Box className="lg:col-span-2">
            <Box className="p-6 border rounded-xl bg-neutral-50">
              <CertificateForm onSubmit={handleSubmit} />
            </Box>
          </Box>

          <Box className="space-y-6">
            <Box className="p-6 border rounded-xl bg-blue-50">
              <Typography variant="h6" className="text-lg font-semibold text-blue-900 mb-4">
                📋 Instruções
              </Typography>
              <Box component="ul" className="space-y-2 text-sm text-blue-800">
                <Typography component="li" variant="body2">• Selecione o tipo correto de atividade</Typography>
                <Typography component="li" variant="body2">• Informe a quantidade exata de horas</Typography>
                <Typography component="li" variant="body2">• Digite o nome completo do curso/atividade</Typography>
                <Typography component="li" variant="body2">• Faça upload apenas de arquivos PDF</Typography>
                <Typography component="li" variant="body2">• Tamanho máximo: 10MB</Typography>
              </Box>
            </Box>

            <Box className="p-6 border rounded-xl bg-green-50">
              <Typography variant="h6" className="text-lg font-semibold text-green-900 mb-4">
                ✅ Documentos Aceitos
              </Typography>
              <Box component="ul" className="space-y-2 text-sm text-green-800">
                <Typography component="li" variant="body2">• Certificados de conclusão</Typography>
                <Typography component="li" variant="body2">• Declarações de participação</Typography>
                <Typography component="li" variant="body2">• Atestados de atividades</Typography>
                <Typography component="li" variant="body2">• Comprovantes oficiais</Typography>
              </Box>
            </Box>

            <Box className="p-6 border rounded-xl bg-yellow-50">
              <Typography variant="h6" className="text-lg font-semibold text-yellow-900 mb-4">
                ⚠️ Importante
              </Typography>
              <Typography variant="body2" className="text-sm text-yellow-800">
                Todos os certificados passarão por análise da coordenação acadêmica.
                Documentos inválidos ou fraudulentos serão rejeitados.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}


