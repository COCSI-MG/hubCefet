import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { timeSlotsService, TimeSlot, DayOfWeek } from '@/api/services/time-slots';

const DAY_OF_WEEK_MAP: { [key in DayOfWeek]: string } = {
  [DayOfWeek.SUNDAY]: 'Domingo',
  [DayOfWeek.MONDAY]: 'Segunda-feira',
  [DayOfWeek.TUESDAY]: 'Terça-feira',
  [DayOfWeek.WEDNESDAY]: 'Quarta-feira',
  [DayOfWeek.THURSDAY]: 'Quinta-feira',
  [DayOfWeek.FRIDAY]: 'Sexta-feira',
  [DayOfWeek.SATURDAY]: 'Sábado',
};

export default function TimeSlotManagement() {
  const navigate = useNavigate();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await timeSlotsService.getAllTimeSlots();
      
      const sortedTimeSlots = response.sort((a, b) => {
        const dayOrder: { [key in DayOfWeek]: number } = {
          [DayOfWeek.SUNDAY]: 0,
          [DayOfWeek.MONDAY]: 1,
          [DayOfWeek.TUESDAY]: 2,
          [DayOfWeek.WEDNESDAY]: 3,
          [DayOfWeek.THURSDAY]: 4,
          [DayOfWeek.FRIDAY]: 5,
          [DayOfWeek.SATURDAY]: 6,
        };
        
        const dayDiff = dayOrder[a.day_of_week] - dayOrder[b.day_of_week];
        if (dayDiff !== 0) return dayDiff;
        
        return a.start_time.localeCompare(b.start_time);
      });
      
      setTimeSlots(sortedTimeSlots);
      setError(null);
    } catch (err: any) {
      setError('Erro ao carregar horários: ' + (err.response?.data?.message || err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleBack = () => {
    navigate('/horarios/gerenciar');
  };

  const handleDelete = async () => {
    if (!selectedTimeSlot) return;

    try {
      await timeSlotsService.delete(selectedTimeSlot.id);
      setSnackbar({
        open: true,
        message: 'Horário excluído com sucesso',
        severity: 'success',
      });
      handleCloseDeleteDialog();
      loadTimeSlots();
    } catch (err: any) {
      
      if (err.response?.data?.message?.includes('aulas associadas') || err.response?.data?.message?.includes('agendamentos de aulas associados')) {
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Não é possível excluir o horário pois existem aulas associadas a ele',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Erro ao excluir: ' + (err.response?.data?.message || err.message || 'Erro desconhecido'),
          severity: 'error',
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const formatDayOfWeek = (dayOfWeek: DayOfWeek) => {
    return DAY_OF_WEEK_MAP[dayOfWeek] || dayOfWeek;
  };

  const filteredTimeSlots = timeSlots.filter(timeSlot => {
    const searchLower = searchTerm.toLowerCase();
    const dayOfWeek = formatDayOfWeek(timeSlot.day_of_week).toLowerCase();
    const startTime = formatTime(timeSlot.start_time);
    const endTime = formatTime(timeSlot.end_time);
    
    return dayOfWeek.includes(searchLower) ||
           startTime.includes(searchLower) ||
           endTime.includes(searchLower);
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Carregando horários...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper sx={{ p: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mr: 2, mb: { xs: 1, sm: 0 } }}
          >
            Voltar
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            Gerenciamento de Horários
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/horarios/gerenciar/horarios/novo')}
          >
            Novo Horário
          </Button>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <TextField
            label="Buscar horários"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Digite o dia da semana ou horário"
            size="small"
            sx={{ width: { xs: '100%', sm: '300px' } }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f7fa' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Dia da Semana</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Início</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fim</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && timeSlots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredTimeSlots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    Nenhum horário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredTimeSlots.map((timeSlot) => (
                  <TableRow key={timeSlot.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {formatDayOfWeek(timeSlot.day_of_week)}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatTime(timeSlot.start_time)}</TableCell>
                    <TableCell>{formatTime(timeSlot.end_time)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/horarios/gerenciar/horarios/${timeSlot.id}`)}
                        title="Editar horário"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(timeSlot)}
                        title="Excluir horário"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Tem certeza que deseja excluir este horário? Esta ação não pode ser desfeita.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Nota: Não será possível excluir o horário se houver aulas associadas a ele.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 

 