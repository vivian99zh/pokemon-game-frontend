import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box className="bg-primary text-white mt-8 py-4 text-center">
      <Typography variant="body2" className="text-white">
        © {new Date().getFullYear()} Pokémon Game • Data from{' '}
        <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" className="text-info hover:text-info/80">
          PokéAPI
        </a>
      </Typography>
    </Box>
  );
};

export default Footer;
