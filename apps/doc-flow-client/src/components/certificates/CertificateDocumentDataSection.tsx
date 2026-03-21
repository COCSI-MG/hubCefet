import { InfoCard } from "@/components/InfoCard";
import { CertificateDetailsSectionCard } from "./CertificateDetailsSectionCard";

interface CertificateDocumentDataSectionProps {
  statusLabel: string;
  statusDescription: string;
  complementaryTypeDescription?: string | null;
}

export function CertificateDocumentDataSection({
  statusLabel,
  statusDescription,
  complementaryTypeDescription,
}: CertificateDocumentDataSectionProps) {
  return (
    <CertificateDetailsSectionCard title="Dados do Documento">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard label="Status" data={statusLabel} />
        <InfoCard label="Descrição do Status" data={statusDescription} />
        <InfoCard
          label="Descrição do Tipo Complementar"
          data={complementaryTypeDescription || "Não se aplica"}
        />
      </div>
    </CertificateDetailsSectionCard>
  );
}
