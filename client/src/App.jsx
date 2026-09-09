import React, { useState, useEffect, useRef } from 'react';
import { Play, Flag, Users, Trophy, Settings, Target, Zap, Grid, Activity, Skull, X, ChevronRight, Home, RotateCcw, List, Heart, Hand } from 'lucide-react';
import HandCursor from './components/HandCursor';
import { getHandState } from './hooks/useHandTracker';

const Button3D = ({ color = 'blue', children, onClick, className = '', icon: Icon }) => {
  const colorMap = {
    blue: 'from-blue-400 to-blue-600 border-blue-700 shadow-blue-500/50',
    green: 'from-green-400 to-green-600 border-green-700 shadow-green-500/50',
    purple: 'from-purple-400 to-purple-600 border-purple-700 shadow-purple-500/50',
    orange: 'from-orange-400 to-orange-600 border-orange-700 shadow-orange-500/50',
    red: 'from-red-400 to-red-600 border-red-700 shadow-red-500/50',
    yellow: 'from-yellow-400 to-yellow-600 border-yellow-700 shadow-yellow-500/50',
    grey: 'from-slate-400 to-slate-600 border-slate-700 shadow-slate-500/50',
    dark: 'from-slate-700 to-slate-900 border-slate-950 shadow-slate-900/50',
  };

  return (
    <button
      onClick={onClick}
      className={`relative active:translate-y-1 active:border-b-0 active:mb-2 border-b-[6px] rounded-2xl w-full py-4 px-6 font-bold text-white text-2xl flex items-center justify-center gap-4 transition-all bg-gradient-to-b ${colorMap[color]} ${className} uppercase shadow-lg outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2`}
    >
      {Icon && <Icon className="w-8 h-8 drop-shadow-md" />}
      <span className="drop-shadow-md">{children}</span>
    </button>
  );
};

const Card3D = ({ children, className = '' }) => (
  <div className={`bg-white rounded-3xl border-b-[8px] border-slate-200 shadow-2xl p-6 ${className}`}>
    {children}
  </div>
);

const LogoText = () => (
  <div className="text-center mb-8">
    <h1 className="text-6xl font-black italic tracking-tighter text-blue-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]" style={{ WebkitTextStroke: '2px white' }}>
      HOLOBOX
    </h1>
    <h2 className="text-6xl font-black italic tracking-tighter text-orange-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] -mt-2" style={{ WebkitTextStroke: '2px white' }}>
      ARENA
    </h2>
  </div>
);

// Shared HUD bar used by every game mode
const GameTopBar = ({ label, score, right, rightLabel }) => (
  <div className="absolute top-0 inset-x-0 h-28 bg-white shadow-md flex justify-between items-center px-10 z-20 rounded-b-3xl">
    <div className="w-1/3">
      <div className="text-slate-400 font-bold text-sm tracking-widest">SCORE</div>
      <div className="text-4xl font-black text-slate-800">{score}</div>
    </div>
    <div className="w-1/3 flex justify-center">
      <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full font-bold text-xs tracking-wide shadow-sm border border-blue-200 whitespace-nowrap">
        {label}
      </span>
    </div>
    <div className="w-1/3 text-right">
      <div className="text-slate-400 font-bold text-sm tracking-widest">{rightLabel}</div>
      <div className="text-4xl font-black text-slate-800">{right}</div>
    </div>
  </div>
);

// Game mode catalog — shared by Mode Select + How To Play
const MODES = [
  { id: 'catch', name: 'Catch Master', desc: 'Tap glowing orbs, dodge spike bombs', icon: Target, color: 'blue', how: "TAP THE GLOWING ORBS. DODGE THE SPINNING SPIKE BOMBS." },
  { id: 'hit', name: 'Hit Master', desc: 'Whack targets before they vanish', icon: Zap, color: 'red', how: "TAP EACH TARGET FAST, BEFORE IT MOVES AWAY." },
  { id: 'memory', name: 'Memory Grid', desc: 'Watch the pattern, repeat it back', icon: Grid, color: 'yellow', how: "WATCH THE GLOWING SEQUENCE, THEN TAP IT BACK IN ORDER." },
  { id: 'dodge', name: 'Dodge Run', desc: 'Switch lanes, dodge falling blocks', icon: Activity, color: 'green', how: "TAP LEFT / RIGHT TO SWITCH LANES AND DODGE THE BLOCKS." },
  { id: 'boss', name: 'Boss Fight', desc: 'Smash the boss, avoid its counter', icon: Skull, color: 'purple', how: "TAP THE BOSS TO DEAL DAMAGE. DON'T TAP DURING ITS RED ATTACK FLASH." },
];

