import { Trophy, Globe, Heart, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-200/10 bg-white dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Section: Branding */}
        <div className="flex items-center space-x-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-transparent">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-250 uppercase tracking-widest">
              Global Cup 2026
            </h4>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              Fans Live Scores Tracker
            </p>
          </div>
        </div>

        {/* Center Section: Venues summary */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-550 dark:text-slate-500">
          <span className="flex items-center space-x-1">
            <Globe className="h-3 w-3" />
            <span>16 Host Cities</span>
          </span>
          <span>•</span>
          <span>48 Teams</span>
          <span>•</span>
          <span>104 Matches</span>
        </div>

        {/* Right Section: System & Credits */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right gap-1 text-[9px] font-bold text-slate-550 dark:text-slate-500 uppercase tracking-wide">
          <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-500">
            <span className="relative flex h-1.5 w-1.5 mr-0.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500"></span>
            </span>
            <span>Real-world API integration active</span>
          </div>
          <p className="flex items-center justify-center space-x-0.5">
            <span>Made with</span>
            <Heart className="h-2.5 w-2.5 text-rose-500 fill-current" />
            <span>for Football Fans</span>
          </p>
        </div>

      </div>

      <div className="mx-auto max-w-7xl mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-center space-x-1.5 text-[9px] font-semibold text-slate-400 dark:text-slate-600 text-center">
        <ShieldAlert className="h-3 w-3 text-slate-300 dark:text-slate-700 flex-shrink-0" />
        <span>This is a fan-made sports tracker demonstration. All stats are synced from live real-world matches.</span>
      </div>
    </footer>
  );
}
