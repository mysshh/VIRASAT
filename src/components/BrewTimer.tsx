import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX } from "lucide-react";

interface BrewTimerProps {
  initialSeconds?: number;
  title?: string;
  onComplete?: () => void;
}

export function BrewTimer({ initialSeconds = 180, title = "Herbal Steam / Infusion Timer", onComplete }: BrewTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalDuration, setTotalDuration] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset timer when initialSeconds prop changes (e.g. user selected different recipe)
    setSecondsLeft(initialSeconds);
    setTotalDuration(initialSeconds);
    setIsActive(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            triggerChime();
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsLeft]);

  // Generates a cozy, pure resonant chime sound using AudioContext
  const triggerChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Traditional Tibetan chime synthesis (3 stacked frequencies: 440Hz, 880Hz, 1200Hz)
      const now = ctx.currentTime;
      const frequencies = [440, 554.37, 659.25]; // Major triad

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        // Slow fade out to replicate custom ceramic chime
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3 + idx * 0.5);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 4);
      });
    } catch (e) {
      console.error("Web Audio chime failed", e);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(totalDuration);
  };

  const selectPreset = (secs: number) => {
    setIsActive(false);
    setTotalDuration(secs);
    setSecondsLeft(secs);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // SVG Circular progress dimensions
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = totalDuration > 0 ? (totalDuration - secondsLeft) / totalDuration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="bg-white border border-classic-border rounded-[28px] p-5 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
      <div className="space-y-1.5 text-center md:text-left">
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <Timer className="w-4.5 h-4.5 text-classic-rust" />
          <span className="text-[10px] font-mono tracking-widest text-classic-rust font-bold uppercase">Ritual Brew Timer</span>
        </div>
        <h4 className="font-serif text-sm font-bold text-classic-text leading-tight">{title}</h4>
        <p className="text-[11px] text-classic-text/75 leading-relaxed max-w-xs">
          Let your modern brewing sync with ancestral standards. Tap a preset below or use steps as benchmarks.
        </p>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1.5 justify-center md:justify-start">
          <button
            onClick={() => selectPreset(180)}
            className={`text-[9px] font-mono tracking-wider font-bold uppercase rounded-md px-2 py-1 transition-all ${
              totalDuration === 180 ? "bg-classic-rust text-white" : "bg-stone-150 text-classic-text hover:bg-stone-200"
            }`}
          >
            3m (Steep)
          </button>
          <button
            onClick={() => selectPreset(300)}
            className={`text-[9px] font-mono tracking-wider font-bold uppercase rounded-md px-2 py-1 transition-all ${
              totalDuration === 300 ? "bg-classic-rust text-white" : "bg-stone-150 text-classic-text hover:bg-stone-200"
            }`}
          >
            5m (Inhale)
          </button>
          <button
            onClick={() => selectPreset(600)}
            className={`text-[9px] font-mono tracking-wider font-bold uppercase rounded-md px-2 py-1 transition-all ${
              totalDuration === 600 ? "bg-classic-rust text-white" : "bg-stone-150 text-classic-text hover:bg-stone-200"
            }`}
          >
            10m (Decoct)
          </button>
          <button
            onClick={() => selectPreset(900)}
            className={`text-[9px] font-mono tracking-wider font-bold uppercase rounded-md px-2 py-1 transition-all ${
              totalDuration === 900 ? "bg-classic-rust text-white" : "bg-stone-150 text-classic-text hover:bg-stone-200"
            }`}
          >
            15m (Brew)
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Visual Progress Dial */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-stone-100 fill-transparent"
              strokeWidth="5"
            />
            {/* Progress ring with transitions */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-classic-rust fill-transparent transition-all duration-300"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="font-mono text-xl font-bold tracking-tight text-classic-text block leading-none">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[8px] font-mono text-classic-text/50 uppercase tracking-widest font-black block mt-0.5">
              Remaining
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={toggleTimer}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer transition-all active:scale-90 shadow-sm ${
              isActive ? "bg-amber-600 hover:bg-amber-700" : "bg-classic-green hover:bg-classic-green/90"
            }`}
            title={isActive ? "Pause Timer" : "Start Timer"}
          >
            {isActive ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 ml-0.5" />}
          </button>

          <button
            onClick={resetTimer}
            className="w-10 h-10 rounded-full border border-classic-border bg-stone-50 hover:bg-stone-100 text-classic-text/80 flex items-center justify-center cursor-pointer transition-all active:scale-90"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-10 h-10 rounded-full border border-classic-border bg-stone-50 hover:bg-stone-100 text-classic-text/80 flex items-center justify-center cursor-pointer transition-all active:scale-90"
            title={soundEnabled ? "Mute alert chime" : "Unmute alert chime"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-classic-green" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>
        </div>
      </div>
    </div>
  );
}
