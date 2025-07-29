import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import { format, addDays, isAfter, isBefore, isSameDay } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import classesService from '@/api/services/classes';
import { ClassWithDetails } from '@/api/services/classes';
import { jwtDecode } from 'jwt-decode';

const WEEKDAYS = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const WEEKDAYS_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

interface ClassDate {
  date: Date;
  formatted: string;
  weekday: string;
  selected: boolean;
  isCancelled: boolean;
  cancellationReason?: string;
}

export default function CancelClass() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState<ClassWithDetails | null>(null);
  const [classDates, setClassDates] = useState<ClassDate[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [profileName, setProfileName] = useState<string>('');
  
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  useEffect(() => {
    const getUserInfo = () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const decoded: any = jwtDecode(token);
          setUserId(decoded.sub || '');
          
          let profile = '';
          if (typeof decoded.profile === 'string') {
            profile = decoded.profile;
          } else if (decoded.profile?.name) {
            profile = decoded.profile.name;
          }
          
          setProfileName(profile);
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
      }
    };
    
    getUserInfo();
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
        
        const [classDetails, cancellations] = await Promise.all([
          classesService.getClassById(parseInt(id)),
          classesService.getClassCancellations(parseInt(id))
        ]);
        
        if (!classDetails) {
          setError('Aula não encontrada');
          setLoading(false);
          return;
        }
        
        setClassData(classDetails);
        
        if (profileName.toLowerCase() === 'professor' && classDetails.teacherId !== userId) {
          setError('Você não tem permissão para cancelar esta aula');
          setLoading(false);
          return;
        }

        generateClassDates(classDetails, cancellations);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Erro ao carregar detalhes da aula:', err);
        setError('Erro ao carregar detalhes da aula: ' + (err.message || 'Erro desconhecido'));
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [id, userId, profileName]);
  
  const generateClassDates = (classData: ClassWithDetails, cancellations: any[]) => {
    if (!classData || !classData.schedules || classData.schedules.length === 0) {
      setError('Dados insuficientes para gerar datas');
      return;
    }
    
    const dayOfWeekMap: { [key: string]: number } = {
      'SUNDAY': 0,
      'MONDAY': 1,
      'TUESDAY': 2,
      'WEDNESDAY': 3,
      'THURSDAY': 4,
      'FRIDAY': 5,
      'SATURDAY': 6
    };
    
    const weekdayIndices = classData.schedules
      .map(schedule => {
        const timeSlot = schedule.time_slot as any;
        const dayOfWeek = timeSlot?.dayOfWeek || timeSlot?.day_of_week;
        
        if (!timeSlot || !dayOfWeek) return null;
        return dayOfWeekMap[dayOfWeek];
      })
      .filter(index => index !== null && index !== undefined) as number[];
    
    if (weekdayIndices.length === 0) {
      setError('Nenhum horário válido encontrado');
      return;
    }
    
    const semesterStart = classData.semester?.start_date 
      ? new Date(classData.semester.start_date) 
      : new Date();
    
    const semesterEnd = classData.semester?.end_date 
      ? new Date(classData.semester.end_date) 
      : addDays(new Date(), 120);
    
    const today = new Date();
    const dates: ClassDate[] = [];
    
    weekdayIndices.forEach(weekdayIndex => {
      let currentDate = new Date(semesterStart);
      
      while (currentDate.getDay() !== weekdayIndex) {
        currentDate = addDays(currentDate, 1);
      }
      
      while (isBefore(currentDate, semesterEnd) || isSameDay(currentDate, semesterEnd)) {
        if (isAfter(currentDate, today) || isSameDay(currentDate, today)) {
          const currentDateStr = format(currentDate, 'yyyy-MM-dd');
          
          const isCancelled = cancellations.some(cancellation => {
            const cancellationDateStr = cancellation.date;
            return cancellationDateStr === currentDateStr;
          });
          
          dates.push({
            date: new Date(currentDate),
            formatted: format(currentDate, 'dd/MM/yyyy'),
            weekday: WEEKDAYS[currentDate.getDay()],
            selected: false,
            isCancelled: isCancelled,
            cancellationReason: isCancelled ? cancellations.find(cancellation => 
              cancellation.date === currentDateStr
            )?.reason : undefined
          });
        }
        
        currentDate = addDays(currentDate, 7);
      }
    });
    
    dates.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    setClassDates(dates);
  };
  
  const handleDateToggle = (date: Date) => {
    const dateInfo = classDates.find(d => isSameDay(d.date, date));
    if (dateInfo?.isCancelled) {
      setSnackbar({
        open: true,
        message: 'Esta data já foi cancelada e não pode ser selecionada novamente',
        severity: 'warning'
      });
      return;
    }
    
    setSelectedDates(prev => {
      const isSelected = prev.some(d => isSameDay(d, date));
      
      if (isSelected) {
        return prev.filter(d => !isSameDay(d, date));
      } else {
        return [...prev, date];
      }
    });
    
    setClassDates(prev => 
      prev.map(d => 
        isSameDay(d.date, date) 
          ? { ...d, selected: !d.selected } 
          : d
      )
    );
  };
  
  const handleOpenConfirmDialog = () => {
    if (selectedDates.length === 0) {
      setSnackbar({
        open: true,
        message: 'Selecione pelo menos uma data para cancelar',
        severity: 'warning'
      });
      return;
    }
    
    setOpenConfirmDialog(true);
  };
  
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };
  
  const handleCancelClasses = async () => {
    if (selectedDates.length === 0) return;
    
    setSubmitting(true);
    
    try {
      await classesService.cancelClasses(parseInt(id || '0'), selectedDates, cancelReason);
      
      setSnackbar({
        open: true,
        message: 'Aulas canceladas com sucesso',
        severity: 'success'
      });
      
      setOpenConfirmDialog(false);
      
      setTimeout(() => {
        navigate(`/horarios/aulas/detalhes/${id}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Erro ao cancelar aulas:', err);
      
      setSnackbar({
        open: true,
        message: 'Erro ao cancelar aulas: ' + (err.message || 'Erro desconhecido'),
        severity: 'error'
      });
      
      setOpenConfirmDialog(false);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleBack = () => {
    if (profileName.toLowerCase() === 'student' || profileName.toLowerCase() === 'aluno') {
      navigate('/horarios');
    } else {
      navigate(`/horarios/aulas/detalhes/${id}`);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ 
      ...snackbar,
      open: false
    });
  };
  
  return (
    <LocalizationProvider adapterLocale={ptBR}>
      <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : classData ? (
          <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<ArrowBackIcon />} 
                onClick={handleBack}
              >
                Voltar
              </Button>
              
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Cancelar Aula
              </Typography>
            </Box>
            
            <Card sx={{ mb: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {classData.subject?.name || classData.name || 'Aula'}
                </Typography>
                
                {classData.schedules && classData.schedules.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Horários da aula:</strong>
                    </Typography>
                    {classData.schedules.map((schedule, index) => {
                      const dayOfWeekMap: { [key: string]: string } = {
                        'SUNDAY': 'Domingo',
                        'MONDAY': 'Segunda-feira',
                        'TUESDAY': 'Terça-feira',
                        'WEDNESDAY': 'Quarta-feira',
                        'THURSDAY': 'Quinta-feira',
                        'FRIDAY': 'Sexta-feira',
                        'SATURDAY': 'Sábado'
                      };
                      
                      const timeSlot = schedule.time_slot as any;
                      const dayOfWeek = timeSlot?.dayOfWeek || timeSlot?.day_of_week;
                      const startTime = timeSlot?.startTime || timeSlot?.start_time;
                      const endTime = timeSlot?.endTime || timeSlot?.end_time;
                      
                      const dayName = dayOfWeek 
                        ? dayOfWeekMap[dayOfWeek] || dayOfWeek
                        : 'Dia não definido';
                      
                      const formattedStartTime = startTime?.substring(0, 5) || '';
                      const formattedEndTime = endTime?.substring(0, 5) || '';
                      const roomInfo = schedule.room?.building?.name && schedule.room?.name 
                        ? `${schedule.room.building.name} - Sala ${schedule.room.name}`
                        : 'Local não definido';
                      
                      return (
                        <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                          • <strong>{dayName}</strong> das {formattedStartTime} às {formattedEndTime} - {roomInfo}
                        </Typography>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Selecione as datas em que deseja cancelar esta aula. Apenas datas futuras que correspondem ao dia da semana da aula são mostradas.
              </Typography>
            </Alert>
            
            <Typography variant="h6" gutterBottom>
              Selecione as datas para cancelamento
            </Typography>
            
            {classDates.length === 0 ? (
              <Alert severity="warning">
                Não há datas futuras disponíveis para cancelamento.
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {classDates.map((classDate, index) => (
                  <Button 
                    key={index}
                    variant={classDate.selected ? "contained" : "outlined"}
                    color={classDate.isCancelled ? "error" : (classDate.selected ? "primary" : "inherit")}
                    onClick={() => handleDateToggle(classDate.date)}
                    disabled={classDate.isCancelled}
                    sx={{ 
                      mb: 1, 
                      borderRadius: 2,
                      minWidth: '140px',
                      justifyContent: 'flex-start',
                      borderColor: classDate.isCancelled ? 'error.main' : (classDate.selected ? 'primary.main' : '#ddd'),
                      backgroundColor: classDate.isCancelled ? 'error.main' : (classDate.selected ? 'primary.main' : '#fff'),
                      cursor: classDate.isCancelled ? 'not-allowed' : 'pointer',
                      opacity: classDate.isCancelled ? 0.8 : 1,
                      '&:hover': {
                        backgroundColor: classDate.isCancelled ? 'error.main' : (classDate.selected ? 'primary.dark' : '#f5f5f5'),
                      },
                      '&:disabled': {
                        backgroundColor: 'error.main',
                        color: '#fff',
                        borderColor: 'error.main'
                      }
                    }}
                  >
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" sx={{ 
                        display: 'block', 
                        color: classDate.isCancelled ? '#fff' : (classDate.selected ? '#fff' : '#666') 
                      }}>
                        {WEEKDAYS_SHORT[classDate.date.getDay()]}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 'bold', 
                        color: classDate.isCancelled ? '#fff' : (classDate.selected ? '#fff' : '#000') 
                      }}>
                        {classDate.formatted}
                      </Typography>
                      {classDate.isCancelled && (
                        <Typography variant="caption" sx={{ 
                          display: 'block', 
                          color: '#fff',
                          fontStyle: 'italic'
                        }}>
                          CANCELADA
                        </Typography>
                      )}
                    </Box>
                    {classDate.selected && !classDate.isCancelled && (
                      <EventBusyIcon sx={{ ml: 'auto', fontSize: 20, color: '#fff' }} />
                    )}
                    {classDate.isCancelled && (
                      <CancelIcon sx={{ ml: 'auto', fontSize: 20, color: '#fff' }} />
                    )}
                  </Button>
                ))}
              </Box>
            )}
            
            {selectedDates.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>{selectedDates.length} data(s) selecionada(s)</strong>
                </Typography>
                
                <List dense>
                  {selectedDates.map((date, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CancelIcon color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${format(date, 'dd/MM/yyyy')} (${WEEKDAYS[date.getDay()]})`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleOpenConfirmDialog}
                disabled={selectedDates.length === 0}
                startIcon={<EventBusyIcon />}
                size="large"
              >
                Cancelar Aulas Selecionadas
              </Button>
            </Box>
          </Paper>
        ) : null}
        
        {/* Diálogo de confirmação */}
        <Dialog
          open={openConfirmDialog}
          onClose={handleCloseConfirmDialog}
          aria-labelledby="confirm-dialog-title"
        >
          <DialogTitle id="confirm-dialog-title">
            Confirmar Cancelamento
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Você está prestes a cancelar esta aula para {selectedDates.length} data(s). Esta ação notificará os alunos. Confirma?
            </DialogContentText>
            
            <TextField
              label="Motivo do cancelamento"
              multiline
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              fullWidth
              required
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <Alert severity="warning" icon={<InfoIcon />}>
              Esta ação não pode ser desfeita.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmDialog} disabled={submitting}>
              Voltar
            </Button>
            <Button 
              onClick={handleCancelClasses} 
              color="error" 
              variant="contained"
              disabled={submitting || !cancelReason.trim()}
            >
              {submitting ? 'Processando...' : 'Confirmar Cancelamento'}
            </Button>
          </DialogActions>
        </Dialog>
        
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
    </LocalizationProvider>
  );
} 
 