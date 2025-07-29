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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ClassIcon from '@mui/icons-material/Class';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { jwtDecode } from 'jwt-decode';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { ClassUI } from '@/pages/schedule/ClassManagement';
import classesService from '@/api/services/classes';
import { ClassWithDetails, ClassCancellation } from '@/api/services/classes';
import { User } from '@/api/services/users';

interface UserProfile {
  isAdmin: boolean;
  userId: string;
  profileName: string;
}

interface StudentUI extends User {
  name?: string;
  enrollment?: string;
}

interface ExtendedClassUI extends Omit<ClassUI, 'students'> {
  students: StudentUI[];
}

const DAY_STRING_TO_NUMBER: { [key: string]: number } = {
  DOMINGO: 0,
  SEGUNDA: 1,
  TERÇA: 2,
  QUARTA: 3,
  QUINTA: 4,
  SEXTA: 5,
  SÁBADO: 6,
};

const formatTime = (timeStr: string | undefined | null): string => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
};

export default function ClassDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState<ExtendedClassUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    isAdmin: false,
    userId: '',
    profileName: ''
  });
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const [cancellations, setCancellations] = useState<ClassCancellation[]>([]);
  const [loadingCancellations, setLoadingCancellations] = useState(false);

  useEffect(() => {
    const getUserProfile = () => {
      try {
        const token = localStorage.getItem('accessToken');
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
          
          const isAdmin = profileName?.toLowerCase() === 'admin' || profileName?.toLowerCase() === 'coordinator';
          const userId = decoded.sub || decoded.id || '';
          
          setUserProfile({
            isAdmin,
            userId,
            profileName
          });
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
      }
    };
    
    getUserProfile();
  }, []);

  useEffect(() => {
    if (!id) {
      setError('ID da aula não fornecido');
      setLoading(false);
      return;
    }

    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        const classDetails: ClassWithDetails = await classesService.getClassById(parseInt(id));
        
        if (!classDetails) {
          setError('Aula não encontrada');
          setLoading(false);
          return;
        }
        
        const semesterData = (classDetails as any).semester || { number: 0, year: 0 };
        
        const teacherName = classDetails.teacher?.full_name || '';
        const teacherId = classDetails.teacher?.id || (classDetails as any).teacherId || '';
        
        let schedules = [];
        let locations = [];

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
              const startTime = schedule.time_slot.start_time || schedule.time_slot.startTime;
              const endTime = schedule.time_slot.end_time || schedule.time_slot.endTime;
              
              schedules.push({
                dayOfWeek: dayOfWeekMap[dayOfWeek] || dayOfWeek,
                startTime: formatTime(startTime),
                endTime: formatTime(endTime)
              });
              
              const building = schedule.room?.building?.name || '';
              const room = schedule.room?.name || '';
              
              locations.push({
                building,
                room
              });
            }
          });
        } else if ((classDetails as any).schedule) {
          const scheduleString = (classDetails as any).schedule.toUpperCase();
          const parts = scheduleString.split(' ');
          
          if (parts.length >= 3) {
            const dayOfWeekDisplay = parts[0];
            const startTimeStr = parts[1];
            const endTimeStr = parts.length >= 4 && parts[2] === '-' ? parts[3] : '';

            if (DAY_STRING_TO_NUMBER[dayOfWeekDisplay] !== undefined) {
              schedules.push({
                dayOfWeek: dayOfWeekDisplay,
                startTime: formatTime(startTimeStr),
                endTime: formatTime(endTimeStr)
              });
              
              const building = (classDetails as any).room?.building?.name || '';
              const room = (classDetails as any).room?.name || '';
              
              locations.push({
                building,
                room
              });
            }
          }
        }

        const mappedStudents = (classDetails.students || []).map(student => ({
          ...student,
          name: student.full_name || student.email || 'Nome não disponível',
          enrollment: (student as any).enrollment || '-'
        }));

        const mappedClass: ExtendedClassUI = {
          id: classDetails.id?.toString() || '',
          subjectName: classDetails.subject?.name || '',
          subjectCode: classDetails.subject?.code || '',
          semester: parseInt(semesterData.number?.toString() || '0'),
          year: parseInt(semesterData.year?.toString() || '0'),
          teacherId: teacherId,
          teacherName: teacherName,
          schedules: schedules,
          locations: locations,
          students: mappedStudents,
        };
        
        setClassData(mappedClass);
        setLoading(false);
      } catch (err: any) {
        console.error('Erro ao carregar detalhes da aula:', err);
        setError('Erro ao carregar detalhes da aula: ' + (err.message || 'Erro desconhecido'));
        setLoading(false);
      }
    };

    const fetchCancellations = async () => {
      if (!id) return;
      
      try {
        setLoadingCancellations(true);
        const data = await classesService.getClassCancellations(parseInt(id));
        setCancellations(data);
      } catch (err) {
        console.error('Erro ao carregar cancelamentos:', err);
      } finally {
        setLoadingCancellations(false);
      }
    };

    fetchClassDetails();
    fetchCancellations();
  }, [id]);

  const handleBack = () => {
    if (userProfile.profileName.toLowerCase() === 'student' || userProfile.profileName.toLowerCase() === 'aluno') {
      navigate('/horarios');
    } else {
      navigate('/horarios/aulas');
    }
  };

  const handleEdit = () => {
    navigate(`/horarios/aulas/editar/${id}`);
  };

  const handleManageStudents = () => {
    navigate(`/horarios/aulas/alunos/${id}`);
  };

  const handleCancelClasses = () => {
    navigate(`/horarios/aulas/cancelar/${id}`);
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDeleteClass = async () => {
    if (!id) return;
    
    try {
      setDeleteLoading(true);
      await classesService.deleteClass(parseInt(id));
      setDeleteLoading(false);
      setOpenDeleteDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Aula excluída com sucesso',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/horarios/aulas');
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao excluir aula:', err);
      setDeleteLoading(false);
      setOpenDeleteDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Erro ao excluir aula: ' + (err.message || 'Erro desconhecido'),
        severity: 'error'
      });
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!id) return;
    
    try {
      await classesService.removeStudent(parseInt(id), studentId);
      
      if (classData) {
        setClassData({
          ...classData,
          students: classData.students.filter(student => student.id !== studentId)
        });
      }
      
      setSnackbar({
        open: true,
        message: 'Aluno removido com sucesso',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Erro ao remover aluno:', err);
      
      setSnackbar({
        open: true,
        message: 'Erro ao remover aluno: ' + (err.message || 'Erro desconhecido'),
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      return dateString;
    }
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
                Voltar
              </Button>
              
              <Box>
                {(userProfile.isAdmin || (userProfile.profileName.toLowerCase() === 'professor' && userProfile.userId === classData.teacherId)) && (
                  <>
                    <Button 
                      startIcon={<EditIcon />} 
                      onClick={handleEdit}
                      variant="outlined"
                      sx={{ mr: 1 }}
                    >
                      Editar Aula
                    </Button>
                    <Button 
                      startIcon={<EventBusyIcon />} 
                      onClick={handleCancelClasses}
                      variant="outlined"
                      color="warning"
                      sx={{ mr: 1 }}
                    >
                      Cancelar Aulas
                    </Button>
                    <Button 
                      startIcon={<DeleteIcon />} 
                      onClick={handleOpenDeleteDialog}
                      variant="outlined"
                      color="error"
                    >
                      Excluir Aula
                    </Button>
                  </>
                )}
              </Box>
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
                                  <Typography variant="body2">
                                    {classData.locations[index].building && <span style={{ fontWeight: 500 }}>{classData.locations[index].building}</span>}
                                    {classData.locations[index].building && classData.locations[index].room && ' - '}
                                    {classData.locations[index].room && `Sala ${classData.locations[index].room}`}
                                  </Typography>
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
            
            <Divider sx={{ my: 3 }} />
            
            {/* Seção de Cancelamentos */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventBusyIcon sx={{ mr: 1, color: 'primary.main' }} /> Aulas Canceladas
                </Typography>
                
                {(userProfile.isAdmin || (userProfile.profileName.toLowerCase() === 'professor' && userProfile.userId === classData.teacherId)) && (
                  <Button 
                    variant="contained" 
                    color="warning"
                    onClick={handleCancelClasses}
                    startIcon={<EventBusyIcon />}
                  >
                    Cancelar Aula
                  </Button>
                )}
              </Box>
              
              {loadingCancellations ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : cancellations.length > 0 ? (
                <TableContainer component={Paper} elevation={0} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Motivo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cancellations.map((cancellation) => (
                        <TableRow key={cancellation.id} hover>
                          <TableCell>{formatDate(cancellation.date)}</TableCell>
                          <TableCell>{cancellation.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Não há aulas canceladas nesta disciplina.
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Seção de Estudantes - Visível apenas para admin/coordenador e professor da aula */}
            {(userProfile.isAdmin || (userProfile.profileName.toLowerCase() === 'professor' && userProfile.userId === classData.teacherId)) && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} /> Alunos Matriculados
                  </Typography>
                  
                  {(userProfile.isAdmin || (userProfile.profileName.toLowerCase() === 'professor' && userProfile.userId === classData.teacherId)) && (
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={handleManageStudents}
                    >
                      Gerenciar Alunos
                    </Button>
                  )}
                </Box>
                
                {classData.students && classData.students.length > 0 ? (
                  <TableContainer component={Paper} elevation={0} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Matrícula</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {classData.students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.name || student.full_name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.enrollment || '-'}</TableCell>
                            <TableCell align="right">
                              {(userProfile.isAdmin || 
                              (userProfile.profileName.toLowerCase() === 'professor' && userProfile.userId === classData.teacherId)) && (
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleRemoveStudent(student.id)}
                                  title="Remover aluno da aula"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Não há alunos matriculados nesta aula.
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
          
          {/* Diálogo de Confirmação de Exclusão */}
          <Dialog
            open={openDeleteDialog}
            onClose={handleCloseDeleteDialog}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <DialogTitle id="delete-dialog-title">Excluir Aula</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-dialog-description">
                Tem certeza de que deseja excluir esta aula? Esta ação não pode ser desfeita.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog} color="primary">
                Cancelar
              </Button>
              <Button 
                onClick={handleDeleteClass} 
                color="error" 
                autoFocus
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Excluindo...' : 'Excluir'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
      
      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
