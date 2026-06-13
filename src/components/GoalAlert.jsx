import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, X } from 'lucide-react';

// Web Audio API Stadium Cheer Sound Synthesizer
const playCheerSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // --- WHISTLE BLOW ---
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(1000, audioCtx.currentTime + 0.08);
    osc.frequency.linearRampToValueAtTime(850, audioCtx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(1100, audioCtx.currentTime + 0.25);
    osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.35);
    
    oscGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);

    // --- CROWD CHEER (Noise + Filtering) ---
    const bufferSize = audioCtx.sampleRate * 3; // 3 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filter to reshape noise to sound like crowd roar
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 650; // Muffles high hiss

    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 350; // Concentrates energy in rumble
    bandpass.Q.value = 0.8;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.01, audioCtx.currentTime + 0.1);
    noiseGain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.45); // Fade in roar
    noiseGain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 1.2);  // Steady cheer
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.0); // Decay

    noiseSource.connect(lowpass);
    lowpass.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noiseSource.start(audioCtx.currentTime + 0.1);
    noiseSource.stop(audioCtx.currentTime + 3.0);
  } catch (err) {
    console.error("Synthesizer failed:", err);
  }
};

export default function GoalAlert({ alertsQueue, onDismissAlert, soundEnabled }) {
  const currentAlert = alertsQueue[0] || null;

  const handleClose = () => {
    if (currentAlert) {
      onDismissAlert(currentAlert.alertId);
    }
  };

  // Play Sound when a new alert becomes active
  useEffect(() => {
    if (currentAlert && soundEnabled) {
      playCheerSound();
    }
  }, [currentAlert, soundEnabled]);

  // Handle auto-dismiss timer when a new alert becomes active
  useEffect(() => {
    if (currentAlert) {
      const timer = setTimeout(() => {
        onDismissAlert(currentAlert.alertId);
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [currentAlert, onDismissAlert]);

  return (
    <AnimatePresence>
      {currentAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          
          <motion.div
            initial={{ scale: 0.3, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className="relative w-full max-w-md mx-auto overflow-hidden rounded-3xl border border-amber-500 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-5 sm:p-8 shadow-2xl text-center"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-100 transition cursor-pointer z-10 border border-slate-700/30"
              title="Close Alert"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Flashing Green Laser Line Effect */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 animate-pulse"></div>

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
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mt-1">
              Minute {currentAlert.minute}'
            </p>

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

            {/* Alert sound note */}
            {soundEnabled && (
              <div className="mt-4 flex items-center justify-center space-x-1.5 text-[10px] text-slate-500 font-bold">
                <Volume2 className="h-3 w-3 text-slate-400" />
                <span>Stadium audio synthesized live</span>
              </div>
            )}
          </motion.div>
          
        </div>
      )}
    </AnimatePresence>
  );
}
