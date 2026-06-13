import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Timer, Trophy, Flag, AlertCircle } from 'lucide-react';
import { getCountryFlag } from '../utils/countryHelper.jsx';

export default function NotificationToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 w-full max-w-md px-4 sm:px-0 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onDismiss }) {
  const { id, title, message, type, match } = toast;

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  // Set style parameters based on notification type
  let iconBg = 'bg-amber-500/10 dark:bg-amber-500/20';
  let iconColor = 'text-amber-600 dark:text-amber-400';
  let Icon = Timer;
  let borderColor = 'border-l-amber-500';

  if (type === 'goal') {
    iconBg = 'bg-emerald-500/10 dark:bg-emerald-500/20';
    iconColor = 'text-emerald-600 dark:text-emerald-400';
    Icon = Trophy;
    borderColor = 'border-l-emerald-500';
  } else if (type === 'finished') {
    iconBg = 'bg-indigo-500/10 dark:bg-indigo-500/20';
    iconColor = 'text-indigo-600 dark:text-indigo-400';
    Icon = Flag;
    borderColor = 'border-l-indigo-500';
  } else if (type === 'error') {
    iconBg = 'bg-rose-500/10 dark:bg-rose-500/20';
    iconColor = 'text-rose-600 dark:text-rose-400';
    Icon = AlertCircle;
    borderColor = 'border-l-rose-500';
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9, x: 50 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.85, x: 100, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 20, stiffness: 150 }}
      className={`pointer-events-auto flex w-full border-l-4 ${borderColor} bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl dark:shadow-2xl backdrop-blur-md overflow-hidden transition-colors duration-300`}
    >
      <div className="p-4 flex items-start gap-3 w-full">
        {/* Left Column: Icon */}
        <div className={`flex-shrink-0 p-2 rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-5 w-5 animate-pulse" />
        </div>

        {/* Middle Column: Content */}
        <div className="flex-grow min-w-0 pr-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            {title}
          </h4>
          <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-350 whitespace-pre-line leading-relaxed">
            {message}
          </p>

          {/* Mini Match Scoreboard Display inside Toast */}
          {match && (
            <div className="mt-2.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 max-w-[280px]">
              <div className="flex items-center gap-1.5 truncate">
                {getCountryFlag(match.homeTeamId, "w-5 h-3.5")}
                <span className="text-[10px] font-bold text-slate-655 dark:text-slate-400 truncate max-w-[65px]">{match.homeTeam}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-200/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-800 dark:text-slate-200">
                {match.homeScore} - {match.awayScore}
                {match.homePenalties !== undefined && ` (${match.homePenalties}-${match.awayPenalties})`}
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[10px] font-bold text-slate-655 dark:text-slate-400 truncate max-w-[65px]">{match.awayTeam}</span>
                {getCountryFlag(match.awayTeamId, "w-5 h-3.5")}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Close Button */}
        <div className="flex-shrink-0 self-start">
          <button
            onClick={() => onDismiss(id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
