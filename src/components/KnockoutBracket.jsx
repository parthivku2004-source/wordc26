import { useState, useEffect, useRef } from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { getCountryFlag, getCountryName, countries } from '../utils/countryHelper.jsx';

const BOARD_WIDTH = 1600;
const BOARD_HEIGHT = 920;
const CARD_WIDTH = 150;
const COLUMN_LEFT = [0, 177.78, 355.56, 533.33, 711.11, 888.89, 1066.67, 1244.44, 1422.22];
const yFinal = 340;
const yThird = 660;

export default function KnockoutBracket({ fixtures = [] }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.65);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Auto-fit scale on mount or resize
  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const fitScale = Math.max(0.2, Math.min(0.9, (width - 24) / BOARD_WIDTH));
      setScale(fitScale);
    }
  }, []);

  // Handle zoom with mouse wheel
  useEffect(() => {
    const handleWheel = (e) => {
      // Only zoom if pointer is inside viewport
      if (!containerRef.current) return;
      e.preventDefault();
      const zoomIntensity = 0.05;
      if (e.deltaY < 0) {
        setScale(prev => Math.min(prev + zoomIntensity, 2.0));
      } else {
        setScale(prev => Math.max(prev - zoomIntensity, 0.2));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y
        });
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.2));
  };

  const handleReset = () => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const fitScale = Math.max(0.2, Math.min(0.9, (width - 24) / BOARD_WIDTH));
      setScale(fitScale);
    } else {
      setScale(0.65);
    }
    setPosition({ x: 0, y: 0 });
  };
  const getFlag = (teamId, customClass = "w-5 h-3.5 shadow-sm rounded-sm") => {
    if (!teamId || teamId === 'TBD' || teamId.startsWith('W') || teamId.startsWith('L') || /^\d/.test(teamId)) {
      return <span className="text-[10px] filter grayscale opacity-45">🏳️</span>;
    }
    return getCountryFlag(teamId, customClass);
  };

  const getTeamName = (team, fallback) => {
    if (!team || team.id === 'TBD' || team.id.startsWith('W') || team.id.startsWith('L') || /^\d/.test(team.id)) {
      let name = team?.name || fallback || "TBD";
      if (name.startsWith('R32 Winner #')) {
        return `Winner ${name.replace('R32 Winner #', '')}`;
      }
      if (name.startsWith('R16 Winner #')) {
        return `Winner ${name.replace('R16 Winner #', '')}`;
      }
      if (name.startsWith('QF Winner #')) {
        return `Winner ${name.replace('QF Winner #', '')}`;
      }
      if (name.startsWith('Winner Group ')) {
        return `Winner ${name.replace('Winner Group ', '')}`;
      }
      if (name.startsWith('Runner-up Group ')) {
        return `Runner ${name.replace('Runner-up Group ', '')}`;
      }
      if (name.startsWith('3rd Place ')) {
        return `3rd ${name.replace('3rd Place ', '')}`;
      }
      // Formatting fallback string like "1A (TBD)" or "3rd ABCDF (TBD)"
      if (/^\d[A-L]/.test(name)) {
        const rank = name.slice(0, 1);
        const group = name.slice(1, 2);
        return rank === '1' ? `Winner Group ${group}` : `Runner Group ${group}`;
      }
      if (/^3rd [A-L]/.test(name)) {
        const match = name.match(/^3rd ([A-L/]+)/);
        return `3rd Place ${match ? match[1] : ''}`;
      }
      return name;
    }
    const isCountryCode = countries[team.id.toUpperCase().trim()] !== undefined;
    if (isCountryCode) {
      return getCountryName(team.id);
    }
    return team.name || fallback || "TBD";
  };

  const resolveBracketMatch = (stage, index) => {
    let matchId;
    let fallbackHome = "TBD";
    let fallbackAway = "TBD";

    if (stage === 'R32') {
      const r32Mapping = [
        { matchId: 73, home: '2A', away: '2B' },
        { matchId: 75, home: '1F', away: '2C' },
        { matchId: 74, home: '1E', away: '3ABCDF' },
        { matchId: 77, home: '1I', away: '3CDFGH' },
        { matchId: 81, home: '1D', away: '3BEFIJ' },
        { matchId: 82, home: '1G', away: '3AEHIJ' },
        { matchId: 83, home: '2K', away: '2L' },
        { matchId: 84, home: '1H', away: '2J' },
        // Right side:
        { matchId: 76, home: '1C', away: '2F' },
        { matchId: 78, home: '2E', away: '2I' },
        { matchId: 79, home: '1A', away: '3CEFHI' },
        { matchId: 80, home: '1L', away: '3EHIK' },
        { matchId: 86, home: '1J', away: '2H' },
        { matchId: 88, home: '2D', away: '2G' },
        { matchId: 85, home: '1B', away: '3EFGIJ' },
        { matchId: 87, home: '1K', away: '3DEIJL' }
      ];
      const mapping = r32Mapping[index];
      matchId = mapping.matchId;
      fallbackHome = mapping.home;
      fallbackAway = mapping.away;
    } else if (stage === 'R16') {
      const r16Mapping = [
        // Left side:
        { matchId: 90, home: 'Winner 73', away: 'Winner 75' },
        { matchId: 89, home: 'Winner 74', away: 'Winner 77' },
        { matchId: 94, home: 'Winner 81', away: 'Winner 82' },
        { matchId: 93, home: 'Winner 83', away: 'Winner 84' },
        // Right side:
        { matchId: 91, home: 'Winner 76', away: 'Winner 78' },
        { matchId: 92, home: 'Winner 79', away: 'Winner 80' },
        { matchId: 95, home: 'Winner 86', away: 'Winner 88' },
        { matchId: 96, home: 'Winner 85', away: 'Winner 87' }
      ];
      const mapping = r16Mapping[index];
      matchId = mapping.matchId;
      fallbackHome = mapping.home;
      fallbackAway = mapping.away;
    } else if (stage === 'QF') {
      const qfMapping = [
        // Left side:
        { matchId: 97, home: 'Winner 89', away: 'Winner 90' },
        { matchId: 98, home: 'Winner 93', away: 'Winner 94' },
        // Right side:
        { matchId: 99, home: 'Winner 91', away: 'Winner 92' },
        { matchId: 100, home: 'Winner 95', away: 'Winner 96' }
      ];
      const mapping = qfMapping[index];
      matchId = mapping.matchId;
      fallbackHome = mapping.home;
      fallbackAway = mapping.away;
    } else if (stage === 'SF') {
      const sfMapping = [
        // Left side:
        { matchId: 101, home: 'Winner 97', away: 'Winner 98' },
        // Right side:
        { matchId: 102, home: 'Winner 99', away: 'Winner 100' }
      ];
      const mapping = sfMapping[index];
      matchId = mapping.matchId;
      fallbackHome = mapping.home;
      fallbackAway = mapping.away;
    } else if (stage === 'Final') {
      matchId = 104;
      fallbackHome = "Winner 101";
      fallbackAway = "Winner 102";
    } else if (stage === 'ThirdPlace') {
      matchId = 103;
      fallbackHome = "Loser 101";
      fallbackAway = "Loser 102";
    }

    const match = fixtures.find(m => m.matchId === matchId);
    const homeId = match ? match.homeTeamId : 'TBD';
    const awayId = match ? match.awayTeamId : 'TBD';

    return {
      matchId,
      homeTeam: { id: homeId, name: match ? match.homeTeam : fallbackHome },
      awayTeam: { id: awayId, name: match ? match.awayTeam : fallbackAway },
      homeScore: match ? match.homeScore : null,
      awayScore: match ? match.awayScore : null,
      homePenalties: match ? match.homePenalties : null,
      awayPenalties: match ? match.awayPenalties : null,
      status: match ? match.status : 'Upcoming',
      winner: match && match.status === 'Finished' ? match.winner : null
    };
  };

  const renderMatchCard = (matchData, placeholderHome = "TBD", placeholderAway = "TBD", side = 'left') => {
    const isFinished = matchData.status === 'Finished';
    const isLive = matchData.status === 'LIVE' || matchData.status === 'Half Time' || matchData.status === 'Extra Time' || matchData.status === 'Penalties';
    const hasScore = matchData.homeScore !== null && matchData.awayScore !== null;

    const homeIsWinner = isFinished && matchData.winner === matchData.homeTeam.id;
    const awayIsWinner = isFinished && matchData.winner === matchData.awayTeam.id;

    let barColor = "bg-gradient-to-r from-blue-600 to-cyan-500";
    if (side === 'right') {
      barColor = "bg-gradient-to-r from-rose-500 to-red-600";
    } else if (side === 'center') {
      barColor = "bg-gradient-to-r from-blue-600 via-purple-500 to-rose-500";
    }

    return (
      <div className="relative overflow-hidden w-[150px] p-2.5 pt-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/90 shadow-md hover:scale-102 hover:shadow-lg transition-all duration-300 space-y-1.5 z-10">
        {/* Accent Bar */}
        <div className={`absolute top-0 left-0 right-0 h-[3px] ${barColor}`} />

        {/* Home Row */}
        <div className={`flex justify-between items-center text-[10px] sm:text-xs ${homeIsWinner ? 'font-black text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="flex items-center space-x-1 pl-0.5 truncate max-w-[105px]">
            <span>{getFlag(matchData.homeTeam.id)}</span>
            <span className="truncate">{getTeamName(matchData.homeTeam, placeholderHome)}</span>
          </span>
          {hasScore ? (
            <span className={`font-black text-right pr-0.5 ${homeIsWinner ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500'}`}>
              {matchData.homeScore}
              {matchData.homePenalties !== undefined && matchData.homePenalties !== null && (
                <span className="text-[8px] font-normal text-slate-400 dark:text-slate-500 ml-0.5">({matchData.homePenalties})</span>
              )}
            </span>
          ) : (
            <span className="text-[9px] text-slate-350 dark:text-slate-700 font-bold pr-0.5">-</span>
          )}
        </div>

        {/* Away Row */}
        <div className={`flex justify-between items-center text-[10px] sm:text-xs ${awayIsWinner ? 'font-black text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="flex items-center space-x-1 pl-0.5 truncate max-w-[105px]">
            <span>{getFlag(matchData.awayTeam.id)}</span>
            <span className="truncate">{getTeamName(matchData.awayTeam, placeholderAway)}</span>
          </span>
          {hasScore ? (
            <span className={`font-black text-right pr-0.5 ${awayIsWinner ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500'}`}>
              {matchData.awayScore}
              {matchData.awayPenalties !== undefined && matchData.awayPenalties !== null && (
                <span className="text-[8px] font-normal text-slate-400 dark:text-slate-505 ml-0.5">({matchData.awayPenalties})</span>
              )}
            </span>
          ) : (
            <span className="text-[9px] text-slate-350 dark:text-slate-700 font-bold pr-0.5">-</span>
          )}
        </div>

        {/* Status overlay */}
        <div className="pt-1 border-t border-slate-100 dark:border-slate-900/60 flex items-center justify-between text-[7px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {isLive ? (
            <span className="text-rose-500 animate-pulse flex items-center gap-0.5">
              <span>{matchData.status === 'LIVE' ? `LIVE • ${matchData.minute || 0}'` : matchData.status.toUpperCase()}</span>
              <span>🔴</span>
            </span>
          ) : isFinished ? (
            <span>Finished</span>
          ) : (
            <span>Upcoming</span>
          )}
        </div>
      </div>
    );
  };

  const renderPath = (d, isActive, key) => {
    return (
      <g key={key}>
        {isActive && (
          <path
            d={d}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.25"
            className="animate-pulse"
            style={{ filter: 'blur(3px)' }}
          />
        )}
        <path
          d={d}
          fill="none"
          stroke={isActive ? "#fb923c" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-all duration-500 ${isActive ? 'text-amber-500' : 'text-slate-200 dark:text-slate-800/40'}`}
        />
      </g>
    );
  };

  const drawBracketLines = () => {
    const paths = [];

    const isPathActive = (src, dest) => {
      if (!src || !dest) return false;
      if (src.status !== 'Finished' || !src.winner) return false;
      return dest.homeTeam.id === src.winner || dest.awayTeam.id === src.winner;
    };

    const isLoserPathActive = (src, dest) => {
      if (!src || !dest) return false;
      if (src.status !== 'Finished' || !src.winner) return false;
      const loserId = src.winner === src.homeTeam.id ? src.awayTeam.id : src.homeTeam.id;
      return dest.homeTeam.id === loserId || dest.awayTeam.id === loserId;
    };

    const getColCenterX = (c) => COLUMN_LEFT[c] + 177.78 / 2;
    const getCardCenterY = (n, idx) => (idx + 0.5) * (BOARD_HEIGHT / n);

    // Left Side Brackets:
    // 1. R32 (Col 0) -> R16 (Col 1)
    for (let i = 0; i < 8; i += 2) {
      const yA = getCardCenterY(8, i);
      const yB = getCardCenterY(8, i + 1);
      const yDest = getCardCenterY(4, i / 2);
      const startX = getColCenterX(0) + CARD_WIDTH / 2;
      const endX = getColCenterX(1) - CARD_WIDTH / 2;
      const midX = (getColCenterX(0) + getColCenterX(1)) / 2;

      const srcA = resolveBracketMatch('R32', i);
      const srcB = resolveBracketMatch('R32', i + 1);
      const dest = resolveBracketMatch('R16', i / 2);

      const activeA = isPathActive(srcA, dest);
      const activeB = isPathActive(srcB, dest);
      const activeDest = activeA || activeB;

      paths.push({ d: `M ${startX} ${yA} H ${midX} V ${yDest}`, active: activeA });
      paths.push({ d: `M ${startX} ${yB} H ${midX} V ${yDest}`, active: activeB });
      paths.push({ d: `M ${midX} ${yDest} H ${endX}`, active: activeDest });
    }

    // 2. R16 (Col 1) -> QF (Col 2)
    for (let i = 0; i < 4; i += 2) {
      const yA = getCardCenterY(4, i);
      const yB = getCardCenterY(4, i + 1);
      const yDest = getCardCenterY(2, i / 2);
      const startX = getColCenterX(1) + CARD_WIDTH / 2;
      const endX = getColCenterX(2) - CARD_WIDTH / 2;
      const midX = (getColCenterX(1) + getColCenterX(2)) / 2;

      const srcA = resolveBracketMatch('R16', i);
      const srcB = resolveBracketMatch('R16', i + 1);
      const dest = resolveBracketMatch('QF', i / 2);

      const activeA = isPathActive(srcA, dest);
      const activeB = isPathActive(srcB, dest);
      const activeDest = activeA || activeB;

      paths.push({ d: `M ${startX} ${yA} H ${midX} V ${yDest}`, active: activeA });
      paths.push({ d: `M ${startX} ${yB} H ${midX} V ${yDest}`, active: activeB });
      paths.push({ d: `M ${midX} ${yDest} H ${endX}`, active: activeDest });
    }

    // 3. QF (Col 2) -> SF (Col 3)
    for (let i = 0; i < 2; i += 2) {
      const yA = getCardCenterY(2, i);
      const yB = getCardCenterY(2, i + 1);
      const yDest = getCardCenterY(1, i / 2);
      const startX = getColCenterX(2) + CARD_WIDTH / 2;
      const endX = getColCenterX(3) - CARD_WIDTH / 2;
      const midX = (getColCenterX(2) + getColCenterX(3)) / 2;

      const srcA = resolveBracketMatch('QF', i);
      const srcB = resolveBracketMatch('QF', i + 1);
      const dest = resolveBracketMatch('SF', i / 2);

      const activeA = isPathActive(srcA, dest);
      const activeB = isPathActive(srcB, dest);
      const activeDest = activeA || activeB;

      paths.push({ d: `M ${startX} ${yA} H ${midX} V ${yDest}`, active: activeA });
      paths.push({ d: `M ${startX} ${yB} H ${midX} V ${yDest}`, active: activeB });
      paths.push({ d: `M ${midX} ${yDest} H ${endX}`, active: activeDest });
    }

    // 4. SF Left (Col 3) -> Final (Col 4) & 3rd Place (Col 4)
    {
      const ySF = getCardCenterY(1, 0);
      const startX = getColCenterX(3) + CARD_WIDTH / 2;
      const endX = getColCenterX(4) - CARD_WIDTH / 2;
      const midX = getColCenterX(3) + (getColCenterX(4) - getColCenterX(3)) * 0.45;

      const srcSF = resolveBracketMatch('SF', 0);
      const destFinal = resolveBracketMatch('Final', 0);
      const destThird = resolveBracketMatch('ThirdPlace', 0);

      const activeFinal = isPathActive(srcSF, destFinal);
      const activeThird = isLoserPathActive(srcSF, destThird);

      paths.push({ d: `M ${startX} ${ySF} H ${midX} V ${yFinal} H ${endX}`, active: activeFinal });
      paths.push({ d: `M ${startX} ${ySF} H ${midX} V ${yThird} H ${endX}`, active: activeThird });
    }

    // Right Side Brackets:
    // 1. R32 (Col 8) -> R16 (Col 7)
    for (let i = 0; i < 8; i += 2) {
      const yA = getCardCenterY(8, i);
      const yB = getCardCenterY(8, i + 1);
      const yDest = getCardCenterY(4, i / 2);
      const startX = getColCenterX(8) - CARD_WIDTH / 2;
      const endX = getColCenterX(7) + CARD_WIDTH / 2;
      const midX = (getColCenterX(8) + getColCenterX(7)) / 2;

      const srcA = resolveBracketMatch('R32', i + 8);
      const srcB = resolveBracketMatch('R32', i + 9);
      const dest = resolveBracketMatch('R16', i / 2 + 4);

      const activeA = isPathActive(srcA, dest);
      const activeB = isPathActive(srcB, dest);
      const activeDest = activeA || activeB;

      paths.push({ d: `M ${startX} ${yA} H ${midX} V ${yDest}`, active: activeA });
      paths.push({ d: `M ${startX} ${yB} H ${midX} V ${yDest}`, active: activeB });
      paths.push({ d: `M ${midX} ${yDest} H ${endX}`, active: activeDest });
    }

    // 2. R16 (Col 7) -> QF (Col 6)
    for (let i = 0; i < 4; i += 2) {
      const yA = getCardCenterY(4, i);
      const yB = getCardCenterY(4, i + 1);
      const yDest = getCardCenterY(2, i / 2);
      const startX = getColCenterX(7) - CARD_WIDTH / 2;
      const endX = getColCenterX(6) + CARD_WIDTH / 2;
      const midX = (getColCenterX(7) + getColCenterX(6)) / 2;

      const srcA = resolveBracketMatch('R16', i + 4);
      const srcB = resolveBracketMatch('R16', i + 5);
      const dest = resolveBracketMatch('QF', i / 2 + 2);

      const activeA = isPathActive(srcA, dest);
      const activeB = isPathActive(srcB, dest);
      const activeDest = activeA || activeB;

      paths.push({ d: `M ${startX} ${yA} H ${midX} V ${yDest}`, active: activeA });
      paths.push({ d: `M ${startX} ${yB} H ${midX} V ${yDest}`, active: activeB });
      paths.push({ d: `M ${midX} ${yDest} H ${endX}`, active: activeDest });
    }

    // 3. QF (Col 6) -> SF (Col 5)
    for (let i = 0; i < 2; i += 2) {
      const yA = getCardCenterY(2, i);
      const yB = getCardCenterY(2, i + 1);
      const yDest = getCardCenterY(1, i / 2);
      const startX = getColCenterX(6) - CARD_WIDTH / 2;
      const endX = getColCenterX(5) + CARD_WIDTH / 2;
      const midX = (getColCenterX(6) + getColCenterX(5)) / 2;

      const srcA = resolveBracketMatch('QF', i + 2);
      const srcB = resolveBracketMatch('QF', i + 3);
      const dest = resolveBracketMatch('SF', i / 2 + 1);

      const activeA = isPathActive(srcA, dest);
      const activeB = isPathActive(srcB, dest);
      const activeDest = activeA || activeB;

      paths.push({ d: `M ${startX} ${yA} H ${midX} V ${yDest}`, active: activeA });
      paths.push({ d: `M ${startX} ${yB} H ${midX} V ${yDest}`, active: activeB });
      paths.push({ d: `M ${midX} ${yDest} H ${endX}`, active: activeDest });
    }

    // 4. SF Right (Col 5) -> Final (Col 4) & 3rd Place (Col 4)
    {
      const ySF = getCardCenterY(1, 0);
      const startX = getColCenterX(5) - CARD_WIDTH / 2;
      const endX = getColCenterX(4) + CARD_WIDTH / 2;
      const midX = getColCenterX(5) - (getColCenterX(5) - getColCenterX(4)) * 0.45;

      const srcSF = resolveBracketMatch('SF', 1);
      const destFinal = resolveBracketMatch('Final', 0);
      const destThird = resolveBracketMatch('ThirdPlace', 0);

      const activeFinal = isPathActive(srcSF, destFinal);
      const activeThird = isLoserPathActive(srcSF, destThird);

      paths.push({ d: `M ${startX} ${ySF} H ${midX} V ${yFinal} H ${endX}`, active: activeFinal });
      paths.push({ d: `M ${startX} ${ySF} H ${midX} V ${yThird} H ${endX}`, active: activeThird });
    }

    return paths.map((p, idx) => renderPath(p.d, p.active, `path-${idx}`));
  };

  return (
    <div className="w-full rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-3 sm:p-6 backdrop-blur-md shadow-xl overflow-hidden">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/60 mb-4 sm:mb-6 gap-2">
        <div className="flex items-center space-x-2.5">
          <Trophy className="h-5 w-5 text-amber-500 dark:text-amber-400 animate-bounce-slow flex-shrink-0" />
          <div>
            <h3 className="text-sm font-black text-slate-850 dark:text-slate-100 uppercase tracking-widest">Road to the Championship Final</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase -mt-0.5">
              Round of 32 Knockout Bracket Layout (ACCORDING TO CURRENT STANDINGS)
            </p>
          </div>
        </div>
        {/* Interaction badge */}
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 w-fit text-amber-600 dark:text-amber-400">
          <span className="text-[9px] font-bold uppercase tracking-widest">Drag to pan • Scroll/Pinch to zoom</span>
        </div>
      </div>

      {/* Bracket Tree Container - Zoomable & Draggable Viewport */}
      <div className="relative w-full h-[520px] sm:h-[600px] md:h-[680px] rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/80 bg-slate-950 select-none shadow-inner"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundImage: 'radial-gradient(rgba(245, 158, 11, 0.08) 1.5px, transparent 1.5px), radial-gradient(rgba(14, 165, 233, 0.05) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      >
        {/* Canvas Board */}
        <div 
          className={`absolute origin-center ${isDragging ? 'transition-none' : 'transition-transform duration-200 ease-out'}`}
          style={{
            width: `${BOARD_WIDTH}px`,
            height: `${BOARD_HEIGHT}px`,
            left: `calc(50% - ${BOARD_WIDTH / 2}px)`,
            top: `calc(50% - ${BOARD_HEIGHT / 2}px)`,
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          
          {/* SVG Connector Lines */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full text-slate-200 dark:text-slate-800/30">
            {drawBracketLines()}
          </svg>
          
          {/* Column 0: Left R32 (8 Matches) */}
          <div className="absolute top-0 bottom-0 flex flex-col justify-around items-center w-[177.78px]" style={{ left: '0px' }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const matchData = resolveBracketMatch('R32', i);
              return (
                <div key={i} className="flex justify-center z-10">
                  {renderMatchCard(matchData, matchData.homeTeam.name, matchData.awayTeam.name, 'left')}
                </div>
              );
            })}
          </div>

          {/* Column 1: Left R16 (4 Matches) */}
          <div className="absolute top-0 bottom-0 flex flex-col justify-around items-center w-[177.78px]" style={{ left: '177.78px' }}>
            {Array.from({ length: 4 }).map((_, i) => {
              const matchData = resolveBracketMatch('R16', i);
              return (
                <div key={i} className="flex justify-center z-10">
                  {renderMatchCard(matchData, matchData.homeTeam.name, matchData.awayTeam.name, 'left')}
                </div>
              );
            })}
          </div>

          {/* Column 2: Left QF (2 Matches) */}
          <div className="absolute top-0 bottom-0 flex flex-col justify-around items-center w-[177.78px]" style={{ left: '355.56px' }}>
            {Array.from({ length: 2 }).map((_, i) => {
              const matchData = resolveBracketMatch('QF', i);
              return (
                <div key={i} className="flex justify-center z-10">
                  {renderMatchCard(matchData, matchData.homeTeam.name, matchData.awayTeam.name, 'left')}
                </div>
              );
            })}
          </div>

          {/* Column 3: Left SF (1 Match) */}
          <div className="absolute top-0 bottom-0 flex flex-col justify-around items-center w-[177.78px]" style={{ left: '533.33px' }}>
            {Array.from({ length: 1 }).map((_, i) => {
              const matchData = resolveBracketMatch('SF', i);
              return (
                <div key={i} className="flex justify-center z-10">
                  {renderMatchCard(matchData, matchData.homeTeam.name, matchData.awayTeam.name, 'left')}
                </div>
              );
            })}
          </div>

          {/* Column 4: Center (Final + 3rd Place) */}
          <div className="absolute top-0 bottom-0 w-[177.78px]" style={{ left: '711.11px' }}>
            {/* Final Match Block */}
            <div className="absolute w-[150px]" style={{ left: '13.89px', top: `${yFinal - 95}px` }}>
              <div className="flex flex-col items-center text-center space-y-1.5 mb-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg animate-bounce-slow">
                  <Trophy className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Championship Final</h4>
                  <p className="text-[7px] text-slate-500 font-bold uppercase">July 19 • MetLife Stadium</p>
                </div>
              </div>
              <div className="flex justify-center z-10">
                {renderMatchCard(resolveBracketMatch('Final', 0), "SF 1 Winner", "SF 2 Winner", 'center')}
              </div>
            </div>

            {/* 3rd Place Match Block */}
            <div className="absolute w-[150px]" style={{ left: '13.89px', top: `${yThird - 60}px` }}>
              <div className="flex flex-col items-center text-center space-y-1 mb-2.5">
                <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">3rd Place Match</h4>
                <p className="text-[7px] text-slate-500 font-bold uppercase">July 18 • Hard Rock Stadium</p>
              </div>
              <div className="flex justify-center z-10">
                {renderMatchCard(resolveBracketMatch('ThirdPlace', 0), "SF 1 Loser", "SF 2 Loser", 'center')}
              </div>
            </div>
          </div>

          {/* Column 5: Right SF (1 Match) */}
          <div className="absolute top-0 bottom-0 flex flex-col justify-around items-center w-[177.78px]" style={{ left: '888.89px' }}>
            {Array.from({ length: 1 }).map((_, i) => {
              const matchData = resolveBracketMatch('SF', i + 1);
              return (
                <div key={i} className="flex justify-center z-10">
                  {renderMatchCard(matchData, matchData.homeTeam.name, matchData.awayTeam.name, 'right')}
                </div>
              );
            })}
          </div>

          {/* Column 6: Right QF (2 Matches) */}
          <div className="absolute top-0 bottom-0 flex flex-col justify-around items-center w-[177.78px]" style={{ left: '1066.67px' }}>
            {Array.from({ length: 2 }).map((_, i) => {
              const matchData = resolveBracketMatch('QF', i + 2);
              return (
                <div key={i} className="flex justify-center z-10">
                  {renderMatchCard(matchData, matchData.homeTeam.name, matchData.awayTeam.name, 'right')}
                </div>
              );
            })}
          </div>

          {/* Column 7: Right R16 (4 Matches) */}
          <div className="absolute top-0 bottom-0 flex flex-col justify-around items-center w-[177.78px]" style={{ left: '1244.44px' }}>
            {Array.from({ length: 4 }).map((_, i) => {
              const matchData = resolveBracketMatch('R16', i + 4);
              return (
                <div key={i} className="flex justify-center z-10">
                  {renderMatchCard(matchData, matchData.homeTeam.name, matchData.awayTeam.name, 'right')}
                </div>
              );
            })}
          </div>

          {/* Column 8: Right R32 (8 Matches) */}
          <div className="absolute top-0 bottom-0 flex flex-col justify-around items-center w-[177.78px]" style={{ left: '1422.22px' }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const matchData = resolveBracketMatch('R32', i + 8);
              return (
                <div key={i} className="flex justify-center z-10">
                  {renderMatchCard(matchData, matchData.homeTeam.name, matchData.awayTeam.name, 'right')}
                </div>
              );
            })}
          </div>

        </div>

        {/* Zoom / Pan Controls Overlay */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-1.5 p-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
          <button 
            onClick={handleZoomOut}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-655 dark:text-slate-400 font-black text-sm cursor-pointer select-none h-7 w-7 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-[10px] font-black text-slate-655 dark:text-slate-350 min-w-[36px] text-center select-none tracking-wider">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={handleZoomIn}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-655 dark:text-slate-400 font-black text-sm cursor-pointer select-none h-7 w-7 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50"
            title="Zoom In"
          >
            +
          </button>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800/60" />
          <button 
            onClick={handleReset}
            className="px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer select-none h-7 flex items-center justify-center border border-amber-550/20"
            title="Fit Screen"
          >
            Fit
          </button>
        </div>

      </div>

      {/* Screen swipe/zoom info text */}
      <div className="mt-3 flex items-center justify-center space-x-2 text-slate-400 dark:text-slate-600">
        <Calendar className="h-3 w-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">
          Use mouse wheel / gestures to zoom, drag to pan
        </span>
        <Calendar className="h-3 w-3" />
      </div>

    </div>
  );
}
