import { ReactNode, useState, useEffect, useRef } from "react";

interface MobileContainerProps {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
}

/**
 * MobileContainer
 *
 * - Computes a fixed scale factor ONCE based on the initial viewport width
 *   so the design never re-scales when the keyboard opens.
 * - The outer wrapper follows the live window.innerHeight so when the native
 *   keyboard appears (Capacitor Keyboard `resize: 'native'`), the WebView
 *   shrinks naturally and focused inputs scroll into view, then restores
 *   cleanly when the keyboard hides.
 */
export const MobileContainer = ({ width, height, children, className = "" }: MobileContainerProps) => {
  const [scale, setScale] = useState(1);
  const [dynamicHeight, setDynamicHeight] = useState(height);
  const [safeAreaTop, setSafeAreaTop] = useState(0);
  const [safeAreaBottom, setSafeAreaBottom] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number>(window.innerHeight);

  const initialWidthRef = useRef<number | null>(null);
  const initialHeightRef = useRef<number | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const computeScale = () => {
      const viewportWidth = window.innerWidth;
      const vh = window.innerHeight;

      if (!hasInitialized.current) {
        initialWidthRef.current = viewportWidth;
        initialHeightRef.current = vh;
        hasInitialized.current = true;
      }

      const baseWidth = initialWidthRef.current!;
      const baseHeight = initialHeightRef.current!;
      const scaleFactor = Math.ceil(Math.min(Math.max(baseWidth / width, 0.5), 1) * 100) / 100;
      setScale(scaleFactor);
      setDynamicHeight(Math.ceil(baseHeight / scaleFactor));

      const safeTop = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--safe-area-inset-top')
          .replace('px', '') || '0'
      );
      const safeBottom = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--safe-area-inset-bottom')
          .replace('px', '') || '0'
      );
      setSafeAreaTop(safeTop);
      setSafeAreaBottom(safeBottom);
    };

    computeScale();

    // Track live viewport height (shrinks when keyboard appears with
    // resize: 'native', restores when keyboard hides). Scale stays fixed.
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    const handleOrientationChange = () => {
      hasInitialized.current = false;
      setTimeout(() => {
        computeScale();
        setViewportHeight(window.innerHeight);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [width]);

  const totalHeight = dynamicHeight + safeAreaTop + safeAreaBottom;

  return (
    <div
      className="w-full bg-white overflow-hidden"
      style={{
        height: `${viewportHeight}px`,
        position: 'relative',
      }}
    >
      <div
        className={`relative ${className}`}
        style={{
          width: `${width}px`,
          height: `${totalHeight}px`,
          transform: `scale(${scale}) translate3d(0, 0, 0)`,
          transformOrigin: 'top left',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
          WebkitFontSmoothing: 'antialiased',
          paddingTop: `${safeAreaTop}px`,
          paddingBottom: `${safeAreaBottom}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
