import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

/**
 * Ensures the focused input is scrolled into view when the native keyboard
 * appears, and resets any leftover scroll/transform when it hides.
 *
 * Pairs with capacitor.config Keyboard `resize: 'native'`, which lets the
 * WebView shrink naturally so MobileContainer can follow window.innerHeight.
 */
export const useKeyboardFix = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const scrollFocusedIntoView = () => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
        try {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        } catch {
          el.scrollIntoView();
        }
      }
    };

    const resetScroll = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' } as ScrollToOptions);
    };

    let removeShow: (() => void) | null = null;
    let removeHide: (() => void) | null = null;

    (async () => {
      try {
        const show = await Keyboard.addListener('keyboardDidShow', () => {
          // Wait one frame so the WebView has resized
          requestAnimationFrame(scrollFocusedIntoView);
        });
        const hide = await Keyboard.addListener('keyboardDidHide', () => {
          resetScroll();
          setTimeout(resetScroll, 100);
        });
        removeShow = () => show.remove();
        removeHide = () => hide.remove();
      } catch (e) {
        console.warn('useKeyboardFix: Could not attach keyboard listeners', e);
      }
    })();

    return () => {
      removeShow?.();
      removeHide?.();
    };
  }, []);
};
