
/**
 * Initialize the theme based on localStorage or user preference
 */
export const initializeTheme = () => {
  // Check for theme in localStorage
  const savedTheme = localStorage.getItem('theme');
  
  // Remove any existing theme classes first
  document.documentElement.classList.remove('dark', 'dark-red', 'dark-green', 'dark-yellow');
  
  // Apply the saved theme
  if (savedTheme) {
    if (savedTheme !== 'light') {
      document.documentElement.classList.add(savedTheme);
    }
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // If no saved theme but user prefers dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
};

// Function to change theme programmatically
export const changeTheme = (theme: string) => {
  // Remove all theme classes first
  document.documentElement.classList.remove('dark', 'dark-red', 'dark-green', 'dark-yellow');
  
  // Apply the selected theme (if not light)
  if (theme !== 'light') {
    document.documentElement.classList.add(theme);
  }
  
  // Save the theme selection to localStorage
  localStorage.setItem('theme', theme);
  
  // Dispatch a custom event for other components to detect the theme change
  window.dispatchEvent(new Event('themechange'));
  
  // Also dispatch a storage event for components listening to storage changes
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'theme',
    newValue: theme,
    oldValue: localStorage.getItem('theme'),
    storageArea: localStorage
  }));
};

export default initializeTheme;
