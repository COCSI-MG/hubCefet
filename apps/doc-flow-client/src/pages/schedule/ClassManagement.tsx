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
  DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { jwtDecode } from 'jwt-decode';

import classesService from '@/api/services/classes';
import { ClassWithDetails } from '@/api/services/classes';

export interface ClassUI {
  id: string;
  subjectName: string;
  subjectCode: string;
  semester: number;
  year: number;
  teacherId: string;
  teacherName: string;
  schedules: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
  locations: {
    building: string;
    room: string;
  }[];
  students: {
    id: string;
    email: string;
    full_name?: string;
    name?: string;
    enrollment?: string;
  }[];
}

export default function ClassManagement() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [profileName, setProfileName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getUserProfile = () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const decoded: any = jwtDecode(token);
          
          let profile = '';
          if (typeof decoded.profile === 'string') {
            profile = decoded.profile;
          } else if (decoded.profile?.name) {
            profile = decoded.profile.name;
          }
          
          const userId = decoded.sub || '';
          setUserId(userId);
          setProfileName(profile);
          setIsAdmin(profile.toLowerCase() === 'admin' || profile.toLowerCase() === 'coordinator');
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
      }
    };
    
    getUserProfile();
  }, []);

  useEffect(() => {
    if (userId) {
      loadClasses();
    }
  }, [userId]);

  const mapApiClassToUIClass = (apiClass: ClassWithDetails): ClassUI => {
    const mappedStudents = (apiClass.students || []).map(student => ({
      ...student,
      name: student.full_name || student.email || 'Nome não disponível'
    }));
    
    const schedules = (apiClass.schedules || []).map(schedule => {
      const timeSlot = schedule.time_slot;
      return {
        dayOfWeek: timeSlot?.day_of_week || '',
        startTime: timeSlot?.start_time || '',
        endTime: timeSlot?.end_time || ''
      };
    });

    const locations = (apiClass.schedules || []).map(schedule => ({
      building: schedule.room?.building?.name || '',
      room: schedule.room?.name || ''
    }));
    
    return {
      id: apiClass.id?.toString() || '',
      subjectName: apiClass.subject?.name || '',
      subjectCode: apiClass.subject?.code || '',
      semester: apiClass.semesterId || 0,
      year: 0,
      teacherId: apiClass.teacher?.id || apiClass.teacherId || '',
      teacherName: apiClass.teacher?.full_name || apiClass.professor?.name || '',
      schedules,
      locations,
      students: mappedStudents
    };
  };

  const loadClasses = () => {
    setLoading(true);
    classesService.getClasses()
      .then(data => {
        let filteredData = data;
        if (!isAdmin && profileName.toLowerCase() === 'professor') {
          filteredData = data.filter(cls => cls.teacherId === userId);
        }
        
        const mappedClasses = filteredData.map(mapApiClassToUIClass);
        setClasses(mappedClasses);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar aulas:', err);
        setError('Erro ao carregar aulas: ' + (err.message || 'Erro desconhecido'));
        setLoading(false);
      });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredClasses = classes.filter(cls => 
    cls.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClass = () => {
    navigate('/horarios/aulas/criar');
  };

  const handleEditClass = (id: string) => {
    navigate(`/horarios/aulas/editar/${id}`);
  };

  const handleViewClass = (id: string) => {
    navigate(`/horarios/aulas/detalhes/${id}`);
  };

  const handleManageStudents = (id: string) => {
    navigate(`/horarios/aulas/alunos/${id}`);
  };

  const handleBack = () => {
    navigate('/horarios/gerenciar');
  };

  const openDeleteDialog = (id: string) => {
    setClassToDelete(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  const confirmDelete = () => {
    if (!classToDelete) return;
    
    setLoading(true);
    classesService.deleteClass(parseInt(classToDelete))
      .then(() => {
        setClasses(prev => prev.filter(cls => cls.id !== classToDelete));
        closeDeleteDialog();
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao excluir aula:', err);
        setError('Erro ao excluir aula: ' + (err.message || 'Erro desconhecido'));
        closeDeleteDialog();
        setLoading(false);
      });
  };

  const handleCreateDiscipline = () => {
    navigate('/horarios/aulas/cadastrar');
  };

  const handleCancelClass = (id: string) => {
    navigate(`/horarios/aulas/cancelar/${id}`);
  };

  if (loading && classes.length === 0) {
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
        <Box
          sx={{
            display: 'flex',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 3
          }}
        >
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mr: { md: 2, xs: 0 }, mb: { xs: 1, md: 0 }, minWidth: 120 }}
          >
            Voltar
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            Gerenciamento de Aulas
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={handleCreateClass}
            sx={{ mr: 1 }}
          >
            Nova Aula
          </Button>
        </Box>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <TextField
            label="Buscar aulas"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Digite o nome da disciplina, código ou professor"
            size="small"
            sx={{ width: { xs: '100%', md: '350px' } }}
          />
        </Box>

        {error && (
          <Typography color="error" sx={{ my: 2 }}>
            {error}
          </Typography>
        )}

        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f7fa' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Disciplina</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Professor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Horário</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Alunos</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              )}
              
              {!loading && filteredClasses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhuma aula encontrada
                  </TableCell>
                </TableRow>
              )}
              
              {!loading && filteredClasses.map((cls) => (
                <TableRow key={cls.id} hover>
                  <TableCell>{cls.subjectName}</TableCell>
                  <TableCell>{cls.subjectCode}</TableCell>
                  <TableCell>{cls.teacherName}</TableCell>
                  <TableCell>
                    {cls.schedules.map((schedule, index) => (
                      <div key={index}>
                        {schedule.dayOfWeek}, {schedule.startTime} - {schedule.endTime}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Box
                      onClick={() => handleManageStudents(cls.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px solid',
                        borderColor: 'primary.main',
                        borderRadius: '20px',
                        px: 2,
                        py: 0.5,
                        cursor: 'pointer',
                        width: 60,
                        mx: 'auto',
                        transition: 'background 0.2s',
                        '&:hover': { backgroundColor: 'primary.50' }
                      }}
                    >
                      <PeopleIcon color="primary" sx={{ mr: 1 }} />
                      <Typography color="primary" fontWeight="bold" sx={{ fontSize: 18, lineHeight: 1 }}>
                        {cls.students.length}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        color="info" 
                        onClick={() => handleViewClass(cls.id)}
                        title="Visualizar detalhes"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {(isAdmin || cls.teacherId === userId) && (
                        <>
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleEditClass(cls.id)}
                            title="Editar aula"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="warning" 
                            onClick={() => handleCancelClass(cls.id)}
                            sx={{ ml: 1 }}
                            title="Cancelar aulas"
                          >
                            <EventBusyIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => openDeleteDialog(cls.id)}
                            title="Excluir aula"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
