import { ReactNode } from "react";
import { Card, CardContent, Divider, Typography } from "@mui/material";

interface CertificateDetailsSectionCardProps {
  title: string;
  children: ReactNode;
}

export function CertificateDetailsSectionCard({
  title,
  children,
}: CertificateDetailsSectionCardProps) {
  return (
    <Card className="border rounded-xl">
      <CardContent>
        <Typography variant="h6" className="font-semibold" gutterBottom>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );
}
