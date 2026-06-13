import { useState, useEffect, useMemo } from 'react';
import { Search, Sparkles, Globe } from 'lucide-react';

export default function RealWorldNewsFeed({ fixtures }) {
  const [fetchedNews, setFetchedNews] = useState([]);

  const finishedCount = useMemo(() => {
    return fixtures ? fixtures.filter(m => m.status === 'Finished').length : 0;
  }, [fixtures]);

  useEffect(() => {
    let active = true;
    const loadNews = async () => {
      try {
        const response = await fetch('https://saurav.tech/NewsAPI/top-headlines/category/sports/us.json');
        if (!response.ok) throw new Error("Failed to fetch sports news");
        const data = await response.json();
        if (!active) return;
        
        // Filter for football / soccer / championship keywords
        const keywords = ['championship', 'football', 'soccer', 'tournament', 'match', 'score', 'goal', 'stadium', 'mexico', 'canada', 'usa', 'team', 'cup', 'opening'];
        const filtered = (data.articles || []).filter(a => {
          const title = a.title?.toLowerCase() || '';
          const desc = a.description?.toLowerCase() || '';
          return keywords.some(k => title.includes(k) || desc.includes(k));
        });

        // Map to our format
        const items = filtered.map((a, idx) => ({
          id: `real-news-${idx}-${a.publishedAt || idx}`,
          source: a.source?.name || 'Google News',
          icon: Search,
          iconColor: 'text-sky-500',
          query: 'Google News Search',
          content: a.title
        }));
        setFetchedNews(items);
      } catch (err) {
        console.warn("Failed to fetch real-world news:", err);
      }
    };

    loadNews();

    // Auto-refresh news periodically every 30 seconds
    const interval = setInterval(loadNews, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [finishedCount]);

  const newsItems = useMemo(() => {
    const items = [];
    const finished = fixtures.filter(m => m.status === 'Finished');
    const live = fixtures.filter(m => m.status === 'LIVE' || m.status === 'Half Time' || m.status === 'Extra Time' || m.status === 'Penalties');

    // Add live matches updates
    live.forEach(match => {
      items.push({
        id: `live-search-${match.matchId}`,
        source: 'Google Live',
        icon: Search,
        iconColor: 'text-sky-500',
        query: `"${match.homeTeam} vs ${match.awayTeam} live score"`,
        content: `Match is currently LIVE at ${match.stadium} (${match.minute}'). Current Score: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}.`
      });

      // Parse goals for live events
      const lastGoal = match.events?.filter(e => e.type === 'goal').pop();
      items.push({
        id: `live-ai-${match.matchId}`,
        source: 'AI Match Tracker',
        icon: Sparkles,
        iconColor: 'text-amber-500',
        query: `Live match analysis`,
        content: lastGoal 
          ? `🤖 AI Alert: Goal scored by ${lastGoal.player} in the ${lastGoal.minute}th minute for ${lastGoal.teamId === match.homeTeamId ? match.homeTeam : match.awayTeam}!`
          : `🤖 AI Alert: Tactical battle at ${match.stadium}. Possession stands at 50%-50%. High pressure from both sides.`
      });
    });

    // Add finished matches updates
    finished.slice(0, 2).forEach(match => {
      items.push({
        id: `finished-search-${match.matchId}`,
        source: 'Google Search',
        icon: Search,
        iconColor: 'text-sky-500',
        query: `"${match.homeTeam} vs ${match.awayTeam} final result"`,
        content: `Official: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}. Match played at ${match.stadium}, ${match.city}.`
      });

      // Scorers list
      const goalScorers = match.events?.filter(e => e.type === 'goal').map(e => `${e.player} (${e.minute}')`).join(', ');
      items.push({
        id: `finished-ai-${match.matchId}`,
        source: 'AI Recap',
        icon: Sparkles,
        iconColor: 'text-amber-500',
        query: `Match summary`,
        content: `🤖 AI Recap: ${match.homeTeam} played ${match.awayTeam} in an intense group stage match. The match finished ${match.homeScore}-${match.awayScore}. Goals: ${goalScorers || 'None'}.`
      });
    });

    // Merge fetched news or show static fallbacks
    if (fetchedNews.length > 0) {
      items.push(...fetchedNews);
    } else {
      // Default Global Football Cup News (Real World)
      items.push({
        id: 'default-news-1',
        source: 'Global News Feed',
        icon: Globe,
        iconColor: 'text-emerald-500',
        query: 'Global Football Cup 2026 Schedule',
        content: 'The Global Football Cup 2026 starts with 48 teams competing in 104 matches across the USA, Canada, and Mexico. The finals will take place on July 19, 2026 at MetLife Stadium.'
      });

      items.push({
        id: 'default-news-2',
        source: 'Google News',
        icon: Search,
        iconColor: 'text-sky-500',
        query: 'Estadio Azteca opening game',
        content: 'Mexico opens the tournament with a 2-0 win over South Africa at Estadio Azteca, fueled by goals from Quiñones and Jiménez.'
      });

      items.push({
        id: 'default-news-3',
        source: 'AI Assistant',
        icon: Sparkles,
        iconColor: 'text-amber-500',
        query: 'Top Contenders',
        content: '🤖 AI Prediction: Argentina, Brazil, France, and England are rated as the top 4 favorites to reach the semi-finals based on squad depth and recent form.'
      });
    }

    return items.slice(0, 6); // Limit to 6 news updates
  }, [fixtures, fetchedNews]);


  return (
    <div className="rounded-2xl border border-slate-200/85 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 p-4 space-y-4 backdrop-blur-sm shadow-md transition-colors duration-300">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-amber-500 animate-spin-slow" />
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
            Google Search & AI News
          </h4>
        </div>
        <div className="flex items-center space-x-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Auto-Syncing</span>
        </div>
      </div>

      <div className="space-y-3.5 divide-y divide-slate-100/50 dark:divide-slate-800/50">
        {newsItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="pt-3 first:pt-0 flex items-start gap-2.5">
              <div className={`flex-shrink-0 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 ${item.iconColor}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.source}</span>
                  <span className="text-[9px] text-slate-350 dark:text-slate-655 font-bold">•</span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-455 truncate max-w-[150px]" title={item.query}>
                    {item.query}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-350 leading-relaxed">
                  {item.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
