import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import classesService from '@/api/services/classes';
import { ClassCancellation } from '@/api/services/classes';
import { jwtDecode } from 'jwt-decode';

interface UserProfile {
  sub?: string;
  id?: string;
  email?: string;
  profile?: {
    name?: string;
  } | string;
  isAdmin: boolean;
  userId: string;
  profileName: string;
}

const TIME_SLOTS = [
  "07:00 - 07:50",
  "07:50 - 08:40",
  "08:40 - 09:30",
  "09:30 - 09:45",
  "09:45 - 10:35",
  "10:35 - 11:25",
  "11:25 - 12:15",
  "12:15 - 13:00",
  "13:00 - 13:50",
  "13:50 - 14:40",
  "14:40 - 15:30",
  "15:30 - 15:45",
  "15:45 - 16:35",
  "16:35 - 17:25",
  "17:25 - 18:15",
  "18:15 - 19:00",
  "19:00 - 19:50",
  "19:50 - 20:40",
  "20:40 - 21:30",
  "21:30 - 21:45",
  "21:45 - 22:35",
];

const DAYS_OF_WEEK = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];

interface ClassSchedule {
  id: string;
  classId?: number;
  subjectName: string;
  subjectCode: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  building: string;
  room: string;
  color: string;
  textColor: string;
}

