import { useState, useEffect, useMemo } from 'react';
import { Trophy, PlayCircle, X } from 'lucide-react';
import { getCountryFlag, getCountryName } from '../utils/countryHelper.jsx';

function TrophyIcon() {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/trophy.jpg';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If white/near-white, set transparent (threshold 225 for JPEGs)
          if (r > 225 && g > 225 && b > 225) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setImgSrc(canvas.toDataURL());
      } catch (e) {
        console.error("Canvas error:", e);
        setImgSrc('/trophy.jpg');
      }
    };
    img.onerror = () => {
      setImgSrc('/trophy.jpg');
    };
  }, []);

  if (!imgSrc) {
    return <div className="h-16 sm:h-20 md:h-24 lg:h-28 w-12 sm:w-16 md:w-20 lg:w-24 animate-pulse bg-slate-200 dark:bg-slate-800/60 rounded-xl shrink-0" />;
  }

  return (
    <img 
      src={imgSrc} 
      alt="Cup Trophy" 
      className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain shrink-0 filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.25)]"
    />
  );
}

export default function Hero({ fixtures, onViewMatch, onActiveLiveGamesClick, onMatchesCompletedClick }) {
  const [now, setNow] = useState(new Date());
  const [showScorers, setShowScorers] = useState(false);

  // Compute top scorers
  const scorers = useMemo(() => {
    const counts = {};
    fixtures.forEach(match => {
      if (match.events) {
        match.events.forEach(event => {
          if (event.type === 'goal' && event.player) {
            const key = `${event.player.replace(/^(GK|DF|MF|FW):\s*/, '')} (${event.teamId})`;
            counts[key] = (counts[key] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(counts)
      .map(([playerWithTeam, goals]) => {
        const match = playerWithTeam.match(/(.+) \((.+)\)/);
        const name = match ? match[1] : playerWithTeam;
        const teamId = match ? match[2] : '';
        return { name, teamId, goals };
      })
      .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
  }, [fixtures]);
  
  // Update local clock every second for countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const totalMatches = fixtures.length;
  const finishedMatches = fixtures.filter(m => m.status === 'Finished').length;
  const liveMatches = fixtures.filter(m => m.status === 'LIVE' || m.status === 'Half Time' || m.status === 'Extra Time' || m.status === 'Penalties').length;
  const totalGoals = fixtures.reduce((acc, m) => acc + (m.homeScore || 0) + (m.awayScore || 0), 0);

  // Find next upcoming match
  const upcomingMatches = fixtures
    .filter(m => m.status === 'Upcoming')
    .map(m => ({ ...m, dateObj: new Date(m.dateTimeISO) }))
    .filter(m => m.dateObj > now)
    .sort((a, b) => a.dateObj - b.dateObj);

  const nextMatch = upcomingMatches[0] || null;

  // Next 8 matches in order (including live and upcoming matches)
  const nextDayMatches = useMemo(() => {
    return fixtures
      .filter(m => m.status !== 'Finished')
      .map(m => ({ ...m, dateObj: new Date(m.dateTimeISO) }))
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 8);
  }, [fixtures]);

  // Countdown to Final (July 19, 2026 23:30:00 IST)
  const finalDate = new Date("2026-07-19T23:30:00+05:30");
  const getFinalCountdown = () => {
    const diff = finalDate - now;
    if (diff <= 0) return { days: 0, hrs: 0, mins: 0, secs: 0 };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hrs, mins, secs };
  };

  const finalTimeLeft = getFinalCountdown();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-200/10 bg-white dark:bg-slate-950 px-4 py-6 shadow-xl dark:shadow-2xl sm:px-8 sm:py-10 md:px-12 md:py-16">
      
      {/* Stadium-inspired background grid & radial glow */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_bottom,rgba(241,245,249,0.3),rgba(255,255,255,0.95))] dark:bg-[linear-gradient(to_bottom,rgba(15,23,42,0.3),rgba(2,6,23,0.95))]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.15),transparent_60%)]"></div>
        <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px]"></div>
        <div className="absolute -right-1/4 -bottom-1/4 h-96 w-96 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[100px]"></div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        
        {/* Left Column: Heading, Final Countdown & Stats */}
        <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/25 bg-amber-500/5 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 dark:bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-600 dark:bg-amber-500"></span>
            </span>
            <span>UNITED 2026: USA • CANADA • MEXICO</span>
          </div>

          <h2 className="flex items-center gap-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-850 dark:text-slate-100 md:text-4xl lg:text-5xl">
            <TrophyIcon />
            <span>CUP <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-emerald-550 dark:from-amber-400 dark:via-yellow-300 dark:to-emerald-400 bg-clip-text text-transparent">2026</span></span>
          </h2>
          
          <p className="max-w-xl text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Track fixtures, live scores, standings, and match events in real-time. Experience the expanded 48-team tournament live from your dashboard.
          </p>

          {/* Final Countdown Widget */}
          <div className="pt-2">
            <p className="text-xs sm:text-sm font-extrabold tracking-widest text-slate-450 dark:text-slate-500 uppercase mb-3">Countdown to the Final</p>
            <div className="flex space-x-3 sm:space-x-5">
              {[
                { label: 'Days', value: finalTimeLeft.days },
                { label: 'Hours', value: finalTimeLeft.hrs },
                { label: 'Mins', value: finalTimeLeft.mins },
                { label: 'Secs', value: finalTimeLeft.secs },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-sm dark:shadow-lg">
                  <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">{String(item.value).padStart(2, '0')}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-450 dark:text-slate-500 uppercase mt-0.5">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div 
              onClick={() => setShowScorers(true)}
              className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white/70 hover:bg-white dark:bg-slate-900/30 dark:hover:bg-slate-900/50 p-3 backdrop-blur-md shadow-sm dark:shadow-md cursor-pointer hover:border-amber-500/30 hover:shadow-md transition duration-200"
            >
              <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Total Goals</p>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-black text-slate-800 dark:text-slate-100">{totalGoals}</span>
                <span className="text-[9px] font-bold text-emerald-605 dark:text-emerald-555">⚽ Active</span>
              </div>
            </div>
            <div 
              onClick={onMatchesCompletedClick}
              className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white/70 hover:bg-white dark:bg-slate-900/30 dark:hover:bg-slate-900/50 p-3 backdrop-blur-md shadow-sm dark:shadow-md cursor-pointer hover:border-amber-500/30 hover:shadow-md transition duration-200"
            >
              <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Matches Completed</p>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-black text-slate-800 dark:text-slate-100">{finishedMatches}</span>
                <span className="text-[9px] font-bold text-slate-450 dark:text-slate-400">/ {totalMatches}</span>
              </div>
            </div>
            <div 
              onClick={onActiveLiveGamesClick}
              className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white/70 hover:bg-white dark:bg-slate-900/30 dark:hover:bg-slate-900/50 p-3 backdrop-blur-md shadow-sm dark:shadow-md cursor-pointer hover:border-amber-500/30 hover:shadow-md transition duration-200"
            >
              <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Active Live Games</p>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 animate-pulse">{liveMatches}</span>
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500">🔴 Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Next Match */}
        <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            {/* Next Match(es) Card */}
          {nextDayMatches.length > 0 && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/60 p-5 sm:p-6 backdrop-blur-lg shadow-lg dark:shadow-2xl transition duration-300">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-200/80 dark:border-slate-800/60">
                <span className="text-xs sm:text-sm font-extrabold tracking-widest text-amber-600 dark:text-amber-400 uppercase flex items-center space-x-2">
                  <PlayCircle className="h-4.5 w-4.5 text-amber-500 dark:text-amber-400 fill-current animate-pulse" />
                  <span>Next Upcoming Matches</span>
                </span>
                <span className="text-xs text-slate-550 dark:text-slate-400 font-extrabold uppercase bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200/55 dark:border-slate-700/50">
                  {nextDayMatches.length} {nextDayMatches.length === 1 ? 'Match' : 'Matches'}
                </span>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-none">
                {nextDayMatches.map((match) => {
                  // Calculate countdown for this match
                  const diff = match.dateObj - now;
                  let countdownStr = '';
                  if (diff > 0) {
                    const hrs = Math.floor(diff / (1000 * 60 * 60));
                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const secs = Math.floor((diff % (1000 * 60)) / 1000);
                    countdownStr = `${String(hrs).padStart(2, '0')}h : ${String(mins).padStart(2, '0')}m : ${String(secs).padStart(2, '0')}s`;
                  }

                  const isLive = match.status === 'LIVE' || match.status === 'Half Time' || match.status === 'Extra Time' || match.status === 'Penalties';

                  return (
                    <div
                      key={match.matchId}
                      onClick={() => onViewMatch(match.matchId)}
                      className="group/item relative flex flex-col p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/20 hover:border-amber-500/30 dark:hover:border-amber-500/20 hover:bg-slate-100 dark:hover:bg-slate-900/40 transition duration-200 cursor-pointer"
                    >
                      {/* Match Header */}
                      <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-3">
                        <span>Match #{match.matchId} • {match.stage} {match.group ? `(Group ${match.group})` : ''}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-extrabold">{match.dateIST} • {match.timeIST} IST</span>
                      </div>
                                         {/* Teams & Flags */}
                      <div className="flex items-center justify-between py-2 text-slate-805 dark:text-slate-100">
                        <div className="flex items-center space-x-3 w-[42%] min-w-0">
                          {getCountryFlag(match.homeTeamId, "w-8 h-5.5 sm:w-10 sm:h-7 shadow-sm")}
                          <span className="text-xs sm:text-sm md:text-base font-extrabold truncate">{match.homeTeam}</span>
                        </div>
                        
                        {(isLive || match.status === 'Finished') ? (
                          <span className={`text-sm sm:text-base md:text-lg font-black px-2.5 py-0.5 rounded-xl border shadow-sm ${
                            isLive 
                              ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25 animate-pulse' 
                              : 'text-slate-655 dark:text-slate-350 bg-slate-100 dark:bg-slate-805 border-slate-200 dark:border-slate-700/50'
                          }`}>
                            {match.homeScore} - {match.awayScore}
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 dark:text-slate-600 uppercase px-1">VS</span>
                        )}

                        <div className="flex items-center space-x-3 justify-end w-[42%] min-w-0">
                          <span className="text-xs sm:text-sm md:text-base font-extrabold truncate text-right">{match.awayTeam}</span>
                          {getCountryFlag(match.awayTeamId, "w-8 h-5.5 sm:w-10 sm:h-7 shadow-sm")}
                        </div>
                      </div>

                      {/* Countdown / Live Indicator Row */}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/40 dark:border-slate-800/30">
                        <span className="text-xs text-slate-450 dark:text-slate-500 font-bold uppercase">Status</span>
                        {match.status === 'Finished' ? (
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            FT
                          </span>
                        ) : isLive ? (
                          <span className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase flex items-center space-x-1 animate-pulse">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-450 opacity-75"></span>
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-600"></span>
                            </span>
                            <span>{match.status === 'LIVE' ? `${match.minute}' LIVE` : match.status}</span>
                          </span>
                        ) : countdownStr ? (
                          <span className="text-sm sm:text-base font-black text-slate-700 dark:text-slate-200 font-mono tracking-wider">
                            {countdownStr}
                          </span>
                        ) : (
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">
                            Starting soon
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Golden Boot / Top Scorers Modal Overlay */}
      {showScorers && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl relative space-y-4 max-h-[85vh] overflow-hidden flex flex-col">
            {/* Close button */}
            <button 
              onClick={() => setShowScorers(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-405 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-805 dark:hover:text-slate-100 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Trophy className="h-5 w-5 text-amber-550 dark:text-amber-400" />
              <div>
                <h3 className="text-sm font-black text-slate-850 dark:text-slate-100 uppercase tracking-widest">Tournament Top Scorers</h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase -mt-0.5">Golden Boot Race</p>
              </div>
            </div>

            {/* List of Scorers */}
            <div className="flex-1 overflow-y-auto max-h-72 sm:max-h-80 pr-1 space-y-2.5">
              {scorers.length > 0 ? (
                scorers.map((scorer, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-950/80 transition duration-200 text-slate-800 dark:text-slate-200 animate-fade-in">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 w-4">{idx + 1}.</span>
                      <span className="text-sm">{getCountryFlag(scorer.teamId, "w-5 h-3.5 shadow-sm")}</span>
                      <div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200">{scorer.name}</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase">{getCountryName(scorer.teamId)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">{scorer.goals}</span>
                      <span className="text-[10px] text-slate-500 font-bold">⚽</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 font-semibold">
                  No goals have been scored yet in the tournament.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
