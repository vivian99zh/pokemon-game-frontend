import colors from 'tailwindcss/colors';
import type { PokemonDetail } from '../schemas';

export type AuthContextType = {
  isAuthenticated: boolean;
  userId: string | null;
  login: (newToken: string, newUserId: string) => void;
  logout: () => void;
  getHeaders: () => HeadersInit;
};

export type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

export type NavItem = {
  label: string;
  path: string;
  action?: () => void;
};

export type PokemonCardProps = {
  pokemon: PokemonDetail;
  onClick?: () => void;
  className?: string;
};

export type PokemonListProps = {
  showOnlyRoster?: boolean;
  title?: string;
  icon?: React.ReactNode;
  hidePagination?: boolean;
  emptyMessage?: string;
  showSnackbar?: boolean;
  fetchUrl?: string;
};

export type BattlePokemon = PokemonDetail & {
  currentHp: number;
  maxHp: number;
};

export const TYPE_COLORS: Record<string, string> = {
  normal: colors.stone[400],
  fire: colors.orange[500],
  water: colors.blue[500],
  electric: colors.yellow[400],
  grass: colors.green[500],
  ice: colors.cyan[300],
  fighting: colors.red[700],
  poison: colors.purple[600],
  ground: colors.amber[600],
  flying: colors.indigo[400],
  psychic: colors.pink[500],
  bug: colors.lime[500],
  rock: colors.yellow[600],
  ghost: colors.violet[700],
  dragon: colors.indigo[700],
  dark: colors.neutral[800],
  steel: colors.slate[400],
  fairy: colors.pink[300]
};
