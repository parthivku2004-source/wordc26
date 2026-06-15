import initialFixtures from '../data/fixtures.json';
import initialTeams from '../data/teams.json';

// Resolve a team's formation, starting 11, and substitutes dynamically & deterministically
export const getTeamFormationAndLineup = (teamId, roster) => {
  const formations = {
    MEX: '4-3-3',
    BRA: '4-3-3',
    ARG: '4-3-3',
    GER: '4-2-3-1',
    ESP: '4-3-3',
    FRA: '4-2-3-1',
    ENG: '4-2-3-1',
    ITA: '3-5-2',
    POR: '4-3-3',
    NED: '3-5-2',
    CRO: '4-3-3',
    BEL: '3-4-3',
    URU: '4-3-3',
    USA: '4-3-3',
    CAN: '4-4-2',
    MAR: '4-2-3-1',
    KOR: '4-4-2',
    JPN: '4-2-3-1',
    COL: '4-3-3',
    SEN: '4-3-3',
  };

  // Deterministic fallback based on teamId characters
  const charCode = teamId ? (teamId.charCodeAt(0) + teamId.charCodeAt(1)) : 0;
  const formationOptions = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3'];
  const formation = formations[teamId] || formationOptions[charCode % formationOptions.length];

  // Parse required position counts
  let dfNeeded = 4;
  let mfNeeded = 3;
  let fwNeeded = 3;

  if (formation === '4-2-3-1') {
    dfNeeded = 4;
    mfNeeded = 5;
    fwNeeded = 1;
  } else if (formation === '4-4-2') {
    dfNeeded = 4;
    mfNeeded = 4;
    fwNeeded = 2;
  } else if (formation === '3-5-2') {
    dfNeeded = 3;
    mfNeeded = 5;
    fwNeeded = 2;
  } else if (formation === '3-4-3') {
    dfNeeded = 3;
    mfNeeded = 4;
    fwNeeded = 3;
  } else if (formation === '5-3-2') {
    dfNeeded = 5;
    mfNeeded = 3;
    fwNeeded = 2;
  }

  const starters = [];
  const starterIds = new Set();

  // 1. Goalkeeper
  const gks = roster.filter(p => p.position === 'GK');
  if (gks.length > 0) {
    starters.push(gks[0]);
    starterIds.add(gks[0].number);
  }

  // 2. Defenders
  const dfs = roster.filter(p => p.position === 'DF');
  const selectedDfs = dfs.slice(0, dfNeeded);
  starters.push(...selectedDfs);
  selectedDfs.forEach(p => starterIds.add(p.number));

  // 3. Midfielders
  const mfs = roster.filter(p => p.position === 'MF');
  const selectedMfs = mfs.slice(0, mfNeeded);
  starters.push(...selectedMfs);
  selectedMfs.forEach(p => starterIds.add(p.number));

  // 4. Forwards
  const fws = roster.filter(p => p.position === 'FW');
  const selectedFws = fws.slice(0, fwNeeded);
  starters.push(...selectedFws);
  selectedFws.forEach(p => starterIds.add(p.number));

  // Fallback: if starters < 11, fill with anyone who isn't already a starter
  if (starters.length < 11) {
    for (const p of roster) {
      if (starters.length >= 11) break;
      if (!starterIds.has(p.number)) {
        starters.push(p);
        starterIds.add(p.number);
      }
    }
  }

  // Substitutes: all roster players not starting
  const subs = roster.filter(p => !starterIds.has(p.number));

  return { formation, starters, subs };
};

// Generate realistic match outcome deterministically based on matchId (including cards and substitutions)
export const generateDeterministicResult = (match) => {
  const events = [];
  
  // Real world events for historical matches 1 and 2
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

  if (realWorldEvents[match.matchId]) {
    events.push(...realWorldEvents[match.matchId]);
  }

  let homeScore = 0;
  let awayScore = 0;
  events.forEach(e => {
    if (e.type === 'goal') {
      if (e.teamId === match.homeTeamId) homeScore++;
      else if (e.teamId === match.awayTeamId) awayScore++;
    }
  });

  let winner = null;
  if (homeScore > awayScore) {
    winner = match.homeTeamId;
  } else if (awayScore > homeScore) {
    winner = match.awayTeamId;
  }

  return { homeScore, awayScore, winner, events };
};

