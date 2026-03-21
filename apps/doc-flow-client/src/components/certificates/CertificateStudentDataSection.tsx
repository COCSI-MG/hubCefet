import { InfoCard } from "@/components/InfoCard";
import { CertificateReviewUser } from "@/lib/types/certificate-review.types";
import { CertificateDetailsSectionCard } from "./CertificateDetailsSectionCard";

interface CertificateStudentDataSectionProps {
  user: CertificateReviewUser;
  studentName: string;
}

export function CertificateStudentDataSection({
  user,
  studentName,
}: CertificateStudentDataSectionProps) {
  return (
    <CertificateDetailsSectionCard title="Dados do Aluno">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard label="Nome" data={studentName} />
        <InfoCard label="Email" data={user.email || "Não informado"} />
        <InfoCard
          label="Matrícula"
          data={user.enrollment || "Não informado"}
        />
      </div>
    </CertificateDetailsSectionCard>
  );
}
