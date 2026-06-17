import { useState, useEffect, useCallback, useRef } from 'react';
import { getFixtures, calculateStandings, saveFixtures, getTeams } from '../api/footballApi';

const realWorldEvents = {
  1: [
    { type: 'red', minute: 49, teamId: 'RSA', player: 'Sphephelo Sithole', detail: 'Straight Red Card (Professional foul)' },
    { type: 'red', minute: 84, teamId: 'RSA', player: 'Themba Zwane', detail: 'Red Card (Violent conduct)' },
    { type: 'red', minute: 90, teamId: 'MEX', player: 'Cesar Montes', detail: 'Red Card (Late tackle)' },
    { type: 'sub', minute: 75, teamId: 'MEX', player: 'Brian Gutierrez (Out) / Gilberto Mora (In)', detail: 'Tactical replacement' }
  ],
  2: [
    { type: 'yellow', minute: 96, teamId: 'KOR', player: 'Lee Gi-Hyuk', detail: 'Tactical foul' },
    { type: 'sub', minute: 62, teamId: 'KOR', player: 'Lee Jae-Sung (Out) / Hwang Hee-Chan (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 64, teamId: 'UEFA_D', player: 'Pavel Sulc (Out) / Adam Hlozek (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 64, teamId: 'UEFA_D', player: 'Patrik Schick (Out) / Tomas Chory (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 64, teamId: 'UEFA_D', player: 'Lukas Provod (Out) / Michal Sadilek (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 69, teamId: 'KOR', player: 'Lee Tae-Seok (Out) / Eom Ji-Sung (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 69, teamId: 'KOR', player: 'Son Heung-Min (Out) / Oh Hyeon-Gyu (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 84, teamId: 'UEFA_D', player: 'Alexandr Sojka (Out) / Mojmir Chytil (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 84, teamId: 'KOR', player: 'Hwang In-Beom (Out) / Kim Jin-Gyu (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 84, teamId: 'KOR', player: 'Paik Seung-Ho (Out) / Park Jin-Seob (In)', detail: 'Tactical replacement' }
  ]
};


const getApiGameForFixture = (fixture, apiGames, teams) => {
  if (!apiGames || apiGames.length === 0) return null;

  // 1. For knockout stage matches, always match by ID directly
  if (fixture.stage !== 'Group Stage') {
    return apiGames.find(g => Number(g.id) === fixture.matchId);
  }

  // 2. For group stage matches, check if the fixture has fully resolved team codes (e.g., "MEX", "BRA", "USA" etc.)
  const isHomeResolved = teams.some(t => t.id === fixture.homeTeamId);
  const isAwayResolved = teams.some(t => t.id === fixture.awayTeamId);

  if (isHomeResolved && isAwayResolved) {
    // Both team IDs are resolved. Find the matching game in the API where the teams match.
    return apiGames.find(g => {
      const homeIndex = Number(g.home_team_id) - 1;
      const awayIndex = Number(g.away_team_id) - 1;
      const apiHomeTeam = teams[homeIndex];
      const apiAwayTeam = teams[awayIndex];
      return apiHomeTeam && apiAwayTeam && 
             apiHomeTeam.id === fixture.homeTeamId && 
             apiAwayTeam.id === fixture.awayTeamId;
    });
  }

  // 3. Fallback to mapping by ID if teams are not resolved
  return apiGames.find(g => Number(g.id) === fixture.matchId);
};

export const useLiveScores = (onGoalAlert) => {
  const [fixtures, setFixtures] = useState(() => {
    try {
      return getFixtures();
    } catch (err) {
      console.error("Failed to load initial fixtures:", err);
      return [];
    }
  });

  const [standings, setStandings] = useState(() => {
    try {
      return calculateStandings();
    } catch (err) {
      console.error("Failed to load initial standings:", err);
      return [];
    }
  });

  const [loading] = useState(false);
  const [error, setError] = useState(null);
  
  const timerRef = useRef(null);

  // Store the goal alert callback in a ref to avoid resetting the simulation interval
  const onGoalAlertRef = useRef(onGoalAlert);
  useEffect(() => {
    onGoalAlertRef.current = onGoalAlert;
  }, [onGoalAlert]);

  // Helper to detect new goal events and trigger alert callbacks
  const detectNewGoalsAndAlert = useCallback((prevFixtures, nextFixtures) => {
    if (!prevFixtures || prevFixtures.length === 0) return;

    nextFixtures.forEach(nextMatch => {
      const prevMatch = prevFixtures.find(m => m.matchId === nextMatch.matchId);
      if (!prevMatch) return;

      const nextGoals = nextMatch.events?.filter(e => e.type === 'goal') || [];
      const prevGoals = prevMatch.events?.filter(e => e.type === 'goal') || [];

      if (nextGoals.length > prevGoals.length) {
        nextGoals.forEach(g => {
          const alreadyLogged = prevGoals.some(pg => pg.minute === g.minute && pg.teamId === g.teamId && pg.player === g.player);
          if (!alreadyLogged) {
            if (onGoalAlertRef.current) {
              onGoalAlertRef.current({
                matchId: nextMatch.matchId,
                teamId: g.teamId,
                teamName: g.teamId === nextMatch.homeTeamId ? nextMatch.homeTeam : nextMatch.awayTeam,
                player: g.player,
                assist: g.assist,
                minute: g.minute,
                homeScore: nextMatch.homeScore,
                awayScore: nextMatch.awayScore,
                homeTeam: nextMatch.homeTeam,
                awayTeam: nextMatch.awayTeam,
                homeTeamId: nextMatch.homeTeamId,
                awayTeamId: nextMatch.awayTeamId
              });
            }
          }
        });
      }
    });
  }, []);

  // Update check loop (Fully automated clock-based live simulation)
  const fetchLiveScores = useCallback(async () => {
    try {
      const currentFixtures = getFixtures(true); // Automatically time-synced based on current system clock
      saveFixtures(currentFixtures); // Persist simulated scores and minutes to database
      
      setFixtures(prev => {
        detectNewGoalsAndAlert(prev, currentFixtures);
        return currentFixtures;
      });
      setStandings(calculateStandings(true));
      setError(null);
    } catch (err) {
      console.error("Failed to update live scores:", err);
      setError("Failed to update live scores");
    }
  }, [detectNewGoalsAndAlert]);

  // Set interval dynamically to pull real-world scores
  useEffect(() => {
    // Perform initial fetch to load real-world scores on mount asynchronously
    const timerId = setTimeout(fetchLiveScores, 0);

    const runAutoTick = () => {
      fetchLiveScores();
    };

    // Pull or update matches every 10 seconds to keep live scores/events active and synced
    timerRef.current = setInterval(runAutoTick, 10000);

    return () => {
      clearTimeout(timerId);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchLiveScores]);

  return {
    fixtures,
    standings,
    loading,
    error,
    fetchLiveScores
  };
};

