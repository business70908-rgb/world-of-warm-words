import { useEffect, useState } from "react";
import e9Image from "@/assets/e9.png";

interface Dot {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export const ScanningEffect = () => {
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    const yMin = 12; // Below indigo banner (12% from top)
    const yMax = 72; // Above zoom slider (72% from top)

    // Pattern 1: Cluster of 5-10 dots
    const generateCluster = (baseId: number) => {
      const clusterSize = 5 + Math.floor(Math.random() * 6); // Random 5-10
      const centerX = 20 + Math.random() * 60; // Random center X position
      const centerY = yMin + Math.random() * (yMax - yMin); // Random center Y
      
      return Array.from({ length: clusterSize }, (_, i) => ({
        id: baseId + i,
        x: centerX + (Math.random() - 0.5) * 15, // Spread ±7.5% around center
        y: centerY + (Math.random() - 0.5) * 15,
        delay: Math.random() * 0.2, // Random delay 0-0.2s
        duration: 1, // 1 second lifespan
      }));
    };

    // Pattern 2: Horizontal line of 4-5 dots
    const generateHorizontalLine = (baseId: number) => {
      const lineSize = 4 + Math.floor(Math.random() * 2); // Random 4-5
      const startX = 15 + Math.random() * 30; // Random start position
      const y = yMin + Math.random() * (yMax - yMin); // Random Y level
      
      return Array.from({ length: lineSize }, (_, i) => ({
        id: baseId + i,
        x: startX + (i * 15), // Evenly spaced 15% apart
        y: y + (Math.random() - 0.5) * 3, // Slight vertical variance ±1.5%
        delay: i * 0.1, // Sequential delay (0s, 0.1s, 0.2s, etc.)
        duration: 1,
      }));
    };

    // Pattern 3: Random scatter of 8-9 dots
    const generateRandom = (baseId: number) => {
      const randomSize = 8 + Math.floor(Math.random() * 2); // Random 8-9
      
      return Array.from({ length: randomSize }, (_, i) => ({
        id: baseId + i,
        x: Math.random() * 100, // Completely random X (0-100%)
        y: yMin + Math.random() * (yMax - yMin), // Random Y in range
        delay: Math.random() * 0.3, // Random delay 0-0.3s
        duration: 1,
      }));
    };

    // Initialize with all three patterns at once
    const initialDots = [
      ...generateCluster(1000),
      ...generateHorizontalLine(2000),
      ...generateRandom(3000),
    ];
    setDots(initialDots);

    // Rotate between patterns every 1 second
    let patternIndex = 0;
    const interval = setInterval(() => {
      const baseId = Date.now(); // Unique ID based on timestamp
      let newDots: Dot[] = [];
      
      // Cycle through patterns: cluster → horizontal → random → repeat
      if (patternIndex === 0) {
        newDots = generateCluster(baseId);
      } else if (patternIndex === 1) {
        newDots = generateHorizontalLine(baseId);
      } else {
        newDots = generateRandom(baseId);
      }
      
      patternIndex = (patternIndex + 1) % 3; // Cycle 0→1→2→0
      setDots(newDots); // Replace all dots with new pattern
    }, 1000); // Every 1 second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((dot) => (
        <img
          key={dot.id}
          src={e9Image}
          alt=""
          className="absolute w-3 h-3"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            animation: `scanDot ${dot.duration}s ease-in-out ${dot.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
};

