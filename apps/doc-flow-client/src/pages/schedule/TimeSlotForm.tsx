import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { timeSlotsService, DayOfWeek } from '@/api/services/time-slots';

export default function TimeSlotForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState({
    startTime: '',
    endTime: '',
    conflict: '',
  });
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    dayOfWeek: DayOfWeek.MONDAY,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const dayOfWeekOptions = [
    { value: DayOfWeek.MONDAY, label: 'Segunda-feira' },
    { value: DayOfWeek.TUESDAY, label: 'Terça-feira' },
    { value: DayOfWeek.WEDNESDAY, label: 'Quarta-feira' },
    { value: DayOfWeek.THURSDAY, label: 'Quinta-feira' },
    { value: DayOfWeek.FRIDAY, label: 'Sexta-feira' },
    { value: DayOfWeek.SATURDAY, label: 'Sábado' },
    { value: DayOfWeek.SUNDAY, label: 'Domingo' },
  ];

  useEffect(() => {
    if (id) {
      loadTimeSlot();
    }
  }, [id]);

  useEffect(() => {
    validateTimes();
    checkConflicts();
  }, [formData.startTime, formData.endTime, formData.dayOfWeek]);

  const validateTimes = () => {
    const errors = {
      startTime: '',
      endTime: '',
      conflict: '',
    };

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (formData.startTime && !timeRegex.test(formData.startTime)) {
      errors.startTime = 'Formato de horário inválido. Use HH:MM';
    }
    
    if (formData.endTime && !timeRegex.test(formData.endTime)) {
      errors.endTime = 'Formato de horário inválido. Use HH:MM';
    }

    if (formData.startTime && formData.endTime && timeRegex.test(formData.startTime) && timeRegex.test(formData.endTime)) {
      const startTime = new Date(`1970-01-01T${formData.startTime}:00`);
      const endTime = new Date(`1970-01-01T${formData.endTime}:00`);
      
      if (endTime <= startTime) {
        errors.endTime = 'O horário de término deve ser posterior ao horário de início';
      }
    }

    setFormErrors(errors);
  };

  const checkConflicts = async () => {
    if (!formData.startTime || !formData.endTime || !formData.dayOfWeek) {
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
      return;
    }

    const startTime = new Date(`1970-01-01T${formData.startTime}:00`);
    const endTime = new Date(`1970-01-01T${formData.endTime}:00`);
    
    if (endTime <= startTime) {
      return;
    }

    try {
      const allTimeSlots = await timeSlotsService.getAllTimeSlots();
      
      const sameDaySlots = allTimeSlots.filter(slot => 
        slot.day_of_week === formData.dayOfWeek && 
        (!id || slot.id !== Number(id))
      );

      const exactMatch = sameDaySlots.find(slot => 
        slot.start_time.substring(0, 5) === formData.startTime && 
        slot.end_time.substring(0, 5) === formData.endTime
      );

      if (exactMatch) {
        setFormErrors(prev => ({
          ...prev,
          conflict: 'Já existe um horário idêntico cadastrado para este dia da semana'
        }));
        return;
      }

      const startTime = formData.startTime;
      const endTime = formData.endTime;

      const hasOverlap = sameDaySlots.some(slot => {
        const slotStart = slot.start_time.substring(0, 5);
        const slotEnd = slot.end_time.substring(0, 5);

        return (
          (startTime < slotEnd && endTime > slotStart) ||
          (slotStart < endTime && slotEnd > startTime)
        );
      });

      if (hasOverlap) {
        const conflictingSlot = sameDaySlots.find(slot => {
          const slotStart = slot.start_time.substring(0, 5);
          const slotEnd = slot.end_time.substring(0, 5);
          return (
            (startTime < slotEnd && endTime > slotStart) ||
            (slotStart < endTime && slotEnd > startTime)
          );
        });

        if (conflictingSlot) {
          setFormErrors(prev => ({
            ...prev,
            conflict: `Conflito de horário detectado. Já existe um horário das ${conflictingSlot.start_time.substring(0, 5)} às ${conflictingSlot.end_time.substring(0, 5)} no mesmo dia da semana que se sobrepõe ao horário informado.`
          }));
        }
      } else {
        setFormErrors(prev => ({
          ...prev,
          conflict: ''
        }));
      }
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
    }
  };

  const loadTimeSlot = async () => {
    try {
      setLoading(true);
      const timeSlot = await timeSlotsService.getTimeSlotById(Number(id));
      setFormData({
        startTime: timeSlot.start_time.substring(0, 5),
        endTime: timeSlot.end_time.substring(0, 5),
        dayOfWeek: timeSlot.day_of_week,
      });
      setError(null);
    } catch (err: any) {
      console.error("Erro ao carregar horário:", err);
      setError('Erro ao carregar horário: ' + (err.response?.data?.message || err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleDayOfWeekChange = (event: SelectChangeEvent) => {
    setFormData({
      ...formData,
      dayOfWeek: event.target.value as DayOfWeek
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      if (!formData.startTime || !formData.endTime || !formData.dayOfWeek) {
        setSnackbar({
          open: true,
          message: 'Por favor, preencha todos os campos obrigatórios',
          severity: 'error',
        });
        setSubmitting(false);
        return;
      }

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
        setSnackbar({
          open: true,
          message: 'Formato de horário inválido. Use o formato HH:MM',
          severity: 'error',
        });
        setSubmitting(false);
        return;
      }

      const startTime = new Date(`1970-01-01T${formData.startTime}:00`);
      const endTime = new Date(`1970-01-01T${formData.endTime}:00`);
      
      if (endTime <= startTime) {
        setSnackbar({
          open: true,
          message: 'O horário de término deve ser posterior ao horário de início',
          severity: 'error',
        });
        setSubmitting(false);
        return;
      }

      if (formErrors.startTime || formErrors.endTime || formErrors.conflict) {
        setSnackbar({
          open: true,
          message: formErrors.conflict || formErrors.endTime || formErrors.startTime,
          severity: 'error',
        });
        setSubmitting(false);
        return;
      }

      if (id) {
        await timeSlotsService.update(Number(id), {
          start_time: formData.startTime,
          end_time: formData.endTime,
          day_of_week: formData.dayOfWeek
        });
        setSnackbar({
          open: true,
          message: 'Horário atualizado com sucesso',
          severity: 'success',
        });
      } else {
        await timeSlotsService.create({
          start_time: formData.startTime,
          end_time: formData.endTime,
          day_of_week: formData.dayOfWeek
        });
        setSnackbar({
          open: true,
          message: 'Horário criado com sucesso',
          severity: 'success',
        });
      }
      navigate('/horarios/gerenciar/horarios');
    } catch (err: any) {
      console.error("Erro ao salvar horário:", err);
      setSnackbar({
        open: true,
        message: 'Erro: ' + (err.response?.data?.message || err.message || 'Erro desconhecido'),
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Carregando horário...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/horarios" color="inherit">
          Horários
        </MuiLink>
        <MuiLink component={Link} to="/horarios/gerenciar/horarios" color="inherit">
          Gerenciamento
        </MuiLink>
        <Typography color="text.primary">
          {id ? 'Editar Horário' : 'Novo Horário'}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          {id ? 'Editar Horário' : 'Novo Horário'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Dia da Semana</InputLabel>
            <Select
              value={formData.dayOfWeek}
              onChange={handleDayOfWeekChange}
              label="Dia da Semana"
            >
              {dayOfWeekOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="time"
            label="Horário de Início"
            value={formData.startTime}
            onChange={(e) => handleTimeChange('startTime', e.target.value)}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            error={!!formErrors.startTime}
            helperText={formErrors.startTime || 'Formato: HH:MM (ex: 08:00)'}
            inputProps={{
              step: 300,
              min: '06:00',
              max: '23:59'
            }}
          />

          <TextField
            type="time"
            label="Horário de Término"
            value={formData.endTime}
            onChange={(e) => handleTimeChange('endTime', e.target.value)}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            error={!!formErrors.endTime}
            helperText={formErrors.endTime || 'Deve ser posterior ao horário de início'}
            inputProps={{
              step: 300,
              min: '06:00',
              max: '23:59'
            }}
          />

          {formErrors.conflict && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {formErrors.conflict}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              onClick={() => navigate('/horarios/gerenciar/horarios')} 
              variant="outlined"
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disabled={!formData.startTime || !formData.endTime || !!formErrors.startTime || !!formErrors.endTime || !!formErrors.conflict || submitting}
            >
              {submitting ? 'Salvando...' : (id ? 'Salvar' : 'Criar')}
            </Button>
          </Box>
        </Box>
      </Paper>

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
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 
 