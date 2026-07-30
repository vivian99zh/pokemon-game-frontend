import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import { CatchingPokemon, MilitaryTech, Whatshot, Refresh, EmojiEvents } from '@mui/icons-material';
import { POKE_API_URL } from '../config';
import { pokemonDetailSchema } from '../schemas';
import { useRoster } from '../hooks/useRoster';
import { useAuth } from '../contexts/AuthProvider';

import { calculateDamage, calculateScore } from '../utils/battleUtils';
import type { BattlePokemon } from '../types';
import type { Score } from '../schemas';
import { GAME_URL } from '../config';

const Battle = () => {
  const navigate = useNavigate();
  const { getHeaders } = useAuth();
  //https://pokeapi.co/api/v2/pokemon/1026 till end not found
  const totalPokemonCount = 1025;
  //const { userId } = useAuth();
  const { rosterPokemon } = useRoster();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [battlePokemon, setBattlePokemon] = useState<BattlePokemon | null>(null);
  const [enemyPokemon, setEnemyPokemon] = useState<BattlePokemon | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [battleActive, setBattleActive] = useState<boolean>(false);
  const [playerTurn, setPlayerTurn] = useState<boolean>(true);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const [showSelection, setShowSelection] = useState<boolean>(true);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get random Pokemon from API (enemy)
  const fetchRandomPokemon = async (): Promise<BattlePokemon> => {
    const randomId = Math.floor(Math.random() * totalPokemonCount) + 1;
    const res = await fetch(`${POKE_API_URL}/pokemon/${randomId}`);
    if (!res.ok) throw new Error('Failed to fetch enemy Pokemon');
    const data = await res.json();
    const validated = pokemonDetailSchema.parse(data);
    const maxHp = validated.stats.find(s => s.stat.name === 'hp')?.base_stat || 100;
    return {
      ...validated,
      currentHp: maxHp,
      maxHp: maxHp
    };
  };

  const saveScore = async (won: boolean): Promise<void> => {
    try {
      const score = calculateScore(
        won,
        battlePokemon?.currentHp || 0,
        battlePokemon?.maxHp || 100,
        enemyPokemon?.currentHp || 0,
        enemyPokemon?.maxHp || 100
      );
      const scoreData: Score = {
        score: score
        // pokemonName: battlePokemon?.name || '',
      };

      const res = await fetch(`${GAME_URL}/leaderboard`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(scoreData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save scores');
      }

      await res.json();

      setSnackbar({
        open: true,
        message: won ? `🏆 Score saved ${score} points!` : `Better luck next time! Score saved ${score} points!`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to save score',
        severity: 'error'
      });
    }
  };

  const startBattle = async () => {
    try {
      setLoading(true);
      setError(null);
      setBattleResult(null);
      setBattleLog([]);

      if (!selectedPokemonId) {
        setError('Please select a Pokémon to battle!');
        setLoading(false);
        return;
      }

      const selected = rosterPokemon.find(p => p.id === selectedPokemonId);
      if (!selected) {
        setError('Selected Pokémon not found!');
        setLoading(false);
        return;
      }

      const maxHp = selected.stats.find(s => s.stat.name === 'hp')?.base_stat || 100;
      setBattlePokemon({
        ...selected,
        currentHp: maxHp,
        maxHp: maxHp
      });

      const enemy = await fetchRandomPokemon();
      setEnemyPokemon(enemy);

      setBattleActive(true);
      setShowSelection(false);
      setPlayerTurn(true);
      addLog(`⚔️ Battle started! ${selected.name} vs ${enemy.name}`);
      addLog(`💪 ${selected.name} is ready to fight!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start battle';
      setError(errorMessage);
      console.error('Error starting battle:', err);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  };

  const playerAttack = () => {
    if (!battlePokemon || !enemyPokemon || !battleActive || !playerTurn) return;

    const result = calculateDamage(battlePokemon, enemyPokemon);
    const newHp = Math.max(0, enemyPokemon.currentHp - result.damage);

    setEnemyPokemon({
      ...enemyPokemon,
      currentHp: newHp
    });

    addLog(`💥 ${battlePokemon.name} attacked ${enemyPokemon.name} for ${result.damage} damage!`);

    if (newHp <= 0) {
      setBattleResult('win');
      setBattleActive(false);
      addLog(`🎉 ${battlePokemon.name} wins! Congratulations!`);
      saveScore(true);
      return;
    }

    setPlayerTurn(false);
    setTimeout(() => enemyAttack(), 1000);
  };

  const enemyAttack = () => {
    if (!battlePokemon || !enemyPokemon || !battleActive) return;

    const result = calculateDamage(enemyPokemon, battlePokemon);
    const newHp = Math.max(0, battlePokemon.currentHp - result.damage);

    setBattlePokemon({
      ...battlePokemon,
      currentHp: newHp
    });

    addLog(`💥 ${enemyPokemon.name} attacked ${battlePokemon.name} for ${result.damage} damage!`);

    if (newHp <= 0) {
      setBattleResult('lose');
      setBattleActive(false);
      addLog(`💔 ${battlePokemon.name} fainted. Better luck next time!`);
      saveScore(false);
      return;
    }

    setPlayerTurn(true);
  };

  const resetBattle = () => {
    setBattleActive(false);
    setBattleLog([]);
    setBattlePokemon(null);
    setEnemyPokemon(null);
    setBattleResult(null);
    setPlayerTurn(true);
    setShowSelection(true);
    setSelectedPokemonId(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (rosterPokemon.length === 0) {
    return (
      <Box className="max-w-4xl mx-auto mt-15 px-4 pb-8">
        <Card variant="outlined" className="p-8 text-center">
          <CatchingPokemon className="text-6xl text-gray-300 mb-4" />
          <Typography className="font-bold mb-2 text-2xl">No Pokémon in Roster</Typography>
          <Typography variant="body1" color="text.secondary" className="mb-4">
            Add Pokémon to your roster to start battling!
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')} startIcon={<CatchingPokemon />}>
            Browse Pokémon
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="max-w-6xl mx-auto mt-15 px-4 pb-8">
      <Box className="flex items-center justify-between mb-8 mt-10">
        <Typography variant="h4" component="h1" className="font-bold flex items-center gap-2">
          <MilitaryTech className="text-primary text-4xl" />
          Pokémon Battle
        </Typography>
        <Chip label={`Roster: ${rosterPokemon.length} Pokémon`} color="primary" variant="outlined" />
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Pokemon Selection Dialog */}
      <Dialog open={showSelection && !battleActive} maxWidth="md" fullWidth>
        <DialogTitle className="text-center text-bold text-5xl">
          <Typography className="font-bold mb-2">Choose Your Fighter</Typography>
          <Typography variant="body2" color="text.secondary">
            Select a Pokémon from your roster to battle
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {rosterPokemon.map(p => (
              <Card
                key={p.id}
                variant={selectedPokemonId === p.id ? 'outlined' : 'elevation'}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPokemonId === p.id ? 'ring-2 ring-info' : ''
                }`}
                onClick={() => setSelectedPokemonId(p.id)}
                onDoubleClick={startBattle}
              >
                <CardContent className="text-center">
                  <img
                    src={
                      p.sprites.other?.['official-artwork']?.front_default ||
                      p.sprites.front_default ||
                      'https://via.placeholder.com/80'
                    }
                    alt={p.name}
                    className="w-16 h-16 object-contain mx-auto"
                  />
                  <Typography className="capitalize font-semibold">{p.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    #{String(p.id).padStart(3, '0')}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button variant="outlined" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button
            variant="contained"
            className="bg-primary text-white"
            onClick={startBattle}
            disabled={!selectedPokemonId || loading}
            startIcon={<Whatshot />}
          >
            {loading ? <CircularProgress size={24} /> : 'Start Battle!'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Battle Arena*/}
      {battleActive && battlePokemon && enemyPokemon && (
        <>
          <Grid container spacing={4} className="mb-6">
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" className="h-full">
                <CardContent>
                  <Box className="flex items-center justify-between mb-4">
                    <Typography variant="h6" className="capitalize font-bold">
                      {enemyPokemon.name}
                    </Typography>
                    <Chip label="Enemy" color="error" size="small" />
                  </Box>
                  <Box className="flex justify-center">
                    <img
                      src={
                        enemyPokemon.sprites.other?.['official-artwork']?.front_default ||
                        enemyPokemon.sprites.front_default ||
                        'https://via.placeholder.com/150'
                      }
                      alt={enemyPokemon.name}
                      className="w-32 h-32 object-contain"
                    />
                  </Box>
                  <Box className="mt-4">
                    <Box className="flex justify-between text-sm mb-1">
                      <Typography variant="body2">HP</Typography>
                      <Typography variant="body2" className="font-medium">
                        {enemyPokemon.currentHp} / {enemyPokemon.maxHp}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(enemyPokemon.currentHp / enemyPokemon.maxHp) * 100}
                      color={enemyPokemon.currentHp / enemyPokemon.maxHp > 0.3 ? 'success' : 'error'}
                      className="h-2 rounded"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" className="h-full">
                <CardContent>
                  <Box className="flex items-center justify-between mb-4">
                    <Typography variant="h6" className="capitalize font-bold">
                      {battlePokemon.name}
                    </Typography>
                    <Chip label="You" className="bg-primary text-white" size="small" />
                  </Box>
                  <Box className="flex justify-center">
                    <img
                      src={
                        battlePokemon.sprites.other?.['official-artwork']?.front_default ||
                        battlePokemon.sprites.front_default ||
                        'https://via.placeholder.com/150'
                      }
                      alt={battlePokemon.name}
                      className="w-32 h-32 object-contain"
                    />
                  </Box>
                  <Box className="mt-4">
                    <Box className="flex justify-between text-sm mb-1">
                      <Typography variant="body2">HP</Typography>
                      <Typography variant="body2" className="font-medium">
                        {battlePokemon.currentHp} / {battlePokemon.maxHp}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(battlePokemon.currentHp / battlePokemon.maxHp) * 100}
                      color={battlePokemon.currentHp / battlePokemon.maxHp > 0.3 ? 'success' : 'error'}
                      className="h-2 rounded"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box className="flex flex-wrap gap-4 mb-6">
            <Button
              variant="contained"
              className="bg-primary text-white"
              onClick={playerAttack}
              disabled={!playerTurn || !battleActive}
              startIcon={<Whatshot />}
              size="large"
            >
              {playerTurn ? 'Attack!' : 'Waiting...'}
            </Button>
            <Button variant="outlined" color="secondary" onClick={resetBattle} startIcon={<Refresh />} size="large">
              Forfeit
            </Button>
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" className="font-bold mb-2">
                Battle Log
              </Typography>
              <Box className="max-h-48 overflow-y-auto space-y-1">
                {battleLog.map((log, index) => (
                  <Typography key={index} variant="body2" className="text-gray-700">
                    {log}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {battleResult && (
        <Card
          variant="outlined"
          className={`p-6 text-center ${battleResult === 'win' ? 'border-success' : 'border-error'}`}
        >
          <Typography variant="h4" className="font-bold">
            {battleResult === 'win' ? '🎉 Victory!' : '💔 Defeat!'}
          </Typography>
          <Typography variant="body1" color="text.secondary" className="mt-2">
            {battleResult === 'win'
              ? 'Congratulations! Your Pokémon is victorious! +10 points!'
              : "Don't give up! Train your Pokémon and try again!"}
          </Typography>
          <Box className="flex gap-4 justify-center mt-4">
            <Button variant="contained" onClick={resetBattle} startIcon={<Refresh />}>
              Battle Again
            </Button>
            <Button variant="outlined" onClick={() => navigate('/leaderboard')} startIcon={<EmojiEvents />}>
              View Leaderboard
            </Button>
          </Box>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Battle;
