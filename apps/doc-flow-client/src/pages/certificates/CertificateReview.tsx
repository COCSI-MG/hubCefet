import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TablePagination,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowForward as ReviewIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import { certificateService } from '@/api/services/certificate.service';
import { toast } from 'sonner';
import { ApiError } from '@/api/errors/ApiError';
import { useNavigate } from 'react-router-dom';
import { CertificateReviewListItem } from '@/lib/types/certificate-review.types';

export default function CertificateReview() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<CertificateReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);

      const data = await certificateService.getActivitiesForReview();
      setActivities(data);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Erro ao carregar atividades para revisar");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStudentName = (activity: CertificateReviewListItem) => {
    return activity.user.full_name || activity.user.fullName || 'Aluno não encontrado';
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedActivities = activities.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
        title="Avaliação de Certificados"
        description="Selecione um certificado para abrir os detalhes completos antes de avaliar o certificado"
      />

      <Box className="ml-6 mr-6 mt-6 max-w-full">
        <Card className="border rounded-xl">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" className="font-semibold">
                Certificados Pendentes de Avaliação
              </Typography>
              <Chip
                label={`${activities.length} certificados`}
                color="primary"
                variant="outlined"
              />
            </Box>

            {activities.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Não há certificados pendentes para sua avaliação no momento.
              </Alert>
            ) : (
              <>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell className="font-semibold">Aluno</TableCell>
                        <TableCell className="font-semibold">Curso/Atividade</TableCell>
                        <TableCell className="font-semibold">Tipo</TableCell>
                        <TableCell className="font-semibold">Horas</TableCell>
                        <TableCell className="font-semibold">Data</TableCell>
                        <TableCell className="font-semibold" align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedActivities.map((activity) => (
                        <TableRow key={activity.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" className="font-semibold">
                                {getStudentName(activity)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.user.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {activity.course_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {activity.activityType?.name || 'Tipo não encontrado'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography className="font-semibold">
                              {activity.hours}h
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(activity.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              endIcon={<ReviewIcon />}
                              onClick={() => navigate(`/docflow/certificates/review/${activity.id}`)}
                            >
                              Avaliar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={activities.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Itens por página:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                  }
                />
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