// Automatically update match statuses based on current time (automated for match time itself)
export const syncFixturesWithCurrentTime = (fixtures, forceSync = false) => {
  if (!fixtures) return [];
  const now = Date.now();

  return fixtures.map(match => {
    // If the match is already Finished, preserve it.
    if (match.status === 'Finished') {
      return match;
    }

    // If the match is synced from the API and we are not forcing simulation sync, preserve it.
    if (match.apiSynced && !forceSync) {
      return match;
    }

    const matchTime = new Date(match.dateTimeISO).getTime();
    
    // If the match is scheduled in the future, it is Upcoming
    if (now < matchTime) {
      return {
        ...match,
        status: 'Upcoming',
        minute: null,
        homeScore: 0,
        awayScore: 0,
        events: [],
        winner: null,
        stats: {
          possession: [50, 50],
          shots: [0, 0],
          shotsOnTarget: [0, 0],
          fouls: [0, 0]
        }
      };
    }

    const elapsedMs = now - matchTime;
    const elapsedMins = Math.floor(elapsedMs / 60000);

    const isKnockout = match.stage !== 'Group Stage';

    let status = 'Finished';
    let matchMin = 90;

    // Timeline stages of match (in wall-clock time after kickoff):
    // 0 to 45 mins: 1st Half LIVE
    // 45 to 60 mins: Half Time (15 min break)
    // 60 to 105 mins: 2nd Half LIVE (runs from min 46 to 90)
    // 105+ mins: If group stage, Finished. If knockout and draw, goes to Extra Time:
    //   105 to 110 mins: Break before Extra Time (min 90)
    //   110 to 125 mins: Extra Time 1st Half (min 91-105)
    //   125 to 130 mins: Break (min 105)
    //   130 to 145 mins: Extra Time 2nd Half (min 106-120)
    //   145 to 155 mins: Penalty Shootout
    //   155+ mins: Finished

    const fullOutcome = generateDeterministicResult(match);

    if (elapsedMins < 45) {
      status = 'LIVE';
      matchMin = elapsedMins + 1;
    } else if (elapsedMins < 60) {
      status = 'Half Time';
      matchMin = 45;
    } else if (elapsedMins < 105) {
      status = 'LIVE';
      matchMin = 45 + (elapsedMins - 60) + 1;
      if (matchMin > 90) matchMin = 90;
    } else {
      // It has been 90 minutes.
      if (isKnockout && fullOutcome.homeScore === fullOutcome.awayScore) {
        if (elapsedMins < 110) {
          status = 'LIVE';
          matchMin = 90;
        } else if (elapsedMins < 125) {
          status = 'Extra Time';
          matchMin = 90 + (elapsedMins - 110) + 1;
        } else if (elapsedMins < 130) {
          status = 'Extra Time';
          matchMin = 105;
        } else if (elapsedMins < 145) {
          status = 'Extra Time';
          matchMin = 105 + (elapsedMins - 130) + 1;
          if (matchMin > 120) matchMin = 120;
        } else if (elapsedMins < 155) {
          status = 'Penalties';
          matchMin = 120;
        } else {
          status = 'Finished';
          matchMin = 120;
        }
      } else {
        status = 'Finished';
        matchMin = 90;
      }
    }

    // Filter events based on current match minute
    let activeEvents = (fullOutcome.events || []).filter(e => {
      if (status === 'Finished') return true;
      if (status === 'Penalties') return e.minute <= 120;
      return e.minute <= matchMin;
    });

    // Compute live scores based on active events
    let homeScore = 0;
    let awayScore = 0;
    activeEvents.forEach(e => {
      if (e.type === 'goal') {
        if (e.teamId === match.homeTeamId) homeScore++;
        else if (e.teamId === match.awayTeamId) awayScore++;
      }
    });

    // Determine winner & penalties
    let winner = null;
    let homePenalties = undefined;
    let awayPenalties = undefined;

    if (status === 'Finished') {
      winner = fullOutcome.winner;
    }

    const stats = {
      possession: [50, 50],
      shots: [0, 0],
      shotsOnTarget: [0, 0],
      fouls: [0, 0]
    };

    return {
      ...match,
      status,
      minute: (status === 'LIVE' || status === 'Extra Time') ? matchMin : (status === 'Upcoming' ? null : matchMin),
      homeScore,
      awayScore,
      events: activeEvents,
      winner,
      homePenalties,
      awayPenalties,
      stats
    };
  });
};

