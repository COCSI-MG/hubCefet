import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScheduleTable, { ScheduledClassDisplayItem } from "@/components/ScheduleTable";
import SettingsIcon from '@mui/icons-material/Settings';
import useAuth from "@/hooks/useAuth";
import classesService from '@/api/services/classes';
import { Class as BaseClass } from '@/api/services/classes';
import { jwtDecode } from "jwt-decode";
import { TimeSlot } from '@/api/services/time-slots';
import { Subject } from '@/api/services/subjects';
import { User } from '@/api/services/users';

interface UserProfile {
  sub?: string;
  id?: string;
  email?: string;
  profile?: { name?: string; roles?: string[] } | string;
  isAdmin?: boolean;
  userId: string;
  profileName: string;
}

interface ClassScheduleFromApi {
  id: number;
  dayOfWeek: number | string;
  timeSlotId?: number;
  time_slot_id?: number;
  timeSlot?: TimeSlot;
  building?: { id: number; name: string };
  room?: { id: number; name: string };
  classId?: number;
}

interface ApiClass extends BaseClass {
  subject?: Subject;
  teacher?: User;
  semester?: { id: number; name: string; year: number; number: number };
  classSchedules?: ClassScheduleFromApi[];
  schedules?: ClassScheduleFromApi[];
  students?: Array<{ id: string; fullName?: string; full_name?: string }>;
  weeklyCancellations?: Array<{ id: number; classId: number; date: string; reason: string }>;
  
  schedule?: string;
  timeSlot?: TimeSlot;
}

