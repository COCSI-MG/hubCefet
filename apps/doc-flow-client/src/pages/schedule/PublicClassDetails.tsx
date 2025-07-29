import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ClassIcon from '@mui/icons-material/Class';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import classesService from '@/api/services/classes';
import { ClassWithDetails } from '@/api/services/classes';

interface PublicClassUI {
  id: number;
  name: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  year: number;
  semester: number;
  schedules: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
  locations: Array<{
    building?: string;
    room?: string;
  }>;
}

const formatTime = (timeStr: string | undefined | null): string => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
};

export default function PublicClassDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState<PublicClassUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID da aula não fornecido');
      setLoading(false);
      return;
    }

    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        const classDetails: ClassWithDetails = await classesService.getPublicClassById(parseInt(id));
        
        if (!classDetails) {
          setError('Aula não encontrada');
          setLoading(false);
          return;
        }
        
        const semesterData = (classDetails as any).semester || { number: 0, year: 0 };
        const teacherName = classDetails.teacher?.full_name || '';
        
        let schedules: Array<{
          dayOfWeek: string;
          startTime: string;
          endTime: string;
        }> = [];
        let locations: Array<{
          building?: string;
          room?: string;
        }> = [];

        const dayOfWeekMap: { [key: string]: string } = {
          'SUNDAY': 'Domingo',
          'MONDAY': 'Segunda-feira',
          'TUESDAY': 'Terça-feira',
          'WEDNESDAY': 'Quarta-feira',
          'THURSDAY': 'Quinta-feira',
          'FRIDAY': 'Sexta-feira',
          'SATURDAY': 'Sábado'
        };

        if (classDetails.schedules && classDetails.schedules.length > 0) {
          classDetails.schedules.forEach((schedule: any) => {
            if (schedule.time_slot) {
              const dayOfWeek = schedule.time_slot.day_of_week || schedule.time_slot.dayOfWeek;
              const dayInPortuguese = dayOfWeekMap[dayOfWeek] || dayOfWeek;
              
              schedules.push({
                dayOfWeek: dayInPortuguese,
                startTime: formatTime(schedule.time_slot.start_time),
                endTime: formatTime(schedule.time_slot.end_time)
              });

              const building = schedule.building?.name || '';
              const room = schedule.room?.name || '';
              locations.push({ building, room });
            }
          });
        }

        const publicClassData: PublicClassUI = {
          id: classDetails.id || 0,
          name: classDetails.name,
          subjectName: classDetails.subject?.name || '',
          subjectCode: classDetails.subject?.code || '',
          teacherName,
          year: Number(semesterData.year) || 0,
          semester: Number(semesterData.number) || 0,
          schedules,
          locations
        };

        setClassData(publicClassData);
      } catch (error) {
        console.error('Erro ao buscar detalhes da aula:', error);
        setError('Erro ao carregar informações da aula');
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [id]);

  const handleBack = () => {
    navigate('/horarios/todos');
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : classData ? (
        <>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<ArrowBackIcon />} 
                onClick={handleBack}
              >
                Voltar aos Horários
              </Button>
            </Box>
            
            <Typography variant="h4" gutterBottom>
              {classData.subjectName}
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom color="text.secondary">
              Código: {classData.subjectCode}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ClassIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">
                    Semestre: {classData.year}.{classData.semester}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">
                    Professor: {classData.teacherName}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                {/* Seção de Horários */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                  }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      Horários e Local
                    </Typography>
                  </Box>
                  
                  {classData.schedules && classData.schedules.length > 0 ? (
                    <TableContainer 
                      component={Paper} 
                      elevation={0}
                      sx={{ borderRadius: 1 }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Dia</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Horário</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '45%' }}>Local</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {classData.schedules.map((schedule, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {schedule.dayOfWeek}
                                </Typography>
                              </TableCell>
                              
                              <TableCell>
                                <Typography variant="body2">
                                  {schedule.startTime} - {schedule.endTime}
                                </Typography>
                              </TableCell>
                              
                              <TableCell>
                                {classData.locations && classData.locations[index] ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocationOnIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: 16 }} />
                                    <Typography variant="body2">
                                      {classData.locations[index].building && <span style={{ fontWeight: 500 }}>{classData.locations[index].building}</span>}
                                      {classData.locations[index].building && classData.locations[index].room && ' - '}
                                      {classData.locations[index].room && `Sala ${classData.locations[index].room}`}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    Local não definido
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Não há horários definidos para esta aula.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </>
      ) : null}
    </Box>
  );
} 
 
 