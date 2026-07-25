// src/components/PokemonList.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Typography, Alert, CircularProgress, Box, Snackbar, Pagination } from '@mui/material';
import { CatchingPokemon } from '@mui/icons-material';
import { POKE_API_URL } from '../config';
import { type PokemonDetail, pokemonDetailSchema, pokemonListResponseSchema } from '../schemas';
import PokemonCard from './PokemonCard';
import { useRoster } from '../hooks/useRoster';

import type { SnackbarState } from '../types';

interface PokemonListProps {
  showOnlyRoster?: boolean;
  title?: string;
  icon?: React.ReactNode;
  hidePagination?: boolean;
  emptyMessage?: string;
  showSnackbar?: boolean;
  fetchUrl?: string;
}

const PokemonList = ({
  showOnlyRoster = false,
  title = 'Pokémon Collection',
  icon = <CatchingPokemon className="text-purple-600 text-4xl" />,
  hidePagination = false,
  emptyMessage = 'No Pokémon found.',
  showSnackbar = true,
  fetchUrl = `${POKE_API_URL}/pokemon`
}: PokemonListProps) => {
  const navigate = useNavigate();

  const { count: rosterCount, rosterIds } = useRoster();

  const [pokemon, setPokemon] = useState<PokemonDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 12;

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch Pokemon data - single useEffect
  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        setError(null);

        // If showing only roster, fetch all roster Pokemon
        if (showOnlyRoster) {
          if (rosterIds.length === 0) {
            setPokemon([]);
            setTotalCount(0);
            setLoading(false);
            return;
          }

          // Fetch details for each Pokemon in roster
          const detailPromises = rosterIds.map(async id => {
            const detailRes = await fetch(`${POKE_API_URL}/pokemon/${id}`);
            if (!detailRes.ok) throw new Error(`Failed to fetch Pokemon ${id}`);
            const detailData = await detailRes.json();
            return pokemonDetailSchema.parse(detailData);
          });

          const details = await Promise.all(detailPromises);
          const sortedDetails = details.sort((a, b) => a.id - b.id);
          setPokemon(sortedDetails);
          setTotalCount(sortedDetails.length);
          setLoading(false);
          return;
        }

        // Normal fetch for all Pokemon (Home page)
        const res = await fetch(`${POKE_API_URL}/pokemon/?limit=${limit}&offset=${offset}`);
        if (!res.ok) throw new Error('Failed to fetch Pokemon list');
        const data = await res.json();

        const validatedList = pokemonListResponseSchema.parse(data);
        setTotalCount(validatedList.count);

        const detailPromises = validatedList.results.map(async item => {
          const detailRes = await fetch(item.url);
          if (!detailRes.ok) throw new Error(`Failed to fetch ${item.name}`);
          const detailData = await detailRes.json();
          return pokemonDetailSchema.parse(detailData);
        });

        const details = await Promise.all(detailPromises);
        setPokemon(details);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load Pokemon';
        setError(errorMessage);
        console.error('Error fetching Pokemon:', err);

        if (showSnackbar) {
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [offset, showOnlyRoster, rosterIds, fetchUrl, showSnackbar]);

  const handlePokemonClick = (pokemon: PokemonDetail) => {
    navigate(`/pokemon/${pokemon.id}`);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    const newOffset = (page - 1) * limit;
    setOffset(newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter pokemon based on roster filter
  const displayedPokemon = showOnlyRoster ? pokemon : pokemon;
  const totalPages = Math.ceil((showOnlyRoster ? rosterCount : totalCount) / limit);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="mb-4 mt-10 justify-center">
        {error}
      </Alert>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto mt-15 px-4">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 mt-10 gap-4">
        <Typography variant="h4" component="h1" className="font-bold flex items-center gap-2">
          {icon}
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {showOnlyRoster ? rosterCount : totalCount} Pokémon
        </Typography>
      </Box>

      {/* Empty state */}
      {displayedPokemon.length === 0 ? (
        <Typography variant="body1" color="text.secondary" className="text-center py-12">
          {showOnlyRoster ? 'Your roster is empty. Add some Pokémon! ❤️' : emptyMessage}
        </Typography>
      ) : (
        <>
          {/* Pagination - Only show for non-roster view */}
          {!hidePagination && !showOnlyRoster && totalPages > 1 && (
            <Box className="flex justify-center mt-8 pb-4">
              <Pagination
                count={totalPages}
                page={Math.floor(offset / limit) + 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                className="pokemon-pagination"
              />
            </Box>
          )}
          <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedPokemon.map(p => (
              <PokemonCard key={p.id} pokemon={p} onClick={() => handlePokemonClick(p)} />
            ))}
          </Box>

          {/* Pagination - Only show for non-roster view */}
          {!hidePagination && !showOnlyRoster && totalPages > 1 && (
            <Box className="flex justify-center mt-8 pb-4">
              <Pagination
                count={totalPages}
                page={Math.floor(offset / limit) + 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                className="pokemon-pagination"
              />
            </Box>
          )}
        </>
      )}

      {/* Snackbar for feedback */}
      {showSnackbar && (
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
      )}
    </Box>
  );
};

export default PokemonList;
