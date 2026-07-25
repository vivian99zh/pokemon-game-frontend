import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, Typography, Button, Alert, CircularProgress, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { POKE_API_URL } from '../config';
import { pokemonDetailSchema } from '../schemas';
import type { PokemonDetail } from '../schemas';
import PokemonCard from '../components/PokemonCard';

const PokemonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemonDetail = async (): Promise<void> => {
      if (!id) {
        setError('Pokemon ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${POKE_API_URL}/pokemon/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Pokemon not found');
          }
          throw new Error('Failed to fetch Pokemon');
        }

        const data = await res.json();

        const validatedPokemon = pokemonDetailSchema.parse(data);
        setPokemon(validatedPokemon);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'ZodError') {
            setError('Invalid Pokemon data received from server');
          } else {
            setError(err.message);
          }
        } else {
          setError('Failed to load Pokemon details');
        }
        console.error('Error fetching Pokemon:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [id]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64 mt-10">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !pokemon) {
    return (
      <div className="max-w-4xl mx-auto mt-15 px-4">
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} className="mb-4" variant="outlined">
          Back to Pokémon
        </Button>
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="max-w-4xl mx-auto mt-15 px-4">
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} className="mb-4" variant="outlined">
          Back to Pokémon
        </Button>
        <Alert severity="warning">Pokemon not found</Alert>
      </div>
    );
  }

  return (
    <Box className="max-w-4xl mx-auto mt-15 px-4 pb-8">
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} className="mb-4" variant="outlined">
        Back
      </Button>

      <Card variant="outlined">
        <CardContent>
          <Box className="flex flex-col w-full">
            <PokemonCard key={pokemon.id} pokemon={pokemon} className="w-full max-w-sm" />

            <Box className="w-full mt-4 space-y-2">
              <Typography variant="subtitle2" className="font-bold">
                Stats
              </Typography>
              {pokemon.stats.map(stat => (
                <Box key={stat.stat.name} className="flex items-center gap-4">
                  <Typography variant="body2" className="w-24 capitalize text-gray-600">
                    {stat.stat.name.replace('-', ' ')}
                  </Typography>
                  <Box className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <Box
                      className="h-full bg-info rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stat.base_stat / 255) * 100, 100)}%` }}
                    />
                  </Box>
                  <Typography variant="body2" className="w-10 text-right font-medium">
                    {stat.base_stat}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {error && (
            <Alert severity="error" className="mt-4">
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PokemonDetails;