export default function TeacherScheduleView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduleMatrix, setScheduleMatrix] = useState<Record<string, Record<string, ClassSchedule[]>>>({});
  const [cancelledClasses, setCancelledClasses] = useState<ClassCancellation[]>([]);
  const [currentDate] = useState(new Date());
  const [userProfile, setUserProfile] = useState<UserProfile>({
    isAdmin: false,
    userId: '',
    profileName: ''
  });


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
    const initializeMatrix = () => {
      const matrix: Record<string, Record<string, ClassSchedule[]>> = {};
      
      TIME_SLOTS.forEach(slot => {
        matrix[slot] = {};
        DAYS_OF_WEEK.forEach(day => {
          matrix[slot][day] = [];
        });
      });
      
      setScheduleMatrix(matrix);
    };
    
    initializeMatrix();
  }, []);

  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!userProfile.userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const classesData = await classesService.getClasses();
        
        const teacherClasses = classesData.filter((cls: any) => 
          cls.teacher?.id === userProfile.userId || cls.teacher_id === userProfile.userId
        );
        
        const colors = [
          '#e8f4fd',
          '#e8f5e9',
          '#fff8e1',
          '#f3e5f5',
          '#e1f5fe',
          '#e0f2f1',
          '#f1f8e9',
          '#e8eaf6',
          '#fce4ec',
          '#e0f7fa',
        ];
        
        const textColors = [
          '#1565c0',
          '#2e7d32',
          '#ef6c00',
          '#6a1b9a',
          '#0277bd',
          '#00695c',
          '#558b2f',
          '#303f9f',
          '#c2185b',
          '#00838f',
        ];
        
        const subjectColors: Record<string, {bg: string, text: string}> = {};
        let colorIndex = 0;
        
        const matrix: Record<string, Record<string, ClassSchedule[]>> = {};
        
        const usedTimeSlots = new Set<string>();
        
        teacherClasses.forEach((cls: any) => {
          const subjectId = cls.subject?.id.toString() || '';
          
          if (!subjectColors[subjectId]) {
            subjectColors[subjectId] = {
              bg: colors[colorIndex % colors.length],
              text: textColors[colorIndex % textColors.length]
            };
            colorIndex++;
          }
          
          if (cls.schedules && Array.isArray(cls.schedules) && cls.schedules.length > 0) {
            cls.schedules.forEach((schedule: any) => {
              const day = schedule.day_of_week?.toUpperCase() || '';
              const startTime = schedule.start_time || '';
              const endTime = schedule.end_time || '';
              
              if (!DAYS_OF_WEEK.includes(day)) return;
              
              TIME_SLOTS.forEach(slot => {
                const [slotStart] = slot.split(' - ');
                
                if (isTimeInRange(slotStart, startTime, endTime)) {
                  usedTimeSlots.add(slot);
                  
                  if (!matrix[slot]) {
                    matrix[slot] = {};
                    DAYS_OF_WEEK.forEach(day => {
                      matrix[slot][day] = [];
                    });
                  }
                  
                  const classSchedule: ClassSchedule = {
                    id: `${cls.id}-${slot}`,
                    classId: cls.id,
                    subjectName: cls.subject?.name || '',
                    subjectCode: cls.subject?.code || '',
                    dayOfWeek: day,
                    startTime,
                    endTime,
                    building: schedule.building?.name || '',
                    room: schedule.room?.name || '',
                    color: subjectColors[subjectId].bg,
                    textColor: subjectColors[subjectId].text
                  };
                  
                  if (matrix[slot] && matrix[slot][day]) {
                    matrix[slot][day].push(classSchedule);
                  }
                }
              });
            });
          } else if (cls.schedule) {
            const scheduleParts = cls.schedule.split(' ');
            if (scheduleParts.length >= 4) {
              const day = scheduleParts[0].toUpperCase();
              const startTime = scheduleParts[1];
              const endTime = scheduleParts[3];
              
              if (!DAYS_OF_WEEK.includes(day)) return;
              
              TIME_SLOTS.forEach(slot => {
                const [slotStart] = slot.split(' - ');
                
                if (isTimeInRange(slotStart, startTime, endTime)) {
                  usedTimeSlots.add(slot);
                  
                  if (!matrix[slot]) {
                    matrix[slot] = {};
                    DAYS_OF_WEEK.forEach(day => {
                      matrix[slot][day] = [];
                    });
                  }
                  
                  const classSchedule: ClassSchedule = {
                    id: `${cls.id}-direct`,
                    classId: cls.id,
                    subjectName: cls.subject?.name || '',
                    subjectCode: cls.subject?.code || '',
                    dayOfWeek: day,
                    startTime,
                    endTime,
                    building: '',
                    room: '',
                    color: subjectColors[subjectId].bg,
                    textColor: subjectColors[subjectId].text
                  };
                  
                  if (matrix[slot] && matrix[slot][day]) {
                    matrix[slot][day].push(classSchedule);
                  }
                }
              });
            }
          }
        });
        
        const activeTimeSlots = Array.from(usedTimeSlots).sort((a, b) => {
          const timeA = a.split(' - ')[0];
          const timeB = b.split(' - ')[0];
          return timeA.localeCompare(timeB);
        });
        
        const filteredMatrix: Record<string, Record<string, ClassSchedule[]>> = {};
        activeTimeSlots.forEach(slot => {
          filteredMatrix[slot] = matrix[slot] || {};
        });
        
        setScheduleMatrix(filteredMatrix);
        setLoading(false);

        await fetchCancellations();
      } catch (err: any) {
        console.error('Erro ao carregar aulas:', err);
        setError('Erro ao carregar suas aulas: ' + (err.message || 'Erro desconhecido'));
        setLoading(false);
      }
    };
    
    if (userProfile.userId) {
      fetchTeacherClasses();
    }
  }, [userProfile.userId]);

  const isTimeInRange = (time: string, start: string, end: string): boolean => {
    const timeToMinutes = (timeStr: string): number => {
      const [hours, minutes] = timeStr.trim().split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const timeMin = timeToMinutes(time);
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    
    return timeMin >= startMin && timeMin < endMin;
  };


  const isClassCancelled = (classId?: number, dayOfWeek?: string): boolean => {
    if (!classId || !cancelledClasses || cancelledClasses.length === 0 || !dayOfWeek) return false;
    
    const dayToNumber: Record<string, number> = {
      'DOMINGO': 0,
      'SEGUNDA': 1,
      'TERÇA': 2,
      'QUARTA': 3,
      'QUINTA': 4,
      'SEXTA': 5,
      'SÁBADO': 6
    };
    
    const dayNumber = dayToNumber[dayOfWeek];
    if (dayNumber === undefined) return false;
    
    return cancelledClasses.some(cancellation => {
      if (cancellation.classId !== classId) return false;
      
      try {
        const cancelDate = new Date(cancellation.date);
        
        if (cancelDate < currentDate) return false;
        return cancelDate.getDay() === dayNumber;
      } catch (error) {
        console.error("Erro ao processar data de cancelamento:", error);
        return false;
      }
    });
  };
  
  const getCancellationDates = (classId?: number, dayOfWeek?: string): string[] => {
    if (!classId || !cancelledClasses || cancelledClasses.length === 0 || !dayOfWeek) return [];
    
    const dayToNumber: Record<string, number> = {
      'DOMINGO': 0,
      'SEGUNDA': 1,
      'TERÇA': 2,
      'QUARTA': 3,
      'QUINTA': 4,
      'SEXTA': 5,
      'SÁBADO': 6
    };
    
    const dayNumber = dayToNumber[dayOfWeek];
    if (dayNumber === undefined) return [];
    
    const dates: string[] = [];
    
    cancelledClasses.forEach(cancellation => {
      if (cancellation.classId !== classId) return;
      
      try {
        const cancelDate = new Date(cancellation.date);
        
        if (cancelDate < currentDate) return;
        
        if (cancelDate.getDay() === dayNumber) {
          const day = String(cancelDate.getDate()).padStart(2, '0');
          const month = String(cancelDate.getMonth() + 1).padStart(2, '0');
          const year = cancelDate.getFullYear();
          dates.push(`${day}/${month}/${year}`);
        }
      } catch (error) {
        console.error("Erro ao processar data de cancelamento:", error);
      }
    });
    
    return dates;
  };

  const fetchCancellations = async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      
      const startOfMonth = `${year}-${month}-01`;
      const endOfMonth = `${year}-${month}-31`; 
      
      const cancellations = await classesService.getAllCancellations({
        startDate: startOfMonth,
        endDate: endOfMonth
      });
      
      setCancelledClasses(cancellations);
    } catch (error) {
      console.error('Erro ao carregar cancelamentos:', error);
    }
  };

  const handleBack = () => {
    navigate('/horarios/gerenciar');
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper sx={{ p: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
          >
            Voltar
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Meu Quadro de Horários
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Visualize todos os seus horários de aula da semana.
        </Typography>

        {error && (
          <Typography color="error" sx={{ my: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={0} sx={{ margin: '0 auto', overflow: 'hidden', maxWidth: '100%', border: '1px solid #e0e0e0', borderRadius: '2px' }}>
            <Box sx={{ 
              p: 1.5, 
              mb: 0, 
              borderBottom: '1px solid #e0e0e0', 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <Typography variant="h6" sx={{ 
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Quadro de Horários
                <Typography variant="caption" sx={{ 
                  fontSize: '0.7rem',
                  fontWeight: 'normal',
                  color: '#0066cc',
                  ml: 1
                }}>
                  Ver Legenda
                </Typography>
              </Typography>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: `minmax(120px, auto) repeat(${DAYS_OF_WEEK.length}, 1fr)`,
                minWidth: 900, 
                border: 'none',
                '& > div': {
                  borderRight: '1px solid #e0e0e0',
                  '&:last-child': {
                    borderRight: 'none'
                  }
                }
              }}>
                <Box sx={{ 
                  backgroundColor: '#f9f9f9',
                  padding: '8px 12px',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  color: '#333',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  Horário
                </Box>
                
                {DAYS_OF_WEEK.map((day) => (
                  <Box key={day} sx={{ 
                    backgroundColor: '#f9f9f9',
                    padding: '8px 12px',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    color: '#333',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    {day}
                  </Box>
                ))}

                {Object.keys(scheduleMatrix).map((slot) => (
                  <React.Fragment key={slot}>
                    <Box sx={{ 
                      borderTop: '1px solid #e0e0e0',
                      padding: '6px 10px',
                      backgroundColor: '#f9f9f9',
                      color: '#333',
                      fontSize: '0.7rem',
                      textAlign: 'center'
                    }}>
                      {slot}
                    </Box>
                    
                    {DAYS_OF_WEEK.map((day) => (
                      <Box 
                        key={`${day}-${slot}`} 
                        sx={{ 
                          borderTop: '1px solid #e0e0e0',
                          height: slot.includes('Intervalo') || slot.includes('Almoço') || slot.includes('Jantar') 
                            ? '30px' 
                            : '50px',
                          padding: '0',
                          position: 'relative'
                        }}
                      >
                        {scheduleMatrix[slot] && scheduleMatrix[slot][day] && scheduleMatrix[slot][day].map((classItem, classIndex) => {
                          const isCancelled = isClassCancelled(classItem.classId, classItem.dayOfWeek);
                          
                          const cancellationDates = getCancellationDates(classItem.classId, classItem.dayOfWeek);
                          const cancellationInfo = cancellationDates.length > 0 
                            ? `\nAULA CANCELADA NAS DATAS:\n${cancellationDates.join('\n')}`
                            : '';
                          
                          return (
                            <Box 
                              key={`${classItem.id}-${classIndex}`}
                              sx={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                bottom: '0',
                                backgroundColor: isCancelled ? '#ffebee' : classItem.color,
                                color: isCancelled ? '#d32f2f' : classItem.textColor,
                                padding: '4px 8px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: isCancelled ? '#ffcdd2' : classItem.color,
                                  filter: 'brightness(95%)'
                                },
                                textAlign: 'center',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '4px',
                                  backgroundColor: isCancelled ? '#ef5350' : classItem.textColor
                                }
                              }}
                              onClick={() => navigate(`/horarios/aulas/detalhes/${classItem.classId}`)}
                              title={`${classItem.subjectName} (${classItem.subjectCode})
Horário: ${classItem.startTime} - ${classItem.endTime}
Local: ${classItem.building}, ${classItem.room}${cancellationInfo}`}
                            >
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  fontWeight: 'bold',
                                  textDecoration: isCancelled ? 'line-through' : 'none'
                                }}
                              >
                                {classItem.subjectName}
                              </Typography>
                              
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: '0.65rem',
                                  textDecoration: isCancelled ? 'line-through' : 'none'
                                }}
                              >
                                {classItem.subjectCode}
                              </Typography>
                              
                              {isCancelled && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.65rem',
                                    color: '#d32f2f',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    width: '100%',
                                    mt: 0.3
                                  }}
                                >
                                  CANCELADA
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          </Paper>
        )}
      </Paper>
    </Box>
  );
}