const MODE_GRADIENTS = {
  blue: 'from-blue-500 to-indigo-600',
  red: 'from-red-500 to-rose-600',
  yellow: 'from-amber-400 to-orange-500',
  green: 'from-emerald-500 to-green-600',
  purple: 'from-purple-500 to-fuchsia-600',
};

const ModeCard = ({ mode, onClick }) => {
  const Icon = mode.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 bg-gradient-to-br ${MODE_GRADIENTS[mode.color]} shadow-lg active:scale-[0.98] transition-all flex items-center gap-4 border border-white/10 outline-none focus-visible:ring-4 focus-visible:ring-white/70`}
    >
      <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-inner">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-black text-lg uppercase tracking-wide leading-tight">{mode.name}</div>
        <div className="text-white/80 text-xs font-medium truncate">{mode.desc}</div>
      </div>
      <ChevronRight className="w-6 h-6 text-white/70 flex-shrink-0" />
    </button>
  );
};

// Screens
const Splash = ({ onNext }) => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-white relative cursor-pointer" onClick={onNext}>
    <div className="flex flex-col items-center relative z-10 space-y-12">
      {/* Abstract 3D Cube representation */}
      <div className="w-48 h-48 relative animate-pulse mb-8">
        <div className="absolute inset-0 bg-blue-500 rounded-3xl transform rotate-45 shadow-[0_20px_50px_rgba(59,130,246,0.5)] border-4 border-white flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-300 rounded-xl transform -rotate-45 shadow-inner opacity-80 border-2 border-blue-200"></div>
            <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full opacity-60 shadow-lg"></div>
        </div>
      </div>
      <LogoText />
      <Button3D color="blue" className="mt-20 w-80 animate-bounce" onClick={onNext}>
        TAP ANYWHERE<br/>TO START
      </Button3D>
    </div>
  </div>
);

const MainMenu = ({ onNavigate }) => (
  <div className="flex flex-col items-center h-full w-full bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 p-8 pt-16">
    <LogoText />
    <Card3D className="w-full max-w-md mt-4">
      <h3 className="text-center text-slate-500 font-bold mb-6 text-xl">MAIN MENU</h3>
      <div className="space-y-4">
        <Button3D color="green" icon={Play} onClick={() => onNavigate('ModeSelect')}>QUICK PLAY</Button3D>
        <Button3D color="blue" icon={Flag} onClick={() => onNavigate('ModeSelect')}>CAMPAIGN</Button3D>
        <Button3D color="purple" icon={Users} onClick={() => onNavigate('ModeSelect')}>2 PLAYER</Button3D>
        <Button3D color="orange" icon={Trophy} onClick={() => onNavigate('Leaderboard')}>LEADERBOARD</Button3D>
        <Button3D color="grey" icon={Settings}>SETTINGS</Button3D>
      </div>
    </Card3D>
    <div className="mt-8 bg-white rounded-full px-8 py-4 flex items-center gap-4 shadow-md border border-slate-200">
      <Trophy className="w-10 h-10 text-yellow-500 fill-yellow-500 drop-shadow-md" />
      <div className="flex flex-col">
        <span className="text-slate-500 font-bold text-sm tracking-widest">BEST SCORE</span>
        <span className="text-slate-800 font-black text-3xl leading-none">12580</span>
      </div>
    </div>
  </div>
);

const ModeSelect = ({ onNavigate, onSelectMode }) => (
  <div className="flex flex-col items-center h-full w-full bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 p-8 pt-16">
    <Card3D className="w-full max-w-md h-full flex flex-col pt-8">
      <h3 className="text-center text-slate-500 font-bold mb-6 text-xl tracking-widest">SELECT MODE</h3>
      <div className="space-y-4 flex-1 overflow-y-auto pb-4">
        {MODES.map(mode => (
          <ModeCard
            key={mode.id}
            mode={mode}
            onClick={() => { onSelectMode(mode.id); onNavigate('HowToPlay'); }}
          />
        ))}
      </div>
    </Card3D>
  </div>
);

const HowToPlay = ({ onNavigate, mode }) => {
  const modeInfo = MODES.find(m => m.id === mode) || MODES[0];
  const Icon = modeInfo.icon;
  return (
    <div className="flex flex-col items-center h-full w-full bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 p-8 pt-16">
      <Card3D className="w-full max-w-md h-full flex flex-col items-center justify-between py-12">
        <h3 className="text-center text-slate-500 font-bold text-2xl tracking-widest">HOW TO PLAY</h3>
        <div className="relative flex-1 w-full flex items-center justify-center my-8 bg-slate-50 rounded-3xl overflow-hidden shadow-inner border border-slate-200">
          <div className="w-48 h-48 border-[6px] border-blue-200 border-dashed rounded-full animate-spin absolute" style={{ animationDuration: '6s' }}></div>
          <div className={`w-24 h-24 bg-gradient-to-br ${MODE_GRADIENTS[modeInfo.color]} rounded-full shadow-[0_0_40px_rgba(96,165,250,0.6)] z-10 flex items-center justify-center border-4 border-white`}>
            <Icon className="w-12 h-12 text-white" />
          </div>
        </div>
        <div className="text-center mb-10 w-full px-6">
          <span className="text-xs font-black uppercase tracking-widest text-blue-500 mb-2 block">{modeInfo.name}</span>
          <p className="text-slate-600 font-bold text-xl leading-relaxed">{modeInfo.how}</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <Hand className="w-4 h-4" /> Pinch your fingers together to tap
          </div>
        </div>
        <Button3D color="green" className="w-full" onClick={() => onNavigate('Countdown')}>
          OK, GOT IT!
        </Button3D>
      </Card3D>
    </div>
  );
};

const Countdown = ({ onNavigate }) => {
  const [count, setCount] = useState(3);
  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onNavigate('GamePlay');
    }
  }, [count, onNavigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 relative">
      <h2 className="absolute top-48 text-5xl font-black text-slate-400 tracking-wider">GET READY!</h2>
      <div className="w-80 h-80 rounded-full border-[12px] border-blue-100 flex items-center justify-center relative shadow-[inset_0_0_50px_rgba(0,0,0,0.1)] bg-white">
        <div className="absolute inset-0 rounded-full border-t-[12px] border-blue-500 animate-spin" style={{ animationDuration: '1s' }}></div>
        <span className="text-9xl font-black text-blue-500 drop-shadow-lg scale-150 animate-pulse">
          {count || 'GO!'}
        </span>
      </div>
    </div>
  );
};

// ── Mode 1: Catch Master ──────────────────────────────────────────
const GamePlay = ({ onNavigate, setFinalScore }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  const [objects, setObjects] = useState([]);
  const [bonusText, setBonusText] = useState(null);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setFinalScore({ score, combo, accuracy: Math.min(100, Math.max(0, 50 + combo * 5)) });
      onNavigate('LevelComplete');
    }
  }, [timeLeft, onNavigate, score, combo, setFinalScore]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      const id = Date.now();
      const type = Math.random() > 0.2 ? 'orb' : 'virus';
      const x = Math.random() * 70 + 15;
      const y = Math.random() * 60 + 20;
      setObjects(prev => [...prev, { id, type, x, y }]);
      setTimeout(() => {
        setObjects(prev => prev.filter(o => o.id !== id));
      }, 2000);
    }, 700);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleTap = (obj) => {
    setObjects(prev => prev.filter(o => o.id !== obj.id));
    if (obj.type === 'orb') {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const points = 10 * newCombo;
      setScore(s => s + points);
      if (newCombo % 5 === 0) {
        setBonusText(`+${points} BONUS`);
        setTimeout(() => setBonusText(null), 1000);
      }
    } else {
      setCombo(0);
      setScore(s => Math.max(0, s - 50));
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full bg-slate-100 relative overflow-hidden">
      <GameTopBar label="CATCH MASTER" score={score} right={`00:${timeLeft.toString().padStart(2, '0')}`} rightLabel="TIME" />

      <div className="absolute inset-0 top-28 z-10">
        {objects.map(obj => (
          <div
            key={obj.id}
            onClick={() => handleTap(obj)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
            style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
          >
            {obj.type === 'orb' ? (
              <div className="w-24 h-24 bg-blue-400 rounded-full border-4 border-white shadow-[0_0_30px_rgba(96,165,250,1)] flex items-center justify-center animate-pulse">
                <div className="w-12 h-12 bg-white rounded-full opacity-60 shadow-inner"></div>
              </div>
            ) : (
              <div className="w-28 h-28 bg-red-500 rounded-full border-4 border-red-700 shadow-[0_0_30px_rgba(239,68,68,1)] flex items-center justify-center relative animate-spin" style={{animationDuration: '3s'}}>
                {[0,45,90,135,180,225,270,315].map(deg => (
                  <div key={deg} className="absolute w-4 h-8 bg-red-700 rounded-full" style={{ transform: `rotate(${deg}deg) translateY(-18px)` }}></div>
                ))}
                <div className="w-12 h-12 bg-red-300 rounded-full opacity-50 z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <X className="w-10 h-10 text-white opacity-80" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {combo > 2 && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none text-center">
          <div className="text-orange-400 font-black text-5xl drop-shadow-lg tracking-wider">COMBO</div>
          <div className="text-yellow-400 font-black text-7xl drop-shadow-lg transform scale-110 animate-bounce">x{combo}</div>
        </div>
      )}

      {bonusText && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none text-yellow-400 font-black text-6xl drop-shadow-[0_5px_10px_rgba(0,0,0,0.3)] animate-fade-in-up">
          {bonusText}
        </div>
      )}
    </div>
  );
};

// ── Mode 2: Hit Master (whack-a-mole) ─────────────────────────────
const HitMasterGame = ({ onNavigate, setFinalScore }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeIndex, setActiveIndex] = useState(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    } else {
      const total = hits + misses;
      const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;
      setFinalScore({ score, combo: hits, accuracy });
      onNavigate('LevelComplete');
    }
  }, [timeLeft, hits, misses, score, setFinalScore, onNavigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const spawn = setInterval(() => {
      setActiveIndex(() => Math.floor(Math.random() * 9));
    }, 800);
    return () => clearInterval(spawn);
  }, [timeLeft]);

  const handleCellTap = (i) => {
    if (i === activeIndex) {
      setScore(s => s + 15);
      setHits(h => h + 1);
      setActiveIndex(null);
    } else {
      setMisses(m => m + 1);
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full bg-slate-100 relative overflow-hidden">
      <GameTopBar label="HIT MASTER" score={score} right={`00:${timeLeft.toString().padStart(2, '0')}`} rightLabel="TIME" />
      <div className="flex-1 w-full flex items-center justify-center px-8 pt-28">
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          {Array.from({ length: 9 }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleCellTap(i)}
              className={`aspect-square rounded-2xl border-4 flex items-center justify-center transition-all duration-150 outline-none focus-visible:ring-4 focus-visible:ring-red-300 ${
                activeIndex === i
                  ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-700 shadow-[0_0_25px_rgba(239,68,68,0.8)] scale-105'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {activeIndex === i && <Zap className="w-10 h-10 text-white drop-shadow-md" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Mode 3: Memory Grid (Simon says) ──────────────────────────────
const TILE_COLORS = [
  { base: 'bg-blue-500', active: 'bg-blue-300 shadow-[0_0_40px_rgba(59,130,246,0.9)]' },
  { base: 'bg-red-500', active: 'bg-red-300 shadow-[0_0_40px_rgba(239,68,68,0.9)]' },
  { base: 'bg-yellow-500', active: 'bg-yellow-300 shadow-[0_0_40px_rgba(234,179,8,0.9)]' },
  { base: 'bg-green-500', active: 'bg-green-300 shadow-[0_0_40px_rgba(34,197,94,0.9)]' },
];

const MemoryGridGame = ({ onNavigate, setFinalScore }) => {
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [round, setRound] = useState(1);
  const [flashIndex, setFlashIndex] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const endedRef = useRef(false);

  useEffect(() => {
    setSequence(prev => [...prev, Math.floor(Math.random() * 4)]);
    setPlayerStep(0);
  }, [round]);

  useEffect(() => {
    if (sequence.length === 0) return;
    setIsPlayerTurn(false);
    let i = 0;
    let cancelled = false;
    const playNext = () => {
      if (cancelled) return;
      if (i >= sequence.length) {
        setFlashIndex(null);
        setIsPlayerTurn(true);
        return;
      }
      setFlashIndex(sequence[i]);
      setTimeout(() => {
        if (cancelled) return;
        setFlashIndex(null);
        i += 1;
        setTimeout(playNext, 250);
      }, 500);
    };
    const start = setTimeout(playNext, 600);
    return () => { cancelled = true; clearTimeout(start); };
  }, [sequence]);

  const handleEnd = (finalRound) => {
    if (endedRef.current) return;
    endedRef.current = true;
    setFinalScore({ score: (finalRound - 1) * 50, combo: finalRound - 1, accuracy: 100 });
    onNavigate('LevelComplete');
  };

  const handleTileTap = (i) => {
    if (!isPlayerTurn) return;
    if (i === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      if (nextStep === sequence.length) {
        setIsPlayerTurn(false);
        setTimeout(() => setRound(r => r + 1), 600);
      } else {
        setPlayerStep(nextStep);
      }
    } else {
      setIsPlayerTurn(false);
      handleEnd(round);
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full bg-slate-100 relative overflow-hidden">
      <GameTopBar label="MEMORY GRID" score={(round - 1) * 50} right={round} rightLabel="ROUND" />
      <div className="flex-1 w-full flex flex-col items-center justify-center px-10 pt-28">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-8 text-center">
          {isPlayerTurn ? 'Your turn — repeat the pattern' : 'Watch carefully...'}
        </p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {TILE_COLORS.map((c, i) => (
            <button
              key={i}
              onClick={() => handleTileTap(i)}
              className={`aspect-square rounded-3xl border-4 border-white shadow-lg transition-all duration-150 outline-none focus-visible:ring-4 focus-visible:ring-slate-400 ${flashIndex === i ? c.active + ' scale-105' : c.base}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Mode 4: Dodge Run ─────────────────────────────────────────────
const DodgeRunGame = ({ onNavigate, setFinalScore }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [lane, setLane] = useState(1);
  const [blocks, setBlocks] = useState([]);
  const endedRef = useRef(false);

  useEffect(() => {
    if (endedRef.current) return;
    if (timeLeft > 0 && lives > 0) {
      const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
      return () => clearTimeout(t);
    } else {
      endedRef.current = true;
      const accuracy = Math.max(0, Math.round((lives / 3) * 100));
      setFinalScore({ score, combo: lives, accuracy });
      onNavigate('LevelComplete');
    }
  }, [timeLeft, lives, score, setFinalScore, onNavigate]);

  useEffect(() => {
    if (lives <= 0) return;
    const spawner = setInterval(() => {
      setBlocks(prev => [...prev, { id: Date.now() + Math.random(), lane: Math.floor(Math.random() * 3), y: -10 }]);
    }, 900);
    return () => clearInterval(spawner);
  }, [lives]);

  useEffect(() => {
    if (lives <= 0) return;
    const mover = setInterval(() => {
      // Follow the tracked hand's horizontal position as a live lane control
      // (falls back to the on-screen LEFT/RIGHT buttons if no hand is seen).
      const hand = getHandState();
      if (hand.status === 'ready' && hand.handVisible) {
        const handLane = Math.min(2, Math.max(0, Math.floor(hand.xPct / (100 / 3))));
        setLane(handLane);
      }

      setBlocks(prev => {
        const next = [];
        prev.forEach(b => {
          const ny = b.y + 8;
          if (ny >= 85) {
            if (b.lane === lane) {
              setLives(l => Math.max(0, l - 1));
            } else {
              setScore(s => s + 10);
            }
          } else {
            next.push({ ...b, y: ny });
          }
        });
        return next;
      });
    }, 120);
    return () => clearInterval(mover);
  }, [lane, lives]);

  return (
    <div className="flex flex-col items-center h-full w-full bg-slate-100 relative overflow-hidden">
      <GameTopBar label="DODGE RUN" score={score} right={`00:${timeLeft.toString().padStart(2, '0')}`} rightLabel="TIME" />

      <div className="flex items-center gap-2 absolute top-32 left-1/2 -translate-x-1/2 z-20">
        {[0,1,2].map(i => (
          <Heart key={i} className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-300'}`} />
        ))}
      </div>

      <div className="absolute inset-0 top-28 grid grid-cols-3">
        {[0,1,2].map(l => (
          <div key={l} className="relative border-r last:border-r-0 border-slate-200">
            {blocks.filter(b => b.lane === l).map(b => (
              <div
                key={b.id}
                className="absolute left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg"
                style={{ top: `${b.y}%` }}
              />
            ))}
          </div>
        ))}
        <div
          className="absolute bottom-6 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full shadow-[0_0_20px_rgba(96,165,250,0.8)] border-4 border-white transition-all duration-150"
          style={{ left: `${(lane + 0.5) * (100 / 3)}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      <div className="absolute bottom-0 inset-x-0 flex px-8 pb-8 gap-4 z-30">
        <button
          onClick={() => setLane(l => Math.max(0, l - 1))}
          className="flex-1 py-5 rounded-2xl bg-white shadow-lg border border-slate-200 font-black text-slate-600 active:scale-95 transition-all outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
        >
          ◀ LEFT
        </button>
        <button
          onClick={() => setLane(l => Math.min(2, l + 1))}
          className="flex-1 py-5 rounded-2xl bg-white shadow-lg border border-slate-200 font-black text-slate-600 active:scale-95 transition-all outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
        >
          RIGHT ▶
        </button>
      </div>
    </div>
  );
};

// ── Mode 5: Boss Fight ────────────────────────────────────────────
const BossFightGame = ({ onNavigate, setFinalScore }) => {
  const [timeLeft, setTimeLeft] = useState(40);
  const [bossHp, setBossHp] = useState(100);
  const [playerHits, setPlayerHits] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);
  const endedRef = useRef(false);

  const finished = bossHp <= 0 || playerHits >= 3 || timeLeft <= 0;

  useEffect(() => {
    if (finished) {
      if (endedRef.current) return;
      endedRef.current = true;
      const won = bossHp <= 0;
      setFinalScore({
        score: score + (won ? 200 : 0),
        combo: 100 - bossHp,
        accuracy: won ? 100 : Math.max(0, 100 - playerHits * 30),
      });
      onNavigate('LevelComplete');
      return;
    }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, finished, bossHp, score, playerHits, setFinalScore, onNavigate]);

  useEffect(() => {
    if (finished) return;
    let cancelled = false;
    const cycle = () => {
      setPhase('warning');
      setTimeout(() => {
        if (cancelled) return;
        setPhase('attack');
        setTimeout(() => {
          if (cancelled) return;
          setPhase('idle');
        }, 500);
      }, 500);
    };
    const t = setInterval(cycle, 2200);
    return () => { cancelled = true; clearInterval(t); };
  }, [finished]);

  const handleBossTap = () => {
    if (finished) return;
    if (phase === 'attack') {
      setPlayerHits(h => h + 1);
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }
    setBossHp(hp => Math.max(0, hp - 12));
    setScore(s => s + 12);
  };

  return (
    <div className={`flex flex-col items-center h-full w-full relative overflow-hidden transition-colors duration-300 ${phase === 'attack' ? 'bg-red-50' : phase === 'warning' ? 'bg-amber-50' : 'bg-slate-100'}`}>
      <GameTopBar label="BOSS FIGHT" score={score} right={`00:${timeLeft.toString().padStart(2, '0')}`} rightLabel="TIME" />
      <div className="flex-1 w-full flex flex-col items-center justify-center px-10 pt-24">
        <div className="w-full max-w-sm mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Boss HP</span><span>{bossHp}%</span>
          </div>
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-300" style={{ width: `${bossHp}%` }} />
          </div>
        </div>

        <button
          onClick={handleBossTap}
          className={`w-56 h-56 rounded-full flex items-center justify-center transition-transform duration-150 outline-none focus-visible:ring-4 focus-visible:ring-purple-300 border-4 border-white ${shake ? '-translate-x-2' : ''} ${
            phase === 'attack'
              ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_60px_rgba(239,68,68,0.7)] scale-105'
              : 'bg-gradient-to-br from-purple-600 to-fuchsia-700 shadow-[0_0_40px_rgba(168,85,247,0.5)]'
          }`}
        >
          <Skull className="w-24 h-24 text-white drop-shadow-lg" />
        </button>

        <p className={`mt-8 text-center font-black text-sm uppercase tracking-widest ${phase === 'attack' ? 'text-red-500' : 'text-slate-400'}`}>
          {phase === 'attack' ? "DON'T TAP! BOSS IS ATTACKING" : phase === 'warning' ? 'Boss winding up...' : 'Tap the boss!'}
        </p>

        <div className="flex gap-2 mt-4">
          {[0,1,2].map(i => (
            <Heart key={i} className={`w-6 h-6 ${i < (3 - playerHits) ? 'text-red-500 fill-red-500' : 'text-slate-200'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

const LevelComplete = ({ onNavigate, stats }) => (
  <div className="flex flex-col h-full w-full bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 p-8 pt-14 overflow-y-auto">
    <div className="text-center mb-6 flex-shrink-0">
      <h2 className="text-green-500 text-4xl font-black uppercase tracking-wide leading-tight">Level Complete!</h2>
      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Great run</p>
    </div>

    <div className="flex justify-center items-end gap-2 mb-8 h-28 flex-shrink-0">
      <Trophy className="w-20 h-20 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] transform -rotate-12 mb-2" />
      <Trophy className="w-28 h-28 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] z-10" />
      <Trophy className="w-20 h-20 text-slate-300 fill-slate-300 transform rotate-12 mb-2" />
    </div>

    <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-6 mb-6 flex-shrink-0">
      <div className="text-center mb-6">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Final Score</span>
        <div className="text-6xl font-black text-blue-500 mt-1 leading-none">{stats?.score ?? 0}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-2xl px-4 py-4 border border-slate-100 text-center">
          <List className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <div className="text-slate-800 font-black text-xl">x{stats?.combo ?? 0}</div>
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">Best Combo</div>
        </div>
        <div className="bg-slate-50 rounded-2xl px-4 py-4 border border-slate-100 text-center">
          <Target className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <div className="text-slate-800 font-black text-xl">{stats?.accuracy ?? 0}%</div>
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">Accuracy</div>
        </div>
      </div>
    </div>

    <div className="space-y-3 flex-shrink-0 mt-auto">
      <Button3D color="green" icon={RotateCcw} onClick={() => onNavigate('Countdown')}>PLAY AGAIN</Button3D>
      <Button3D color="orange" icon={Trophy} onClick={() => onNavigate('Leaderboard')}>LEADERBOARD</Button3D>
    </div>
  </div>
);

const Leaderboard = ({ onNavigate }) => (
  <div className="flex flex-col items-center h-full w-full bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 p-8 pt-14">
    <div className="w-full max-w-md flex flex-col h-full bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden relative">
      <h2 className="text-slate-800 text-2xl font-black text-center py-7 bg-slate-50 border-b border-slate-100 tracking-widest">
        LEADERBOARD
      </h2>

      <div className="flex px-6 pt-5 pb-4 gap-2">
        <button className="flex-1 bg-blue-500 text-white font-bold py-3 text-base rounded-xl shadow-sm outline-none focus-visible:ring-4 focus-visible:ring-blue-200">WORLD</button>
        <button className="flex-1 bg-slate-100 text-slate-500 font-bold py-3 text-base rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-slate-200">FRIENDS</button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3">
        {[
          {r:1, n:'PLAYER ONE', s:'25680', gold:true},
          {r:2, n:'HOLOMASTER', s:'19540', silver:true},
          {r:3, n:'SHADOW', s:'17890', bronze:true},
          {r:4, n:'GAMERX', s:'12580', highlight:true},
          {r:5, n:'CYBERKING', s:'11240'},
          {r:6, n:'NINJA', s:'9850'},
        ].map(row => (
          <div key={row.r} className={`flex items-center justify-between p-4 rounded-2xl ${row.highlight ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' : 'bg-slate-50 border border-slate-100'}`}>
            <div className="flex items-center gap-4">
              <span className={`font-black w-7 text-center text-lg ${row.gold?'text-yellow-500':row.silver?'text-slate-400':row.bronze?'text-orange-500':'text-slate-400'}`}>{row.r}</span>
              {row.gold || row.silver || row.bronze ? <Trophy className={`w-6 h-6 ${row.gold?'text-yellow-500 fill-yellow-500':row.silver?'text-slate-400 fill-slate-400':'text-orange-500 fill-orange-500'}`} /> : <span className="w-6 h-6 block"></span>}
              <span className={`font-bold text-base ${row.highlight ? 'text-blue-700' : 'text-slate-700'}`}>{row.n}</span>
            </div>
            <span className={`font-black text-lg ${row.highlight ? 'text-blue-600' : 'text-slate-800'}`}>{row.s}</span>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 border-t border-slate-100 p-6 text-center">
        <div className="text-slate-400 font-bold text-xs uppercase mb-1 tracking-widest">Your Rank</div>
        <div className="text-slate-800 font-black text-3xl">4 <span className="text-slate-400 text-lg font-bold">/ 12,580</span></div>
      </div>

      {/* Click anywhere on leaderboard to go to Next */}
      <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => onNavigate('PlayAgainHome')}></div>
    </div>
  </div>
);

const PlayAgainHome = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 p-10">
    <div className="w-full max-w-sm flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.4)] mb-8">
        <Trophy className="w-14 h-14 text-white" />
      </div>
      <h2 className="text-slate-800 text-4xl font-black text-center mb-2 uppercase tracking-wide">Thanks for Playing!</h2>
      <p className="text-slate-500 text-center font-medium mb-12">Ready for another round?</p>
      <div className="w-full space-y-4">
        <Button3D color="green" icon={RotateCcw} onClick={() => onNavigate('ModeSelect')}>PLAY AGAIN</Button3D>
        <Button3D color="grey" icon={Home} onClick={() => onNavigate('MainMenu')}>MAIN MENU</Button3D>
      </div>
    </div>
  </div>
);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [mode, setMode] = useState('catch');
  const [finalScore, setFinalScore] = useState({ score: 0, combo: 0, accuracy: 0 });

  const handleNavigate = (screen) => setCurrentScreen(screen);

  const renderGame = () => {
    const props = { onNavigate: handleNavigate, setFinalScore };
    switch (mode) {
      case 'hit':
        return <HitMasterGame {...props} />;
      case 'memory':
        return <MemoryGridGame {...props} />;
      case 'dodge':
        return <DodgeRunGame {...props} />;
      case 'boss':
        return <BossFightGame {...props} />;
      default:
        return <GamePlay {...props} />;
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return <Splash onNext={() => handleNavigate('MainMenu')} />;
      case 'MainMenu':
        return <MainMenu onNavigate={handleNavigate} />;
      case 'ModeSelect':
        return <ModeSelect onNavigate={handleNavigate} onSelectMode={setMode} />;
      case 'HowToPlay':
        return <HowToPlay onNavigate={handleNavigate} mode={mode} />;
      case 'Countdown':
        return <Countdown onNavigate={handleNavigate} />;
      case 'GamePlay':
        return renderGame();
      case 'LevelComplete':
        return <LevelComplete onNavigate={handleNavigate} stats={finalScore} />;
      case 'Leaderboard':
        return <Leaderboard onNavigate={handleNavigate} />;
      case 'PlayAgainHome':
        return <PlayAgainHome onNavigate={handleNavigate} />;
      default:
        return <Splash onNext={() => handleNavigate('MainMenu')} />;
    }
  };

  const handPlayActive = currentScreen === 'Countdown' || currentScreen === 'GamePlay';

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100 p-0 overflow-hidden">
      {/* 1080x1920 9:16 Portrait Canvas (Scales to fit screen while maintaining ratio) */}
      <div className="kiosk-aspect relative bg-white flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        {/* Content Screens */}
        <div className="flex-1 overflow-hidden relative">
          {renderScreen()}
        </div>
      </div>
      <HandCursor active={handPlayActive} />
    </div>
  );
}
