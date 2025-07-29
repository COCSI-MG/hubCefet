import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { fetchSemesters, deleteSemester, Semester } from '@/api/services/semesters';

export default function PeriodManagement() {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [periodToDelete, setPeriodToDelete] = useState<string | null>(null);

  const loadPeriods = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchSemesters();
      setPeriods(data);
    } catch (err: any) {
      console.error('Erro ao carregar períodos:', err);
      setError('Erro ao carregar períodos: ' + (err.message || 'Erro desconhecido'));
      
      setTimeout(() => {
        loadPeriods();
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredPeriods = periods.filter(period => {
    const searchLower = searchTerm.toLowerCase();
    return period.year.toString().includes(searchLower) || 
           period.number.toString().includes(searchLower);
  });

  const handleCreatePeriod = () => {
    navigate('/horarios/periodos/criar');
  };

  const handleEditPeriod = (id: string) => {
    navigate(`/horarios/periodos/editar/${id}`);
  };

  const handleBack = () => {
    navigate('/horarios/gerenciar');
  };

  const openDeleteDialog = (id: string) => {
    setPeriodToDelete(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPeriodToDelete(null);
  };

  const confirmDelete = async () => {
    if (!periodToDelete) return;
    
    setLoading(true);
    try {
      await deleteSemester(periodToDelete);
      setPeriods(prev => prev.filter(period => period.id !== periodToDelete));
      setSuccess('Período excluído com sucesso');
    } catch (err: any) {
      console.error('Erro ao excluir período:', err);
      setError('Erro ao excluir período: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
      closeDeleteDialog();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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
            Gerenciamento de Períodos
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={handleCreatePeriod}
          >
            Novo Período
          </Button>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <TextField
            label="Buscar períodos"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Digite o ano ou número do período"
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
                <TableCell sx={{ fontWeight: 'bold' }}>Ano</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Número do Período</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Data de Início</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Data de Término</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && periods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredPeriods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    Nenhum período encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredPeriods.map((period) => (
                  <TableRow key={period.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {period.year}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {period.number}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(period.start_date)}</TableCell>
                    <TableCell>{formatDate(period.end_date)}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditPeriod(period.id)}
                        title="Editar período"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => openDeleteDialog(period.id)}
                        title="Excluir período"
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

      {/* Diálogo de confirmação para exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este período? Esta ação não pode ser desfeita e todas as aulas associadas a este período ficarão sem vínculo.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens de sucesso */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
} 