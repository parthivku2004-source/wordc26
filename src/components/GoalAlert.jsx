import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';


export default function GoalAlert({ alertsQueue, onDismissAlert }) {
  const currentAlert = alertsQueue[0] || null;

  const handleClose = () => {
    if (currentAlert) {
      onDismissAlert(currentAlert.alertId);
    }
  };

  // Handle auto-dismiss timer when a new alert becomes active
  useEffect(() => {
    if (currentAlert) {
      const timer = setTimeout(() => {
        onDismissAlert(currentAlert.alertId);
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [currentAlert, onDismissAlert]);

  const isFinished = currentAlert?.type === 'finished';

  return (
    <AnimatePresence>
      {currentAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          
          <motion.div
            initial={{ scale: 0.3, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className={`relative w-full max-w-md mx-auto overflow-hidden rounded-3xl border ${
              isFinished ? 'border-indigo-500' : 'border-amber-500'
            } bg-[linear-gradient(to_bottom,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-5 sm:p-8 shadow-2xl text-center`}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-100 transition cursor-pointer z-10 border border-slate-700/30"
              title="Close Alert"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Flashing Laser Line Effect */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
              isFinished ? 'from-indigo-500 via-purple-500 to-pink-500' : 'from-emerald-500 via-amber-500 to-rose-500'
            } animate-pulse`}></div>

            {isFinished ? (
              <>
                {/* Match Finished Title */}
                <motion.h3 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-2xl sm:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 uppercase drop-shadow-md"
                >
                  MATCH FINISHED 🏁
                </motion.h3>

                {/* Winner Info */}
                <p className="mt-3 sm:mt-4 text-base sm:text-xl font-bold text-slate-100">
                  {currentAlert.homeScore === currentAlert.awayScore && currentAlert.homePenalties === undefined ? (
                    "It's a Draw!"
                  ) : (
                    <>
                      {currentAlert.homeScore > currentAlert.awayScore || (currentAlert.homePenalties !== undefined && currentAlert.homePenalties > currentAlert.awayPenalties) ? (
                        <span>🎉 {currentAlert.homeTeam} Wins!</span>
                      ) : (
                        <span>🎉 {currentAlert.awayTeam} Wins!</span>
                      )}
                    </>
                  )}
                </p>
                {currentAlert.homePenalties !== undefined ? (
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mt-1">
                    Won on Penalties ({currentAlert.homePenalties} - {currentAlert.awayPenalties})
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                    Full Time Result
                  </p>
                )}
              </>
            ) : (
              <>
                {/* Goal Title */}
                <motion.h3 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-3xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 uppercase drop-shadow-md"
                >
                  GOOOAL! ⚽
                </motion.h3>

                {/* Goal Info */}
                <p className="mt-3 sm:mt-4 text-base sm:text-xl font-bold text-slate-100">
                  Goal for {currentAlert.teamName}!
                </p>
                {currentAlert.player && (
                  <p className="text-sm font-semibold text-slate-300 mt-1">
                    {currentAlert.player}{currentAlert.assist ? ` (Assist: ${currentAlert.assist})` : ''}
                  </p>
                )}
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mt-1">
                  Minute {currentAlert.minute}'
                </p>
              </>
            )}

            {/* Match Teams Row */}
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 mt-4 sm:mt-6 py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs sm:text-sm font-bold text-slate-300 truncate max-w-[80px] sm:max-w-[100px]">{currentAlert.homeTeam}</span>
              
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black text-slate-100">{currentAlert.homeScore}</span>
                <span className="text-slate-500 font-bold">-</span>
                <span className="text-xl sm:text-2xl font-black text-slate-100">{currentAlert.awayScore}</span>
              </div>
              
              <span className="text-xs sm:text-sm font-bold text-slate-300 truncate max-w-[80px] sm:max-w-[100px]">{currentAlert.awayTeam}</span>
            </div>

          </motion.div>
          
        </div>
      )}
    </AnimatePresence>
  );
}
