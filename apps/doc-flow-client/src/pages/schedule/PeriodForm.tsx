import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getSemesterById, createSemester, updateSemester } from '@/api/services/semesters';

interface FormData {
  year: number;
  number: number;
  start_date: Date | null;
  end_date: Date | null;
}

const currentYear = new Date().getFullYear();
const initialFormData: FormData = {
  year: currentYear,
  number: 1,
  start_date: null,
  end_date: null
};

export default function PeriodForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && id) {
      loadPeriodData(id);
    }
  }, [id, isEditMode]);

  const loadPeriodData = async (periodId: string) => {
    try {
      const data = await getSemesterById(periodId);
      setFormData({
        year: data.year,
        number: data.number,
        start_date: data.start_date ? new Date(data.start_date) : null,
        end_date: data.end_date ? new Date(data.end_date) : null
      });
    } catch (err: any) {
      console.error('Erro ao carregar dados do período:', err);
      setError('Erro ao carregar dados do período: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, year }));
    validateField('year', year);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const number = value === '' ? '' : parseInt(value);
    setFormData(prev => ({ ...prev, number: number as number }));
    validateField('number', number);
  };

  const handleStartDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, start_date: date }));
    validateField('start_date', date);
    
    if (formData.end_date) {
      validateField('end_date', formData.end_date);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, end_date: date }));
    validateField('end_date', date);
  };

  const validateField = (field: string, value: any) => {
    let errorMessage = '';
    
    if (field === 'year') {
      if (!value && value !== 0) {
        errorMessage = 'O ano é obrigatório';
      } else if (value < 2000 || value > 2100) {
        errorMessage = 'O ano deve estar entre 2000 e 2100';
      }
    } else if (field === 'number') {
      if (!value && value !== 0) {
        errorMessage = 'O número do período é obrigatório';
      } else if (value < 1) {
        errorMessage = 'O número do período deve ser maior que zero';
      }
    } else if (field === 'start_date') {
      if (!value) {
        errorMessage = 'A data de início é obrigatória';
      }
    } else if (field === 'end_date') {
      if (!value) {
        errorMessage = 'A data de término é obrigatória';
      } else if (formData.start_date && value < formData.start_date) {
        errorMessage = 'A data de término deve ser posterior à data de início';
      }
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: errorMessage
    }));
    
    return !errorMessage;
  };

  const validateForm = () => {
    const yearValid = validateField('year', formData.year);
    const numberValid = validateField('number', formData.number);
    const startDateValid = validateField('start_date', formData.start_date);
    const endDateValid = validateField('end_date', formData.end_date);
    
    return yearValid && numberValid && startDateValid && endDateValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    const formattedData = {
      year: formData.year,
      number: formData.number,
      start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : '',
      end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : ''
    };
    
    try {
      if (isEditMode && id) {
        await updateSemester(id, formattedData);
        setSuccess('Período atualizado com sucesso!');
      } else {
        await createSemester(formattedData);
        setSuccess('Período criado com sucesso!');
      }
      
      setTimeout(() => {
        navigate('/horarios/periodos');
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao salvar período:', err);
      let errorMessage = 'Erro ao salvar período: ';
      
      if (err.response) {
        const status = err.response.status;
        if (status === 400) {
          errorMessage += 'Dados inválidos. Verifique os campos e tente novamente.';
        } else if (status === 409) {
          errorMessage += err.response.data?.message || 'Este período já existe para as datas informadas.';
        } else {
          errorMessage += err.response.data?.message || 'Erro desconhecido';
        }
      } else {
        errorMessage += err.message || 'Erro desconhecido';
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/horarios/periodos');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 600, width: '100%', borderRadius: '8px', mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<ArrowBackIcon />} 
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              Voltar
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {isEditMode ? 'Editar Período' : 'Novo Período'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 3 }}>
            Cada período é identificado por um <strong>número</strong> (como 1, 2, 3...) associado a um <strong>ano</strong>.
            Um mesmo número de período pode existir em anos diferentes, mas não pode se sobrepor no tempo com outro período de mesmo número.
          </Alert>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Ano"
                type="number"
                value={formData.year}
                onChange={handleYearChange}
                fullWidth
                required
                InputProps={{ inputProps: { min: 2000, max: 2100 } }}
                error={!!errors.year}
                helperText={errors.year || "Ano ao qual o período está associado"}
              />

              <TextField
                label="Número do Período"
                type="number"
                value={formData.number}
                onChange={handleNumberChange}
                fullWidth
                required
                InputProps={{ inputProps: { min: 1 } }}
                error={!!errors.number}
                helperText={errors.number || "Identificador numérico do período (ex: 1, 2, 3, etc.)"}
              />

              <DatePicker
                label="Data de Início"
                value={formData.start_date}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.start_date,
                    helperText: errors.start_date
                  }
                }}
              />

              <DatePicker
                label="Data de Término"
                value={formData.end_date}
                onChange={handleEndDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.end_date,
                    helperText: errors.end_date
                  }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleBack}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : isEditMode ? 'Salvar' : 'Criar'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>

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
    </LocalizationProvider>
  );
} 