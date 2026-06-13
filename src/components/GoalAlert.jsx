import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getCountryFlag } from '../utils/countryHelper.jsx';

export default function GoalAlert({ alertsQueue, onDismissAlert }) {
  const currentAlert = alertsQueue[0] || null;

  const handleClose = () => {
    if (currentAlert) {
      onDismissAlert(currentAlert.alertId);
    }
  };

  const isFinished = currentAlert?.type === 'finished';

  // Handle auto-dismiss timer when a new alert becomes active
  useEffect(() => {
    if (currentAlert) {
      const displayDuration = isFinished ? 7000 : 5000;
      const timer = setTimeout(() => {
        onDismissAlert(currentAlert.alertId);
      }, displayDuration);

      return () => clearTimeout(timer);
    }
  }, [currentAlert, onDismissAlert, isFinished]);

  return (
    <AnimatePresence>
      {currentAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          
          <motion.div
            initial={{ scale: 0.3, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className={`relative w-full max-w-md mx-auto overflow-hidden rounded-3xl border ${
              isFinished 
                ? 'border-indigo-500/40 shadow-[0_0_50px_rgba(99,102,241,0.25)] bg-[linear-gradient(to_bottom,rgba(15,23,42,0.95),rgba(2,6,23,0.98)),linear-gradient(to_bottom,rgba(99,102,241,0.1),transparent)]' 
                : 'border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] bg-[linear-gradient(to_bottom,rgba(15,23,42,0.95),rgba(2,6,23,0.98)),linear-gradient(to_bottom,rgba(16,185,129,0.1),transparent)]'
            } p-6 sm:p-8 text-center backdrop-blur-lg`}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer z-10 border border-slate-700/30"
              title="Close Alert"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Flashing Laser Line Effect */}
            <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${
              isFinished ? 'from-indigo-500 via-purple-500 to-pink-500' : 'from-emerald-500 via-amber-500 to-rose-500'
            } animate-pulse`}></div>

            {isFinished ? (
              <>
                {/* Trophy Graphic & Match Finished Title */}
                <motion.div
                  initial={{ scale: 0.5, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-5xl mb-2 filter drop-shadow-lg animate-bounce-slow" role="img" aria-label="Trophy">🏆</span>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 uppercase drop-shadow-md">
                    MATCH FINISHED
                  </h3>
                </motion.div>

                {/* Winner Info details card */}
                <div className="relative mt-4 py-4 px-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner text-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-30"></div>
                  <p className="relative z-10 text-base sm:text-lg font-extrabold text-slate-100">
                    {currentAlert.homeScore === currentAlert.awayScore && currentAlert.homePenalties === undefined ? (
                      <span className="text-indigo-300">⚔️ It's a Draw!</span>
                    ) : (
                      <>
                        {currentAlert.homeScore > currentAlert.awayScore || (currentAlert.homePenalties !== undefined && currentAlert.homePenalties > currentAlert.awayPenalties) ? (
                          <span className="text-amber-400">🎉 {currentAlert.homeTeam} Wins!</span>
                        ) : (
                          <span className="text-amber-400">🎉 {currentAlert.awayTeam} Wins!</span>
                        )}
                      </>
                    )}
                  </p>
                  {currentAlert.homePenalties !== undefined ? (
                    <div className="relative z-10 inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                      Won on Penalties ({currentAlert.homePenalties} - {currentAlert.awayPenalties})
                    </div>
                  ) : (
                    <div className="relative z-10 inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Full Time Result
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Goal Title */}
                <motion.div
                  initial={{ scale: 0.5, rotate: -15 }}
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="inline-block"
                >
                  <h3 className="text-4xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-350 to-emerald-450 uppercase filter drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
                    GOOOAL! ⚽
                  </h3>
                </motion.div>

                <p className="mt-3 text-sm font-black tracking-wider text-emerald-450 uppercase">
                  Goal for {currentAlert.teamName}!
                </p>

                {/* Goal Info Inner Card */}
                <div className="relative mt-4 py-4 px-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-amber-500/5 opacity-30"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                      {currentAlert.player}
                    </span>
                    {currentAlert.assist && (
                      <span className="text-xs text-slate-400 mt-1">
                        Assist: <span className="text-slate-200 font-bold">{currentAlert.assist}</span>
                      </span>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                      ⏱️ Minute {currentAlert.minute}'
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Match Teams Row / Scoreboard style */}
            <div className="flex items-center justify-between gap-4 mt-6 py-4 px-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="h-10 w-14 flex items-center justify-center filter drop-shadow-md">
                  {getCountryFlag(currentAlert.homeTeamId, "w-10 h-7 sm:w-12 sm:h-8.5")}
                </div>
                <span className="mt-2 text-xs font-black text-slate-300 truncate w-full text-center tracking-wide">
                  {currentAlert.homeTeam}
                </span>
              </div>

              {/* Score Box */}
              <div className="flex flex-col items-center justify-center px-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1 border ${
                  isFinished 
                    ? 'text-slate-400 bg-slate-800 border-slate-700/50' 
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  {isFinished ? 'FINAL' : 'LIVE'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tighter">
                    {currentAlert.homeScore}
                  </span>
                  <span className="text-slate-600 font-black text-xl">:</span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tighter">
                    {currentAlert.awayScore}
                  </span>
                </div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="h-10 w-14 flex items-center justify-center filter drop-shadow-md">
                  {getCountryFlag(currentAlert.awayTeamId, "w-10 h-7 sm:w-12 sm:h-8.5")}
                </div>
                <span className="mt-2 text-xs font-black text-slate-300 truncate w-full text-center tracking-wide">
                  {currentAlert.awayTeam}
                </span>
              </div>
            </div>

          </motion.div>
          
        </div>
      )}
    </AnimatePresence>
  );
}
