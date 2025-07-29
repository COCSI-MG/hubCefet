import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { Profile } from '@/lib/enum/profile.enum';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  IconButton,
  Alert,
  Snackbar,
  FormHelperText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { SelectChangeEvent } from '@mui/material/Select';

import classesService, { Class, CreateClassWithSchedulesRequest } from '@/api/services/classes';
import { fetchSubjects, Subject } from '@/api/services/subjects';
import { fetchSemesters, Semester } from '@/api/services/semesters';
import { fetchBuildings, Building } from '@/api/services/buildings';
import { classSchedulesService } from '@/api/services/schedules';
import { usersService, User } from '@/api/services/users';
import { timeSlotsService, TimeSlot, DayOfWeek } from '@/api/services/time-slots';

const dayOfWeekMap = {
  [DayOfWeek.MONDAY]: 'Segunda-feira',
  [DayOfWeek.TUESDAY]: 'Terça-feira',
  [DayOfWeek.WEDNESDAY]: 'Quarta-feira',
  [DayOfWeek.THURSDAY]: 'Quinta-feira',
  [DayOfWeek.FRIDAY]: 'Sexta-feira',
  [DayOfWeek.SATURDAY]: 'Sábado',
  [DayOfWeek.SUNDAY]: 'Domingo'
};

interface Schedule {
  timeSlotId: number;
  roomId: number;
  buildingId?: number;
}

interface ClassFormData {
  subjectId: string;
  semesterId: number;
  teacherId: string;
  schedules: Schedule[];
  name: string;
}

