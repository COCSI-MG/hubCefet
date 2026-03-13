import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import EventIcon from "@mui/icons-material/Event";

export function AppSelection() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100%",
          py: { xs: 10, sm: 12 },
          px: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 600,
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
            textAlign: "center",
          }}
        >
          Selecione o Aplicativo
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: `repeat(2 , 1fr)`,
            },
            gap: { xs: 2, sm: 3, md: 4 },
            mt: { xs: 3, sm: 4 },
            width: "100%",
          }}
        >
          <Card
            sx={{
              height: "100%",
              display: "flex",
              "&:hover": {
                transform: "scale(1.02)",
                transition: "transform 0.2s ease-in-out",
              },
            }}
          >
            <CardActionArea
              onClick={() => navigate("/docflow")}
              sx={{ flexGrow: 1 }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  p: { xs: 3, sm: 4 }
                }}
              >
                <DescriptionIcon
                  sx={{
                    fontSize: { xs: 45, sm: 60 },
                    color: "primary.main",
                    mb: 2
                  }}
                />
                <Typography variant="h5" component="h2" gutterBottom>
                  DocFlow
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Gerenciamento de documentos e arquivos
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card
            sx={{
              height: "100%",
              display: "flex",
              "&:hover": {
                transform: "scale(1.02)",
                transition: "transform 0.2s ease-in-out",
              },
            }}
          >
            <CardActionArea
              onClick={() => navigate("/events")}
              sx={{ flexGrow: 1 }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  p: { xs: 3, sm: 4 },
                }}
              >
                <EventIcon
                  sx={{
                    fontSize: { xs: 45, sm: 60 },
                    color: "primary.main",
                    mb: 2
                  }}
                />
                <Typography variant="h5" component="h2" gutterBottom>
                  Eventos
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Gerenciamento de eventos acadêmicos
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

        </Box>
      </Box>
    </Container>
  );
}
