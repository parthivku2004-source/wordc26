import { Star, Bell, BellOff, Calendar, MapPin } from 'lucide-react';
import { getCountryFlag } from '../utils/countryHelper.jsx';

export default function FixtureCard({ 
  match, 
  onViewDetails, 
  isFavorite, 
  onToggleFavorite, 
  isReminderSet, 
  onToggleReminder 
}) {

  const getStatusColor = (status) => {
    switch (status) {
      case 'LIVE':
      case 'Extra Time':
      case 'Penalties':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/30 font-bold';
      case 'Half Time':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold';
      case 'Finished':
        return 'bg-slate-800 text-slate-400 border border-slate-700/50';
      default:
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
    }
  };

  // Client-side ICS generator
  const handleExportICS = (e) => {
    e.stopPropagation();
    
    // ICS date strings
    const dtStart = new Date(match.dateTimeISO).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtEnd = new Date(new Date(match.dateTimeISO).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Global Cup 2026 Live Tracker//EN',
      'BEGIN:VEVENT',
      `UID:match-${match.matchId}@globalcup2026.com`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:⚽ Global Cup 2026: ${match.homeTeam} vs ${match.awayTeam}`,
      `DESCRIPTION:Match #${match.matchId} - ${match.stage} (Group ${match.group || 'N/A'}) at ${match.stadium}, ${match.city}.`,
      `LOCATION:${match.stadium}, ${match.city}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Match_${match.matchId}_${match.homeTeamId}_vs_${match.awayTeamId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLive = match.status === 'LIVE' || match.status === 'Half Time' || match.status === 'Extra Time' || match.status === 'Penalties';  return (
    <div 
      onClick={() => onViewDetails(match.matchId)}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 backdrop-blur-md cursor-pointer hover:shadow-xl ${
        isFavorite 
          ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-955/10 hover:border-amber-400' 
          : 'border-slate-200/80 bg-white/70 dark:border-slate-200/10 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700/60'
      }`}
    >
      {/* Background highlight glow for Live games */}
      {isLive && (
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.06),transparent_85%)] animate-pulse"></div>
      )}

      {/* Top Bar: Match Info, Date Badge & Status */}
      <div className="relative z-10 flex flex-col border-b border-slate-200/60 dark:border-slate-200/5">
        {/* Date + Time highlighted row */}
        <div className={`flex items-center justify-between px-4 py-2 ${
          match.status === 'LIVE' || match.status === 'Half Time' || match.status === 'Extra Time' || match.status === 'Penalties'
            ? 'bg-rose-500/8 dark:bg-rose-500/10'
            : match.status === 'Finished'
            ? 'bg-slate-100/70 dark:bg-slate-800/30'
            : 'bg-amber-500/6 dark:bg-amber-500/8'
        }`}>
          <div className="flex items-center space-x-1.5">
            <Calendar className={`h-3 w-3 flex-shrink-0 ${
              match.status === 'LIVE' || match.status === 'Half Time' || match.status === 'Extra Time' || match.status === 'Penalties'
                ? 'text-rose-500'
                : match.status === 'Finished'
                ? 'text-slate-400'
                : 'text-amber-500'
            }`} />
            <span className={`text-[11px] font-black tracking-wide ${
              match.status === 'LIVE' || match.status === 'Half Time' || match.status === 'Extra Time' || match.status === 'Penalties'
                ? 'text-rose-600 dark:text-rose-400'
                : match.status === 'Finished'
                ? 'text-slate-500 dark:text-slate-400'
                : 'text-amber-700 dark:text-amber-400'
            }`}>
              {match.dateIST}
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
            <span className={`text-[11px] font-black ${
              match.status === 'Upcoming'
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {match.timeIST} IST
            </span>
          </div>
          {/* Status Badge */}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase ${getStatusColor(match.status)}`}>
            {match.status === 'LIVE' ? (
              <span className="flex items-center space-x-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-455 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-600"></span>
                </span>
                <span>{match.minute}' LIVE 🔴</span>
              </span>
            ) : match.status}
          </span>
        </div>
        {/* Match meta row */}
        <div className="flex items-center px-4 py-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-700 dark:text-slate-300">Match #{match.matchId}</span>
          <span className="mx-1.5">•</span>
          <span>{match.stage} {match.group ? `(Group ${match.group})` : ''}</span>
        </div>
      </div>

      {/* Main Card Content: Teams & Scores */}
      <div className="relative z-10 grid grid-cols-12 items-center gap-2 px-4 py-5 md:py-6">
        
        {/* Home Team */}
        <div className="col-span-5 flex flex-col items-center justify-center text-center">
          <span className="text-4xl md:text-5xl transition-transform duration-300 group-hover:scale-110" role="img" aria-label={match.homeTeam}>
            {getCountryFlag(match.homeTeamId)}
          </span>
          <span className="mt-2 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-slate-100 truncate w-full max-w-[110px]">
            {match.homeTeam}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(match.homeTeamId);
            }}
            className="mt-1 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-405 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 transition"
            title="Star Favorite Team"
          >
            <Star className={`h-3.5 w-3.5 ${isFavorite ? 'fill-amber-500 text-amber-550 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Score / Time */}
        <div className="col-span-2 flex flex-col items-center justify-center text-center">
          {match.status === 'Upcoming' ? (
            <div className="flex flex-col items-center">
              <span className="text-xs md:text-sm font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                {match.timeIST}
              </span>
              <span className="mt-1.5 text-[10px] text-slate-500 font-semibold tracking-tighter">
                IST
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-1.5 md:space-x-2.5">
                <span className={`text-2xl md:text-3xl font-black ${isLive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {match.homeScore}
                </span>
                <span className="text-slate-400 dark:text-slate-550 font-bold text-sm">-</span>
                <span className={`text-2xl md:text-3xl font-black ${isLive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {match.awayScore}
                </span>
              </div>
              {match.status === 'Half Time' && (
                <span className="mt-1 text-[9px] font-bold text-amber-600 dark:text-amber-500 tracking-wider uppercase animate-pulse">HT</span>
              )}
              {match.homePenalties !== undefined && match.homePenalties !== null && (
                <span className="mt-1 text-[10px] font-extrabold text-slate-500 dark:text-slate-450 uppercase tracking-tight">
                  (Pen: {match.homePenalties}-{match.awayPenalties})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-5 flex flex-col items-center justify-center text-center">
          <span className="text-4xl md:text-5xl transition-transform duration-300 group-hover:scale-110" role="img" aria-label={match.awayTeam}>
            {getCountryFlag(match.awayTeamId)}
          </span>
          <span className="mt-2 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-slate-100 truncate w-full max-w-[110px]">
            {match.awayTeam}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(match.awayTeamId);
            }}
            className="mt-1 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-405 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 transition"
            title="Star Favorite Team"
          >
            <Star className={`h-3.5 w-3.5 ${isFavorite ? 'fill-amber-500 text-amber-555 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
          </button>
        </div>

      </div>

      {/* Footer: Location & Action Buttons */}
      <div className="relative z-10 flex items-center justify-between border-t border-slate-200/60 bg-slate-50/50 dark:bg-slate-950/20 px-4 py-2 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
        <div className="flex items-center space-x-1 truncate max-w-[180px] sm:max-w-none">
          <MapPin className="h-3 w-3 text-slate-450 dark:text-slate-500 flex-shrink-0" />
          <span className="truncate">{match.stadium}, {match.city}</span>
        </div>
        
        <div className="flex items-center">
          {/* Utilities for Upcoming */}
          {match.status === 'Upcoming' && (
            <div className="flex items-center space-x-2">
              {/* Reminder toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleReminder(match.matchId);
                }}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-405 dark:text-slate-500 hover:text-amber-550 dark:hover:text-amber-400 transition"
                title={isReminderSet ? "Remove Reminder" : "Set Match Reminder"}
              >
                {isReminderSet ? <BellOff className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" /> : <Bell className="h-3.5 w-3.5" />}
              </button>

              {/* ICS Export */}
              <button
                onClick={handleExportICS}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-405 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition"
                title="Export to Calendar (.ics)"
              >
                <Calendar className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
