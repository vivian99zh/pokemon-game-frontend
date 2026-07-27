import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Button
} from '@mui/material';
import { EmojiEvents, Refresh } from '@mui/icons-material';
import { leaderboardService } from '../services/leaderboardService';
import type { LeaderboardEntry } from '../schemas';

const Leaderboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await leaderboardService.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="max-w-4xl mx-auto mt-15 px-4">
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={fetchLeaderboard} startIcon={<Refresh />} className="mt-4">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto mt-15 px-4 pb-8">
      <Box className="flex justify-between items-center  mt-10">
        <Button variant="outlined" onClick={fetchLeaderboard} startIcon={<Refresh />} size="small">
          Refresh
        </Button>
      </Box>
      <Box className="flex justify-between items-center mb-8 mt-5">
        <Typography variant="h4" className="font-bold flex items-center gap-2">
          <EmojiEvents className="text-yellow-500 text-4xl" />
          Leaderboard
        </Typography>
      </Box>

      {leaderboard.length === 0 ? (
        <Card className="p-8 text-center">
          <Typography className="font-bold text-2xl mb-2">No Scores Yet</Typography>
          <Typography variant="body1" color="text.secondary" className="mb-4">
            Start battling to earn points!
          </Typography>
          <Button variant="contained" onClick={() => navigate('/battle')}>
            Start Battling
          </Button>
        </Card>
      ) : (
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead className="bg-gray-50 ">
                <TableRow sx={{ '& .MuiTableCell-root': { color: 'primary.main', fontWeight: 'bold' } }}>
                  <TableCell>Rank</TableCell>
                  <TableCell>Trainer</TableCell>
                  <TableCell>Pokémon</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell align="center">W/L</TableCell>
                  <TableCell align="center">Win Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((entry, index) => {
                  const rank = page * rowsPerPage + index + 1;
                  return (
                    <TableRow key={entry._id} className="hover:bg-gray-50">
                      <TableCell>#{rank}</TableCell>
                      <TableCell>{entry.username}</TableCell>
                      <TableCell className="capitalize">{entry.pokemonName}</TableCell>
                      <TableCell align="center" className="font-bold text-orange-500">
                        {entry.score}
                      </TableCell>
                      <TableCell align="center">
                        {entry.wins}W / {entry.losses}L
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${entry.winRate}%`}
                          size="small"
                          color={entry.winRate >= 60 ? 'success' : entry.winRate >= 40 ? 'warning' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={leaderboard.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={e => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      )}
    </Box>
  );
};

export default Leaderboard;
