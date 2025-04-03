
/**
 * Initialize the theme based on localStorage or user preference
 */
import { initializeBackground } from './background';

export const initializeTheme = () => {
  // Check for theme in localStorage
  const savedTheme = localStorage.getItem('theme');
  
  // Remove any existing theme classes first
  document.documentElement.classList.remove('dark', 'dark-red', 'dark-green', 'dark-yellow', 'dark-purple');
  
  // Apply the saved theme
  if (savedTheme) {
    if (savedTheme !== 'light') {
      document.documentElement.classList.add(savedTheme);
      console.log(`[Theme] Initialized with: ${savedTheme}`);
    } else {
      console.log('[Theme] Initialized with: light (default)');
    }
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // If no saved theme but user prefers dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    console.log('[Theme] Initialized with: dark (system preference)');
  } else {
    console.log('[Theme] Initialized with: light (default - no saved preference)');
  }
  
  // Initialize the background animation
  initializeBackground();
  
  // Add global escape key handler to help dismiss any stuck tooltips or popups
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      // This will help dismiss any stuck tooltips or popups
      console.log('[UI] Escape key pressed - attempting to clear UI state');
      
      // Dispatch a click on the body to help dismiss any open tooltips or popups
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.body.dispatchEvent(clickEvent);
      
      // Force any open tooltips to close by targeting their close buttons
      document.querySelectorAll('[data-state="open"][role="tooltip"] button[aria-label="Close"]')
        .forEach(button => {
          (button as HTMLElement).click();
        });
    }
  });
};

// Function to change theme programmatically
export const changeTheme = (theme: string) => {
  console.log(`[Theme] Changing to: ${theme}`);
  
  // First verify the theme is valid
  const validThemes = ['light', 'dark', 'dark-red', 'dark-green', 'dark-yellow', 'dark-purple'];
  if (!validThemes.includes(theme)) {
    console.error(`[Theme] Invalid theme: ${theme}`);
    return;
  }
  
  // Remove all theme classes first
  document.documentElement.classList.remove('dark', 'dark-red', 'dark-green', 'dark-yellow', 'dark-purple');
  
  // Apply the selected theme (if not light)
  if (theme !== 'light') {
    document.documentElement.classList.add(theme);
    console.log(`[Theme] Applied class: ${theme}`);
  }
  
  // Save the theme selection to localStorage
  localStorage.setItem('theme', theme);
  
  // Dispatch a custom event for other components to detect the theme change
  window.dispatchEvent(new Event('themechange'));
};

export default initializeTheme;
