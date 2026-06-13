import { useState, useEffect, useCallback, useRef } from 'react';
import { getFixtures, calculateStandings, saveFixtures, getTeams } from '../api/footballApi';
import playersData from '../data/players.json';

const realWorldEvents = {
  1: [
    { type: 'red', minute: 49, teamId: 'RSA', player: 'Sphephelo Sithole', detail: 'Straight Red Card (Professional foul)' },
    { type: 'red', minute: 84, teamId: 'RSA', player: 'Themba Zwane', detail: 'Red Card (Violent conduct)' },
    { type: 'red', minute: 90, teamId: 'MEX', player: 'César Montes', detail: 'Red Card (Late tackle)' },
    { type: 'sub', minute: 75, teamId: 'MEX', player: 'Brian Gutierrez (Out) / Gilberto Mora (In)', detail: 'Tactical replacement' }
  ],
  2: [
    { type: 'yellow', minute: 96, teamId: 'KOR', player: 'Lee Gi-Hyuk', detail: 'Tactical foul' },
    { type: 'sub', minute: 62, teamId: 'KOR', player: 'Lee Jae-Sung (Out) / Hwang Hee-Chan (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 64, teamId: 'UEFA_D', player: 'Pavel Sulc (Out) / Adam Hlozek (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 64, teamId: 'UEFA_D', player: 'Patrik Schick (Out) / Tomás Chory (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 64, teamId: 'UEFA_D', player: 'Lukás Provod (Out) / Michal Sadílek (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 69, teamId: 'KOR', player: 'Lee Tae-Seok (Out) / Eom Ji-Sung (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 69, teamId: 'KOR', player: 'Son Heung-Min (Out) / Oh Hyeon-Gyu (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 84, teamId: 'UEFA_D', player: 'Alexandr Sojka (Out) / Mojmír Chytil (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 84, teamId: 'KOR', player: 'Hwang In-Beom (Out) / Kim Jin-Gyu (In)', detail: 'Tactical replacement' },
    { type: 'sub', minute: 84, teamId: 'KOR', player: 'Paik Seung-Ho (Out) / Park Jin-Seob (In)', detail: 'Tactical replacement' }
  ]
};

const generateMockCardsAndSubs = (m) => {
  const eventsList = [];
  const seed = m.matchId;
  
  const yellowCount = (seed * 3 + 1) % 5; // 0 to 4 yellows
  const hasRed = (seed * 7) % 10 === 0; // 10% chance of red
  const subCount = 3 + (seed % 3); // 3 to 5 subs
  
  const homePlayers = playersData[m.homeTeamId] || [];
  const awayPlayers = playersData[m.awayTeamId] || [];
  
  // Generate Yellow Cards
  for (let i = 0; i < yellowCount; i++) {
    const isHome = (seed + i) % 2 === 0;
    const roster = isHome ? homePlayers : awayPlayers;
    const teamId = isHome ? m.homeTeamId : m.awayTeamId;
    if (roster.length > 0) {
      const player = roster[(seed + i * 2) % roster.length].name;
      eventsList.push({
        type: 'yellow',
        minute: 10 + ((i * 18) % 80),
        teamId,
        player,
        detail: 'Booked for a late challenge'
      });
    }
  }
  
  // Generate Red Card
  if (hasRed && homePlayers.length > 0 && awayPlayers.length > 0) {
    const isHome = seed % 2 === 0;
    const roster = isHome ? homePlayers : awayPlayers;
    const teamId = isHome ? m.homeTeamId : m.awayTeamId;
    const player = roster[(seed * 3) % roster.length].name;
    eventsList.push({
      type: 'red',
      minute: 70 + (seed % 20),
      teamId,
      player,
      detail: 'Sent off for violent conduct'
    });
  }
  
  // Generate Substitutions
  for (let i = 0; i < subCount; i++) {
    const isHome = (seed + i * 3) % 2 === 0;
    const roster = isHome ? homePlayers : awayPlayers;
    const teamId = isHome ? m.homeTeamId : m.awayTeamId;
    
    const starters = roster.slice(0, 11);
    const bench = roster.slice(11);
    
    if (starters.length > 0 && bench.length > 0) {
      const playerOut = starters[(seed + i) % starters.length].name;
      const playerIn = bench[(seed + i * 2) % bench.length].name;
      eventsList.push({
        type: 'sub',
        minute: 55 + i * 7,
        teamId,
        player: `${playerOut} (Out) / ${playerIn} (In)`,
        detail: 'Tactical substitution'
      });
    }
  }
  
  return eventsList;
};

const getApiGameForFixture = (fixture, apiGames, teams) => {
  if (!apiGames || apiGames.length === 0) return null;

  // 1. Check if the fixture has fully resolved team codes (e.g., "MEX", "BRA", "USA" etc.)
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

  // 2. If one or both team IDs are not yet resolved, fallback to mapping by ID
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

  // Update check loop (API fetch / real-world tracker with time-sync fallback)
  const fetchLiveScores = useCallback(async () => {
    try {
      let data;
      try {
        const response = await fetch('https://worldcup26.ir/get/games');
        if (!response.ok) throw new Error("Primary API fetch failed");
        data = await response.json();
      } catch (primaryErr) {
        console.warn("Primary API fetch failed. Trying CORS proxy fallback...", primaryErr);
        const proxyResponse = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://worldcup26.ir/get/games'));
        if (!proxyResponse.ok) throw new Error("CORS proxy fetch failed");
        data = await proxyResponse.json();
      }
      const apiGames = data.games || data || [];
      const teams = getTeams() || [];
      
      const currentFixtures = getFixtures();
      let updated = false;
      const goalAlerts = [];

      const updatedFixtures = currentFixtures.map(match => {
        const apiGame = getApiGameForFixture(match, apiGames, teams);
        if (!apiGame) return match;

        const apiHomeScore = Number(apiGame.home_score || 0);
        const apiAwayScore = Number(apiGame.away_score || 0);
        
        let apiStatus = 'Upcoming';
        if (apiGame.finished === 'TRUE') {
          apiStatus = 'Finished';
        } else if (apiGame.time_elapsed !== 'notstarted' && apiGame.time_elapsed !== 'null' && apiGame.time_elapsed) {
          apiStatus = 'LIVE';
        }

        const scoreChanged = match.homeScore !== apiHomeScore || match.awayScore !== apiAwayScore;
        const statusChanged = match.status !== apiStatus;
        const prevEventsLength = match.events?.length || 0;

        // Parse goals to see if there are any new goal alerts we should trigger!
        const parseScorers = (scorersStr, teamId, teamName) => {
          if (!scorersStr || scorersStr === 'null') return [];
          const clean = scorersStr.replace(/[{}]/g, '').replace(/”/g, '"').replace(/“/g, '"');
          const parts = clean.split(',').map(s => s.trim().replace(/"/g, ''));
          const goals = [];
          parts.forEach(part => {
            const m = part.match(/(.+?)\s+(\d+)'/);
            if (m) {
              goals.push({
                player: m[1].trim(),
                minute: Number(m[2]),
                teamId,
                teamName
              });
            }
          });
          return goals;
        };

        const homeGoals = parseScorers(apiGame.home_scorers, match.homeTeamId, match.homeTeam);
        const awayGoals = parseScorers(apiGame.away_scorers, match.awayTeamId, match.awayTeam);
        const allApiGoals = [...homeGoals, ...awayGoals];

        // Reconstruct events
        let events = allApiGoals.map(g => ({
          type: 'goal',
          minute: g.minute,
          teamId: g.teamId,
          player: g.player,
          assist: null,
          detail: 'Goal'
        }));

        // Inject cards & substitutions
        if (realWorldEvents[match.matchId]) {
          events.push(...realWorldEvents[match.matchId]);
        } else if (apiStatus !== 'Upcoming') {
          events.push(...generateMockCardsAndSubs(match));
        }

        events.sort((a, b) => a.minute - b.minute);

        // Check for new goals for alerts
        allApiGoals.forEach(g => {
          const alreadyLogged = match.events?.some(e => e.type === 'goal' && e.minute === g.minute && e.teamId === g.teamId);
          if (!alreadyLogged) {
            goalAlerts.push({
              matchId: match.matchId,
              teamId: g.teamId,
              teamName: g.teamName,
              player: g.player,
              assist: null,
              minute: g.minute,
              homeScore: apiHomeScore,
              awayScore: apiAwayScore,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              homeTeamId: match.homeTeamId,
              awayTeamId: match.awayTeamId
            });
          }
        });

        if (scoreChanged || statusChanged || events.length !== prevEventsLength) {
          updated = true;
        }

        // Determine winner
        let winner = null;
        if (apiStatus === 'Finished') {
          if (apiHomeScore > apiAwayScore) winner = match.homeTeamId;
          else if (apiAwayScore > apiHomeScore) winner = match.awayTeamId;
        }

        return {
          ...match,
          status: apiStatus,
          minute: apiStatus === 'LIVE' ? (Number(apiGame.time_elapsed) || 45) : (apiStatus === 'Finished' ? 90 : null),
          homeScore: apiHomeScore,
          awayScore: apiAwayScore,
          events,
          winner
        };
      });

      if (updated) {
        saveFixtures(updatedFixtures);
        setFixtures(prev => {
          detectNewGoalsAndAlert(prev, updatedFixtures);
          return updatedFixtures;
        });
        setStandings(calculateStandings());

        // Trigger goal alerts
        if (goalAlerts.length > 0 && onGoalAlertRef.current) {
          goalAlerts.forEach(alert => {
            onGoalAlertRef.current(alert);
          });
        }
      }
      setError(null);
    } catch (err) {
      console.warn("API offline / fetch failed. Auto-simulating fixtures based on current system time.", err);
      // Fallback: update fixtures and standings based on local system time-sync!
      const currentFixtures = getFixtures(); // Automatically time-synced
      
      setFixtures(prev => {
        detectNewGoalsAndAlert(prev, currentFixtures);
        return currentFixtures;
      });
      setStandings(calculateStandings());
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

