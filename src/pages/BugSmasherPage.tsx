import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Play, 
  Pause, 
  Trophy, 
  Crosshair, 
  Flame, 
  Sparkles, 
  AlertTriangle
} from 'lucide-react';
import { arcadeAudio } from '../utils/arcadeAudio';

interface Bug {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: 'glitch' | 'speed' | 'tank' | 'ghost' | 'boss';
  hp: number;
  maxHp: number;
  speed: number;
  color: string;
  points: number;
  angle: number;
  legPhase: number;
  glitchOffset?: number;
  alpha?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: 'emp' | 'freeze' | 'heal' | 'multishot';
  speed: number;
  icon: string;
  color: string;
}

interface LaserStreak {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  alpha: number;
}

export const BugSmasherPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game states
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('bug_smasher_high_score') || '0', 10);
  });
  const [health, setHealth] = useState<number>(100);
  const [wave, setWave] = useState<number>(1);
  const [combo, setCombo] = useState<number>(1);
  const [bugsSquashed, setBugsSquashed] = useState<number>(0);
  const [accuracyHits, setAccuracyHits] = useState<number>(0);
  const [accuracyTotal, setAccuracyTotal] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activePowerup, setActivePowerup] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Mutable refs for high performance 60fps loop
  const stateRef = useRef({
    gameState: 'idle' as 'idle' | 'playing' | 'paused' | 'gameover',
    score: 0,
    health: 100,
    wave: 1,
    combo: 1,
    comboTimer: 0,
    bugsSquashed: 0,
    accuracyHits: 0,
    accuracyTotal: 0,
    frozenUntil: 0,
    multiShotUntil: 0,
    lastSpawnTime: 0,
    lastPowerupTime: 0,
    nextBugId: 1,
    nextTextId: 1,
    nextPowerupId: 1,
  });

  const bugsRef = useRef<Bug[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const laserStreaksRef = useRef<LaserStreak[]>([]);
  const animationFrameId = useRef<number | null>(null);

  // Sync Audio mute state
  useEffect(() => {
    arcadeAudio.setMuted(isMuted);
  }, [isMuted]);

  // Handle Screen Shake helper
  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  };

  // Spawn a bug based on current wave
  const spawnBug = (width: number) => {
    const s = stateRef.current;
    const bugId = s.nextBugId++;
    const roll = Math.random();

    let type: Bug['type'] = 'glitch';
    let hp = 1;
    let radius = 18;
    let speed = 1.3 + s.wave * 0.18;
    let color = '#f43f5e'; // neon pink
    let points = 100;

    if (s.wave >= 2 && roll < 0.28) {
      // Speed bug
      type = 'speed';
      hp = 1;
      radius = 14;
      speed = 2.4 + s.wave * 0.22;
      color = '#eab308'; // electric amber
      points = 250;
    } else if (s.wave >= 3 && roll > 0.72 && roll <= 0.90) {
      // Memory Leak Tank
      type = 'tank';
      hp = 3;
      radius = 26;
      speed = 0.9 + s.wave * 0.12;
      color = '#a855f7'; // cyber purple
      points = 450;
    } else if (s.wave >= 4 && roll > 0.90) {
      // Ghost / Stealth
      type = 'ghost';
      hp = 1;
      radius = 16;
      speed = 1.6 + s.wave * 0.15;
      color = '#06b6d4'; // cyan
      points = 350;
    }

    // Boss appearance every 5 waves
    if (s.wave % 5 === 0 && Math.random() < 0.12 && !bugsRef.current.some(b => b.type === 'boss')) {
      type = 'boss';
      hp = 8 + s.wave;
      radius = 36;
      speed = 0.7;
      color = '#ef4444';
      points = 1500;
    }

    const margin = radius + 20;
    const x = margin + Math.random() * (width - margin * 2);

    bugsRef.current.push({
      id: bugId,
      x,
      y: -radius - 10,
      radius,
      type,
      hp,
      maxHp: hp,
      speed,
      color,
      points,
      angle: Math.PI / 2 + (Math.random() * 0.4 - 0.2),
      legPhase: Math.random() * Math.PI,
      alpha: 1,
    });
  };

  // Spawn random power-up
  const spawnPowerUp = (width: number) => {
    const s = stateRef.current;
    const powerId = s.nextPowerupId++;
    const types: PowerUp['type'][] = ['emp', 'freeze', 'heal', 'multishot'];
    const selected = types[Math.floor(Math.random() * types.length)];

    let color = '#38bdf8';
    let icon = '⚡';

    if (selected === 'emp') {
      color = '#f59e0b';
      icon = '💥';
    } else if (selected === 'freeze') {
      color = '#38bdf8';
      icon = '❄️';
    } else if (selected === 'heal') {
      color = '#10b981';
      icon = '💖';
    } else if (selected === 'multishot') {
      color = '#ec4899';
      icon = '🚀';
    }

    const margin = 30;
    const x = margin + Math.random() * (width - margin * 2);

    powerUpsRef.current.push({
      id: powerId,
      x,
      y: -25,
      radius: 20,
      type: selected,
      speed: 1.2,
      icon,
      color,
    });
  };

  // Create explosion particles
  const createExplosion = (x: number, y: number, color: string, count = 22) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 5.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2.5 + Math.random() * 3.5,
        alpha: 1,
        life: 0,
        maxLife: 25 + Math.random() * 20,
      });
    }
  };

  // Add floating floating text
  const addFloatingText = (text: string, x: number, y: number, color = '#38bdf8', scale = 1) => {
    floatingTextsRef.current.push({
      id: stateRef.current.nextTextId++,
      text,
      x,
      y,
      color,
      alpha: 1,
      vy: -1.8,
      scale,
    });
  };

  // Activate power-up effect
  const activatePowerup = (type: PowerUp['type']) => {
    arcadeAudio.playPowerup();
    const s = stateRef.current;

    if (type === 'emp') {
      triggerScreenShake();
      arcadeAudio.playExplosion();
      let empPoints = 0;
      bugsRef.current.forEach((b) => {
        createExplosion(b.x, b.y, b.color, 15);
        empPoints += b.points;
      });
      s.score += empPoints;
      s.bugsSquashed += bugsRef.current.length;
      bugsRef.current = [];
      addFloatingText('EMP SYSTEM PURGE!', 180, 200, '#f59e0b', 1.6);
      setActivePowerup('EMP PURGE (CLEARED ALL)');
    } else if (type === 'freeze') {
      s.frozenUntil = Date.now() + 4500;
      addFloatingText('SYSTEM CRYO-FREEZE!', 180, 200, '#38bdf8', 1.5);
      setActivePowerup('CRYO-FREEZE (4.5s)');
    } else if (type === 'heal') {
      s.health = Math.min(100, s.health + 25);
      setHealth(s.health);
      addFloatingText('+25% FIREWALL REPAIRED', 180, 200, '#10b981', 1.4);
      setActivePowerup('+25% FIREWALL HP');
    } else if (type === 'multishot') {
      s.multiShotUntil = Date.now() + 7000;
      addFloatingText('TRIPLE LASER OVERDRIVE!', 180, 200, '#ec4899', 1.5);
      setActivePowerup('TRIPLE LASER (7s)');
    }

    setTimeout(() => {
      setActivePowerup(null);
    }, 3000);
  };

  // Start / Restart game
  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.gameState = 'playing';
    s.score = 0;
    s.health = 100;
    s.wave = 1;
    s.combo = 1;
    s.comboTimer = 0;
    s.bugsSquashed = 0;
    s.accuracyHits = 0;
    s.accuracyTotal = 0;
    s.frozenUntil = 0;
    s.multiShotUntil = 0;
    s.lastSpawnTime = Date.now();
    s.lastPowerupTime = Date.now();

    bugsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    powerUpsRef.current = [];
    laserStreaksRef.current = [];

    setGameState('playing');
    setScore(0);
    setHealth(100);
    setWave(1);
    setCombo(1);
    setBugsSquashed(0);
    setAccuracyHits(0);
    setAccuracyTotal(0);

    arcadeAudio.playLaser();
  }, []);

  // End Game
  const endGame = useCallback(() => {
    const s = stateRef.current;
    s.gameState = 'gameover';
    setGameState('gameover');
    arcadeAudio.playGameOver();

    if (s.score > highScore) {
      setHighScore(s.score);
      localStorage.setItem('bug_smasher_high_score', s.score.toString());
    }
  }, [highScore]);

  // Click / Touch Handler for shooting
  const handleInteraction = (clientX: number, clientY: number) => {
    if (stateRef.current.gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const s = stateRef.current;
    s.accuracyTotal++;
    setAccuracyTotal(s.accuracyTotal);

    const isMultiShot = Date.now() < s.multiShotUntil;
    arcadeAudio.playLaser();

    // Laser visual streaks
    laserStreaksRef.current.push({
      x1: canvas.width / 2,
      y1: canvas.height,
      x2: x,
      y2: y,
      color: isMultiShot ? '#ec4899' : '#38bdf8',
      alpha: 1,
    });

    if (isMultiShot) {
      // Also shoot 2 spread beams
      laserStreaksRef.current.push({
        x1: canvas.width / 2 - 30,
        y1: canvas.height,
        x2: x - 40,
        y2: y - 20,
        color: '#f43f5e',
        alpha: 0.8,
      });
      laserStreaksRef.current.push({
        x1: canvas.width / 2 + 30,
        y1: canvas.height,
        x2: x + 40,
        y2: y - 20,
        color: '#f43f5e',
        alpha: 0.8,
      });
    }

    let hitSomething = false;

    // Check hit on power-ups
    for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
      const p = powerUpsRef.current[i];
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist <= p.radius + 14) {
        hitSomething = true;
        createExplosion(p.x, p.y, p.color, 18);
        activatePowerup(p.type);
        powerUpsRef.current.splice(i, 1);
        break;
      }
    }

    // Check hit on bugs
    for (let i = bugsRef.current.length - 1; i >= 0; i--) {
      const bug = bugsRef.current[i];
      const hitRadius = bug.radius + (isMultiShot ? 22 : 14);
      const dist = Math.hypot(bug.x - x, bug.y - y);

      if (dist <= hitRadius) {
        hitSomething = true;
        s.accuracyHits++;
        setAccuracyHits(s.accuracyHits);

        bug.hp--;
        createExplosion(bug.x, bug.y, bug.color, 12);

        if (bug.hp <= 0) {
          // Bug eliminated!
          arcadeAudio.playSquish(s.combo);
          createExplosion(bug.x, bug.y, bug.color, 26);

          // Update combo
          s.comboTimer = 140; // ~2.3 seconds
          s.combo = Math.min(s.combo + 1, 8);
          setCombo(s.combo);

          const addedScore = bug.points * s.combo;
          s.score += addedScore;
          s.bugsSquashed++;
          setScore(s.score);
          setBugsSquashed(s.bugsSquashed);

          const comboText = s.combo > 1 ? ` +${addedScore} (x${s.combo})` : ` +${addedScore}`;
          addFloatingText(comboText, bug.x, bug.y, bug.color, s.combo > 2 ? 1.3 : 1);

          bugsRef.current.splice(i, 1);

          // Wave progression check
          if (s.bugsSquashed > 0 && s.bugsSquashed % 12 === 0) {
            s.wave++;
            setWave(s.wave);
            addFloatingText(`WAVE ${s.wave} INCOMING!`, canvas.width / 2, canvas.height / 2, '#38bdf8', 1.8);
            arcadeAudio.playPowerup();
          }
        } else {
          // Tank or Boss damaged
          arcadeAudio.playSquish(1);
          addFloatingText(`HP ${bug.hp}/${bug.maxHp}`, bug.x, bug.y - 20, '#a855f7', 1.1);
        }

        if (!isMultiShot) {
          break; // Single target per click unless multi-shot active
        }
      }
    }

    if (!hitSomething) {
      // Missed shot resets combo
      if (s.combo > 1) {
        s.combo = 1;
        setCombo(1);
      }
    }
  };

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      const s = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid
      ctx.strokeStyle = '#161b22';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Firewall Core at the bottom
      const firewallHeight = 45;
      const firewallY = height - firewallHeight;
      const healthRatio = s.health / 100;

      // Glow behind firewall
      const firewallGrad = ctx.createLinearGradient(0, firewallY, 0, height);
      firewallGrad.addColorStop(0, healthRatio > 0.4 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.25)');
      firewallGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
      ctx.fillStyle = firewallGrad;
      ctx.fillRect(0, firewallY, width, firewallHeight);

      // Firewall neon barrier line
      ctx.strokeStyle = healthRatio > 0.4 ? '#38bdf8' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, firewallY);
      ctx.lineTo(width, firewallY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Firewall label
      ctx.fillStyle = healthRatio > 0.4 ? '#94a3b8' : '#f87171';
      ctx.font = '11px monospace';
      ctx.fillText(`FIREWALL SHIELD // ${s.health}% INTEGRITY`, 16, height - 16);

      // If Playing: Handle Spawns & Updates
      if (s.gameState === 'playing') {
        const now = Date.now();
        const isFrozen = now < s.frozenUntil;

        // Combo decay timer
        if (s.comboTimer > 0) {
          s.comboTimer--;
          if (s.comboTimer === 0 && s.combo > 1) {
            s.combo = 1;
            setCombo(1);
          }
        }

        // Bug Spawning logic
        const spawnDelay = Math.max(650, 1900 - s.wave * 120);
        if (now - s.lastSpawnTime > spawnDelay) {
          spawnBug(width);
          s.lastSpawnTime = now;
        }

        // Power-up Spawning (approx every 12-18 seconds)
        if (now - s.lastPowerupTime > 14000 && Math.random() < 0.05) {
          spawnPowerUp(width);
          s.lastPowerupTime = now;
        }

        // Update & Draw PowerUps
        for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
          const p = powerUpsRef.current[i];
          p.y += p.speed;

          // Draw Glowing Orb
          ctx.save();
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 16;
          ctx.fillStyle = '#161b22';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Icon
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.icon, p.x, p.y);
          ctx.restore();

          if (p.y > height) {
            powerUpsRef.current.splice(i, 1);
          }
        }

        // Update & Draw Bugs
        for (let i = bugsRef.current.length - 1; i >= 0; i--) {
          const bug = bugsRef.current[i];

          if (!isFrozen) {
            bug.y += bug.speed;
            bug.legPhase += 0.2;

            if (bug.type === 'speed') {
              bug.x += Math.sin(bug.legPhase * 1.5) * 2.5;
            }
          }

          // Check if bug reached firewall
          if (bug.y >= firewallY - bug.radius) {
            triggerScreenShake();
            arcadeAudio.playDamage();
            createExplosion(bug.x, firewallY, '#ef4444', 20);

            const dmg = bug.type === 'boss' ? 35 : (bug.type === 'tank' ? 18 : 10);
            s.health = Math.max(0, s.health - dmg);
            setHealth(s.health);

            bugsRef.current.splice(i, 1);

            if (s.health <= 0) {
              endGame();
              break;
            }
            continue;
          }

          // Draw Bug Entity
          ctx.save();
          ctx.translate(bug.x, bug.y);

          // Freeze ice glow
          if (isFrozen) {
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 14;
          } else {
            ctx.shadowColor = bug.color;
            ctx.shadowBlur = 10;
          }

          // Ghost flickering
          if (bug.type === 'ghost') {
            ctx.globalAlpha = 0.35 + Math.abs(Math.sin(bug.legPhase)) * 0.65;
          }

          // Bug Legs
          ctx.strokeStyle = isFrozen ? '#7dd3fc' : bug.color;
          ctx.lineWidth = 2;
          const legLen = bug.radius * 0.8;
          for (let side = -1; side <= 1; side += 2) {
            for (let legIdx = -1; legIdx <= 1; legIdx++) {
              const legAngle = (side * Math.PI) / 3 + legIdx * 0.35 + Math.sin(bug.legPhase + legIdx) * 0.3;
              ctx.beginPath();
              ctx.moveTo(0, legIdx * 6);
              ctx.lineTo(Math.cos(legAngle) * (bug.radius + legLen), Math.sin(legAngle) * (bug.radius + legLen) + legIdx * 6);
              ctx.stroke();
            }
          }

          // Bug Body
          ctx.fillStyle = isFrozen ? '#0284c7' : '#111827';
          ctx.beginPath();
          ctx.ellipse(0, 0, bug.radius * 0.8, bug.radius, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = isFrozen ? '#38bdf8' : bug.color;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Bug Eyes
          ctx.fillStyle = isFrozen ? '#ffffff' : '#f0f6fc';
          ctx.beginPath();
          ctx.arc(-bug.radius * 0.35, -bug.radius * 0.45, 2.5, 0, Math.PI * 2);
          ctx.arc(bug.radius * 0.35, -bug.radius * 0.45, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Health bar for tank or boss
          if (bug.maxHp > 1) {
            const barW = bug.radius * 2.2;
            const barH = 4;
            const hpRatio = bug.hp / bug.maxHp;
            ctx.fillStyle = '#374151';
            ctx.fillRect(-barW / 2, -bug.radius - 12, barW, barH);
            ctx.fillStyle = bug.color;
            ctx.fillRect(-barW / 2, -bug.radius - 12, barW * hpRatio, barH);
          }

          ctx.restore();
        }

        // Update & Draw Laser Streaks
        for (let i = laserStreaksRef.current.length - 1; i >= 0; i--) {
          const l = laserStreaksRef.current[i];
          ctx.save();
          ctx.strokeStyle = l.color;
          ctx.lineWidth = 3;
          ctx.globalAlpha = l.alpha;
          ctx.shadowColor = l.color;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(l.x1, l.y1);
          ctx.lineTo(l.x2, l.y2);
          ctx.stroke();
          ctx.restore();

          l.alpha -= 0.14;
          if (l.alpha <= 0) {
            laserStreaksRef.current.splice(i, 1);
          }
        }
      }

      // Update & Draw Particles (Explosions)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size * (1 - p.life / p.maxLife)), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Update & Draw Floating Texts (+100, COMBO x3)
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const t = floatingTextsRef.current[i];
        t.y += t.vy;
        t.alpha -= 0.025;

        ctx.save();
        ctx.globalAlpha = Math.max(0, t.alpha);
        ctx.font = `bold ${Math.round(14 * t.scale)}px monospace`;
        ctx.fillStyle = t.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 8;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();

        if (t.alpha <= 0) {
          floatingTextsRef.current.splice(i, 1);
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isMounted = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [endGame]);

  // Adjust canvas size to parent container on mount/resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = Math.min(window.innerHeight * 0.68, 640);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const accuracyPct = accuracyTotal > 0 ? Math.round((accuracyHits / accuracyTotal) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22272e] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-rose-950/60 border border-rose-800/40 text-rose-400 font-mono text-xs mb-2">
            <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>bug_smasher_arcade.exe</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#f0f6fc]">
            Bug Smasher: Server Defense
          </h1>
          <p className="text-sm text-[#8b949e] mt-1 font-mono">
            Squish incoming glitches, memory leaks, and 404 bugs before they breach your server firewall!
          </p>
        </div>

        {/* Global Controls & High Score Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] flex items-center gap-2 text-xs font-mono text-[#adbac7]">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>High Score: <strong className="text-amber-400 font-bold">{highScore.toLocaleString()}</strong></span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-md bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white transition-colors"
            title={isMuted ? 'Unmute Arcade Sounds' : 'Mute Sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Arcade Screen Container */}
      <div className="relative rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden shadow-2xl">
        {/* HUD Top Bar */}
        <div className="bg-[#161b22]/90 backdrop-blur-sm px-4 py-3 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-[#8b949e]">
              Score: <strong className="text-white text-base font-bold">{score.toLocaleString()}</strong>
            </span>
            <span className="text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
              Wave {wave}
            </span>
            {combo > 1 && (
              <span className="inline-flex items-center gap-1 text-amber-400 font-bold animate-pulse bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {combo}x Combo!
              </span>
            )}
            {activePowerup && (
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 animate-bounce">
                {activePowerup}
              </span>
            )}
          </div>

          {/* Firewall HP Bar */}
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${health > 35 ? 'text-sky-400' : 'text-rose-500 animate-pulse'}`} />
            <span className="text-[#8b949e]">Firewall:</span>
            <div className="w-28 sm:w-36 h-2.5 bg-[#21262d] rounded-full overflow-hidden border border-[#30363d]">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  health > 50 ? 'bg-gradient-to-r from-sky-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                }`}
                style={{ width: `${health}%` }}
              />
            </div>
            <span className={`font-bold ${health > 35 ? 'text-white' : 'text-rose-400'}`}>
              {health}%
            </span>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          className={`relative w-full cursor-crosshair ${screenShake ? 'animate-bounce' : ''}`}
          style={{ minHeight: '480px' }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => handleInteraction(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            className="w-full h-full block"
          />

          {/* Overlay: Game Start / Welcome */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-[#0d1117]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
                <Crosshair className="w-9 h-9" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white mb-2">
                Server Bug Smasher
              </h2>
              <p className="text-sm text-[#8b949e] max-w-md mb-6 font-mono">
                Click or tap the invading glitch bugs, memory leaks, and rogue daemons before they reach your firewall!
              </p>

              {/* Bug Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg w-full mb-6 text-xs font-mono">
                <div className="p-2.5 rounded bg-[#161b22] border border-[#30363d] text-left">
                  <span className="text-rose-400 font-bold block mb-1">🐞 Glitch Bug</span>
                  <span className="text-[#8b949e]">1 Click · 100 pts</span>
                </div>
                <div className="p-2.5 rounded bg-[#161b22] border border-[#30363d] text-left">
                  <span className="text-amber-400 font-bold block mb-1">⚡ Speed Moth</span>
                  <span className="text-[#8b949e]">Fast · 250 pts</span>
                </div>
                <div className="p-2.5 rounded bg-[#161b22] border border-[#30363d] text-left">
                  <span className="text-purple-400 font-bold block mb-1">🛡️ Memory Tank</span>
                  <span className="text-[#8b949e]">3 Clicks · 450 pts</span>
                </div>
                <div className="p-2.5 rounded bg-[#161b22] border border-[#30363d] text-left">
                  <span className="text-sky-400 font-bold block mb-1">💥 Power-Ups</span>
                  <span className="text-[#8b949e]">Shoot for EMP/Cryo</span>
                </div>
              </div>

              <button
                onClick={startGame}
                className="px-6 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono text-sm inline-flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START SYSTEM DEFENSE</span>
              </button>
            </div>
          )}

          {/* Overlay: Game Over */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-[#0d1117]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-600/40 flex items-center justify-center text-rose-400 mb-3 shadow-lg shadow-rose-900/30">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white mb-1">
                Firewall Breached!
              </h2>
              <p className="text-sm text-rose-400/90 font-mono mb-4">
                The bugs overwhelmed your defenses at Wave {wave}.
              </p>

              {/* Game Stats Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md w-full mb-6 text-xs font-mono">
                <div className="p-3 rounded bg-[#161b22] border border-[#30363d]">
                  <span className="text-[#8b949e] block text-[10px] uppercase">Final Score</span>
                  <span className="text-lg font-bold text-white">{score.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded bg-[#161b22] border border-[#30363d]">
                  <span className="text-[#8b949e] block text-[10px] uppercase">Bugs Squashed</span>
                  <span className="text-lg font-bold text-sky-400">{bugsSquashed}</span>
                </div>
                <div className="p-3 rounded bg-[#161b22] border border-[#30363d]">
                  <span className="text-[#8b949e] block text-[10px] uppercase">Accuracy</span>
                  <span className="text-lg font-bold text-emerald-400">{accuracyPct}%</span>
                </div>
                <div className="p-3 rounded bg-[#161b22] border border-[#30363d]">
                  <span className="text-[#8b949e] block text-[10px] uppercase">Max Wave</span>
                  <span className="text-lg font-bold text-amber-400">{wave}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={startGame}
                  className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono text-sm inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>PLAY AGAIN</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Tips & Controls Bar */}
        <div className="bg-[#161b22]/70 px-4 py-2.5 border-t border-[#30363d] flex flex-wrap items-center justify-between text-xs text-[#8b949e] font-mono gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tip: Consecutive hits build up your score multiplier up to 8x!</span>
            </span>
          </div>

          {gameState === 'playing' && (
            <button
              onClick={endGame}
              className="text-[#6e7681] hover:text-rose-400 transition-colors"
            >
              Abort Mission
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