// Initialize localStorage databases if not present
export const initDatabase = () => {
  // Force reset local database to start fresh with clean (Upcoming) 104-match fixtures schedule
  const needsReset = localStorage.getItem('wc_db_clean_start_v11') !== 'true';
  if (needsReset) {
    localStorage.setItem('wc_fixtures', JSON.stringify(initialFixtures));
    localStorage.setItem('wc_teams', JSON.stringify(initialTeams));
    localStorage.setItem('wc_db_clean_start_v11', 'true');
  }

  if (!localStorage.getItem('wc_fixtures')) {
    localStorage.setItem('wc_fixtures', JSON.stringify(initialFixtures));
  }
  if (!localStorage.getItem('wc_teams')) {
    localStorage.setItem('wc_teams', JSON.stringify(initialTeams));
  }
  if (!localStorage.getItem('wc_favorites')) {
    localStorage.setItem('wc_favorites', JSON.stringify([]));
  }
  if (!localStorage.getItem('wc_reminders')) {
    localStorage.setItem('wc_reminders', JSON.stringify([]));
  }
};

// Automatically resolve knockout match team details dynamically based on group stage standings and previous round winners
export const resolveDynamicKnockoutTeams = (fixtures, standings) => {
  if (!fixtures) return [];

  const clonedFixtures = JSON.parse(JSON.stringify(fixtures));

  // Helper to resolve group standings (e.g. 1E, 2A, 3ABCDF)
  const resolveFormulaTeam = (formula) => {
    const existingTeam = standings.find(t => t.id === formula);
    if (existingTeam) {
      return { id: existingTeam.id, name: existingTeam.name };
    }

    const match = formula.match(/^([123])([A-L]+)$/);
    if (!match) return { id: formula, name: `${formula} (TBD)` };

    const rank = parseInt(match[1]); // 1, 2, or 3
    const groupsStr = match[2]; // e.g. "E", "ABCDF", etc.

    if (groupsStr.length === 1) {
      // Single group (e.g. 1E or 2A)
      const groupTeams = standings.filter(t => t.group === groupsStr);
      const allPlayed = groupTeams.every(t => t.played > 0);
      if (allPlayed) {
        const team = groupTeams[rank - 1];
        if (team) {
          return { id: team.id, name: team.name };
        }
      }
      return { id: formula, name: `${rank}${groupsStr} (TBD)` };
    } else {
      // Best 3rd placed team from a set of groups (e.g. 3ABCDF)
      const allThirdTeams = [];
      const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      groups.forEach(g => {
        const groupTeams = standings.filter(t => t.group === g);
        const allPlayed = groupTeams.every(t => t.played > 0);
        if (allPlayed && groupTeams[2]) {
          allThirdTeams.push(groupTeams[2]);
        }
      });

      // Sort third teams
      allThirdTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = a.goalsFor - a.goalsAgainst;
        const gdB = b.goalsFor - b.goalsAgainst;
        if (gdB !== gdA) return gdB - gdA;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.name.localeCompare(b.name);
      });

      // Filter to third teams belonging to the formula groups
      const validThirds = allThirdTeams.filter(t => groupsStr.includes(t.group));
      const team = validThirds[0];
      if (team) {
        return { id: team.id, name: team.name };
      }
      return { id: formula, name: `3rd ${groupsStr} (TBD)` };
    }
  };

  const findMatch = (id) => clonedFixtures.find(m => m.matchId === id);

  const resolveWinner = (matchId, fallbackLabel) => {
    const m = findMatch(matchId);
    if (m && m.status === 'Finished' && m.winner) {
      const team = standings.find(t => t.id === m.winner);
      return { id: m.winner, name: team ? team.name : m.winner };
    }
    return { id: `W${matchId}`, name: fallbackLabel };
  };

  const resolveLoser = (matchId, fallbackLabel) => {
    const m = findMatch(matchId);
    if (m && m.status === 'Finished' && m.winner) {
      const loserId = m.winner === m.homeTeamId ? m.awayTeamId : m.homeTeamId;
      const team = standings.find(t => t.id === loserId);
      return { id: loserId, name: team ? team.name : loserId };
    }
    return { id: `L${matchId}`, name: fallbackLabel };
  };

  // Process the matches
  clonedFixtures.forEach(match => {
    if (match.stage === 'Group Stage') return;

    if (match.stage === 'Round of 32') {
      const homeResolved = resolveFormulaTeam(match.homeTeamId);
      const awayResolved = resolveFormulaTeam(match.awayTeamId);
      
      // Update teamId and name dynamically if resolved, otherwise keep placeholder
      match.homeTeamId = homeResolved.id;
      match.homeTeam = homeResolved.name;
      match.awayTeamId = awayResolved.id;
      match.awayTeam = awayResolved.name;
    }

    else if (match.stage === 'Round of 16') {
      const homeWinner = resolveWinner(parseInt(match.homeTeamId.substring(1)) || 73, match.homeTeam);
      const awayWinner = resolveWinner(parseInt(match.awayTeamId.substring(1)) || 74, match.awayTeam);

      match.homeTeamId = homeWinner.id;
      match.homeTeam = homeWinner.name;
      match.awayTeamId = awayWinner.id;
      match.awayTeam = awayWinner.name;
    }

    else if (match.stage === 'Quarter Finals') {
      const homeWinner = resolveWinner(parseInt(match.homeTeamId.substring(1)) || 89, match.homeTeam);
      const awayWinner = resolveWinner(parseInt(match.awayTeamId.substring(1)) || 90, match.awayTeam);

      match.homeTeamId = homeWinner.id;
      match.homeTeam = homeWinner.name;
      match.awayTeamId = awayWinner.id;
      match.awayTeam = awayWinner.name;
    }

    else if (match.stage === 'Semi Finals') {
      const homeWinner = resolveWinner(parseInt(match.homeTeamId.substring(1)) || 97, match.homeTeam);
      const awayWinner = resolveWinner(parseInt(match.awayTeamId.substring(1)) || 98, match.awayTeam);

      match.homeTeamId = homeWinner.id;
      match.homeTeam = homeWinner.name;
      match.awayTeamId = awayWinner.id;
      match.awayTeam = awayWinner.name;
    }

    else if (match.stage === 'Third Place Match') {
      const homeWinner = resolveLoser(101, 'SF 1 Loser');
      const awayWinner = resolveLoser(102, 'SF 2 Loser');

      match.homeTeamId = homeWinner.id;
      match.homeTeam = homeWinner.name;
      match.awayTeamId = awayWinner.id;
      match.awayTeam = awayWinner.name;
    }

    else if (match.stage === 'Final') {
      const homeWinner = resolveWinner(101, 'SF 1 Winner');
      const awayWinner = resolveWinner(102, 'SF 2 Winner');

      match.homeTeamId = homeWinner.id;
      match.homeTeam = homeWinner.name;
      match.awayTeamId = awayWinner.id;
      match.awayTeam = awayWinner.name;
    }
  });

  return clonedFixtures;
};

