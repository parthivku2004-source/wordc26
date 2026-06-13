import { useState } from 'react';
import { Star, Trophy, ArrowRight } from 'lucide-react';
import { getCountryFlag, getCountryName } from '../utils/countryHelper.jsx';

export default function StandingsTable({ standings, favoriteTeam, onToggleFavorite }) {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');

  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  // Helper to slice standings by group
  const getGroupTeams = (groupLetter) => {
    return standings.filter(t => t.group === groupLetter);
  };



  const renderGroupTable = (groupLetter) => {
    const teams = getGroupTeams(groupLetter);

    return (
      <div key={groupLetter} className="rounded-2xl border border-slate-200/80 dark:border-slate-200/10 bg-white/70 dark:bg-slate-900/40 p-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/60 mb-3">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <span>Group {groupLetter}</span>
          </h4>
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">Top 2 Qualify</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800/40 pb-2">
                <th className="pb-2 pl-2">#</th>
                <th className="pb-2">Team</th>
                <th className="pb-2 text-center">P</th>
                <th className="pb-2 text-center">W</th>
                <th className="pb-2 text-center">D</th>
                <th className="pb-2 text-center">L</th>
                <th className="pb-2 text-center hidden sm:table-cell">GF</th>
                <th className="pb-2 text-center hidden sm:table-cell">GA</th>
                <th className="pb-2 text-center">GD</th>
                <th className="pb-2 text-center pl-2">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/20 text-xs font-semibold">
              {teams.map((team, idx) => {
                const gd = team.goalsFor - team.goalsAgainst;
                const gdStr = gd > 0 ? `+${gd}` : gd;
                const isFav = favoriteTeam === team.id;
                const isQualifier = idx < 2; // Top 2 automatically qualify
 
                return (
                  <tr 
                    key={team.id}
                    className={`hover:bg-slate-100 dark:hover:bg-slate-800/20 transition-all duration-150 ${
                      isFav 
                        ? 'bg-amber-500/5 text-amber-600 dark:text-amber-300' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {/* Rank Number with green/grey indicator */}
                    <td className="py-2.5 pl-2">
                      <div className="flex items-center space-x-1">
                        <span className={`h-4.5 w-1 rounded-full ${isQualifier ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}></span>
                        <span className={`pl-1 ${isQualifier ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>{idx + 1}</span>
                      </div>
                    </td>

                    {/* Team Name */}
                    <td className="py-2.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-lg" title={getCountryName(team.id)}>{getCountryFlag(team.id, "w-6 h-4.5 shadow-sm")}</span>
                        <span className="truncate max-w-[80px] sm:max-w-[120px] font-bold">{getCountryName(team.id)}</span>
                        <button
                          onClick={() => onToggleFavorite(team.id)}
                          className="text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition"
                          title="Star Favorite"
                        >
                          <Star className={`h-3 w-3 ${isFav ? 'fill-amber-550 text-amber-550 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
                        </button>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-2.5 text-center text-slate-500 dark:text-slate-400 font-medium">{team.played}</td>
                    <td className="py-2.5 text-center text-slate-500 dark:text-slate-400 font-medium">{team.wins}</td>
                    <td className="py-2.5 text-center text-slate-500 dark:text-slate-400 font-medium">{team.draws}</td>
                    <td className="py-2.5 text-center text-slate-500 dark:text-slate-400 font-medium">{team.losses}</td>
                    <td className="py-2.5 text-center text-slate-450 dark:text-slate-500 font-medium hidden sm:table-cell">{team.goalsFor}</td>
                    <td className="py-2.5 text-center text-slate-450 dark:text-slate-500 font-medium hidden sm:table-cell">{team.goalsAgainst}</td>
                    <td className={`py-2.5 text-center font-bold ${
                      gd > 0 ? 'text-emerald-600 dark:text-emerald-500' : gd < 0 ? 'text-rose-600 dark:text-rose-500' : 'text-slate-455 dark:text-slate-400'
                    }`}>
                      {gdStr}
                    </td>
                    <td className="py-2.5 text-center font-black text-slate-850 dark:text-slate-100 pl-2">{team.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Standings Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 dark:border-slate-200/10 bg-white/70 dark:bg-slate-900/40 p-4 gap-4 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-amber-550 dark:text-amber-400 animate-bounce-slow" />
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Points Tables</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">Calculated dynamically based on results</p>
          </div>
        </div>

        {/* Group select buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedGroupFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
              selectedGroupFilter === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-transparent'
            }`}
          >
            All Groups
          </button>
          
          <select
            value={selectedGroupFilter === 'ALL' ? '' : selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value || 'ALL')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/40 border border-slate-250 dark:border-slate-700/30 focus:outline-none cursor-pointer"
          >
            <option value="">Filter Group</option>
            {groups.map(g => (
              <option key={g} value={g}>Group {g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Tables */}
      {selectedGroupFilter === 'ALL' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(g => renderGroupTable(g))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {renderGroupTable(selectedGroupFilter)}
        </div>
      )}

      {/* Qualification note */}
      <div className="flex items-center justify-center space-x-2 text-[10px] font-semibold text-slate-500 dark:text-slate-500 bg-white/50 dark:bg-slate-950/40 py-3 rounded-xl border border-slate-200 dark:border-slate-900">
        <ArrowRight className="h-3 w-3 text-emerald-500" />
        <span>Top 2 from each group + 8 best 3rd placed teams qualify for the Round of 32.</span>
      </div>

    </div>
  );
}
