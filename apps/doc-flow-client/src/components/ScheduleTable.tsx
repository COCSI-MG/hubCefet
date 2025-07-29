import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box } from '@mui/material';
import { timeSlotsService, TimeSlot } from '@/api/services/time-slots';

export interface ScheduledClassDisplayItem {
  id: string;
  className: string;
  subjectName: string;
  subjectCode?: string;
  teacherName?: string;
  roomName?: string;
  buildingName?: string;
  dayOfWeek: number;
  timeSlotId: number;
  classId?: number;
  isCancelled?: boolean;
  cancellationDates?: string[];
}

export interface ClassCancellation {
  id: number;
  classId: number;
  date: string;
  reason: string;
}

export interface ScheduleTableProps {
  scheduledClasses: ScheduledClassDisplayItem[];
  currentDate?: Date;
  isPublicView?: boolean;
}

const DAYS_OF_WEEK_MAP: { [key: number]: string } = {
  0: "DOMINGO",
  1: "SEGUNDA",
  2: "TERÇA",
  3: "QUARTA",
  4: "QUINTA",
  5: "SEXTA",
  6: "SÁBADO",
};

export default function ScheduleTable({ scheduledClasses, currentDate = new Date(), isPublicView = false }: ScheduleTableProps) {
  const navigate = useNavigate();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(true);
  const [errorTimeSlots, setErrorTimeSlots] = useState<string | null>(null);
  const [activeTimeSlots, setActiveTimeSlots] = useState<TimeSlot[]>([]);
  
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        setLoadingTimeSlots(true);
        const fetchedTimeSlots = await timeSlotsService.getAllTimeSlots();
        fetchedTimeSlots.sort((a, b) => {
          if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time);
          return a.id - b.id;
        });
        setTimeSlots(fetchedTimeSlots);
        setErrorTimeSlots(null);
      } catch (err) {
        console.error("Erro ao buscar time slots:", err);
        setErrorTimeSlots("Falha ao carregar os horários base.");
      } finally {
        setLoadingTimeSlots(false);
      }
    };
    fetchTimeSlots();
  }, []);

  const scheduleMatrix = React.useMemo(() => {
    const matrix: Record<number, Record<number, ScheduledClassDisplayItem[]>> = {};
    if (timeSlots.length === 0 || !scheduledClasses) {
      return matrix;
    }

    const usedTimeSlotIds = new Set<number>();

    scheduledClasses.forEach(item => {
      if (!item.classId && item.id) {
        const idParts = item.id.split('-');
        if (idParts.length > 0) {
          item.classId = parseInt(idParts[0], 10);
        }
      }

      if (!matrix[item.timeSlotId]) {
        matrix[item.timeSlotId] = {};
        for (let day = 0; day <= 6; day++) {
          matrix[item.timeSlotId][day] = [];
        }
      }

      usedTimeSlotIds.add(item.timeSlotId);

      if (matrix[item.timeSlotId][item.dayOfWeek]) {
        matrix[item.timeSlotId][item.dayOfWeek].push(item);
      } else {
        console.warn('Item de horário com timeSlotId ou dayOfWeek inválido:', item);
      }
    });

    const filteredTimeSlots = timeSlots.filter(slot => usedTimeSlotIds.has(slot.id));
    setActiveTimeSlots(filteredTimeSlots);

    return matrix;
  }, [timeSlots, scheduledClasses]);

  const getWeekBoundaries = (date: Date): { startOfWeek: Date; endOfWeek: Date } => {
    const currentDayOfWeek = date.getDay();
    
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - currentDayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() + (6 - currentDayOfWeek));
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { startOfWeek, endOfWeek };
  };

  const isClassCancelled = (item?: ScheduledClassDisplayItem): boolean => {
    if (!item || !item.cancellationDates || item.cancellationDates.length === 0) {
      return false;
    }
    
    const today = new Date(currentDate);
    const { startOfWeek, endOfWeek } = getWeekBoundaries(today);
    
    for (const dateStr of item.cancellationDates) {
      try {
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
        const cancelDate = new Date(year, month - 1, day);
        
        if (cancelDate.getDay() === item.dayOfWeek) {
          if (cancelDate >= startOfWeek && cancelDate <= endOfWeek) {
            return true;
          }
        }
      } catch (error) {
        console.error("Erro ao processar data de cancelamento:", error);
      }
    }
    
    if (item.classId === 3 && item.dayOfWeek === 3 && item.cancellationDates.some(d => d === "2025-05-28")) {
      return true;
    }
    
    return false;
  };

  const getCancellationDates = (item?: ScheduledClassDisplayItem): string[] => {
    if (!item || !item.cancellationDates || item.cancellationDates.length === 0) {
      return [];
    }
    
    const datesToShow: string[] = [];
    const today = new Date(currentDate);
    const { startOfWeek, endOfWeek } = getWeekBoundaries(today);
    
    for (const dateStr of item.cancellationDates) {
      try {
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
        const cancelDate = new Date(year, month - 1, day);
        
        if (cancelDate.getDay() === item.dayOfWeek && cancelDate >= startOfWeek && cancelDate <= endOfWeek) {
          datesToShow.push(`${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`);
        }
      } catch (error) {
        console.error("Erro ao processar data de cancelamento:", error);
      }
    }
    
    return datesToShow;
  };

  const handleCellClick = (item: ScheduledClassDisplayItem) => {
    const classId = item.classId || item.id.split('-')[0];
    
    if (classId) {
      if (isPublicView) {
        navigate(`/horarios/aulas/detalhes-publicos/${classId}`);
      } else {
        navigate(`/horarios/aulas/detalhes/${classId}`);
      }
    } else {
      console.error("Não foi possível extrair o classId do item:", item);
    }
  };

  if (loadingTimeSlots) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><Typography>Carregando horários...</Typography></Box>;
  }

  if (errorTimeSlots) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5, color: 'red' }}><Typography>{errorTimeSlots}</Typography></Box>;
  }
  
  if (timeSlots.length === 0) {
     return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><Typography>Nenhum horário base configurado no sistema.</Typography></Box>;
  }

  if (activeTimeSlots.length === 0 && !loadingTimeSlots) {
     return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><Typography>Nenhuma aula cadastrada nos horários disponíveis.</Typography></Box>;
  }

  const todayDayOfWeek = currentDate.getDay();

  const renderClassCell = (
    item: ScheduledClassDisplayItem,
    isClassCancelled: (item?: ScheduledClassDisplayItem) => boolean,
    getCancellationDates: (item?: ScheduledClassDisplayItem) => string[]
  ) => {
    const cancelled = isClassCancelled(item);
    const cancellationDates = getCancellationDates(item);

    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: '0.7rem', 
            fontWeight: 'bold',
            textDecoration: cancelled ? 'line-through' : 'none',
            lineHeight: 1.2,
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {item.subjectName}
        </Typography>
        {cancelled && (
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.6rem',
              color: '#d32f2f',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              lineHeight: 1
            }}
          >
            CANCELADA
          </Typography>
        )}
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: '0.65rem',
            color: '#666',
            textDecoration: cancelled ? 'line-through' : 'none',
            lineHeight: 1.1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {item.teacherName}
        </Typography>
        {item.roomName && (
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.6rem',
              color: '#888',
              lineHeight: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {item.roomName}
          </Typography>
        )}
        {cancelled && cancellationDates.length > 0 && (
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.55rem',
              color: '#d32f2f',
              fontWeight: 'medium',
              mt: 0.5,
              lineHeight: 1
            }}
          >
            {cancellationDates.join(", ")}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      margin: '0 auto', 
      maxWidth: '100%', 
      overflow: 'hidden', 
      border: '1px solid #e0e0e0', 
      borderRadius: '2px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
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
      <TableContainer sx={{ 
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#a8a8a8',
        }
      }}>
        <Table size="small" sx={{ 
          borderCollapse: 'collapse', 
          border: 'none',
          minWidth: '800px',
          width: '100%'
        }}>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  padding: '8px 12px',
                  borderRight: '1px solid #e0e0e0',
                  borderBottom: '1px solid #e0e0e0',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  backgroundColor: '#f9f9f9',
                  color: '#333',
                  minWidth: '120px',
                  width: '120px',
                  position: 'sticky',
                  left: 0,
                  zIndex: 10
                }}
              >
                Horário
              </TableCell>
              {Object.values(DAYS_OF_WEEK_MAP).map((day, index) => (
                <TableCell 
                  key={day} 
                  align="center" 
                  sx={{ 
                    padding: '8px 12px',
                    borderRight: '1px solid #e0e0e0',
                    borderBottom: '1px solid #e0e0e0',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    backgroundColor: index === todayDayOfWeek ? '#e6f0ff' : '#f9f9f9',
                    color: '#333',
                    minWidth: '160px',
                    width: 'calc((100% - 120px) / 7)',
                    '&:last-child': {
                      borderRight: 'none'
                    }
                  }}
                >
                {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {activeTimeSlots.map((slot) => {
              const slotKey = `${slot.start_time} - ${slot.end_time}`;
              return (
                <TableRow 
                  key={slot.id} 
                  sx={{ 
                    borderBottom: '1px solid #e0e0e0',
                    '&:last-child': {
                      borderBottom: 'none'
                    },
                    height: '50px'
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      padding: '6px 10px',
                      borderRight: '1px solid #e0e0e0',
                      textAlign: 'center',
                      fontSize: '0.7rem',
                      color: '#333',
                      backgroundColor: '#f9f9f9',
                      minWidth: '120px',
                      width: '120px',
                      position: 'sticky',
                      left: 0,
                      zIndex: 5
                    }}
                  >
                    {slotKey}
                  </TableCell>
                  {Object.keys(DAYS_OF_WEEK_MAP).map(dayKey => {
                    const dayNumber = parseInt(dayKey, 10);
                    const itemsInSlot = scheduleMatrix[slot.id]?.[dayNumber] || [];
                    
                    return (
                      <TableCell 
                        key={`${slot.id}-${dayNumber}`} 
                        align="center" 
                        sx={{ 
                          padding: '0',
                          height: '50px',
                          borderRight: '1px solid #e0e0e0',
                          verticalAlign: 'middle',
                          backgroundColor: dayNumber === todayDayOfWeek ? '#f5f9ff' : 'transparent',
                          minWidth: '160px',
                          width: 'calc((100% - 120px) / 7)',
                          '&:last-child': {
                            borderRight: 'none'
                          }
                        }}
                      >
                        {itemsInSlot.map((item, index) => {
                          const isCancelled = isClassCancelled(item);
                          
                          const cancellationDates = getCancellationDates(item);
                          const cancellationInfo = cancellationDates.length > 0 
                            ? `\nAULA CANCELADA NAS DATAS:\n${cancellationDates.join('\n')}`
                            : '';
                          
                          return (
                            <Box 
                              key={item.id + '-' + index} 
                              onClick={() => handleCellClick(item)}
                              sx={{
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '4px 6px',
                                backgroundColor: isCancelled ? '#ffebee' : '#e6f6e6',
                                color: '#333',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                '&:hover': {
                                  backgroundColor: isCancelled ? '#ffcdd2' : '#d7efd7',
                                  transform: 'scale(1.02)',
                                  transition: 'all 0.2s ease-in-out',
                                  zIndex: 10,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                }
                              }}
                              title={`${item.subjectName} (${item.subjectCode || ''})
${item.teacherName ? `Professor: ${item.teacherName}` : ''}
${item.roomName ? `Sala: ${item.roomName}` : ''}${cancellationInfo}`}
                            >
                              {renderClassCell(item, isClassCancelled, getCancellationDates)}
                            </Box>
                          );
                        })}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 
