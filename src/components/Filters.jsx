import { Search, Filter, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Filters({
  searchQuery,
  setSearchQuery,
  stageFilter,
  setStageFilter,
  groupFilter,
  setGroupFilter,
  dateFilter,
  setDateFilter,
  showLiveOnly,
  setShowLiveOnly,
  showTodayOnly,
  setShowTodayOnly,
  showUpcomingOnly,
  setShowUpcomingOnly,
  onReset
}) {
  const adjustDate = (days) => {
    const currentVal = dateFilter || new Date().toLocaleDateString('en-CA');
    const parts = currentVal.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    d.setDate(d.getDate() + days);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setDateFilter(`${yyyy}-${mm}-${dd}`);
  };

  const handlePrevDay = () => adjustDate(-1);
  const handleNextDay = () => adjustDate(1);
  const stages = [
    'Group Stage',
    'Round of 32',
    'Round of 16',
    'Quarter Finals',
    'Semi Finals',
    'Third Place Match',
    'Final'
  ];

  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  return (
    <div className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-200/10 bg-white/70 dark:bg-slate-900/40 p-5 backdrop-blur-md shadow-lg space-y-4">
      
      {/* Title */}
      <div className="flex items-center space-x-2 pb-2 border-b border-slate-200 dark:border-slate-800/50">
        <Filter className="h-4.5 w-4.5 text-amber-550 dark:text-amber-400" />
        <h3 className="text-sm font-bold tracking-wide text-slate-800 dark:text-slate-200 uppercase">Search & Filter Fixtures</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Search Input */}
        <div className="relative md:col-span-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team or country..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Stage Filter */}
        <div className="md:col-span-3">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer"
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>

        {/* Group Filter */}
        <div className="md:col-span-2">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            disabled={stageFilter && stageFilter !== 'Group Stage'}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group} value={group}>Group {group}</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="md:col-span-3 flex items-center space-x-1">
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all cursor-pointer flex-shrink-0"
            title="Previous Day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="relative flex-grow">
            <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-slate-455 dark:text-slate-500 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-800 dark:text-slate-350 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all cursor-pointer"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-355 transition-colors"
                title="Clear Date"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            className="p-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all cursor-pointer flex-shrink-0"
            title="Next Day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Toggles & Reset Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-slate-200 dark:border-slate-850 gap-4">
        
        {/* Toggle switches */}
        <div className="flex flex-wrap gap-4">
          
          {/* Live Only */}
          <label className="inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLiveOnly}
              onChange={(e) => {
                setShowLiveOnly(e.target.checked);
                if (e.target.checked) {
                  setShowTodayOnly(false);
                  setShowUpcomingOnly(false);
                }
              }}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-rose-600 peer-checked:after:bg-white"></div>
            <span className="ms-2 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-455 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600"></span>
              </span>
              <span>LIVE Matches Only</span>
            </span>
          </label>

          {/* Today Only */}
          <label className="inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTodayOnly}
              onChange={(e) => {
                setShowTodayOnly(e.target.checked);
                if (e.target.checked) {
                  setShowLiveOnly(false);
                  setShowUpcomingOnly(false);
                }
              }}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-amber-550 dark:peer-checked:bg-amber-500 peer-checked:after:bg-white"></div>
            <span className="ms-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Today's Matches Only</span>
          </label>

          {/* Upcoming Only */}
          <label className="inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showUpcomingOnly}
              onChange={(e) => {
                setShowUpcomingOnly(e.target.checked);
                if (e.target.checked) {
                  setShowLiveOnly(false);
                  setShowTodayOnly(false);
                }
              }}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
            <span className="ms-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Upcoming Matches Only</span>
          </label>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || stageFilter || groupFilter || dateFilter || showLiveOnly || showTodayOnly || showUpcomingOnly) && (
          <button
            onClick={onReset}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/25 transition-all text-center"
          >
            Clear Filters
          </button>
        )}

      </div>
    </div>
  );
}
