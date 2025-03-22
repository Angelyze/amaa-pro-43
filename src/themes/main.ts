
/**
 * Initialize the theme based on localStorage or user preference
 */
export const initializeTheme = () => {
  // Check for theme in localStorage
  const savedTheme = localStorage.getItem('theme');
  
  // Remove any existing theme classes
  document.documentElement.classList.remove('dark', 'dark-red', 'dark-green', 'dark-yellow');
  
  // Apply the saved theme
  if (savedTheme) {
    if (savedTheme !== 'light') {
      document.documentElement.classList.add(savedTheme);
      console.log(`Applied theme: ${savedTheme}`);
    }
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // If no saved theme but user prefers dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
};

// Function to change theme programmatically
export const changeTheme = (theme: string) => {
  console.log(`Changing theme to: ${theme}`);
  
  // Remove all theme classes first
  document.documentElement.classList.remove('dark', 'dark-red', 'dark-green', 'dark-yellow');
  
  // Apply the selected theme
  if (theme !== 'light') {
    document.documentElement.classList.add(theme);
    console.log(`Applied theme class: ${theme}`);
  }
  
  // Always save the theme selection
  localStorage.setItem('theme', theme);
  
  // Dispatch a storage event for other components to detect the change
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'theme',
    newValue: theme
  }));
};

export default initializeTheme;
