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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import { certificateService } from '@/api/services/certificate.service';
import { toast } from 'sonner';

interface Activity {
  id: string;
  course_name: string;
  hours: number;
  certificate_url: string;
  activity_type_id: number;
  status_id: number;
  created_at: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  activityType: {
    id: number;
    name: string;
  };
}

interface ReviewDialogData {
  open: boolean;
  activity: Activity | null;
  decision: 'APPROVED' | 'REJECTED' | null;
}

export default function CertificateReview() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogData>({
    open: false,
    activity: null,
    decision: null
  });
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await certificateService.getActivitiesForReview();
      setActivities(data || []);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar atividades para revisar');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewDialog = (activity: Activity, decision: 'APPROVED' | 'REJECTED') => {
    setReviewDialog({
      open: true,
      activity,
      decision
    });
    setComments('');
  };

  const handleCloseReviewDialog = () => {
    setReviewDialog({
      open: false,
      activity: null,
      decision: null
    });
    setComments('');
  };

  const handleSubmitReview = async () => {
    if (!reviewDialog.activity || !reviewDialog.decision) return;

    try {
      setSubmitting(true);
      await certificateService.reviewActivity(
        reviewDialog.activity.id,
        reviewDialog.decision,
        comments
      );

      toast.success(
        reviewDialog.decision === 'APPROVED'
          ? 'Certificado aprovado com sucesso!'
          : 'Certificado rejeitado!'
      );

      handleCloseReviewDialog();
      loadActivities();
    } catch (error) {
      console.error('Erro ao avaliar certificado:', error);
      toast.error('Erro ao avaliar certificado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCertificate = async (activity: Activity) => {
    try {
      await certificateService.downloadCertificate(activity.id);
      toast.success('Download iniciado!');
    } catch (error) {
      console.error('Erro ao baixar certificado:', error);
      toast.error('Erro ao baixar certificado');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
        description="Analise e aprove/rejeite os certificados de atividades"
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
                                {activity.user.fullName}
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
                            <Box display="flex" gap={1} justifyContent="center">
                              <Tooltip title="Baixar Certificado">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleDownloadCertificate(activity)}
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Aprovar">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleOpenReviewDialog(activity, 'APPROVED')}
                                >
                                  <ApproveIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Rejeitar">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenReviewDialog(activity, 'REJECTED')}
                                >
                                  <RejectIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
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

      {/* Dialog de Avaliação */}
      <Dialog
        open={reviewDialog.open}
        onClose={handleCloseReviewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reviewDialog.decision === 'APPROVED' ? 'Aprovar Certificado' : 'Rejeitar Certificado'}
        </DialogTitle>
        <DialogContent>
          {reviewDialog.activity && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" className="font-semibold">
                {reviewDialog.activity.course_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aluno: {reviewDialog.activity.user.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Horas: {reviewDialog.activity.hours}h
              </Typography>
            </Box>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Comentários (opcional)"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              reviewDialog.decision === 'APPROVED'
                ? 'Adicione comentários sobre a aprovação...'
                : 'Explique o motivo da rejeição...'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color={reviewDialog.decision === 'APPROVED' ? 'success' : 'error'}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Processando...' :
              reviewDialog.decision === 'APPROVED' ? 'Aprovar' : 'Rejeitar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}


