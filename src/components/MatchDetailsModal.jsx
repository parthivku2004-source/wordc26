import { useState, useMemo } from 'react';
import { X, MapPin, Calendar, Star, Users, List, BarChart3, History, Bell, CalendarCheck } from 'lucide-react';
import playersData from '../data/players.json';
import { getCountryFlag, getCountryName } from '../utils/countryHelper.jsx';
import { getTeamFormationAndLineup } from '../api/footballApi';

export default function MatchDetailsModal({
  match,
  onClose,
  isFavorite,
  onToggleFavorite,
  isReminderSet,
  onToggleReminder,
  onExportICS
}) {
  const [activeTab, setActiveTab] = useState('timeline');
  const [currentTime] = useState(() => Date.now());

  // Helper to normalize player names for matching across events
  const normalizeName = (name) => {
    if (!name) return '';
    return name.replace(/^(GK|DF|MF|FW):\s*/i, '').trim();
  };

  // Helper to resolve specific color branding per team
  const getTeamColorClass = (teamId, role) => {
    const colors = {
      MEX: 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-900/40',
      BRA: 'bg-yellow-500 border-yellow-300 text-slate-950 shadow-yellow-900/40',
      ARG: 'bg-sky-400 border-sky-200 text-slate-950 shadow-sky-900/40',
      GER: 'bg-slate-100 border-slate-350 text-slate-950 shadow-slate-955/40',
      ESP: 'bg-rose-600 border-rose-400 text-white shadow-rose-900/40',
      FRA: 'bg-blue-700 border-blue-400 text-white shadow-blue-900/40',
      ENG: 'bg-white border-slate-300 text-slate-900 shadow-slate-300/30',
      ITA: 'bg-blue-600 border-blue-300 text-white shadow-blue-900/40',
      POR: 'bg-red-750 border-red-450 text-white shadow-red-900/40',
      NED: 'bg-orange-500 border-orange-350 text-white shadow-orange-900/40',
      CRO: 'bg-red-650 border-red-300 text-white shadow-red-900/40',
      BEL: 'bg-red-600 border-yellow-450 text-white shadow-red-900/40',
      URU: 'bg-sky-500 border-sky-300 text-white shadow-sky-900/40',
      USA: 'bg-blue-900 border-rose-500 text-white shadow-blue-950/40',
      JPN: 'bg-blue-900 border-blue-450 text-white shadow-blue-950/40',
      KSA: 'bg-emerald-700 border-emerald-400 text-white shadow-emerald-900/40',
      MAR: 'bg-red-700 border-emerald-600 text-white shadow-red-900/40',
      QAT: 'bg-amber-900 border-amber-700 text-white shadow-amber-950/40',
      CAN: 'bg-red-600 border-slate-200 text-white shadow-red-900/40',
    };
    
    if (colors[teamId]) return colors[teamId];
    return role === 'home'
      ? 'bg-blue-600 border-blue-400 text-white shadow-blue-900/40'
      : 'bg-rose-650 border-rose-455 text-white shadow-rose-950/40';
  };

  // Retrieve players for home/away teams (real-world override + dynamic scanning fallback)
  const getTeamRoster = (teamId) => {
    if (!match) return [];
    let roster = [];
    if (playersData[teamId]) {
      roster = playersData[teamId].map(p => ({ ...p }));
    } else {
      const fallback = [];
      const positions = ['GK', 'DF', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'FW', 'MF', 'FW', 'GK', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'GK', 'FW', 'FW', 'FW'];
      for (let i = 1; i <= 26; i++) {
        fallback.push({
          name: `${positions[i - 1]}: Player ${i}`,
          number: i,
          position: positions[i - 1]
        });
      }
      roster = fallback;
    }

    // Dynamic scanning: if a player name from match events is missing in squad, inject them
    if (match.events) {
      match.events.forEach(evt => {
        if (evt.teamId === teamId) {
          const names = [];
          if (evt.player) {
            if (evt.type === 'sub') {
              const parts = evt.player.split('/');
              if (parts.length === 2) {
                names.push(normalizeName(parts[0].replace(/\(Out\)/i, '')));
                names.push(normalizeName(parts[1].replace(/\(In\)/i, '')));
              } else {
                names.push(normalizeName(evt.player.replace(/\(Out\)/i, '')));
              }
            } else {
              names.push(normalizeName(evt.player));
            }
          }
          if (evt.assist) {
            names.push(normalizeName(evt.assist));
          }

          names.forEach(name => {
            if (!name) return;
            const exists = roster.some(p => normalizeName(p.name).toLowerCase() === name.toLowerCase());
            if (!exists) {
              let position = 'MF';
              if (evt.type === 'goal') position = 'FW';
              else if (evt.type === 'red' && name.includes('Montes')) position = 'DF';
              
              const placeholderIdx = roster.findIndex(p => 
                p.name.includes('Player') || 
                p.name.includes('Diaz') || 
                p.name.includes('Ramirez') || 
                p.name.includes('Suarez') || 
                p.name.includes('Gomez') || 
                p.name.includes('Asamoah') || 
                p.name.includes('Trippier') ||
                p.name.includes('Tanaka')
              );
              
              const newPlayer = {
                name: `${position}: ${name}`,
                number: placeholderIdx !== -1 ? roster[placeholderIdx].number : (roster.length + 1),
                position
              };
              
              if (placeholderIdx !== -1) {
                roster[placeholderIdx] = newPlayer;
              } else {
                roster.push(newPlayer);
              }
            }
          });
        }
      });
    }

    return roster;
  };

  const homeRoster = getTeamRoster(match?.homeTeamId);
  const awayRoster = getTeamRoster(match?.awayTeamId);

  const matchTime = match ? new Date(match.dateTimeISO).getTime() : 0;
  const timeToKickoff = match ? matchTime - currentTime : 0;
  const lineupsAvailable = match ? (match.status !== 'Upcoming' || timeToKickoff <= 45 * 60 * 1000) : false;

  // Separate starters and subs dynamically based on realistic team formations
  const { formation: homeFormation, starters: homeStarters, subs: homeSubs } = match
    ? getTeamFormationAndLineup(match.homeTeamId, homeRoster)
    : { formation: '', starters: [], subs: [] };
  const { formation: awayFormation, starters: awayStarters, subs: awaySubs } = match
    ? getTeamFormationAndLineup(match.awayTeamId, awayRoster)
    : { formation: '', starters: [], subs: [] };

  // Compute current active starting XI by applying substitutions from match timeline events
  const activeHomeStarters = useMemo(() => {
    if (!match) return [];
    let active = [...homeStarters];
    let currentSubs = [...homeSubs];
    if (!match.events) return active;
    
    const subEvents = match.events
      .filter(e => e.type === 'sub' && e.teamId === match.homeTeamId)
      .sort((a, b) => a.minute - b.minute);

    subEvents.forEach(evt => {
      if (!evt.player) return;
      const parts = evt.player.split('/');
      if (parts.length === 2) {
        const outName = normalizeName(parts[0].replace(/\(Out\)/i, ''));
        const inName = normalizeName(parts[1].replace(/\(In\)/i, ''));

        const outIdx = active.findIndex(p => normalizeName(p.name).toLowerCase() === outName.toLowerCase());
        if (outIdx !== -1) {
          let inPlayer = currentSubs.find(p => normalizeName(p.name).toLowerCase() === inName.toLowerCase());
          if (!inPlayer) {
            inPlayer = {
              name: inName,
              number: 'SUB',
              position: active[outIdx].position
            };
          }
          const outPlayer = active[outIdx];
          active[outIdx] = inPlayer;
          currentSubs = currentSubs.map(p => p.number === inPlayer.number ? outPlayer : p);
        }
      }
    });
    return active;
  }, [homeStarters, homeSubs, match]);

  const activeAwayStarters = useMemo(() => {
    if (!match) return [];
    let active = [...awayStarters];
    let currentSubs = [...awaySubs];
    if (!match.events) return active;
    
    const subEvents = match.events
      .filter(e => e.type === 'sub' && e.teamId === match.awayTeamId)
      .sort((a, b) => a.minute - b.minute);

    subEvents.forEach(evt => {
      if (!evt.player) return;
      const parts = evt.player.split('/');
      if (parts.length === 2) {
        const outName = normalizeName(parts[0].replace(/\(Out\)/i, ''));
        const inName = normalizeName(parts[1].replace(/\(In\)/i, ''));

        const outIdx = active.findIndex(p => normalizeName(p.name).toLowerCase() === outName.toLowerCase());
        if (outIdx !== -1) {
          let inPlayer = currentSubs.find(p => normalizeName(p.name).toLowerCase() === inName.toLowerCase());
          if (!inPlayer) {
            inPlayer = {
              name: inName,
              number: 'SUB',
              position: active[outIdx].position
            };
          }
          const outPlayer = active[outIdx];
          active[outIdx] = inPlayer;
          currentSubs = currentSubs.map(p => p.number === inPlayer.number ? outPlayer : p);
        }
      }
    });
    return active;
  }, [awayStarters, awaySubs, match]);

  if (!match) return null;

  const getFormationCounts = (formationStr) => {
    const defaultCounts = { df: 4, mf: 3, fw: 3 };
    if (!formationStr) return defaultCounts;
    const parts = formationStr.split('-').map(Number);
    if (parts.length === 3) {
      return { df: parts[0], mf: parts[1], fw: parts[2] };
    } else if (parts.length === 4) {
      return { df: parts[0], mf: parts[1] + parts[2], fw: parts[3] };
    }
    return defaultCounts;
  };

  const homeCounts = getFormationCounts(homeFormation);
  const homeGK = activeHomeStarters.slice(0, 1);
  const homeDF = activeHomeStarters.slice(1, 1 + homeCounts.df);
  const homeMF = activeHomeStarters.slice(1 + homeCounts.df, 1 + homeCounts.df + homeCounts.mf);
  const homeFW = activeHomeStarters.slice(1 + homeCounts.df + homeCounts.mf, 1 + homeCounts.df + homeCounts.mf + homeCounts.fw);

  const awayCounts = getFormationCounts(awayFormation);
  const awayGK = activeAwayStarters.slice(0, 1);
  const awayDF = activeAwayStarters.slice(1, 1 + awayCounts.df);
  const awayMF = activeAwayStarters.slice(1 + awayCounts.df, 1 + awayCounts.df + awayCounts.mf);
  const awayFW = activeAwayStarters.slice(1 + awayCounts.df + awayCounts.mf, 1 + awayCounts.df + awayCounts.mf + awayCounts.fw);

  // Parse match events into a fast lookup map for overlays on the pitch
  const playerEventsMap = {};
  if (match.events) {
    match.events.forEach(evt => {
      if (evt.type === 'goal') {
        if (evt.player) {
          const scorerName = normalizeName(evt.player);
          if (!playerEventsMap[scorerName]) {
            playerEventsMap[scorerName] = { goals: 0, assists: 0, yellow: 0, red: false, subbedOut: false, subbedIn: false };
          }
          playerEventsMap[scorerName].goals += 1;
        }
        if (evt.assist) {
          const assisterName = normalizeName(evt.assist);
          if (!playerEventsMap[assisterName]) {
            playerEventsMap[assisterName] = { goals: 0, assists: 0, yellow: 0, red: false, subbedOut: false, subbedIn: false };
          }
          playerEventsMap[assisterName].assists += 1;
        }
      } else if (evt.type === 'yellow') {
        if (evt.player) {
          const name = normalizeName(evt.player);
          if (!playerEventsMap[name]) {
            playerEventsMap[name] = { goals: 0, assists: 0, yellow: 0, red: false, subbedOut: false, subbedIn: false };
          }
          playerEventsMap[name].yellow += 1;
        }
      } else if (evt.type === 'red') {
        if (evt.player) {
          const name = normalizeName(evt.player);
          if (!playerEventsMap[name]) {
            playerEventsMap[name] = { goals: 0, assists: 0, yellow: 0, red: false, subbedOut: false, subbedIn: false };
          }
          playerEventsMap[name].red = true;
        }
      } else if (evt.type === 'sub') {
        if (evt.player) {
          const parts = evt.player.split('/');
          if (parts.length === 2) {
            const outName = normalizeName(parts[0].replace(/\(Out\)/i, ''));
            const inName = normalizeName(parts[1].replace(/\(In\)/i, ''));
            
            if (!playerEventsMap[outName]) {
              playerEventsMap[outName] = { goals: 0, assists: 0, yellow: 0, red: false, subbedOut: false, subbedIn: false };
            }
            playerEventsMap[outName].subbedOut = true;
            playerEventsMap[outName].subbedOutMin = evt.minute;

            if (!playerEventsMap[inName]) {
              playerEventsMap[inName] = { goals: 0, assists: 0, yellow: 0, red: false, subbedOut: false, subbedIn: false };
            }
            playerEventsMap[inName].subbedIn = true;
            playerEventsMap[inName].subbedInMin = evt.minute;
          } else {
            const outName = normalizeName(evt.player.replace(/\(Out\)/i, ''));
            if (!playerEventsMap[outName]) {
              playerEventsMap[outName] = { goals: 0, assists: 0, yellow: 0, red: false, subbedOut: false, subbedIn: false };
            }
            playerEventsMap[outName].subbedOut = true;
            playerEventsMap[outName].subbedOutMin = evt.minute;
          }
        }
      }
    });
  }

  // Render node element on tactical pitch board
  const renderPlayerNode = (player, role) => {
    const name = normalizeName(player.name);
    const stats = playerEventsMap[name] || { goals: 0, assists: 0, yellow: 0, red: false, subbedOut: false, subbedIn: false };
    
    const isGK = player.position === 'GK';
    const colorClass = isGK 
      ? 'bg-amber-500 border-amber-305 text-slate-950 shadow-amber-600/30'
      : getTeamColorClass(role === 'home' ? match.homeTeamId : match.awayTeamId, role);

    return (
      <div key={player.number} className="relative flex flex-col items-center select-none">
        {/* Player Circle/Jersey */}
        <div className={`relative h-7.5 w-7.5 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black border-2 shadow-lg transition transform hover:scale-110 cursor-pointer ${colorClass}`}>
          {player.number}

          {/* Card Overlays */}
          {stats.red && (
            <span className="absolute -top-1 -right-0.5 flex h-3.5 w-2.5 bg-red-600 rounded-[1px] border border-red-400 shadow-sm animate-pulse" title="Red Card" />
          )}
          {!stats.red && stats.yellow > 0 && (
            <span className="absolute -top-1 -right-0.5 flex h-3.5 w-2.5 bg-yellow-500 rounded-[1px] border border-yellow-300 shadow-sm" title={`${stats.yellow} Yellow Card(s)`} />
          )}

          {/* Substitution Indicator Overlay */}
          {stats.subbedOut && (
            <span className="absolute -top-2 -left-1.5 text-[10px] drop-shadow-md" title={`Subbed out at ${stats.subbedOutMin}'`}>⬇️</span>
          )}
          {stats.subbedIn && (
            <span className="absolute -top-2 -left-1.5 text-[10px] drop-shadow-md" title={`Subbed in at ${stats.subbedInMin}'`}>⬆️</span>
          )}

          {/* Goal & Assist Icons */}
          {(stats.goals > 0 || stats.assists > 0) && (
            <span className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center bg-slate-950/90 rounded-full px-1 border border-slate-800 text-[8px] font-black py-0.5 space-x-0.5 shadow-md">
              {stats.goals > 0 && <span title={`${stats.goals} Goal(s)`}>⚽{stats.goals > 1 ? stats.goals : ''}</span>}
              {stats.assists > 0 && <span title={`${stats.assists} Assist(s)`}>👟{stats.assists > 1 ? stats.assists : ''}</span>}
            </span>
          )}
        </div>

        {/* Player Name Pill */}
        <span className="mt-1 sm:mt-1.5 px-1 sm:px-2 py-0.5 rounded bg-slate-950/70 border border-slate-800/40 text-[8px] sm:text-[9px] font-black text-slate-100 tracking-wider truncate max-w-[56px] sm:max-w-[72px] text-center shadow-md">
          {name}
        </span>
      </div>
    );
  };

  const renderRosterPlayerRow = (p) => {
    const name = normalizeName(p.name);
    const stats = playerEventsMap[name] || { goals: 0, assists: 0, yellow: 0, red: false, subbedOut: false, subbedIn: false };
    
    return (
      <div key={p.number} className="flex items-center justify-between text-[11px] py-1.5 border-b border-slate-200/40 dark:border-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/10 px-2 rounded-xl transition">
        <div className="flex items-center space-x-2.5">
          <span className="text-slate-500 font-mono w-4 font-bold text-left">#{p.number}</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold">{name}</span>
          
          {/* Event Icons */}
          {stats.goals > 0 && (
            <span className="flex items-center space-x-0.5 text-[10px]" title={`${stats.goals} Goal(s)`}>
              <span>⚽</span>
              {stats.goals > 1 && <span className="text-[9px] font-black text-amber-400">{stats.goals}</span>}
            </span>
          )}
          {stats.assists > 0 && (
            <span className="flex items-center space-x-0.5 text-[10px]" title={`${stats.assists} Assist(s)`}>
              <span>👟</span>
              {stats.assists > 1 && <span className="text-[9px] font-black text-emerald-400">{stats.assists}</span>}
            </span>
          )}
          {stats.red && <span className="h-3.5 w-2.5 bg-red-600 rounded-[1px] inline-block shadow-sm" title="Red Card" />}
          {!stats.red && stats.yellow > 0 && (
            <span className="relative flex items-center space-x-0.5">
              <span className="h-3.5 w-2.5 bg-yellow-500 rounded-[1px] inline-block shadow-sm" title={`${stats.yellow} Yellow Card(s)`} />
              {stats.yellow > 1 && <span className="text-[8px] font-bold text-yellow-500">{stats.yellow}</span>}
            </span>
          )}
          {stats.subbedOut && <span className="text-[10px]" title={`Subbed out at ${stats.subbedOutMin}'`}>🔄⬇️</span>}
          {stats.subbedIn && <span className="text-[10px]" title={`Subbed in at ${stats.subbedInMin}'`}>🔄⬆️</span>}
        </div>
        <span className="text-[8px] bg-slate-100 dark:bg-slate-800/60 border border-slate-250 dark:border-slate-700/50 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">{p.position}</span>
      </div>
    );
  };

  const renderBenchPlayerRow = (p) => {
    const name = normalizeName(p.name);
    const stats = playerEventsMap[name] || { goals: 0, assists: 0, yellow: 0, red: false, subbedOut: false, subbedIn: false };
    
    return (
      <div key={p.number} className="flex items-center justify-between text-[11px] py-1.5 border-b border-slate-200/40 dark:border-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/10 px-2 rounded-xl transition text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2.5">
          <span className="text-slate-400 dark:text-slate-600 font-mono w-4 font-bold text-left">#{p.number}</span>
          <span className="font-semibold">{name}</span>
          
          {/* Event Icons */}
          {stats.goals > 0 && (
            <span className="flex items-center space-x-0.5 text-[10px]" title={`${stats.goals} Goal(s)`}>
              <span>⚽</span>
              {stats.goals > 1 && <span className="text-[9px] font-black text-amber-400">{stats.goals}</span>}
            </span>
          )}
          {stats.assists > 0 && (
            <span className="flex items-center space-x-0.5 text-[10px]" title={`${stats.assists} Assist(s)`}>
              <span>👟</span>
              {stats.assists > 1 && <span className="text-[9px] font-black text-emerald-400">{stats.assists}</span>}
            </span>
          )}
          {stats.red && <span className="h-3.5 w-2.5 bg-red-600 rounded-[1px] inline-block shadow-sm" title="Red Card" />}
          {!stats.red && stats.yellow > 0 && (
            <span className="relative flex items-center space-x-0.5">
              <span className="h-3.5 w-2.5 bg-yellow-500 rounded-[1px] inline-block shadow-sm" title={`${stats.yellow} Yellow Card(s)`} />
              {stats.yellow > 1 && <span className="text-[8px] font-bold text-yellow-500">{stats.yellow}</span>}
            </span>
          )}
          {stats.subbedOut && <span className="text-[10px]" title={`Subbed out at ${stats.subbedOutMin}'`}>🔄⬇️</span>}
          {stats.subbedIn && <span className="text-[10px]" title={`Subbed in at ${stats.subbedInMin}'`}>🔄⬆️</span>}
        </div>
        <span className="text-[8px] bg-slate-100 dark:bg-slate-800/60 border border-slate-250 dark:border-slate-700/50 px-1.5 py-0.5 rounded text-slate-550 dark:text-slate-400 font-black uppercase tracking-wider">{p.position}</span>
      </div>
    );
  };

  // Generate H2H record deterministically
  const getH2HRecord = () => {
    return [
      { date: '2024-11-12', competition: 'International Friendly', score: `${match.homeTeam} 1 - 2 ${match.awayTeam}` },
      { date: '2022-06-18', competition: 'International Cup Group Stage', score: `${match.homeTeam} 2 - 2 ${match.awayTeam}` },
      { date: '2019-09-05', competition: 'International Friendly', score: `${match.homeTeam} 0 - 0 ${match.awayTeam}` }
    ];
  };

  // Generate stats or retrieve live simulated ones
  const getMatchStats = () => {
    const statsPossession = match.stats?.possession || [50, 50];
    const statsShots = match.stats?.shots || [0, 0];
    const statsShotsOnTarget = match.stats?.shotsOnTarget || [0, 0];
    const statsFouls = match.stats?.fouls || [0, 0];
    const matchEvents = match.events || [];

    return [
      { name: 'Possession %', home: statsPossession[0], away: statsPossession[1] },
      { name: 'Total Shots', home: statsShots[0], away: statsShots[1] },
      { name: 'Shots on Target', home: statsShotsOnTarget[0], away: statsShotsOnTarget[1] },
      { name: 'Fouls Committed', home: statsFouls[0], away: statsFouls[1] },
      { name: 'Yellow Cards', home: matchEvents.filter(e => e.type === 'yellow' && e.teamId === match.homeTeamId).length, away: matchEvents.filter(e => e.type === 'yellow' && e.teamId === match.awayTeamId).length },
      { name: 'Red Cards', home: matchEvents.filter(e => e.type === 'red' && e.teamId === match.homeTeamId).length, away: matchEvents.filter(e => e.type === 'red' && e.teamId === match.awayTeamId).length }
    ];
  };

  const stats = getMatchStats();
  const h2h = getH2HRecord();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-200/10 bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
        
        {/* Top Header Card */}
        <div className="relative p-6 border-b border-slate-200 dark:border-slate-800 bg-[linear-gradient(to_bottom,rgba(241,245,249,0.9),rgba(255,255,255,0.95))] dark:bg-[linear-gradient(to_bottom,rgba(15,23,42,0.8),rgba(2,6,23,0.95))]">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-805 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
              Match Details #{match.matchId} • Group {match.group || 'Knockouts'}
            </span>
            <div className="flex items-center justify-center space-x-6 py-3">
              {/* Home Team */}
              <div className="flex flex-col items-center w-1/3">
                <span className="text-4xl sm:text-5xl">
                  {getCountryFlag(match.homeTeamId, "w-12 h-8 sm:w-16 sm:h-11 shadow-md")}
                </span>
                <span className="mt-1.5 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate w-full">{getCountryName(match.homeTeamId)}</span>
              </div>

              {/* Score / Status */}
              <div className="flex flex-col items-center w-1/3">
                {match.status === 'Upcoming' ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl">
                    <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{match.timeIST}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{match.homeScore}</span>
                      <span className="text-slate-400 dark:text-slate-550 font-bold text-lg">-</span>
                      <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{match.awayScore}</span>
                    </div>
                    {match.homePenalties !== undefined && match.homePenalties !== null && (
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-205 dark:border-slate-700">
                        Penalties: {match.homePenalties} - {match.awayPenalties}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Status Badge */}
                <span className="mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300">
                  {match.status === 'LIVE' ? `${match.minute}' LIVE 🔴` : match.status}
                </span>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center w-1/3">
                <span className="text-4xl sm:text-5xl">
                  {getCountryFlag(match.awayTeamId, "w-12 h-8 sm:w-16 sm:h-11 shadow-md")}
                </span>
                <span className="mt-1.5 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate w-full">{getCountryName(match.awayTeamId)}</span>
              </div>
            </div>

            {/* Stadium / Location info */}
            <div className="flex justify-center space-x-4 text-[10px] font-semibold text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800/40">
              <span className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-slate-500" />
                <span>{match.stadium}, {match.city}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-slate-500" />
                <span>{match.dateIST}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-x-auto scrollbar-none">
          {[
            { id: 'timeline', label: 'Timeline', icon: List },
            { id: 'lineups', label: 'Lineups', icon: Users },
            { id: 'stats', label: 'Stats', icon: BarChart3 },
            { id: 'h2h', label: 'H2H', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-1 py-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition flex-shrink-0 min-w-[64px] ${
                  activeTab === tab.id
                    ? 'border-b-2 border-amber-600 text-amber-600 dark:text-amber-400 bg-slate-200/40 dark:bg-slate-800/30'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/20 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6">

          {/* 1. TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {match.events && match.events.length > 0 ? (
                <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6 py-2">
                  {match.events.map((evt, idx) => {
                    const isHome = evt.teamId === match.homeTeamId;
                    
                    return (
                      <div key={idx} className="relative">
                        {/* Event Dot Icon indicator */}
                        <span className="absolute -left-[31px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                          {evt.type === 'goal' ? '⚽' : evt.type === 'yellow' ? (
                            <span className="h-3 w-2 bg-yellow-500 rounded-[1px] border border-yellow-400 shadow-sm" title="Yellow Card" />
                          ) : evt.type === 'red' ? (
                            <span className="h-3 w-2 bg-red-600 rounded-[1px] border border-red-500 shadow-sm animate-pulse" title="Red Card" />
                          ) : evt.type === 'sub' ? '🔄' : '🥅'}
                        </span>
                        
                        <div className={`flex flex-col ${isHome ? 'items-start' : 'items-start sm:items-end sm:text-right'}`}>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400">{evt.minute}'</span>
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{evt.player || 'Goal Scored'}</span>
                          </div>
                          {evt.type === 'goal' && evt.assist && (
                            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold -mt-0.5">Assist by {evt.assist}</p>
                          )}
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{evt.detail}</p>
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
                            {evt.teamId === match.homeTeamId ? `${match.homeTeam}` : `${match.awayTeam}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 font-medium text-xs">
                  {match.status === 'Upcoming' ? 'The match timeline will populate live once the game kicks off.' : 'No major match events recorded.'}
                </div>
              )}
            </div>
          )}

          {/* 2. LINEUPS */}
          {activeTab === 'lineups' && (
            <div className="space-y-6">
              {!lineupsAvailable ? (
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/30 p-8 text-center text-slate-500 dark:text-slate-400 font-medium text-xs flex flex-col items-center justify-center space-y-3">
                  <span className="text-3xl">📋</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Lineups Not Yet Announced</span>
                  <p className="max-w-md text-[11px] leading-relaxed">
                    Official starting lineups and formations are typically released **30–45 minutes prior to kickoff**. Please check back closer to match time!
                  </p>
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                    Expected update: ~45m before kickoff
                  </span>
                </div>
              ) : (
                <>
                  {/* Pitch Visual Grid - scrollable on mobile */}
                  <div className="overflow-x-auto -mx-1">
                  <div className="relative rounded-2xl border border-emerald-500/20 bg-[repeating-linear-gradient(to_bottom,#0e291b,#0e291b_20px,#133724_20px,#133724_40px)] p-2 sm:p-4 h-[300px] sm:h-[510px] overflow-hidden flex flex-col justify-between shadow-2xl min-w-[300px]">
                    {/* Pitch lines */}
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-white/10 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 h-20 w-20 rounded-full border border-white/10 -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-12 w-36 border-x border-b border-white/10 rounded-b-2xl"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-12 w-36 border-x border-t border-white/10 rounded-t-2xl"></div>

                    {/* Home formation (top half - playing downward) */}
                    <div className="relative z-10 flex flex-col h-1/2 justify-between pb-1">
                      {/* Goalkeeper row */}
                      <div className="flex justify-center">
                        {homeGK.map(p => renderPlayerNode(p, 'home'))}
                      </div>
                      
                      {/* Defender row */}
                      <div className="flex justify-around px-2">
                        {homeDF.map(p => renderPlayerNode(p, 'home'))}
                      </div>
                      
                      {/* Midfield row */}
                      <div className="flex justify-around px-8">
                        {homeMF.map(p => renderPlayerNode(p, 'home'))}
                      </div>
                      
                      {/* Forward row */}
                      <div className="flex justify-around px-16">
                        {homeFW.map(p => renderPlayerNode(p, 'home'))}
                      </div>
                    </div>

                    {/* Away formation (bottom half - playing upward) */}
                    <div className="relative z-10 flex flex-col h-1/2 justify-between pt-1">
                      {/* Forward row */}
                      <div className="flex justify-around px-16">
                        {awayFW.map(p => renderPlayerNode(p, 'away'))}
                      </div>

                      {/* Midfield row */}
                      <div className="flex justify-around px-8">
                        {awayMF.map(p => renderPlayerNode(p, 'away'))}
                      </div>

                      {/* Defender row */}
                      <div className="flex justify-around px-2">
                        {awayDF.map(p => renderPlayerNode(p, 'away'))}
                      </div>

                      {/* Goalkeeper row */}
                      <div className="flex justify-center">
                        {awayGK.map(p => renderPlayerNode(p, 'away'))}
                      </div>
                    </div>
                  </div>
                  </div>{/* end overflow-x-auto */}

                  {/* Roster Squad List Details (Starting XI vs Bench) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Home squad */}
                    <div>
                      <h5 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest border-b border-slate-205 dark:border-slate-800 pb-1.5 mb-2">{match.homeTeam} Roster ({homeFormation})</h5>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1">Starting XI</p>
                          <div className="space-y-0.5">
                            {homeStarters.map(p => renderRosterPlayerRow(p))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-[9px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1">Substitutes (Bench)</p>
                          <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800/40 pl-2">
                            {homeSubs.map(p => renderBenchPlayerRow(p))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Away squad */}
                    <div>
                      <h5 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest border-b border-slate-205 dark:border-slate-800 pb-1.5 mb-2">{match.awayTeam} Roster ({awayFormation})</h5>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1">Starting XI</p>
                          <div className="space-y-0.5">
                            {awayStarters.map(p => renderRosterPlayerRow(p))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-[9px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-wider mb-1">Substitutes (Bench)</p>
                          <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800/40 pl-2">
                            {awaySubs.map(p => renderBenchPlayerRow(p))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 3. STATISTICS */}
          {activeTab === 'stats' && (
            <div className="space-y-4 py-2">
              {stats.map((stat, idx) => {
                const total = stat.home + stat.away;
                const homePct = total > 0 ? (stat.home / total) * 100 : 50;
                const awayPct = total > 0 ? (stat.away / total) * 100 : 50;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                      <span className="text-amber-600 dark:text-amber-400">{stat.home}</span>
                      <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px]">{stat.name}</span>
                      <span className="text-rose-600 dark:text-rose-400">{stat.away}</span>
                    </div>
                    {/* Visual Bar progress comparison */}
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                      <div className="h-full bg-amber-500" style={{ width: `${homePct}%` }}></div>
                      <div className="h-full bg-rose-500" style={{ width: `${awayPct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. HEAD TO HEAD (H2H) */}
          {activeTab === 'h2h' && (
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2">Previous Encounters</h5>
              <div className="space-y-3">
                {h2h.map((meeting, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800 dark:text-slate-300">{meeting.score}</p>
                      <p className="text-[9px] text-slate-500 font-medium">{meeting.competition}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{meeting.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-2 sm:gap-4 safe-bottom">
          {/* Favorite Team Trigger */}
          <button
            onClick={() => onToggleFavorite(match.homeTeamId)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:border-amber-500/30 dark:border-slate-800 dark:hover:border-amber-500/30 text-slate-550 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400 text-amber-500 dark:text-amber-400' : ''}`} />
            <span>{isFavorite ? 'Star Favorited' : `Star ${match.homeTeam}`}</span>
          </button>

          {/* Upcoming actions */}
          {match.status === 'Upcoming' ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleReminder(match.matchId)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:border-amber-500/30 dark:border-slate-800 dark:hover:border-amber-500/30 text-slate-550 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
              >
                <Bell className={`h-4 w-4 ${isReminderSet ? 'text-amber-600 dark:text-amber-400 fill-current' : ''}`} />
                <span>{isReminderSet ? 'Reminder On' : 'Remind Kickoff'}</span>
              </button>
              
              <button
                onClick={() => onExportICS(match)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-sky-600 dark:text-sky-400 transition"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Add to Calendar</span>
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Stats updated in real-time</span>
          )}
        </div>

      </div>
    </div>
  );
}
