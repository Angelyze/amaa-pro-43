
/**
 * Initialize the theme based on localStorage or user preference
 */
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
  
  // Force a repaint to ensure theme variables apply correctly
  document.body.style.display = 'none';
  setTimeout(() => {
    document.body.style.display = '';
  }, 5);
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
    console.log(`[Theme] Applied class: ${theme} to document.documentElement`);
  }
  
  // Save the theme selection to localStorage
  localStorage.setItem('theme', theme);
  
  // Dispatch a custom event for other components to detect the theme change
  window.dispatchEvent(new Event('themechange'));
  
  // Force a repaint to ensure theme variables apply correctly
  document.body.style.display = 'none';
  setTimeout(() => {
    document.body.style.display = '';
  }, 5);
};

export default initializeTheme;
