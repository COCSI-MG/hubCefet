import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Divider, Chip, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClassIcon from '@mui/icons-material/Class';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';

import { SubjectDetails as SubjectDetailsType, fetchSubjectDetails } from '@/api/services/subjectDetails';

export default function SubjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<SubjectDetailsType | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID da disciplina não fornecido');
      setLoading(false);
      return;
    }

    fetchSubjectDetails(id)
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar detalhes da disciplina:", err);
        setError(err.message || 'Erro ao carregar detalhes da disciplina');
        setLoading(false);
      });
  }, [id]);

  const handleBack = () => {
    navigate('/horarios');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !details) {
    return (
      <Box sx={{ 
        p: 3, 
        width: '100%', 
        position: 'relative',
        zIndex: 1
      }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'Disciplina não encontrada'}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Voltar
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      width: '100%', 
      height: '100%',
      position: 'relative',
      zIndex: 1,
      backgroundColor: '#f5f5f5'
    }}>
      <Paper sx={{ 
        p: 3, 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', 
        borderRadius: '8px',
        height: 'auto'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Voltar
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {details.name}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ClassIcon sx={{ mr: 1 }} /> Informações da Disciplina
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" color="text.secondary">Código</Typography>
                  <Typography variant="body1">{details.code}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" color="text.secondary">Curso</Typography>
                  <Typography variant="body1">{details.course}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle1" color="text.secondary">Ano</Typography>
                  <Typography variant="body1">{details.year}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle1" color="text.secondary">Período</Typography>
                  <Typography variant="body1">{details.semester}º Semestre</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" color="text.secondary">Tipo de Turma</Typography>
                  <Chip 
                    label={details.classType} 
                    color={details.classType === 'Obrigatória' ? 'primary' : 'secondary'} 
                    size="small" 
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} /> Docentes
              </Typography>
              {details.teachers && details.teachers.map((teacher, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{teacher.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{teacher.role}</Typography>
                  {index < (details.teachers?.length || 0) - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
              {(!details.teachers || details.teachers.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  Nenhum docente cadastrado
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1 }} /> Horários
              </Typography>
              {details.schedules && details.schedules.map((schedule, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="subtitle2" color="text.secondary">Dia</Typography>
                      <Typography variant="body2">{schedule.dayOfWeek}</Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="subtitle2" color="text.secondary">Início</Typography>
                      <Typography variant="body2">{schedule.startTime}</Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="subtitle2" color="text.secondary">Fim</Typography>
                      <Typography variant="body2">{schedule.endTime}</Typography>
                    </Grid>
                  </Grid>
                  {index < (details.schedules?.length || 0) - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
              {(!details.schedules || details.schedules.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  Nenhum horário cadastrado
                </Typography>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarMonthIcon sx={{ mr: 1, fontSize: '1rem' }} /> Período Letivo
                </Typography>
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">Início</Typography>
                    <Typography variant="body2">{details.startDate || 'Não informado'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">Fim</Typography>
                    <Typography variant="body2">{details.endDate || 'Não informado'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <MeetingRoomIcon sx={{ mr: 1 }} /> Espaço Físico
              </Typography>
              {details.locations && details.locations.map((location, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">Bloco</Typography>
                      <Typography variant="body2">{location.building}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">Sala</Typography>
                      <Typography variant="body2">{location.room}</Typography>
                    </Grid>
                  </Grid>
                  {details.schedules && details.schedules[index] && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {details.schedules[index].dayOfWeek}, {details.schedules[index].startTime} - {details.schedules[index].endTime}
                    </Typography>
                  )}
                  {index < (details.locations?.length || 0) - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
              {(!details.locations || details.locations.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  Nenhum local cadastrado
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
} 