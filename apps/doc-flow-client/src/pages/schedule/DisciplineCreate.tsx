import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Alert, 
  Snackbar, 
  SelectChangeEvent,
  Divider,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import { SubjectCreateDTO, createSubject } from '@/api/services/subjects';

export default function DisciplineCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState<SubjectCreateDTO>({ name: '', code: '', course: '', classType: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setForm(prev => ({ ...prev, classType: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      setError('Preencha todos os campos obrigatórios: Nome e Código');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await createSubject(form);
      setSuccess(true);
      setForm({ name: '', code: '', course: '', classType: '' });
    } catch (err) {
      console.error('Erro ao cadastrar disciplina:', err);
      setError('Falha ao cadastrar disciplina. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/horarios/gerenciar');

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Paper 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: 3, 
          boxShadow: 1, 
          maxWidth: 900, 
          mx: 'auto', 
          mt: 4,
          background: 'transparent'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Voltar
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Cadastrar Disciplina
          </Typography>
        </Box>

        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Nova Disciplina
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preencha os campos abaixo para cadastrar uma nova disciplina no sistema
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' }, minWidth: 220 }}>
              <TextField
                label="Nome da Disciplina"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 20%' }, minWidth: 120 }}>
              <TextField
                label="Código"
                name="code"
                value={form.code}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 20%' }, minWidth: 120 }}>
              <TextField
                label="Curso"
                name="course"
                value={form.course}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 15%' }, minWidth: 120 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="class-type-label">Tipo da Disciplina</InputLabel>
                <Select
                  labelId="class-type-label"
                  name="classType"
                  value={form.classType || ''}
                  label="Tipo da Disciplina"
                  onChange={handleSelectChange}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                >
                  <MenuItem value="Obrigatória">Obrigatória</MenuItem>
                  <MenuItem value="Optativa">Optativa</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ 
                mt: 3,
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ 
            mt: 4, 
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: 2
          }}>
            <Button 
              variant="outlined" 
              onClick={handleBack}
              disabled={loading}
              sx={{ 
                minWidth: 120,
                borderRadius: 2
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
              sx={{ 
                minWidth: 120,
                borderRadius: 2
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Cadastrar'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar 
        open={success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success"
          sx={{ 
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          Disciplina cadastrada com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
} 