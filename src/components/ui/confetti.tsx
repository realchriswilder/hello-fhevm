import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger, onComplete }) => {
  useEffect(() => {
    if (trigger) {
      console.log('🎉 Confetti triggered!'); // Debug log
      
      // Create confetti burst
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      // Render ABOVE any modal overlay/backdrop blur
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          onComplete?.();
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire confetti from left edge
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });

        // Fire confetti from right edge
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }
  }, [trigger, onComplete]);

  return null;
};

// Hook for easy confetti triggering
export const useConfetti = () => {
  const [trigger, setTrigger] = React.useState(false);

  const fireConfetti = () => {
    setTrigger(true);
    setTimeout(() => setTrigger(false), 100);
  };

  return { fireConfetti, trigger };
};
