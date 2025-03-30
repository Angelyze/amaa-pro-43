
/**
 * Global utilities for ensuring proper UI component behavior
 */

/**
 * Initialize global event handlers to ensure proper closing of 
 * UI components like menus, popovers, etc.
 */
export function initUIEventHandlers() {
  // Ensure this only runs in the browser
  if (typeof window === 'undefined') return;
  
  // Handle Escape key press for all components
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close all open Radix UI components by simulating a click outside
      document.body.click();
      
      // Find and close all open Radix components with data-state="open"
      document.querySelectorAll('[data-state="open"]').forEach(element => {
        // Dispatch a custom close event that Radix components might listen to
        const closeEvent = new CustomEvent('radix-ui-close-trigger');
        element.dispatchEvent(closeEvent);
      });
    }
  });
  
  // Fix pointer events for all Radix UI portals
  const fixPortalPointerEvents = () => {
    document.querySelectorAll('[data-radix-popper-content-wrapper]').forEach(portal => {
      if (portal instanceof HTMLElement) {
        portal.style.pointerEvents = 'auto';
        portal.style.zIndex = '9999';
      }
    });
  };
  
  // Run initially and set an observer for future changes
  fixPortalPointerEvents();
  
  // Set up a MutationObserver to watch for new portals
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        fixPortalPointerEvents();
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return () => {
    observer.disconnect();
  };
}

/**
 * Event handler to ensure context menus close properly
 */
export function handleContextMenuClick(e: React.MouseEvent) {
  // Prevent event propagation to avoid immediate closing
  e.stopPropagation();
}
