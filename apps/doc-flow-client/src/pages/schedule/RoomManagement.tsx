import { Box, Paper, Typography, Button } from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SubjectIcon from '@mui/icons-material/Subject';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';

export default function RoomManagement() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 1, maxWidth: 900, mx: 'auto', mt: 4, background: 'transparent' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: { xs: 'center', md: 'left' }, color: 'primary.main' }}>
          Gestão do Sistema
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' }, color: 'text.secondary' }}>
          Acesse rapidamente os principais módulos administrativos do sistema.
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)' 
          }, 
          gap: 2,
          justifyItems: 'center'
        }}>
          <Box sx={{ width: '100%', maxWidth: 280 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/horarios/aulas')}
              sx={{
                width: '100%',
                minHeight: 56,
                fontSize: 16,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1.5,
                px: 3
              }}
              startIcon={<ClassIcon sx={{ fontSize: 28 }} />}
            >
              Gerenciar Aulas
            </Button>
          </Box>
          <Box sx={{ width: '100%', maxWidth: 280 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/horarios/disciplinas/cadastrar')}
              sx={{
                width: '100%',
                minHeight: 56,
                fontSize: 16,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1.5,
                px: 3
              }}
              startIcon={<SubjectIcon sx={{ fontSize: 28 }} />}
            >
              Gerenciar Disciplinas
            </Button>
          </Box>
          <Box sx={{ width: '100%', maxWidth: 280 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/horarios/salas/gerenciar')}
              sx={{
                width: '100%',
                minHeight: 56,
                fontSize: 16,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1.5,
                px: 3
              }}
              startIcon={<MeetingRoomIcon sx={{ fontSize: 28 }} />}
            >
              Gerenciar Salas
            </Button>
          </Box>
          <Box sx={{ width: '100%', maxWidth: 280 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/horarios/periodos')}
              sx={{
                width: '100%',
                minHeight: 56,
                fontSize: 16,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1.5,
                px: 3
              }}
              startIcon={<DateRangeIcon sx={{ fontSize: 28 }} />}
            >
              Gerenciar Períodos
            </Button>
          </Box>
          <Box sx={{ width: '100%', maxWidth: 280 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/horarios/horarios/gerenciar')}
              sx={{
                width: '100%',
                minHeight: 56,
                fontSize: 16,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1.5,
                px: 3
              }}
              startIcon={<AccessTimeIcon sx={{ fontSize: 28 }} />}
            >
              Gerenciar Horários
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}