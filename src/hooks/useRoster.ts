import { useState, useEffect, useCallback, useMemo } from 'react';
import { POKE_API_URL } from '../config';
import { pokemonDetailSchema } from '../schemas';
import type { PokemonDetail } from '../schemas';
import { useAuth } from '../contexts/AuthProvider';

const ROSTER_KEY_PREFIX = 'roster_ids_';

export const useRoster = () => {
  const { userId, isAuthenticated } = useAuth();

  // Get the full roster key with userId
  const getRosterKey = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return null;
    }
    return `${ROSTER_KEY_PREFIX}${userId}`;
  }, [isAuthenticated, userId]);

  const [rosterIds, setRosterIds] = useState<number[]>(() => {
    const key = getRosterKey();
    if (!key) return [];
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [rosterPokemon, setRosterPokemon] = useState<PokemonDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Save to localStorage whenever rosterIds change
  useEffect(() => {
    const key = getRosterKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(rosterIds));
    } catch (error) {
      console.error('Error saving roster:', error);
    }
  }, [rosterIds, getRosterKey]);

  // Load full Pokemon details - reads fresh from localStorage
  const loadRosterPokemon = useCallback(async () => {
    const key = getRosterKey();
    if (!key) {
      setRosterPokemon([]);
      setLoading(false);
      return;
    }

    // Read fresh pokemon IDs from localStorage
    let freshIds: number[] = [];
    try {
      const saved = localStorage.getItem(key);
      freshIds = saved ? JSON.parse(saved) : [];
    } catch {
      freshIds = [];
    }

    // Also update state with fresh pokemon IDs if they differ
    if (JSON.stringify(freshIds) !== JSON.stringify(rosterIds)) {
      setRosterIds(freshIds);
    }

    if (freshIds.length === 0) {
      setRosterPokemon([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const promises = freshIds.map(async id => {
        const res = await fetch(`${POKE_API_URL}/pokemon/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch Pokemon ${id}`);
        }
        const data = await res.json();
        return pokemonDetailSchema.parse(data);
      });

      const details = await Promise.all(promises);
      setRosterPokemon(details);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load roster';
      setError(errorMessage);
      console.error('Error loading roster:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getRosterKey, rosterIds]);

  // Auto-load when rosterIds change
  useEffect(() => {
    loadRosterPokemon();
  }, [rosterIds, loadRosterPokemon]);

  // Reload when user changes
  useEffect(() => {
    const key = getRosterKey();
    if (!key) {
      setRosterIds([]);
      setRosterPokemon([]);
      return;
    }
    try {
      const saved = localStorage.getItem(key);
      const ids = saved ? JSON.parse(saved) : [];
      setRosterIds(ids);
    } catch {
      setRosterIds([]);
    }
  }, [getRosterKey, userId, isAuthenticated]);

  const addToRoster = useCallback(
    (id: number) => {
      const key = getRosterKey();
      if (!key) return;

      let currentIds: number[] = [];
      try {
        const saved = localStorage.getItem(key);
        currentIds = saved ? JSON.parse(saved) : [];
      } catch {
        currentIds = [];
      }

      // Check if already exists
      if (currentIds.includes(id)) {
        return;
      }

      const newIds = [...currentIds, id];
      localStorage.setItem(key, JSON.stringify(newIds));
      setRosterIds(newIds);
    },
    [getRosterKey]
  );

  const removeFromRoster = useCallback(
    (id: number) => {
      const key = getRosterKey();
      if (!key) return;

      let currentIds: number[] = [];
      try {
        const saved = localStorage.getItem(key);
        currentIds = saved ? JSON.parse(saved) : [];
      } catch {
        currentIds = [];
      }

      const newIds = currentIds.filter(pokemonId => pokemonId !== id);
      localStorage.setItem(key, JSON.stringify(newIds));
      setRosterIds(newIds);
    },
    [getRosterKey]
  );

  const isInRoster = useCallback(
    (id: number) => {
      const key = getRosterKey();
      if (!key) return false;

      try {
        const saved = localStorage.getItem(key);
        if (!saved) return false;
        const ids = JSON.parse(saved);
        return ids.includes(id);
      } catch {
        return false;
      }
    },
    [getRosterKey]
  );

  const clearRoster = useCallback(() => {
    const key = getRosterKey();
    if (key) {
      localStorage.removeItem(key);
    }
    setRosterIds([]);
    setRosterPokemon([]);
  }, [getRosterKey]);

  const loadRosterPokemonManually = useCallback(() => {
    const key = getRosterKey();
    if (!key) {
      setRosterIds([]);
      return;
    }
    // Force reload by reading from localStorage
    try {
      const saved = localStorage.getItem(key);
      const ids = saved ? JSON.parse(saved) : [];
      setRosterIds(ids);
    } catch {
      setRosterIds([]);
    }
  }, [getRosterKey]);

  const count = useMemo(() => {
    const key = getRosterKey();
    if (!key) return 0;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  }, [getRosterKey, rosterIds]);

  const sortedRoster = useMemo(() => {
    return [...rosterPokemon].sort((a, b) => a.id - b.id);
  }, [rosterPokemon]);

  return {
    rosterIds,
    count,
    isInRoster,
    removeFromRoster,
    addToRoster,
    clearRoster,
    rosterPokemon: sortedRoster,
    loading,
    error,
    loadRosterPokemon: loadRosterPokemonManually
  };
};
