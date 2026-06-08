import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import PageHeader from '@/components/PageHeader';
import { certificateService } from '@/api/services/certificate.service';
import { toast } from 'sonner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import { ApiError } from '@/api/errors/ApiError';
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  course_name: string;
  hours: number;
  certificate_url: string;
  activity_type_id: number;
  status_id: number;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalHours: number;
}

interface ActivityType {
  id: number;
  name: string;
  description: string;
}

const COLORS = ['#4caf50', '#ff9800', '#f44336'];
const COMPLEMENTARY_HOURS_REQUIRED = 100;
const EXTENSION_HOURS_REQUIRED = 100;

const ACTIVITY_TYPE = {
  COMPLEMENTARY: 1,
  EXTENSION: 2,
} as const;

const APPROVED_STATUS_ID = 2;

const statusMap = {
  1: { label: 'Pendente', color: 'warning', icon: <PendingIcon /> },
  2: { label: 'Aprovado', color: 'success', icon: <CheckCircleIcon /> },
  3: { label: 'Rejeitado', color: 'error', icon: <CancelIcon /> }
};

export default function CertificateDashboard() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [activitiesData, statsData, typesData] = await Promise.all([
        certificateService.getMyActivities(),
        certificateService.getMyStats(),
        certificateService.getActivityTypes(),
      ]);

      setActivities(activitiesData || []);
      setStats(
        statsData || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          totalHours: 0,
        }
      );
      setActivityTypes(typesData || []);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }

      toast.error("Erro ao carregar dados da dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeName = (typeId: number) => {
    const type = activityTypes.find((t) => t.id === typeId);
    return type?.name || "Tipo não encontrado";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const pieData = stats ? [
    { name: 'Aprovados', value: stats.approved, color: COLORS[0] },
    { name: 'Pendentes', value: stats.pending, color: COLORS[1] },
    { name: 'Rejeitados', value: stats.rejected, color: COLORS[2] }
  ] : [];

  const sumApprovedHoursByType = (activityTypeId: number) =>
    activities
      .filter(a => a.activity_type_id === activityTypeId && a.status_id === APPROVED_STATUS_ID)
      .reduce((sum, a) => sum + a.hours, 0);

  const complementaryHours = sumApprovedHoursByType(ACTIVITY_TYPE.COMPLEMENTARY);
  const extensionHours = sumApprovedHoursByType(ACTIVITY_TYPE.EXTENSION);

  const complementaryPercentage = Math.min((complementaryHours / COMPLEMENTARY_HOURS_REQUIRED) * 100, 100);
  const extensionPercentage = Math.min((extensionHours / EXTENSION_HOURS_REQUIRED) * 100, 100);

  const hoursData = activityTypes.map(type => {
    const typeActivities = activities.filter(a => a.activity_type_id === type.id && a.status_id === 2);
    const totalHours = typeActivities.reduce((sum, a) => sum + a.hours, 0);
    return {
      name: type.name.substring(0, 15) + (type.name.length > 15 ? '...' : ''),
      horas: totalHours
    };
  }).filter(item => item.horas > 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard de Certificados"
        description="Acompanhe o progresso das suas horas complementares"
      />

      <Box className="ml-6 mr-6 mt-6 max-w-full">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border rounded-xl">
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon color="primary" />
                <Box>
                  <Typography variant="h4" className="font-bold text-blue-600">
                    {stats?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Certificados
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card className="border rounded-xl">
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon color="success" />
                <Box>
                  <Typography variant="h4" className="font-bold text-green-600">
                    {stats?.approved || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aprovados
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card className="border rounded-xl">
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PendingIcon color="warning" />
                <Box>
                  <Typography variant="h4" className="font-bold text-orange-600">
                    {stats?.pending || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendentes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card className="border rounded-xl">
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CancelIcon color="error" />
                <Box>
                  <Typography variant="h4" className="font-bold text-red-600">
                    {stats?.rejected || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejeitados
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </div>

        {/* Progresso das Horas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="border rounded-xl">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Progresso das Horas Complementares
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    {complementaryHours} de {COMPLEMENTARY_HOURS_REQUIRED} horas
                  </Typography>
                  <Typography variant="body2" className="font-semibold">
                    {complementaryPercentage.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={complementaryPercentage}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              {complementaryPercentage >= 100 ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  🎉 Parabéns! Você completou todas as horas complementares necessárias!
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Você ainda precisa de {COMPLEMENTARY_HOURS_REQUIRED - complementaryHours} horas complementares.
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="border rounded-xl">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Progresso das Horas de Extensão
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    {extensionHours} de {EXTENSION_HOURS_REQUIRED} horas
                  </Typography>
                  <Typography variant="body2" className="font-semibold">
                    {extensionPercentage.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={extensionPercentage}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              {extensionPercentage >= 100 ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  🎉 Parabéns! Você completou todas as horas de extensão necessárias!
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Você ainda precisa de {EXTENSION_HOURS_REQUIRED - extensionHours} horas de extensão.
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="border rounded-xl">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Status dos Certificados
              </Typography>
              {stats && stats.total > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Resumo dos dados */}
                  <Box className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <Box>
                      <Typography variant="h6" className="font-bold text-green-600">
                        {stats.approved}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Aprovados
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" className="font-bold text-orange-600">
                        {stats.pending}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pendentes
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" className="font-bold text-red-600">
                        {stats.rejected}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rejeitados
                      </Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <Typography color="text.secondary">
                    Nenhum certificado cadastrado ainda
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card className="border rounded-xl">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Horas por Tipo de Atividade
              </Typography>
              {hoursData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hoursData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="horas" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <Typography color="text.secondary">
                    Nenhuma hora aprovada ainda
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Certificados */}
        <Card className="border rounded-xl">
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-4">
              Histórico de Certificados
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {activities.length > 0 ? (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="font-semibold">Curso/Atividade</TableCell>
                      <TableCell className="font-semibold">Tipo</TableCell>
                      <TableCell className="font-semibold">Horas</TableCell>
                      <TableCell className="font-semibold">Status</TableCell>
                      <TableCell className="font-semibold">Data</TableCell>
                      <TableCell className="font-semibold">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activities.slice(0, 10).map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell>{activity.course_name}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {getActivityTypeName(activity.activity_type_id)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography className="font-semibold">
                            {activity.hours}h
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={statusMap[activity.status_id as keyof typeof statusMap]?.icon}
                            label={statusMap[activity.status_id as keyof typeof statusMap]?.label || 'Desconhecido'}
                            color={statusMap[activity.status_id as keyof typeof statusMap]?.color as any || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(activity.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => navigate(`/docflow/certificates/${activity.id}`)}
                            color="primary"
                            title="Abrir certificado"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                <Typography color="text.secondary">
                  Nenhum certificado encontrado
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

