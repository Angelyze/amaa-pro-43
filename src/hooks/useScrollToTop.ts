
import { useEffect } from "react";

/**
 * Ensures the window scrolls to the top when the page/component mounts.
 */
export function useScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
}
