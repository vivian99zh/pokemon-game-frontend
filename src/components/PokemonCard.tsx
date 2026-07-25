import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { CatchingPokemon, Height } from '@mui/icons-material';
import ScaleIcon from '@mui/icons-material/Scale';
import type { PokemonDetail } from '../schemas';
import { useAuth } from '../contexts/AuthProvider';
import { useRoster } from '../hooks/useRoster';
import { TYPE_COLORS as typeColors } from '../types';

interface PokemonCardProps {
  pokemon: PokemonDetail;
  onClick?: () => void;
  className?: string;
}

const PokemonCard = ({ pokemon, onClick }: PokemonCardProps) => {
  const { isAuthenticated } = useAuth();
  const { isInRoster, addToRoster, removeFromRoster } = useRoster();
  const sprite =
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    'https://via.placeholder.com/150';

  const formattedId = String(pokemon.id).padStart(3, '0');
  const isFavorite = isInRoster(pokemon.id);
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) return;

    if (isFavorite) {
      removeFromRoster(pokemon.id);
    } else {
      addToRoster(pokemon.id);
    }
  };

  return (
    <Card
      variant="outlined"
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02], relative"
      onClick={onClick}
    >
      <CardContent>
        {/* Pokemon Image */}
        <Box className="flex justify-center items-center bg-surface rounded-lg p-4 mb-4">
          <img
            src={sprite}
            alt={pokemon.name}
            className="w-32 h-32 object-contain"
            onError={e => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
            }}
          />
        </Box>

        {/* Pokemon Info */}
        <Typography variant="h6" component="h2" className="font-semibold capitalize text-center">
          {pokemon.name}
          <Typography variant="caption" color="text.secondary" className="block font-normal">
            #{formattedId}
          </Typography>
        </Typography>

        {/* Types */}
        <Box className="flex justify-center gap-2 my-3">
          {pokemon.types.map(typeInfo => (
            <span
              key={typeInfo.type.name}
              className="text-white text-xs font-semibold px-3 py-1 rounded-full capitalize"
              style={{ backgroundColor: typeColors[typeInfo.type.name] || '#666' }}
            >
              {typeInfo.type.name}
            </span>
          ))}
        </Box>

        {/* Stats */}
        <Box className="space-y-2 mt-3 border-t pt-3">
          <Box className="flex items-center justify-between text-sm">
            <Box className="flex items-center gap-1">
              <Height fontSize="small" color="action" />
              <Typography variant="body2">Height</Typography>
            </Box>
            <Typography variant="body2" className="font-medium">
              {(pokemon.height / 10).toFixed(1)} m
            </Typography>
          </Box>

          <Box className="flex items-center justify-between text-sm">
            <Box className="flex items-center gap-1">
              <ScaleIcon fontSize="small" color="action" />
              <Typography variant="body2">Weight</Typography>
            </Box>
            <Typography variant="body2" className="font-medium">
              {(pokemon.weight / 10).toFixed(1)} kg
            </Typography>
          </Box>

          <Box className="flex items-center justify-between text-sm">
            <Box className="flex items-center gap-1">
              <CatchingPokemon fontSize="small" color="action" />
              <Typography variant="body2">Base Stats</Typography>
            </Box>
            <Typography variant="body2" className="font-medium">
              {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
            </Typography>
          </Box>
        </Box>

        {isAuthenticated && (
          <IconButton
            size="small"
            className="absolute top-1 right-1 bg-white/80 hover:bg-white/90 shadow-sm"
            onClick={e => {
              e.stopPropagation();
              handleFavoriteClick(e);
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <Favorite fontSize="small" sx={{ color: '#FF4444' }} /> : <FavoriteBorder fontSize="small" />}
          </IconButton>
        )}
      </CardContent>
    </Card>
  );
};

export default PokemonCard;
