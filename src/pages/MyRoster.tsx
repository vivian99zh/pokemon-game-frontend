import { useNavigate } from 'react-router';
import { Box, Button } from '@mui/material';
import { ArrowBack, Delete, Refresh, Favorite } from '@mui/icons-material';
import PokemonList from '../components/PokemonList';
import { useRoster } from '../hooks/useRoster';

const MyRoster = () => {
  const navigate = useNavigate();
  const { clearRoster } = useRoster();

  const handleRefreshRoster = () => {
    window.location.reload();
  };

  const handleClearRoster = () => {
    if (window.confirm('Are you sure you want to clear your entire roster?')) {
      clearRoster();

      navigate('/');
    }
  };

  return (
    <Box>
      <Box className="max-w-7xl mx-auto px-4 pt-4">
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} variant="outlined" className="mt-10 mr-5">
          Back to Collection
        </Button>
        <Button startIcon={<Refresh />} onClick={() => handleRefreshRoster()} variant="outlined" className="mt-10 mr-5">
          Refresh
        </Button>
        <Button startIcon={<Delete />} onClick={() => handleClearRoster()} variant="outlined" className="mt-10">
          Clear and back
        </Button>
      </Box>

      <PokemonList
        title="My Roster"
        icon={<Favorite className="text-error text-4xl" />}
        showOnlyRoster={true}
        showSnackbar={true}
        hidePagination={true}
        emptyMessage="Start adding Pokémon to your roster!"
      />
    </Box>
  );
};

export default MyRoster;
