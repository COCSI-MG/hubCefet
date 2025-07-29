import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  TextField,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar,
  Checkbox,
  InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

import classesService from '@/api/services/classes';
import { ClassWithDetails } from '@/api/services/classes';
import { usersService, User } from '@/api/services/users';

interface StudentUI {
  id: string;
  name?: string;
  full_name?: string;
  email: string;
  registration?: string;
}

export default function ClassStudents() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingClassStudents, setLoadingClassStudents] = useState(false);
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [removeStudentDialogOpen, setRemoveStudentDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [lastSearch, setLastSearch] = useState('');
  const [lastStudentSearch, setLastStudentSearch] = useState('');
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const studentSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const initialLoadRef = useRef(false);
  
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (studentSearchTimeoutRef.current) {
        clearTimeout(studentSearchTimeoutRef.current);
      }
      if (initialLoadTimeoutRef.current) {
        clearTimeout(initialLoadTimeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!id) {
      setError('ID da aula não fornecido');
      setLoading(false);
      return;
    }
    
    const loadClassData = async () => {
      setLoading(true);
      try {
        const data = await classesService.getClassById(Number(id));
        setClassData(data);
        initialLoadRef.current = true;
      } catch (err: any) {
        console.error('Erro ao carregar dados da aula:', err);
        setError('Erro ao carregar dados da aula: ' + (err.message || 'Erro desconhecido'));
      } finally {
        setLoading(false);
      }
    };
    
    loadClassData();
  }, [id]);
  
  useEffect(() => {
    if (classData && initialLoadRef.current) {
      initialLoadRef.current = false;

      const loadStudents = async () => {
        try {
          setLoadingClassStudents(true);
          const data = await classesService.getClassById(Number(id));
          
          if (data && data.students) {
            setClassData(prevData => {
              if (!prevData) return data;
              return {
                ...prevData,
                students: data.students
              };
            });
          }
        } catch (err) {
          console.error('Erro ao carregar alunos:', err);
        } finally {
          setLoadingClassStudents(false);
        }
      };
      
      loadStudents();
    }
  }, [classData, id]);
  
  const fetchClassStudents = useCallback(async (searchTermToUse: string = '') => {
    if (!id) return;
    
    setLoadingClassStudents(true);
    try {
      const data = await classesService.getClassStudents(Number(id), searchTermToUse);
      
      setLastSearch(searchTermToUse);
      
      setClassData(prevData => {
        if (!prevData) return data;
        return {
          ...prevData,
          students: data.students || []
        };
      });
    } catch (err: any) {
      console.error('Erro ao buscar alunos da turma:', err);
      setClassData(prevData => {
        if (!prevData) return null;
        return {
          ...prevData,
          students: []
        };
      });
    } finally {
      setLoadingClassStudents(false);
    }
  }, [id]);
  
  const fetchAvailableStudents = useCallback(async (searchTermToUse: string = '') => {
    if (!id) return;
    
    setLoadingClassStudents(true);
    setError(null);
    try {
      const students = await usersService.getStudents(searchTermToUse);
      setLastStudentSearch(searchTermToUse);
      
      if (!students || students.length === 0) {
        setAvailableStudents([]);
        return;
      }
      
      if (!classData || !classData.students) {
        setAvailableStudents(students);
        return;
      }
      
      const currentStudentIds = new Set((classData.students || []).map(s => s.id));
      const filteredStudents = students.filter(s => !currentStudentIds.has(s.id));
      
      setAvailableStudents(filteredStudents);
    } catch (err: any) {
      console.error('Erro ao buscar alunos disponíveis:', err);
      setError('Erro ao carregar lista de alunos');
      setAvailableStudents([]);
    } finally {
      setLoadingClassStudents(false);
    }
  }, [id, classData]);
  
  const formatStudentsForUI = useCallback((students: any[] = []): StudentUI[] => {
    return students.map(student => ({
      id: student.id,
      name: student.name || student.full_name,
      full_name: student.full_name,
      email: student.email,
      registration: student.registration || ''
    }));
  }, []);

  const filteredStudents = formatStudentsForUI(classData?.students || []);

  const handleBack = useCallback(() => {
    navigate('/horarios/aulas');
  }, [navigate]);

  const openAddStudentDialog = useCallback(() => {
    setStudentSearchTerm('');
    setLastStudentSearch('');
    setSelectedStudents([]);
    setAddStudentDialogOpen(true);
    fetchAvailableStudents('');
  }, [fetchAvailableStudents]);

  const closeAddStudentDialog = useCallback(() => {
    setAddStudentDialogOpen(false);
    setSelectedStudents([]);
    setError(null);
  }, []);

  const openRemoveStudentDialog = useCallback((studentId: string) => {
    setStudentToRemove(studentId);
    setRemoveStudentDialogOpen(true);
  }, []);

  const closeRemoveStudentDialog = useCallback(() => {
    setRemoveStudentDialogOpen(false);
    setStudentToRemove(null);
  }, []);

  const handleToggleStudent = useCallback((studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  }, []);

  const handleAddSelectedStudents = useCallback(async () => {
    if (!id || !classData || selectedStudents.length === 0) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await classesService.addStudents(Number(id), selectedStudents);
      setSuccess(`${selectedStudents.length} aluno(s) adicionado(s) com sucesso!`);
      closeAddStudentDialog();
      
      fetchClassStudents('');
    } catch (err: any) {
      console.error('Erro ao adicionar alunos:', err);
      let errorMessage = 'Erro ao adicionar alunos';
      
      if (err.response) {
        errorMessage += `: ${err.response.status} - ${err.response.statusText}`;
        if (err.response.data?.message) {
          errorMessage += ` - ${err.response.data.message}`;
        }
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [id, classData, selectedStudents, closeAddStudentDialog, fetchClassStudents]);

  const handleRemoveStudent = useCallback(async () => {
    if (!id || !classData || !studentToRemove) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await classesService.removeStudent(Number(id), studentToRemove);
      setSuccess('Aluno removido com sucesso!');
      closeRemoveStudentDialog();
      
      fetchClassStudents('');
    } catch (err: any) {
      console.error('Erro ao remover aluno:', err);
      let errorMessage = 'Erro ao remover aluno';
      
      if (err.response) {
        errorMessage += `: ${err.response.status} - ${err.response.statusText}`;
        if (err.response.data?.message) {
          errorMessage += ` - ${err.response.data.message}`;
        }
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      setError(errorMessage);
      closeRemoveStudentDialog();
    } finally {
      setSaving(false);
    }
  }, [id, classData, studentToRemove, closeRemoveStudentDialog, fetchClassStudents]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  }, []);

  const handleSearch = useCallback(() => {
    if (searchTerm === lastSearch && !(searchTerm === '' && lastSearch !== '')) return;
    
    fetchClassStudents(searchTerm);
  }, [fetchClassStudents, searchTerm, lastSearch]);

  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    if (lastSearch !== '') {
      fetchClassStudents('');
    }
  }, [fetchClassStudents, lastSearch]);

  const handleStudentSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setStudentSearchTerm(value);
  }, []);
  
  const handleStudentSearch = useCallback(() => {
    if (studentSearchTerm === lastStudentSearch && !(studentSearchTerm === '' && lastStudentSearch !== '')) return;
    
    fetchAvailableStudents(studentSearchTerm);
  }, [fetchAvailableStudents, studentSearchTerm, lastStudentSearch]);
  
  const handleStudentSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleStudentSearch();
    }
  }, [handleStudentSearch]);
  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        width: '100%'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper sx={{ p: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
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
          <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            Gerenciar Alunos
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PersonAddIcon />} 
            onClick={openAddStudentDialog}
          >
            Adicionar Aluno
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {classData && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" component="div" gutterBottom>
              {classData.subject?.name} ({classData.subject?.code})
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Professor: {classData.teacher?.full_name || classData.professor?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Horários: {classData.schedules?.map(s => {
                const timeSlot = s.time_slot;
                if (!timeSlot) return 'Horário não definido';
                return `${timeSlot.day_of_week} (${timeSlot.start_time} - ${timeSlot.end_time})`;
              }).join(' / ')}
            </Typography>
            <Chip 
              label={`${classData.students?.length || 0} alunos matriculados`} 
              color="primary" 
              variant="outlined" 
              sx={{ mt: 1 }}
            />
          </Box>
        )}

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <TextField
            label="Buscar alunos"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder="Digite o nome, email ou matrícula do aluno"
            sx={{ width: '350px' }}
            inputRef={searchInputRef}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {loadingClassStudents ? (
                    <CircularProgress size={20} />
                  ) : searchTerm ? (
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                      title="Limpar busca"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={loadingClassStudents || (searchTerm === lastSearch && !(searchTerm === '' && lastSearch !== ''))}
                    onClick={handleSearch}
                    sx={{ ml: 1, minWidth: 0, px: 1 }}
                    title="Buscar"
                  >
                    <SearchIcon fontSize="small" />
                  </Button>
                </InputAdornment>
              )
            }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f7fa' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingClassStudents ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress size={30} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    {lastSearch 
                      ? `Nenhum aluno encontrado para a busca "${lastSearch}"` 
                      : 'Nenhum aluno matriculado nesta aula'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map(student => (
                  <TableRow key={student.id} hover>
                    <TableCell>{student.name || student.full_name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => openRemoveStudentDialog(student.id)}
                        title="Remover aluno da aula"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Diálogo para adicionar alunos */}
      <Dialog 
        open={addStudentDialogOpen} 
        onClose={closeAddStudentDialog}
        PaperProps={{ sx: { width: '500px', maxWidth: '100%' } }}
      >
        <DialogTitle>
          Adicionar Alunos à Aula
          <IconButton
            aria-label="close"
            onClick={closeAddStudentDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Buscar alunos"
            fullWidth
            variant="outlined"
            value={studentSearchTerm}
            onChange={handleStudentSearchChange}
            onKeyDown={handleStudentSearchKeyDown}
            placeholder="Digite o nome, email ou matrícula"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: loadingClassStudents ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : null
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Alunos disponíveis
            </Typography>
            {selectedStudents.length > 0 && (
              <Typography variant="body2" color="primary">
                {selectedStudents.length} aluno(s) selecionado(s)
              </Typography>
            )}
          </Box>
          
          {error ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Verifique se existem alunos cadastrados no sistema com o perfil "student".
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Você pode tentar carregar novamente ou entrar em contato com o administrador do sistema.
              </Typography>
              <Button 
                variant="outlined"
                size="small"
                onClick={(e) => { e.preventDefault(); fetchAvailableStudents(''); }}
                sx={{ mt: 2 }}
              >
                Tentar Novamente
              </Button>
            </Box>
          ) : (
            <List sx={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
              {availableStudents.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary={loadingClassStudents ? "Buscando alunos..." : "Nenhum aluno disponível para adicionar"} 
                    secondary={studentSearchTerm ? `Nenhum resultado para "${studentSearchTerm}"` : null}
                  />
                </ListItem>
              ) : (
                availableStudents.map((student, index) => (
                  <React.Fragment key={student.id}>
                    <ListItem sx={{ py: 1 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleToggleStudent(student.id)}
                        color="primary"
                      />
                      <ListItemText 
                        primary={student.full_name} 
                        secondary={student.email} 
                      />
                    </ListItem>
                    {index < availableStudents.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddStudentDialog} color="inherit" disabled={saving}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddSelectedStudents} 
            color="primary" 
            variant="contained" 
            disabled={saving || selectedStudents.length === 0}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving 
              ? 'Adicionando...' 
              : selectedStudents.length === 0 
                ? 'Adicionar' 
                : `Adicionar ${selectedStudents.length} Aluno(s)`
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação para remover aluno */}
      <Dialog
        open={removeStudentDialogOpen}
        onClose={closeRemoveStudentDialog}
      >
        <DialogTitle>Confirmar Remoção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover este aluno da aula?
            {studentToRemove && classData?.students && (
              <Typography sx={{ mt: 1, fontWeight: 'bold' }}>
                {formatStudentsForUI(classData.students).find(s => s.id === studentToRemove)?.name}
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRemoveStudentDialog} color="primary" disabled={saving}>
            Cancelar
          </Button>
          <Button 
            onClick={handleRemoveStudent} 
            color="error" 
            variant="contained" 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {saving ? 'Removendo...' : 'Remover'}
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