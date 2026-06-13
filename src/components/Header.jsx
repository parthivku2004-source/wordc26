import { useState } from 'react';
import { Trophy, Calendar, ListOrdered, Sun, Moon, Star, Volume2, VolumeX, Menu, X, Bell, BellOff } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setDarkMode, 
  soundEnabled, 
  setSoundEnabled,
  favoriteTeam,
  teams,
  notificationsEnabled,
  setNotificationsEnabled,
  notificationScope,
  setNotificationScope
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const favTeamDetails = favoriteTeam ? teams.find(t => t.id === favoriteTeam) : null;

  const navItems = [
    { id: 'home', label: 'Home', icon: Trophy },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'standings', label: 'Standings', icon: ListOrdered },
  ];


  const renderNotificationSettings = (isMobile = false) => {
    if (!showNotificationSettings) return null;
    return (
      <div className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border bg-white/95 dark:bg-slate-900/95 p-4 shadow-xl border-slate-200 dark:border-slate-800/80 backdrop-blur-md z-50 origin-top-right transition-all duration-200 ${isMobile ? 'right-[-40px] sm:right-0' : ''}`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Match Alerts</h3>
          <button 
            onClick={() => setShowNotificationSettings(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-655 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="mt-3.5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Enable Notifications</span>
              <p className="text-[10px] text-slate-450 dark:text-slate-455 leading-tight">Get kickoff, goals & full-time alerts</p>
            </div>
            <button
              onClick={() => {
                const newVal = !notificationsEnabled;
                setNotificationsEnabled(newVal);
                if (newVal && 'Notification' in window && Notification.permission !== 'granted') {
                  Notification.requestPermission();
                }
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                notificationsEnabled ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {notificationsEnabled && (
            <div className="space-y-2.5 pt-3 border-t border-slate-150 dark:border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Alert Scope</span>
              
              <div className="space-y-2">
                <label 
                  className={`flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer transition text-xs font-semibold ${
                    notificationScope === 'all' 
                      ? 'border-amber-500/40 bg-amber-500/5 text-slate-800 dark:text-slate-100' 
                      : 'border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-655 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="notificationScope"
                    value="all"
                    checked={notificationScope === 'all'}
                    onChange={() => setNotificationScope('all')}
                    className="mt-0.5 accent-amber-500 focus:ring-amber-500 h-3.5 w-3.5"
                  />
                  <div>
                    <span>All Tournament Matches</span>
                    <p className="text-[9px] font-normal text-slate-450 dark:text-slate-455 mt-0.5">Real-time score alerts for every game</p>
                  </div>
                </label>

                <label 
                  className={`flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer transition text-xs font-semibold ${
                    notificationScope === 'favorites' 
                      ? 'border-amber-500/40 bg-amber-500/5 text-slate-800 dark:text-slate-100' 
                      : 'border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-655 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="notificationScope"
                    value="favorites"
                    checked={notificationScope === 'favorites'}
                    onChange={() => setNotificationScope('favorites')}
                    className="mt-0.5 accent-amber-500 focus:ring-amber-500 h-3.5 w-3.5"
                  />
                  <div>
                    <span>Favorite Teams Only</span>
                    <p className="text-[9px] font-normal text-slate-450 dark:text-slate-455 mt-0.5">Only notify for matches involving your favorited country</p>
                    
                    {notificationScope === 'favorites' && (
                      <div className="mt-2 text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-500/5 p-1.5 rounded-md border border-amber-500/10">
                        {favTeamDetails ? (
                          <>⭐ Active: {favTeamDetails.flag} {favTeamDetails.name}</>
                        ) : (
                          <>⚠️ No favorite team selected. Tap standard team stars to star a team!</>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-300 border-slate-200/80 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-md">
            <Trophy className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-wider text-slate-800 dark:text-slate-100 uppercase sm:text-lg">
              Global Cup <span className="text-amber-600 dark:text-amber-400">2026</span>
            </h1>
            <p className="text-[10px] tracking-widest text-slate-500 dark:text-slate-400 font-semibold uppercase -mt-1">
              Live Tracker & Stats
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center space-x-3">
          
          {/* Favorite Team Badge */}
          {favTeamDetails && (
            <div 
              onClick={() => setActiveTab('fixtures')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-400 cursor-pointer hover:bg-amber-500/10 transition"
              title="Your Favorite Team"
            >
              <Star className="h-3.5 w-3.5 fill-current text-amber-500 dark:text-amber-400 animate-spin-slow" />
              <span>{favTeamDetails.flag} {favTeamDetails.name}</span>
            </div>
          )}
                  {/* Notification Settings Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationSettings(!showNotificationSettings)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200/60 dark:border-slate-700/30 transition-colors cursor-pointer"
              title="Alert Settings"
            >
              {notificationsEnabled ? <Bell className="h-4.5 w-4.5 text-amber-550 dark:text-amber-400" /> : <BellOff className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />}
            </button>
            {renderNotificationSettings(false)}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200/60 dark:border-slate-700/30 transition-colors"
            title={soundEnabled ? "Mute Goal Alerts" : "Unmute Goal Alerts"}
          >
            {soundEnabled ? <Volume2 className="h-4.5 w-4.5 text-amber-550 dark:text-amber-400" /> : <VolumeX className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200/60 dark:border-slate-700/30 transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-550 dark:text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-550 dark:text-indigo-400" />}
          </button>
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex items-center space-x-2 md:hidden">
          
          {/* Notification Settings Toggle Mobile */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationSettings(!showNotificationSettings)}
              className="p-1.5 rounded-lg text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 transition cursor-pointer"
              title="Alert Settings"
            >
              {notificationsEnabled ? <Bell className="h-4 w-4 text-amber-550 dark:text-amber-400" /> : <BellOff className="h-4 w-4 text-slate-455 dark:text-slate-500" />}
            </button>
            {renderNotificationSettings(true)}
          </div>

          {/* Mute and Theme on Mobile Header directly */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 transition"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-amber-550 dark:text-amber-400" /> : <VolumeX className="h-4 w-4 text-slate-450 dark:text-slate-500" />}
          </button>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 transition"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-550 dark:text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-550 dark:text-indigo-400" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 transition"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-slate-200/10 bg-white dark:bg-slate-950 px-4 py-4 space-y-3 shadow-xl transition-all duration-300">
          
          {/* Favorite Team Mobile Badge */}
          {favTeamDetails && (
            <div 
              onClick={() => {
                setActiveTab('fixtures');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center space-x-2 p-2 rounded-lg text-xs font-semibold border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 cursor-pointer"
            >
              <Star className="h-3.5 w-3.5 fill-current text-amber-550 dark:text-amber-400" />
              <span>Favorite Country: {favTeamDetails.flag} {favTeamDetails.name}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 p-3 rounded-lg text-sm font-medium transition ${
                    isActive 
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
