import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Filters from './components/Filters';
import FixtureCard from './components/FixtureCard';
import StandingsTable from './components/StandingsTable';
import MatchDetailsModal from './components/MatchDetailsModal';
import GoalAlert from './components/GoalAlert';
import Footer from './components/Footer';
import KnockoutBracket from './components/KnockoutBracket';
import { useLiveScores } from './hooks/useLiveScores';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('wc_dark_mode');
    return saved === 'true'; // Default is false (light mode)
  });
  const [selectedMatchId, setSelectedMatchId] = useState(null);


  // Favorites system (saves to localStorage)
  const [favoriteTeam, setFavoriteTeam] = useState(() => {
    return localStorage.getItem('wc_favorite_team') || null;
  });

  // Reminders system (saves to localStorage)
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('wc_reminders');
    return saved ? JSON.parse(saved) : [];
  });

  // Goal Alerts queue state
  const [alertsQueue, setAlertsQueue] = useState([]);

  // Keep track of alerted goal IDs to prevent duplicate alerts
  const [alertedGoalIds, setAlertedGoalIds] = useState(() => {
    const saved = localStorage.getItem('wc_alerted_goals');
    return saved ? JSON.parse(saved) : [];
  });

  // Ref to hold the dynamically created handleGoalAlert callback
  const handleGoalAlertRef = useRef(null);

  // Hook into our live score state engine
  const {
    fixtures,
    standings,
    loading,
    error,
    fetchLiveScores
  } = useLiveScores((alert) => handleGoalAlertRef.current?.(alert));

  // Notification system settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('wc_notifications_enabled') !== 'false';
  });
  const [notificationScope, setNotificationScope] = useState(() => {
    return localStorage.getItem('wc_notification_scope') || 'all'; // 'all' or 'favorites'
  });
  const [toasts, setToasts] = useState([]);

  // Date and notification scoping state variables
  const [dateFilter, setDateFilter] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [systemToday, setSystemToday] = useState(() => new Date().toLocaleDateString('en-CA'));

  // Auto-update date filter if system day changes (e.g. across midnight)
  useEffect(() => {
    const checkDateInterval = setInterval(() => {
      const currentToday = new Date().toLocaleDateString('en-CA');
      if (currentToday !== systemToday) {
        setSystemToday(currentToday);
        setDateFilter(currentToday);
      }
    }, 30000); // Check every 30 seconds
    return () => clearInterval(checkDateInterval);
  }, [systemToday]);

  // Shared helper function to determine if a match is in scope for notifications/alerts
  const isMatchInScope = useCallback((m) => {
    if (!notificationsEnabled) return false;
    if (m.dateIST !== systemToday) return false; // Only show notifications for the current day's matches
    if (notificationScope === 'all') return true;
    if (notificationScope === 'favorites') {
      return favoriteTeam && (m.homeTeamId === favoriteTeam || m.awayTeamId === favoriteTeam);
    }
    return false;
  }, [notificationsEnabled, systemToday, notificationScope, favoriteTeam]);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('wc_notifications_enabled', String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('wc_notification_scope', notificationScope);
  }, [notificationScope]);

  const handleDismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const triggerNotification = useCallback(({ id, title, message, type, match }) => {
    if (!notificationsEnabled) return;

    // 1. Native Web Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          silent: true
        });
      } catch (e) {
        console.warn("Native Notification failed:", e);
      }
    }

    // 2. In-App Custom Toast Notification
    setToasts(prev => {
      if (prev.some(t => t.id === id)) return prev;
      return [...prev, { id, title, message, type, match }];
    });
  }, [notificationsEnabled]);

  // Setup goal alerts callback (safe now as fixtures is initialized above!)
  const handleGoalAlert = useCallback((alert) => {
    const alertId = `${alert.matchId}-${alert.minute}-${alert.teamId}-${alert.player}`;

    // If already alerted, skip
    if (alertedGoalIds.includes(alertId)) return;

    // Mark as alerted
    setAlertedGoalIds(prev => {
      const updated = [...prev, alertId];
      localStorage.setItem('wc_alerted_goals', JSON.stringify(updated));
      return updated;
    });

    const match = fixtures?.find(m => m.matchId === alert.matchId);

    if (match && isMatchInScope(match)) {
      triggerNotification({
        id: `goal-${alert.matchId}-${alert.minute}-${alert.teamId}`,
        title: '⚽ GOOOAL!',
        message: `${alert.teamName} score! (${alert.minute}') — ${alert.player}${alert.assist ? ` (Assist: ${alert.assist})` : ''}\n${alert.homeTeam} ${alert.homeScore} - ${alert.awayScore} ${alert.awayTeam}`,
        type: 'goal',
        match
      });

      // Overlay popup shown only when notification is on, match is in scope, and match is live
      const isLive = match.status === 'LIVE' || match.status === 'Half Time' || match.status === 'Extra Time' || match.status === 'Penalties';
      if (isLive) {
        setAlertsQueue(prev => {
          const uniqueAlertId = `${alert.matchId}-${alert.minute}-${alert.teamId}`;
          if (prev.some(a => a.alertId === uniqueAlertId)) return prev;
          return [...prev, { ...alert, alertId: uniqueAlertId, type: 'goal' }];
        });
      }
    }
  }, [fixtures, isMatchInScope, triggerNotification, alertedGoalIds]);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    handleGoalAlertRef.current = handleGoalAlert;
  }, [handleGoalAlert]);

  // Request browser notification permissions on mount (only once)
  useEffect(() => {
    const alreadyPrompted = localStorage.getItem('wc_notifications_prompted') === 'true';
    if (!alreadyPrompted && 'Notification' in window && Notification.permission === 'default') {
      localStorage.setItem('wc_notifications_prompted', 'true');
      Notification.requestPermission();
    }
  }, []);

  // Handle dark mode side-effects
  useEffect(() => {
    localStorage.setItem('wc_dark_mode', String(darkMode));
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.backgroundColor = '#020617'; // slate-950
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc'; // slate-50
    }
  }, [darkMode]);

  // Synchronize favorites with localStorage
  const handleToggleFavorite = useCallback((teamId) => {
    setFavoriteTeam(prev => {
      const newVal = prev === teamId ? null : teamId;
      if (newVal) {
        localStorage.setItem('wc_favorite_team', newVal);
      } else {
        localStorage.removeItem('wc_favorite_team');
      }
      return newVal;
    });
  }, []);

  // Synchronize reminders with localStorage
  const handleToggleReminder = useCallback((matchId) => {
    setReminders(prev => {
      let updated;
      if (prev.includes(matchId)) {
        updated = prev.filter(id => id !== matchId);
      } else {
        updated = [...prev, matchId];
        // Request notification permission if they toggle it
        if ('Notification' in window && Notification.permission !== 'granted') {
          Notification.requestPermission();
        }
      }
      localStorage.setItem('wc_reminders', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleDismissAlert = useCallback((alertId) => {
    setAlertsQueue(prev => prev.filter(a => a.alertId !== alertId));
  }, []);

  // Watch simulation state for kickoff (Upcoming -> LIVE) and finished matches
  const prevFixturesRef = useRef([]);
  useEffect(() => {
    if (!fixtures || fixtures.length === 0) return;

    if (prevFixturesRef.current && prevFixturesRef.current.length > 0) {
      fixtures.forEach(match => {
        const prevMatch = prevFixturesRef.current.find(m => m.matchId === match.matchId);
        if (!prevMatch) return;

        // 1. Kickoff Transition (Upcoming -> LIVE)
        if (prevMatch.status === 'Upcoming' && match.status === 'LIVE') {
          if (isMatchInScope(match)) {
            triggerNotification({
              id: `kickoff-${match.matchId}`,
              title: '⏱️ Kickoff Alert',
              message: `Starting in 2 mins: ${match.homeTeam} vs ${match.awayTeam} at ${match.stadium}!`,
              type: 'kickoff',
              match
            });
          }
        }

        // 2. Full Time Transition (LIVE/Extra Time/Penalties -> Finished)
        const isPrevLive = prevMatch.status === 'LIVE' || prevMatch.status === 'Half Time' || prevMatch.status === 'Extra Time' || prevMatch.status === 'Penalties';
        if (isPrevLive && match.status === 'Finished') {
          if (isMatchInScope(match)) {
            let detail = `Full Time: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`;
            if (match.homePenalties !== undefined && match.awayPenalties !== undefined) {
              detail += ` (Pen: ${match.homePenalties}-${match.awayPenalties})`;
            }
            triggerNotification({
              id: `finished-${match.matchId}`,
              title: '🏁 Match Finished',
              message: detail,
              type: 'finished',
              match
            });

            // Add final result to alertsQueue to show the big overlay popup
            setAlertsQueue(prev => {
              const uniqueAlertId = `finished-${match.matchId}`;
              if (prev.some(a => a.alertId === uniqueAlertId)) return prev;
              return [...prev, {
                type: 'finished',
                alertId: uniqueAlertId,
                matchId: match.matchId,
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                homeTeamId: match.homeTeamId,
                awayTeamId: match.awayTeamId,
                homeScore: match.homeScore,
                awayScore: match.awayScore,
                homePenalties: match.homePenalties,
                awayPenalties: match.awayPenalties,
                winner: match.winner
              }];
            });
          }
        }
      });
    }

    prevFixturesRef.current = fixtures;
  }, [fixtures, isMatchInScope, triggerNotification]);

  // Real-time background clock checker for upcoming matches starting in <= 2 minutes
  useEffect(() => {
    if (!notificationsEnabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      fixtures.forEach(match => {
        if (match.status !== 'Upcoming') return;

        if (!isMatchInScope(match)) return;

        const matchTime = new Date(match.dateTimeISO).getTime();
        const diff = matchTime - now;

        // Alert if match starts in 2 minutes (between 0 and 120000ms in the future)
        if (diff > 0 && diff <= 120000) {
          const notifiedKey = `rt-kickoff-notified-${match.matchId}`;
          if (!localStorage.getItem(notifiedKey)) {
            localStorage.setItem(notifiedKey, 'true');
            triggerNotification({
              id: `rt-kickoff-${match.matchId}`,
              title: '⏱️ Kickoff Alert',
              message: `Starting in 2 mins: ${match.homeTeam} vs ${match.awayTeam} at ${match.stadium}!`,
              type: 'kickoff',
              match
            });
          }
        }
      });
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [fixtures, notificationsEnabled, isMatchInScope, triggerNotification]);

  // Filters State for Fixtures page
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);

  // Dynamic SEO JSON-LD Schema injection for Google Search crawler automation
  useEffect(() => {
    const existingScript = document.getElementById('google-sports-events');
    if (existingScript) existingScript.remove();

    if (fixtures && fixtures.length > 0) {
      const schema = fixtures.map(m => ({
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        "name": `${m.homeTeam} vs ${m.awayTeam}`,
        "startDate": m.dateTimeISO,
        "homeTeam": {
          "@type": "SportsTeam",
          "name": m.homeTeam,
          "image": `https://flagsapi.com/${m.homeTeamId === 'UEFA_D' ? 'CZ' : m.homeTeamId === 'UEFA_C' ? 'TR' : m.homeTeamId === 'UEFA_B' ? 'SE' : m.homeTeamId === 'IC_1' ? 'CD' : m.homeTeamId === 'IC_2' ? 'IQ' : m.homeTeamId.slice(0, 2)}/flat/64.png`
        },
        "awayTeam": {
          "@type": "SportsTeam",
          "name": m.awayTeam,
          "image": `https://flagsapi.com/${m.awayTeamId === 'UEFA_D' ? 'CZ' : m.awayTeamId === 'UEFA_C' ? 'TR' : m.awayTeamId === 'UEFA_B' ? 'SE' : m.awayTeamId === 'IC_1' ? 'CD' : m.awayTeamId === 'IC_2' ? 'IQ' : m.awayTeamId.slice(0, 2)}/flat/64.png`
        },
        "location": {
          "@type": "Place",
          "name": m.stadium,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": m.city
          }
        },
        "sport": "Soccer",
        "eventStatus": m.status === 'LIVE' ? "https://schema.org/EventScheduled" : (m.status === 'Finished' ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled"),
        "description": `${m.stage} Match: ${m.homeTeam} vs ${m.awayTeam} at ${m.stadium}`
      }));

      const script = document.createElement('script');
      script.id = 'google-sports-events';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      const existingScript = document.getElementById('google-sports-events');
      if (existingScript) existingScript.remove();
    };
  }, [fixtures]);

  const resetFilters = () => {
    setSearchQuery('');
    setStageFilter('');
    setGroupFilter('');
    setDateFilter(new Date().toLocaleDateString('en-CA'));
    setShowLiveOnly(false);
    setShowTodayOnly(false);
    setShowUpcomingOnly(false);
  };

  // Filter computation
  const filteredFixtures = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // Real-world system date YYYY-MM-DD
    
    return fixtures.filter(match => {
      // Search filter (handles team names, code)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesHome = match.homeTeam.toLowerCase().includes(query) || match.homeTeamId.toLowerCase().includes(query);
        const matchesAway = match.awayTeam.toLowerCase().includes(query) || match.awayTeamId.toLowerCase().includes(query);
        const matchesCity = match.city.toLowerCase().includes(query);
        if (!matchesHome && !matchesAway && !matchesCity) return false;
      }

      // Stage filter
      if (stageFilter && match.stage !== stageFilter) return false;

      // Group filter
      if (groupFilter && match.group !== groupFilter) return false;

      // Date picker filter: show matches from this date onwards (up to the finals)
      if (dateFilter && match.dateIST < dateFilter) return false;

      // Live only
      if (showLiveOnly && !(match.status === 'LIVE' || match.status === 'Half Time' || match.status === 'Extra Time' || match.status === 'Penalties')) {
        return false;
      }

      // Today only
      if (showTodayOnly && match.dateIST !== todayStr) return false;

      // Upcoming only
      if (showUpcomingOnly && match.status !== 'Upcoming') return false;

      return true;
    });
  }, [fixtures, searchQuery, stageFilter, groupFilter, dateFilter, showLiveOnly, showTodayOnly, showUpcomingOnly]);

  // Extract separate match categories for Home Tab
  const liveMatches = useMemo(() => {
    return fixtures.filter(m => m.status === 'LIVE' || m.status === 'Half Time' || m.status === 'Extra Time' || m.status === 'Penalties');
  }, [fixtures]);

  const previousMatches = useMemo(() => {
    // Show finished matches (limit to 4, showing latest finished first)
    return fixtures
      .filter(m => m.status === 'Finished')
      .slice()
      .reverse()
      .slice(0, 4);
  }, [fixtures]);

  const featuredUpcoming = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    // Show upcoming matches starting tomorrow onwards (limit 3)
    return fixtures
      .filter(m => m.dateIST !== todayStr && m.status === 'Upcoming')
      .slice(0, 3);
  }, [fixtures]);
  const selectedMatch = useMemo(() => {
    if (!selectedMatchId) return null;
    return fixtures.find(m => m.matchId === selectedMatchId) || null;
  }, [fixtures, selectedMatchId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 bg-stadium-pitch">
      
      {/* Header Shell Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        favoriteTeam={favoriteTeam}
        teams={standings}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        notificationScope={notificationScope}
        setNotificationScope={setNotificationScope}
      />

      {/* Main Core Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* API Failure/Offline warnings */}
        {error && (
          <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-semibold flex items-center justify-between shadow-md">
            <span>{error}</span>
            <button onClick={fetchLiveScores} className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-[10px] uppercase font-bold tracking-wider">Retry</button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="space-y-6">
            {/* Hero Skeleton */}
            <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-900/60 animate-pulse border border-slate-350/10"></div>
            
            {/* Content Cards Grid Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 rounded-2xl bg-slate-250 dark:bg-slate-900/40 animate-pulse border border-slate-350/5"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* 1. HOME TAB */}
            {activeTab === 'home' && (
              <div className="space-y-8">
                {/* Hero section */}
                <Hero 
                  fixtures={fixtures} 
                  onViewMatch={(id) => {
                    setSelectedMatchId(id);
                  }}
                  onActiveLiveGamesClick={() => {
                    const tracker = document.getElementById('live-tracker');
                    if (tracker) {
                      tracker.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  onMatchesCompletedClick={() => {
                    const tracker = document.getElementById('previous-matches');
                    if (tracker) {
                      tracker.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />

                {/* Visual Knockout Tournament Bracket */}
                <KnockoutBracket fixtures={fixtures} />

                {/* Grid section for Live and Today's Matches */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Live Matches Dashboard */}
                  <div id="live-tracker" className="lg:col-span-8 space-y-6 scroll-mt-24">

                    <div className="flex items-center space-x-2 pt-2">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-455 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-600"></span>
                      </span>
                      <h3 className="text-md font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">LIVE Match Tracker</h3>
                    </div>

                    {liveMatches.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {liveMatches.map(match => (
                          <FixtureCard
                            key={match.matchId}
                            match={match}
                            onViewDetails={setSelectedMatchId}
                            isFavorite={favoriteTeam === match.homeTeamId || favoriteTeam === match.awayTeamId}
                            onToggleFavorite={handleToggleFavorite}
                            isReminderSet={reminders.includes(match.matchId)}
                            onToggleReminder={handleToggleReminder}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200/10 bg-slate-900/20 p-8 text-center text-slate-500 font-medium text-xs">
                        No matches are currently LIVE. The next scheduled matches will kick off automatically!
                      </div>
                    )}

                    {/* Previous matches */}
                    <div id="previous-matches" className="space-y-4 pt-4 scroll-mt-24">
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-150 uppercase tracking-widest">Previous Matches</h4>
                      
                      {previousMatches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {previousMatches.map(match => (
                            <FixtureCard
                              key={match.matchId}
                              match={match}
                              onViewDetails={setSelectedMatchId}
                              isFavorite={favoriteTeam === match.homeTeamId || favoriteTeam === match.awayTeamId}
                              onToggleFavorite={handleToggleFavorite}
                              isReminderSet={reminders.includes(match.matchId)}
                              onToggleReminder={handleToggleReminder}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-200/10 bg-slate-900/10 p-5 text-center text-slate-500 text-xs">
                          No previous match results available.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Featured Upcoming and Quick Highlights */}
                  <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-md font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Upcoming Match</h3>
                    
                    <div className="flex flex-col gap-6">
                      {featuredUpcoming.map(match => (
                        <FixtureCard
                          key={match.matchId}
                          match={match}
                          onViewDetails={setSelectedMatchId}
                          isFavorite={favoriteTeam === match.homeTeamId || favoriteTeam === match.awayTeamId}
                          onToggleFavorite={handleToggleFavorite}
                          isReminderSet={reminders.includes(match.matchId)}
                          onToggleReminder={handleToggleReminder}
                        />
                      ))}
                    </div>

                    <button 
                      onClick={() => setActiveTab('fixtures')}
                      className="w-full text-center py-2.5 rounded-xl border border-slate-800 hover:border-amber-500/35 hover:bg-amber-500/5 text-xs font-bold text-slate-400 hover:text-amber-400 transition"
                    >
                      View All Fixtures & Stages
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* 2. FIXTURES TAB */}
            {activeTab === 'fixtures' && (
              <div className="space-y-6">
                <Filters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  stageFilter={stageFilter}
                  setStageFilter={setStageFilter}
                  groupFilter={groupFilter}
                  setGroupFilter={setGroupFilter}
                  dateFilter={dateFilter}
                  setDateFilter={setDateFilter}
                  showLiveOnly={showLiveOnly}
                  setShowLiveOnly={setShowLiveOnly}
                  showTodayOnly={showTodayOnly}
                  setShowTodayOnly={setShowTodayOnly}
                  showUpcomingOnly={showUpcomingOnly}
                  setShowUpcomingOnly={setShowUpcomingOnly}
                  onReset={resetFilters}
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-450 dark:text-slate-400">
                    Showing {filteredFixtures.length} of {fixtures.length} matches
                  </span>
                </div>

                {filteredFixtures.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFixtures.map(match => (
                      <FixtureCard
                        key={match.matchId}
                        match={match}
                        onViewDetails={setSelectedMatchId}
                        isFavorite={favoriteTeam === match.homeTeamId || favoriteTeam === match.awayTeamId}
                        onToggleFavorite={handleToggleFavorite}
                        isReminderSet={reminders.includes(match.matchId)}
                        onToggleReminder={handleToggleReminder}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200/10 bg-slate-900/20 p-12 text-center text-slate-500 font-medium text-xs">
                    No fixtures match your active filter criteria. Try clearing them!
                  </div>
                )}
              </div>
            )}

            {/* 3. STANDINGS TAB */}
            {activeTab === 'standings' && (
              <StandingsTable
                standings={standings}
                favoriteTeam={favoriteTeam}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

          </>
        )}

      </main>

      {/* Footer Branding */}
      <Footer />

      {/* Global Goal Overlay Alert System */}
      <GoalAlert
        alertsQueue={alertsQueue}
        onDismissAlert={handleDismissAlert}
      />
      {/* Match Details Drawer Modal Overlay */}
      {selectedMatchId && (
        <MatchDetailsModal
          match={selectedMatch}
          onClose={() => setSelectedMatchId(null)}
          isFavorite={favoriteTeam === selectedMatch?.homeTeamId || favoriteTeam === selectedMatch?.awayTeamId}
          onToggleFavorite={handleToggleFavorite}
          isReminderSet={reminders.includes(selectedMatchId)}
          onToggleReminder={handleToggleReminder}
          onExportICS={(m) => {
            // Client-side ICS generator helper
            const dtStart = new Date(m.dateTimeISO).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const dtEnd = new Date(new Date(m.dateTimeISO).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

            const icsContent = [
              'BEGIN:VCALENDAR',
              'VERSION:2.0',
              'PRODID:-//Global Cup 2026 Live Tracker//EN',
              'BEGIN:VEVENT',
              `UID:match-${m.matchId}@globalcup2026.com`,
              `DTSTAMP:${nowStr}`,
              `DTSTART:${dtStart}`,
              `DTEND:${dtEnd}`,
              `SUMMARY:⚽ Global Cup 2026: ${m.homeTeam} vs ${m.awayTeam}`,
              `DESCRIPTION:Match #${m.matchId} - ${m.stage} (Group ${m.group || 'N/A'}) at ${m.stadium}, ${m.city}.`,
              `LOCATION:${m.stadium}, ${m.city}`,
              'END:VEVENT',
              'END:VCALENDAR'
            ].join('\r\n');

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Match_${m.matchId}_${m.homeTeamId}_vs_${m.awayTeamId}.ics`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        />
      )}
    </div>
  );
}