// Retrieve data
export const getFixtures = (forceSync = false) => {
  initDatabase();
  const raw = JSON.parse(localStorage.getItem('wc_fixtures')) || [];
  const synced = syncFixturesWithCurrentTime(raw, forceSync);
  const standings = calculateStandingsFromRaw(synced, getTeams());
  const resolved = resolveDynamicKnockoutTeams(synced, standings);
  return resolved;
};

export const getTeams = () => {
  initDatabase();
  return JSON.parse(localStorage.getItem('wc_teams'));
};

// Update fixtures in localStorage
export const saveFixtures = (fixtures) => {
  localStorage.setItem('wc_fixtures', JSON.stringify(fixtures));
};

export const calculateStandingsFromRaw = (fixtures, teams) => {
  const standings = teams.map(team => ({
    ...team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0
  }));

  fixtures.forEach(match => {
    if (match.stage !== 'Group Stage') return;
    if (match.status === 'Finished' || match.status === 'LIVE' || match.status === 'Half Time' || match.status === 'Extra Time' || match.status === 'Penalties') {
      const home = standings.find(t => t.id === match.homeTeamId);
      const away = standings.find(t => t.id === match.awayTeamId);

      if (home && away) {
        home.played += 1;
        away.played += 1;
        home.goalsFor += match.homeScore;
        home.goalsAgainst += match.awayScore;
        away.goalsFor += match.awayScore;
        away.goalsAgainst += match.homeScore;

        if (match.homeScore > match.awayScore) {
          home.wins += 1;
          home.points += 3;
          away.losses += 1;
        } else if (match.homeScore < match.awayScore) {
          away.wins += 1;
          away.points += 3;
          home.losses += 1;
        } else {
          home.draws += 1;
          away.draws += 1;
          home.points += 1;
          away.points += 1;
        }
      }
    }
  });

  standings.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) {
      return gdB - gdA;
    }
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }
    return a.name.localeCompare(b.name);
  });

  return standings;
};

// Calculate Standings dynamically based on raw fixtures
export const calculateStandings = (forceSync = false) => {
  const teams = getTeams();
  const rawFixtures = JSON.parse(localStorage.getItem('wc_fixtures')) || [];
  const synced = syncFixturesWithCurrentTime(rawFixtures, forceSync);
  return calculateStandingsFromRaw(synced, teams);
};


