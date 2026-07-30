import { useState, useEffect, useCallback } from 'react';
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
  Button
} from '@mui/material';
import { EmojiEvents, Refresh } from '@mui/icons-material';
import type { LeaderboardEntry } from '../schemas';
import { useAuth } from '../contexts/AuthProvider';
import { GAME_URL } from '../config';
import { useTheme } from '../contexts/ThemeProvider';

const Leaderboard = () => {
  const navigate = useNavigate();
  const { getHeaders } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage)
      });

      const res = await fetch(`${GAME_URL}/leaderboard?${queryParams.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch leaderboard');
      }

      const responseData = await res.json();

      const { data, meta } = responseData;

      setTotalData(meta.total);

      setLeaderboard(data);
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

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
      {totalData === 0 ? (
        <Card className="p-D8 text-center">
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
              <TableHead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <TableRow sx={{ '& .MuiTableCell-root': { color: 'primary.main', fontWeight: 'bold' } }}>
                  <TableCell>Rank</TableCell>
                  <TableCell>Trainer</TableCell>
                  {/* <TableCell>Pokémon</TableCell> */}
                  <TableCell align="center">Score</TableCell>
                  <TableCell align="center">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map(entry => {
                  return (
                    <TableRow key={entry.rank} className="hover:bg-gray-50">
                      <TableCell>#{entry.rank}</TableCell>
                      <TableCell>{entry.user.username}</TableCell>
                      {/* <TableCell className="capitalize">{entry.pokemonName}</TableCell> */}
                      <TableCell align="center" className="font-bold text-orange-500">
                        {entry.score}
                      </TableCell>
                      <TableCell align="center">{new Date(entry.date).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalData}
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