const DAY_STRING_TO_NUMBER: { [key: string]: number } = {
  DOMINGO: 0,
  SEGUNDA: 1,
  TERÇA: 2,
  QUARTA: 3,
  QUINTA: 4,
  SEXTA: 5,
  SÁBADO: 6,
  // Mapeamento em inglês para compatibilidade com a API
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export default function ScheduleView() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [scheduledClassItems, setScheduledClassItems] = useState<ScheduledClassDisplayItem[]>([]);
  
  const [isProfessor, setIsProfessor] = useState(false);
  const [isAdminUserState, setIsAdminUserState] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    const getUserProfile = () => {
      try {
        if (token) {
          const decoded: any = jwtDecode(token);
          let profileNameStr = '';
          if (typeof decoded.profile === 'string') {
            profileNameStr = decoded.profile;
          } else if (decoded.profile?.name) {
            profileNameStr = decoded.profile.name;
          } else if (decoded.profile?.roles && decoded.profile.roles.length > 0) {
            profileNameStr = decoded.profile.roles[0];
          }
          
          const profileLower = profileNameStr.toLowerCase();
          const resolvedIsAdmin = profileLower === 'admin' || profileLower === 'coordinator';
          const resolvedIsProfessor = profileLower === 'professor';
          const resolvedIsStudent = profileLower === 'student' || profileLower === 'aluno';
          const resolvedUserId = decoded.sub || decoded.id || '';
          
          setUserProfile({
            ...decoded,
            userId: resolvedUserId,
            profileName: profileNameStr,
            isAdmin: resolvedIsAdmin,
          });
          
          setIsAdminUserState(resolvedIsAdmin);
          setIsProfessor(resolvedIsProfessor);
          setIsStudent(resolvedIsStudent);
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
      }
    };
    getUserProfile();
  }, [token]);
  
  useEffect(() => {
    if (isAdminUserState) {
      navigate('/horarios/gerenciar', { replace: true });
    }
  }, [isAdminUserState, navigate]);

  const fetchUserClassesAndTransform = async () => {
    if (!userProfile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const classesData: ApiClass[] = await classesService.getClasses() as ApiClass[];
      
      let filteredClasses = classesData;
      if (userProfile.profileName && userProfile.userId) {
        const profileLower = userProfile.profileName.toLowerCase();

        if (profileLower === 'professor') {
          filteredClasses = classesData.filter(cls => {
            const teacherObject = cls.teacher;
            const directTeacherId = (cls as any).teacher_id;
            const matchesTeacherObject = teacherObject?.id === userProfile.userId;
            const matchesDirectTeacherId = directTeacherId === userProfile.userId;
            if (matchesTeacherObject || matchesDirectTeacherId) {
              return true;
            }
            return false;
          });
        } else if (profileLower === 'student' || profileLower === 'aluno') {
          filteredClasses = classesData.filter(cls => {
            const isEnrolled = cls.students?.some(student => student.id === userProfile.userId);
            if (isEnrolled) {
              return true;
            }
            return false;
          });
        }
      } else {
        console.warn('[ScheduleView] profileName ou userId ausente no userProfile.');
      }
      
      const transformedItems: ScheduledClassDisplayItem[] = [];
      filteredClasses.forEach((cls: ApiClass) => {
        const schedulesList = cls.classSchedules || cls.schedules || [];

        if (schedulesList.length > 0) {
          schedulesList.forEach(scheduleEntry => {
            const actualTimeSlotId = scheduleEntry.timeSlot?.id ?? scheduleEntry.time_slot_id ?? scheduleEntry.timeSlotId;
            if (actualTimeSlotId === undefined) {
              console.warn('[Transform] ClassSchedule sem timeSlotId válido:', scheduleEntry, 'aula:', cls.name);
              return; 
            }

            let dayOfWeekNumber: number;
            const timeSlotData = scheduleEntry.timeSlot || (scheduleEntry as any).time_slot;
            const dayOfWeekFromTimeSlot = timeSlotData?.dayOfWeek || timeSlotData?.day_of_week;
            
            if (typeof dayOfWeekFromTimeSlot === 'string') {
              dayOfWeekNumber = DAY_STRING_TO_NUMBER[dayOfWeekFromTimeSlot.toUpperCase()];
            } else if (typeof scheduleEntry.dayOfWeek === 'string') {
              dayOfWeekNumber = DAY_STRING_TO_NUMBER[scheduleEntry.dayOfWeek.toUpperCase()];
            } else {
              dayOfWeekNumber = scheduleEntry.dayOfWeek as number;
            }

            if (typeof dayOfWeekNumber !== 'number' || dayOfWeekNumber < 0 || dayOfWeekNumber > 6) {
               console.warn('[Transform] dayOfWeekNumber inválido em ClassSchedule:', dayOfWeekNumber, 'aula:', cls.name);
               return;
            }
            if (typeof actualTimeSlotId !== 'number') {
              console.warn('[Transform] actualTimeSlotId inválido em ClassSchedule:', actualTimeSlotId, 'aula:', cls.name);
              return;
            }

            const cancellationDatesForThisDay = cls.weeklyCancellations
              ?.filter(cancellation => {
                const [year, month, day] = cancellation.date.split('-').map(Number);
                const cancelDate = new Date(year, month - 1, day);
                return cancelDate.getDay() === dayOfWeekNumber;
              })
              .map(cancellation => cancellation.date) || [];

            transformedItems.push({
              id: `${cls.id}-${scheduleEntry.id}`, 
              className: cls.name || 'Aula sem nome',
              subjectName: cls.subject?.name || 'Disciplina desconhecida',
              subjectCode: cls.subject?.code,
              teacherName: cls.teacher?.full_name, 
              roomName: scheduleEntry.room?.name,
              buildingName: scheduleEntry.building?.name,
              dayOfWeek: dayOfWeekNumber,
              timeSlotId: actualTimeSlotId,
              classId: cls.id,
              isCancelled: cancellationDatesForThisDay.length > 0,
              cancellationDates: cancellationDatesForThisDay
            });
          });
        } else if (cls.schedule && cls.timeSlot?.id !== undefined) {
          const scheduleString = cls.schedule.toUpperCase();
          let dayOfWeekNumber = -1;

          for (const dayName in DAY_STRING_TO_NUMBER) {
            if (scheduleString.startsWith(dayName)) {
              dayOfWeekNumber = DAY_STRING_TO_NUMBER[dayName];
              break;
            }
          }

          const actualTimeSlotId = cls.timeSlot?.id;

          if (dayOfWeekNumber === -1) {
            console.warn(`[Transform-Fallback] Não foi possível extrair dia da semana da string: "${cls.schedule}", aula: ${cls.name}`);
            return; 
          }
          if (actualTimeSlotId === undefined || typeof actualTimeSlotId !== 'number') { 
            console.warn('[Transform-Fallback] TimeSlot ID ausente ou inválido no fallback:', actualTimeSlotId, 'aula:', cls.name);
            return; 
          }
          
          const cancellationDatesForThisDay = cls.weeklyCancellations
            ?.filter(cancellation => {
              const [year, month, day] = cancellation.date.split('-').map(Number);
              const cancelDate = new Date(year, month - 1, day);
              return cancelDate.getDay() === dayOfWeekNumber;
            })
            .map(cancellation => cancellation.date) || [];

          transformedItems.push({
            id: `${cls.id}-direct-${actualTimeSlotId}`, 
            className: cls.name || 'Aula sem nome',
            subjectName: cls.subject?.name || 'Disciplina desconhecida',
            subjectCode: cls.subject?.code,
            teacherName: cls.teacher?.full_name,
            roomName: undefined, 
            buildingName: undefined, 
            dayOfWeek: dayOfWeekNumber,
            timeSlotId: actualTimeSlotId,
            classId: cls.id,
            isCancelled: cancellationDatesForThisDay.length > 0,
            cancellationDates: cancellationDatesForThisDay
          });
        }
      });
      
      setScheduledClassItems(transformedItems);
    } catch (error) {
      console.error('Erro ao buscar e transformar aulas do usuário:', error);
      setScheduledClassItems([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchUserClassesAndTransform();
    }
  }, [userProfile]);

  const handleManagementClick = () => {
    navigate('/horarios/gerenciar');
  };
  
   if (isAdminUserState) {
     return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Redirecionando para a área de gerenciamento...</Typography>
        </Box>
     );
   }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Quadro de Horários
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {isProfessor && (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SettingsIcon />}
                onClick={handleManagementClick}
              >
                Gerenciar Aulas
              </Button>
            )}
          </Box>
        </Box>
        
        <Typography component="div" sx={{ mb: 3 }}>
          {isProfessor && (
            <Typography component="span" variant="body2" color="text.secondary" display="block">
              Visualizando as disciplinas que você leciona.
            </Typography>
          )}
          {isStudent && (
            <Typography component="span" variant="body2" color="text.secondary" display="block">
              Visualizando as disciplinas em que você está matriculado.
        </Typography>
          )}
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ScheduleTable 
            scheduledClasses={scheduledClassItems} 
            currentDate={currentDate}
          />
        )}
      </Paper>
    </Box>
  );
} 