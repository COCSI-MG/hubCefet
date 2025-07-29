import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventIcon from '@mui/icons-material/Event';
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import useAuth from "@/hooks/useAuth";

export function AppSelection() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const getUserProfile = () => {
      try {
        if (token) {
          const decoded: any = jwtDecode(token);
          
          let profileName = '';
          if (typeof decoded.profile === 'string') {
            profileName = decoded.profile;
          } else if (decoded.profile?.name) {
            profileName = decoded.profile.name;
          } else if (decoded.profile?.roles && decoded.profile.roles.length > 0) {
            profileName = decoded.profile.roles[0];
          }
          
          const profileLower = profileName.toLowerCase();
          
          setIsAdmin(profileLower === 'admin' || profileLower === 'coordinator');
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
      }
    };
    
    getUserProfile();
  }, [token]);

  const navigateToSchedule = () => {
    if (isAdmin) {
      navigate("/horarios/gerenciar");
    } else {
      navigate("/horarios");
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Selecione o Aplicativo
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
            mt: 4,
            width: '100%'
          }}
        >
          <Card 
            sx={{ 
              height: '100%',
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <CardActionArea 
              onClick={() => navigate("/docflow")}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
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
              height: '100%',
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <CardActionArea 
              onClick={() => navigate("/events")}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <EventIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Eventos
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Gerenciamento de eventos acadêmicos
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card 
            sx={{ 
              height: '100%',
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <CardActionArea 
              onClick={navigateToSchedule}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <ScheduleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  {isAdmin ? "Gestão de Horários" : "Horários"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {isAdmin 
                    ? "Administração de horários, disciplinas e salas"
                    : "Consulta de horários e grade curricular"
                  }
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
      </Box>
    </Container>
  );
} 