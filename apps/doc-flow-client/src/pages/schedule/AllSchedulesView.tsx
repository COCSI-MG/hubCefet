import { Box, Typography, Paper, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Button, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { useState, useEffect } from 'react';
import ScheduleTable, { ScheduledClassDisplayItem } from "@/components/ScheduleTable";
import classesService from '@/api/services/classes';
import { Class as BaseClass } from '@/api/services/classes';
import { TimeSlot } from '@/api/services/time-slots';
import { Subject } from '@/api/services/subjects';
import { User } from '@/api/services/users';

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

interface PeriodGroup {
  periodKey: string;
  periodName: string;
  year: number;
  semester: number;
  classes: ScheduledClassDisplayItem[];
  totalClasses: number;
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

export default function AllSchedulesView() {
  const [loading, setLoading] = useState(true);
  const [periodGroups, setPeriodGroups] = useState<PeriodGroup[]>([]);
  const [currentDate] = useState(new Date());
  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);

  useEffect(() => {
    fetchAllClassesAndGroupByPeriod();
  }, []);

  const fetchAllClassesAndGroupByPeriod = async () => {
    setLoading(true);
    try {
      const classesData: ApiClass[] = await classesService.getPublicClasses() as ApiClass[];
      
      const allClasses = classesData;
      
      const periodMap = new Map<string, {
        year: number;
        semester: number;
        classes: ScheduledClassDisplayItem[];
      }>();

      allClasses.forEach((cls: ApiClass) => {
        const schedulesList = cls.classSchedules || cls.schedules || [];

        if (schedulesList.length > 0) {
          const semesterData = cls.semester || { number: 0, year: 0 };
          const year = Number(semesterData.year) || 0;
          const semester = Number(semesterData.number) || 0;
          const periodKey = `${year}-${semester}`;

          if (!periodMap.has(periodKey)) {
            periodMap.set(periodKey, {
              year,
              semester,
              classes: []
            });
          }

          schedulesList.forEach(scheduleEntry => {
            const actualTimeSlotId = scheduleEntry.timeSlot?.id ?? scheduleEntry.time_slot_id ?? scheduleEntry.timeSlotId;
            if (actualTimeSlotId === undefined) {
              console.warn('[AllSchedulesView] ClassSchedule sem timeSlotId válido:', scheduleEntry, 'aula:', cls.name);
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

            if (dayOfWeekNumber === undefined) {
              console.warn('[AllSchedulesView] dayOfWeek inválido:', scheduleEntry.dayOfWeek, 'timeSlot:', timeSlotData);
              return;
            }

            const teacherName = cls.teacher?.full_name || '';
            const subjectName = cls.subject?.name || '';
            const subjectCode = cls.subject?.code || '';
            const roomName = scheduleEntry.room?.name || '';
            const buildingName = scheduleEntry.building?.name || '';

            const cancellationDates = cls.weeklyCancellations?.map(cancellation => cancellation.date) || [];

            const item: ScheduledClassDisplayItem = {
              id: `${cls.id}-${actualTimeSlotId}-${dayOfWeekNumber}`,
              className: cls.name || '',
              subjectName,
              subjectCode,
              teacherName,
              roomName,
              buildingName,
              dayOfWeek: dayOfWeekNumber,
              timeSlotId: actualTimeSlotId,
              classId: cls.id,
              cancellationDates,
            };
            
            periodMap.get(periodKey)!.classes.push(item);
          });
        } else {
          console.warn('[AllSchedulesView] Aula sem schedules:', cls.name, cls.id);
        }
      });

      const groupedPeriods: PeriodGroup[] = Array.from(periodMap.entries()).map(([key, data]) => ({
        periodKey: key,
        periodName: data.year > 0 ? `${data.year}.${data.semester}` : 'Período não definido',
        year: data.year,
        semester: data.semester,
        classes: data.classes,
        totalClasses: data.classes.length
      })).sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        return b.semester - a.semester;
      });

      setPeriodGroups(groupedPeriods);
    } catch (error) {
      console.error('[AllSchedulesView] Erro ao buscar todas as aulas públicas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandAll = () => {
    const allPeriodKeys = periodGroups.map(period => period.periodKey);
    setExpandedPanels(allPeriodKeys);
  };

  const handleCollapseAll = () => {
    setExpandedPanels([]);
  };

  const handlePanelChange = (periodKey: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    if (isExpanded) {
      setExpandedPanels(prev => [...prev, periodKey]);
    } else {
      setExpandedPanels(prev => prev.filter(key => key !== periodKey));
    }
  };

  useEffect(() => {
    if (periodGroups.length > 0 && expandedPanels.length === 0) {
      setExpandedPanels([periodGroups[0].periodKey]);
    }
  }, [periodGroups]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '100%', margin: '0 auto', padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            Todos os Horários por Período
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Visualização completa organizada por períodos letivos
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            {periodGroups.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<UnfoldMoreIcon />}
                  onClick={handleExpandAll}
                  disabled={expandedPanels.length === periodGroups.length}
                >
                  Expandir Todos
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<UnfoldLessIcon />}
                  onClick={handleCollapseAll}
                  disabled={expandedPanels.length === 0}
                >
                  Recolher Todos
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {periodGroups.length === 0 ? (
        <Paper elevation={2} sx={{ padding: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Nenhuma aula encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Não há aulas cadastradas no sistema.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ space: 2 }}>
          {periodGroups.map((period, index) => (
            <Accordion 
              key={period.periodKey}
              expanded={expandedPanels.includes(period.periodKey)}
              onChange={handlePanelChange(period.periodKey)}
              sx={{ mb: 2, border: '1px solid #e0e0e0' }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  backgroundColor: '#f5f5f5',
                  '&:hover': { backgroundColor: '#eeeeee' },
                  minHeight: 60
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 2 }}>
                      Período {period.periodName}
                    </Typography>
                    <Chip 
                      label={`${period.totalClasses} aulas`}
                      size="small"
                      color="primary"
                      variant="filled"
                    />
                  </Box>
                  {period.year > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                      Ano: {period.year} • Semestre: {period.semester}
                    </Typography>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'medium' }}>
                    Quadro de Horários - {period.periodName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Clique em qualquer aula para ver os detalhes públicos
                  </Typography>
                </Box>
                <ScheduleTable 
                  scheduledClasses={period.classes} 
                  currentDate={currentDate}
                  isPublicView={true}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
} 
 
 