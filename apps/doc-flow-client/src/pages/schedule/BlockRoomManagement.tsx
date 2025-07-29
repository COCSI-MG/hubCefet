import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { Building, fetchBuildings, createBuilding, deleteBuilding, createRoom, deleteRoom } from '@/api/services/buildings';

export default function BlockRoomManagement() {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addBlockDialog, setAddBlockDialog] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');
  const [addRoomDialog, setAddRoomDialog] = useState<{ open: boolean; buildingId: string | null }>({ open: false, buildingId: null });
  const [newRoomName, setNewRoomName] = useState('');
  const [removingBlockId, setRemovingBlockId] = useState<string | null>(null);
  const [removingRoom, setRemovingRoom] = useState<{ buildingId: string; roomId: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBuildings();
  }, []);

  async function loadBuildings() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBuildings();
      setBuildings(data);
    } catch (err) {
      console.error('Erro ao carregar blocos:', err);
      setError('Falha ao carregar blocos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBlock() {
    if (!newBlockName.trim()) return;
    setActionLoading(true);
    try {
      const newBuilding = await createBuilding(newBlockName.trim());
      setBuildings(prev => [...prev, newBuilding]);
      setNewBlockName('');
      setAddBlockDialog(false);
    } catch (err) {
      console.error('Erro ao adicionar bloco:', err);
      setError('Falha ao adicionar bloco. Tente novamente mais tarde.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveBlock(id: string) {
    setActionLoading(true);
    try {
      await deleteBuilding(id);
      setBuildings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Erro ao remover bloco:', err);
      setError('Falha ao remover bloco. Tente novamente mais tarde.');
    } finally {
      setActionLoading(false);
      setRemovingBlockId(null);
    }
  }

  async function handleAddRoom() {
    if (!newRoomName.trim() || !addRoomDialog.buildingId) return;
    setActionLoading(true);
    try {
      const newRoom = await createRoom(addRoomDialog.buildingId, newRoomName.trim());
      setBuildings(prev => prev.map(b => 
        b.id === addRoomDialog.buildingId 
          ? { ...b, rooms: [...b.rooms, newRoom] } 
          : b
      ));
      setNewRoomName('');
      setAddRoomDialog({ open: false, buildingId: null });
    } catch (err) {
      console.error('Erro ao adicionar sala:', err);
      setError('Falha ao adicionar sala. Tente novamente mais tarde.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveRoom(buildingId: string, roomId: string) {
    setActionLoading(true);
    try {
      await deleteRoom(roomId);
      setBuildings(prev => prev.map(b => 
        b.id === buildingId 
          ? { ...b, rooms: b.rooms.filter(r => r.id !== roomId) } 
          : b
      ));
    } catch (err) {
      console.error('Erro ao remover sala:', err);
      setError('Falha ao remover sala. Tente novamente mais tarde.');
    } finally {
      setActionLoading(false);
      setRemovingRoom(null);
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 1, maxWidth: 700, mx: 'auto', mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button variant="contained" color="primary" startIcon={<ArrowBackIcon />} onClick={() => navigate('/horarios/gerenciar')} sx={{ mr: 2 }}>Voltar</Button>
          <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1, color: 'primary.main' }}>
            Gerenciar Blocos e Salas
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          Cadastre, edite e remova blocos e salas do sistema.
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />} 
          onClick={() => setAddBlockDialog(true)} 
          sx={{ mb: 3 }}
          disabled={actionLoading}
        >
          Adicionar Bloco
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
        ) : buildings.length === 0 ? (
          <Typography color="text.secondary">Nenhum bloco cadastrado.</Typography>
        ) : (
          <List>
            {buildings.map(block => (
              <Box key={block.id} sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafbfc' }}>
                <ListItem>
                  <ListItemText primary={<b>{block.name}</b>} secondary={block.rooms.length ? `${block.rooms.length} sala(s)` : 'Sem salas'} />
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<AddIcon />} 
                    onClick={() => setAddRoomDialog({ open: true, buildingId: block.id })} 
                    sx={{ mr: 1 }}
                    disabled={actionLoading}
                  >
                    Adicionar Sala
                  </Button>
                  <IconButton 
                    color="error" 
                    onClick={() => setRemovingBlockId(block.id)}
                    disabled={actionLoading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
                <Divider />
                <List sx={{ pl: 4 }}>
                  {block.rooms.map(room => (
                    <ListItem key={room.id} secondaryAction={
                      <IconButton 
                        color="error" 
                        onClick={() => setRemovingRoom({ buildingId: block.id, roomId: room.id })}
                        disabled={actionLoading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }>
                      <ListItemText primary={room.name} />
                    </ListItem>
                  ))}
                  {block.rooms.length === 0 && (
                    <ListItem><ListItemText primary={<i style={{ color: '#aaa' }}>Nenhuma sala cadastrada</i>} /></ListItem>
                  )}
                </List>
              </Box>
            ))}
          </List>
        )}
      </Paper>

      {/* Diálogo para adicionar bloco */}
      <Dialog open={addBlockDialog} onClose={() => !actionLoading && setAddBlockDialog(false)}>
        <DialogTitle>Adicionar Bloco</DialogTitle>
        <DialogContent>
          <TextField 
            label="Nome do bloco" 
            value={newBlockName} 
            onChange={e => setNewBlockName(e.target.value)} 
            fullWidth 
            autoFocus 
            sx={{ mt: 1 }}
            disabled={actionLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBlockDialog(false)} disabled={actionLoading}>Cancelar</Button>
          <Button 
            onClick={handleAddBlock} 
            variant="contained"
            disabled={actionLoading || !newBlockName.trim()}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para adicionar sala */}
      <Dialog open={addRoomDialog.open} onClose={() => !actionLoading && setAddRoomDialog({ open: false, buildingId: null })}>
        <DialogTitle>Adicionar Sala</DialogTitle>
        <DialogContent>
          <TextField 
            label="Nome da sala" 
            value={newRoomName} 
            onChange={e => setNewRoomName(e.target.value)} 
            fullWidth 
            autoFocus 
            sx={{ mt: 1 }}
            disabled={actionLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddRoomDialog({ open: false, buildingId: null })} disabled={actionLoading}>Cancelar</Button>
          <Button 
            onClick={handleAddRoom} 
            variant="contained"
            disabled={actionLoading || !newRoomName.trim()}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para remover bloco */}
      <Dialog open={!!removingBlockId} onClose={() => !actionLoading && setRemovingBlockId(null)}>
        <DialogTitle>Remover Bloco</DialogTitle>
        <DialogContent>Tem certeza que deseja remover este bloco e todas as suas salas?</DialogContent>
        <DialogActions>
          <Button onClick={() => setRemovingBlockId(null)} disabled={actionLoading}>Cancelar</Button>
          <Button 
            onClick={() => removingBlockId && handleRemoveBlock(removingBlockId)} 
            color="error" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Remover'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para remover sala */}
      <Dialog open={!!removingRoom} onClose={() => !actionLoading && setRemovingRoom(null)}>
        <DialogTitle>Remover Sala</DialogTitle>
        <DialogContent>Tem certeza que deseja remover esta sala?</DialogContent>
        <DialogActions>
          <Button onClick={() => setRemovingRoom(null)} disabled={actionLoading}>Cancelar</Button>
          <Button 
            onClick={() => removingRoom && handleRemoveRoom(removingRoom.buildingId, removingRoom.roomId)} 
            color="error" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Remover'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 