import { CatchingPokemon } from '@mui/icons-material';

import PokemonList from '../components/PokemonList';

const Home = () => {
  return (
    <PokemonList
      title="Pokémon Collection"
      icon={<CatchingPokemon className="text-purple-600 text-4xl" />}
      showOnlyRoster={false}
      showSnackbar={true}
    />
  );
};

export default Home;
