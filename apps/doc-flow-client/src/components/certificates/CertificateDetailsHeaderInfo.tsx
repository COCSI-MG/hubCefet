import { Box, Button, Card, CardContent, Chip, Typography } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { InfoCard } from "@/components/InfoCard";

interface CertificateDetailsHeaderInfoProps {
  backLabel: string;
  backTo: string;
  onNavigate: (path: string) => void;
  onDownload: () => void;
  title: string;
  certificateId: string;
  statusLabel: string;
  statusColor: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  certificateType: string;
  hours: number;
  createdAt: string;
  updatedAt: string;
}

export function CertificateDetailsHeaderInfo({
  backLabel,
  backTo,
  onNavigate,
  onDownload,
  title,
  certificateId,
  statusLabel,
  statusColor,
  certificateType,
  hours,
  createdAt,
  updatedAt,
}: CertificateDetailsHeaderInfoProps) {
  return (
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
              onClick={() => onNavigate(backTo)}
              sx={{ mb: 1, px: 0 }}
            >
              {backLabel}
            </Button>
            <Typography variant="h6" className="font-semibold">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID do certificado: {certificateId}
            </Typography>
          </Box>

          <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
            <Chip
              label={statusLabel}
              color={statusColor}
              variant="outlined"
            />
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={onDownload}
            >
              Baixar certificado
            </Button>
          </Box>
        </Box>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <InfoCard
            label="Tipo do Certificado"
            data={certificateType}
          />
          <InfoCard label="Horas" data={`${hours}h`} />
          <InfoCard
            label="Criada em"
            data={createdAt}
          />
          <InfoCard
            label="Atualizada em"
            data={updatedAt}
          />
        </div>
      </CardContent>
    </Card>
  );
}