export default function ClassForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(true);

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);

  const [professors, setProfessors] = useState<User[]>([]);
  const [loadingProfessors, setLoadingProfessors] = useState(true);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(true);

  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityErrors, setAvailabilityErrors] = useState<{[key: number]: string}>({});

  const { user } = useAuth();
  const isAdmin = user?.profile?.name === Profile.Admin;

  const emptyFormData: ClassFormData = {
    subjectId: '',
    semesterId: 0,
    teacherId: '',
    schedules: [{ timeSlotId: 0, roomId: 0 }],
    name: ''
  };

  const [formData, setFormData] = useState<ClassFormData>({...emptyFormData});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingSubjects(true);
        setLoadingSemesters(true);
        setLoadingBuildings(true);
        setLoadingProfessors(true);
        setLoadingTimeSlots(true);

        const [subjectsData, semestersData, buildingsData, professorsData, timeSlotsData] = await Promise.all([
          fetchSubjects(),
          fetchSemesters(),
          fetchBuildings(),
          usersService.getAllProfessors(),
          timeSlotsService.getAllTimeSlots()
        ]);

        setSubjects(subjectsData);
        setSemesters(semestersData);
        setBuildings(buildingsData);
        setProfessors(professorsData);
        setTimeSlots(timeSlotsData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados necessários para o formulário.');
      } finally {
        setLoadingSubjects(false);
        setLoadingSemesters(false);
        setLoadingBuildings(false);
        setLoadingProfessors(false);
        setLoadingTimeSlots(false);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      classesService.getClassById(parseInt(id))
        .then(async (classData) => {
          if (classData) {
            const schedules = await classSchedulesService.getSchedulesByClassId(classData.id!);
            
            setFormData({
              subjectId: classData.subjectId.toString(),
              semesterId: classData.semesterId,
              teacherId: classData.teacherId,
              schedules: schedules.map(schedule => ({
                timeSlotId: schedule.time_slot_id,
                roomId: schedule.room_id,
                buildingId: schedule.building_id
              })),
              name: classData.name
            });
            
            setLoading(false);
          } else {
            setError('Aula não encontrada');
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Erro ao carregar dados da aula:', err);
          setError('Erro ao carregar dados da aula: ' + (err.message || 'Erro desconhecido'));
          setLoading(false);
        });
    } else {
      setFormData({
        ...emptyFormData
      });
      setLoading(false);
    }
  }, [id, isEditMode]);

  const handleSubjectChange = (event: SelectChangeEvent) => {
    const subjectId = event.target.value;
    
    const selectedSubject = subjects.find(subject => subject.id === subjectId);
    
    setFormData(prev => ({
      ...prev,
      subjectId,
      name: selectedSubject ? selectedSubject.name : prev.name
    }));
  };

  const handleSemesterChange = (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      semesterId: parseInt(event.target.value)
    }));
  };

  const handleTeacherChange = (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      teacherId: event.target.value
    }));
  };

  const handleTimeSlotChange = async (index: number, value: string) => {
    const timeSlotId = parseInt(value);
    
    const updatedSchedules = [...formData.schedules];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      timeSlotId
    };
    
    setFormData(prev => ({
      ...prev,
      schedules: updatedSchedules
    }));

    if (timeSlotId > 0 && updatedSchedules[index].roomId > 0) {
      setCheckingAvailability(true);
      try {
        const isAvailable = await classSchedulesService.isRoomAvailable(
          updatedSchedules[index].roomId, 
          timeSlotId
        );
        
        setAvailabilityErrors(prev => ({
          ...prev,
          [index]: isAvailable ? '' : 'Esta sala já está ocupada neste horário'
        }));
      } catch (err) {
        console.error('Erro ao verificar disponibilidade:', err);
      } finally {
        setCheckingAvailability(false);
      }
    }
  };

  const handleBuildingChange = (index: number, value: string) => {
    const buildingId = parseInt(value);
    
    const updatedSchedules = [...formData.schedules];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      buildingId,
      roomId: 0
    };
    
    setFormData(prev => ({
      ...prev,
      schedules: updatedSchedules
    }));
  };

  const handleRoomChange = async (index: number, value: string) => {
    const roomId = parseInt(value);
    
    const updatedSchedules = [...formData.schedules];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      roomId
    };
    
    setFormData(prev => ({
      ...prev,
      schedules: updatedSchedules
    }));

    if (roomId > 0 && updatedSchedules[index].timeSlotId > 0) {
      setCheckingAvailability(true);
      try {
        const isAvailable = await classSchedulesService.isRoomAvailable(
          roomId, 
          updatedSchedules[index].timeSlotId
        );
        
        setAvailabilityErrors(prev => ({
          ...prev,
          [index]: isAvailable ? '' : 'Esta sala já está ocupada neste horário'
        }));
      } catch (err) {
        console.error('Erro ao verificar disponibilidade:', err);
      } finally {
        setCheckingAvailability(false);
      }
    }
  };

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, { timeSlotId: 0, roomId: 0 }]
    }));
  };

  const removeSchedule = (index: number) => {
    if (formData.schedules.length <= 1) return;
    
    const updatedSchedules = [...formData.schedules];
    updatedSchedules.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      schedules: updatedSchedules
    }));
    
    const updatedErrors = {...availabilityErrors};
    delete updatedErrors[index];
    setAvailabilityErrors(updatedErrors);
  };

  const getAvailableRooms = (buildingId: string) => {
    if (!buildingId) return [];
    
    const selectedBuilding = buildings.find(b => b.id.toString() === buildingId);
    return selectedBuilding?.rooms || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.values(availabilityErrors).some(error => error !== '')) {
      setError('Existem conflitos de horário que precisam ser resolvidos antes de salvar.');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      if (isEditMode) {
        const classData: Partial<Class> = {
          subjectId: parseInt(formData.subjectId),
          semesterId: formData.semesterId,
          teacherId: formData.teacherId,
          name: formData.name
        };
        
        await classesService.updateClass(parseInt(id!), classData);
        
        const classId = parseInt(id!);
        
        const existingSchedules = await classSchedulesService.getSchedulesByClassId(classId);
        
        for (const existingSchedule of existingSchedules) {
          const stillExists = formData.schedules.some(schedule => 
            schedule.timeSlotId === existingSchedule.time_slot_id && 
            schedule.roomId === existingSchedule.room_id
          );
          
          if (!stillExists && existingSchedule.id) {
            await classSchedulesService.deleteSchedule(existingSchedule.id);
          }
        }
        
        for (const schedule of formData.schedules) {
          const alreadyExists = existingSchedules.some(existing => 
            existing.time_slot_id === schedule.timeSlotId && 
            existing.room_id === schedule.roomId
          );
          
          if (!alreadyExists) {
            await classSchedulesService.createSchedule({
              class_id: classId,
              time_slot_id: schedule.timeSlotId,
              room_id: schedule.roomId,
              building_id: schedule.buildingId
            });
          }
        }
        
        setSuccess('Aula atualizada com sucesso!');
        setTimeout(() => {
          navigate('/horarios/aulas');
        }, 1500);
      } else {
        const classData: any = {
          subjectId: parseInt(formData.subjectId),
          semesterId: formData.semesterId,
          name: formData.name || subjects.find(s => s.id === formData.subjectId)?.name || ''
        };
        
        if (isAdmin && formData.teacherId && formData.teacherId.trim() !== '') {
          classData.teacherId = formData.teacherId;
        }
        
        const schedulesData = formData.schedules.map(schedule => ({
          time_slot_id: schedule.timeSlotId,
          room_id: schedule.roomId,
          building_id: schedule.buildingId,
          class_id: 0
        }));
        
        const createData: CreateClassWithSchedulesRequest = {
          class: classData,
          schedules: schedulesData
        };
        
        await classesService.createClassWithSchedules(createData);
        
        setSuccess('Aula criada com sucesso!');
        setTimeout(() => {
          navigate('/horarios/aulas');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Erro ao salvar aula:', err);
      setError('Erro ao salvar aula: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.subjectId !== '' &&
      formData.semesterId > 0 &&
      (isAdmin ? formData.teacherId !== '' : true) &&
      formData.name.trim() !== '' &&
      formData.schedules.length > 0 &&
      formData.schedules.every(schedule => 
        schedule.timeSlotId > 0 && schedule.roomId > 0
      ) &&
      Object.values(availabilityErrors).every(error => error === '')
    );
  };

  const handleBack = () => {
    navigate('/horarios/aulas');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        width: '100%'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, width: '100%', borderRadius: 3, boxShadow: 2, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mr: 2, minWidth: 100 }}
          >
            Voltar
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1, fontSize: { xs: 24, md: 32 } }}>
            {isEditMode ? 'Editar Aula' : 'Criar Nova Aula'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 1, mb: 2, fontWeight: 600 }}>
          Informações Básicas
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
          <FormControl fullWidth required variant="outlined">
            <InputLabel>Disciplina</InputLabel>
            <Select
              value={formData.subjectId}
              onChange={handleSubjectChange}
              label="Disciplina"
              disabled={loadingSubjects}
            >
              {subjects.map(subject => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required variant="outlined">
            <InputLabel>Semestre</InputLabel>
            <Select
              value={formData.semesterId.toString()}
              onChange={handleSemesterChange}
              label="Semestre"
              disabled={loadingSemesters}
            >
              {semesters.map(semester => (
                <MenuItem key={semester.id} value={semester.id.toString()}>
                  {semester.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isAdmin && (
            <FormControl fullWidth required variant="outlined">
              <InputLabel>Professor</InputLabel>
              <Select
                value={formData.teacherId}
                onChange={handleTeacherChange}
                label="Professor"
                disabled={loadingProfessors}
              >
                {professors.map(professor => (
                  <MenuItem key={professor.id} value={professor.id}>
                    {professor.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
            Horários e Locais
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={addSchedule}
            size="small"
          >
            Adicionar Horário
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
          {formData.schedules.map((schedule, index) => (
            <Box 
              key={index} 
              sx={{ 
                p: 3, 
                pt: 4,
                border: availabilityErrors[index] ? '1px solid #d32f2f' : '1px dashed #b3c2d1', 
                borderRadius: 2, 
                background: '#fff', 
                boxShadow: 0, 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 3,
                position: 'relative'
              }}
            >
              {availabilityErrors[index] && (
                <Alert severity="error" sx={{ width: '100%', mb: 1 }}>
                  {availabilityErrors[index]}
                </Alert>
              )}
              
              <FormControl fullWidth required variant="outlined" sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, mb: { xs: 2, md: 0 }, mr: { md: 2 } }}>
                <InputLabel id={`horario-label-${index}`}>Horário</InputLabel>
                <Select
                  labelId={`horario-label-${index}`}
                  value={schedule.timeSlotId.toString() || ''}
                  onChange={(e) => handleTimeSlotChange(index, e.target.value)}
                  label="Horário"
                  displayEmpty
                  disabled={loadingTimeSlots || checkingAvailability}
                >
                  <MenuItem value="0" disabled>
                    Selecione o horário
                  </MenuItem>
                  {timeSlots.map(slot => {
                    return (
                      <MenuItem key={slot.id} value={slot.id}>
                        {`${dayOfWeekMap[slot.day_of_week as DayOfWeek]} - ${slot.start_time} às ${slot.end_time}`}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl fullWidth required variant="outlined" sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, mb: { xs: 2, md: 0 }, mr: { md: 2 } }}>
                <Select
                  labelId={`predio-label-${index}`}
                  value={(schedule.buildingId || '').toString()}
                  onChange={(e) => handleBuildingChange(index, e.target.value)}
                  label="Prédio"
                  displayEmpty
                  disabled={loadingBuildings || checkingAvailability}
                >
                  <MenuItem value="" disabled>
                    Selecione o prédio
                  </MenuItem>
                  {buildings.map(building => (
                    <MenuItem key={building.id} value={building.id.toString()}>
                      {building.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required variant="outlined" sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, mb: { xs: 2, md: 0 } }}>
                <InputLabel id={`sala-label-${index}`}>Sala</InputLabel>
                <Select
                  labelId={`sala-label-${index}`}
                  value={schedule.roomId.toString() || '0'}
                  onChange={(e) => handleRoomChange(index, e.target.value)}
                  label="Sala"
                  displayEmpty
                  disabled={!schedule.buildingId || loadingBuildings || checkingAvailability}
                >
                  <MenuItem value="0" disabled>
                    Selecione a sala
                  </MenuItem>
                  {getAvailableRooms(schedule.buildingId?.toString() || '').map(room => (
                    <MenuItem key={room.id} value={room.id.toString()}>
                      {room.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <IconButton 
                color="error" 
                onClick={() => removeSchedule(index)}
                sx={{ flex: { md: '0 0 10%' }, alignSelf: 'center' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={!isFormValid() || saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </Box>
      </Paper>
      
      {/* Snackbar para mensagens de sucesso */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(null)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}