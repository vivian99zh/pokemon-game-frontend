import type { Score, LeaderboardEntry } from '../schemas';

const MOCK_LEADERBOARD_KEY = 'mock_leaderboard';

// Get scores from localStorage
const getScores = (): Score[] => {
  const data = localStorage.getItem(MOCK_LEADERBOARD_KEY);
  return data ? JSON.parse(data) : [];
};

// Save scores to localStorage
const saveScores = (scores: Score[]) => {
  localStorage.setItem(MOCK_LEADERBOARD_KEY, JSON.stringify(scores));
};

// Mock API Service
export const leaderboardService = {
  // Get leaderboard
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const scores = getScores();

    // Convert to leaderboard entries with calculated winRate
    return scores
      .map((score, index) => ({
        _id: `score_${index + 1}`,
        userId: score.userId,
        username: `Trainer_${score.userId.slice(-3)}`,
        score: score.score,
        wins: score.wins,
        losses: score.losses,
        date: new Date().toISOString(),
        pokemonName: score.pokemonName,
        pokemonId: score.pokemonId,
        winRate: score.wins + score.losses > 0 ? Math.round((score.wins / (score.wins + score.losses)) * 100) : 0
      }))
      .sort((a, b) => b.score - a.score);
  },

  // Save score after battle
  postScore: async (scoreData: any): Promise<Score> => {
    const scores = getScores();

    // Find existing user score
    const existingIndex = scores.findIndex(s => s.userId === scoreData.userId);

    let newScore: Score;

    if (existingIndex !== -1) {
      // Update existing
      const existing = scores[existingIndex];
      newScore = {
        ...existing,
        score: existing.score + scoreData.score,
        wins: existing.wins + scoreData.wins,
        losses: existing.losses + scoreData.losses,
        pokemonName: scoreData.pokemonName || existing.pokemonName,
        pokemonId: scoreData.pokemonId || existing.pokemonId
      };
      scores[existingIndex] = newScore;
    } else {
      // Create new
      newScore = {
        userId: scoreData.userId,
        score: scoreData.score,
        wins: scoreData.wins,
        losses: scoreData.losses,
        pokemonName: scoreData.pokemonName,
        pokemonId: scoreData.pokemonId
      };
      scores.push(newScore);
    }

    saveScores(scores);
    return newScore;
  }
};
