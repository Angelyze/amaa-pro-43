
/**
 * Initialize the theme based on localStorage or user preference
 */
export const initializeTheme = () => {
  // Check for theme in localStorage
  const savedTheme = localStorage.getItem('theme');
  
  // Remove any existing theme classes
  document.documentElement.classList.remove('dark', 'dark-red', 'dark-green');
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'dark-red') {
    document.documentElement.classList.add('dark-red');
  } else if (savedTheme === 'dark-green') {
    document.documentElement.classList.add('dark-green');
  } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // If no saved theme but user prefers dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
};

// Function to change theme programmatically
export const changeTheme = (theme: string) => {
  // Remove all theme classes first
  document.documentElement.classList.remove('dark', 'dark-red', 'dark-green');
  
  // Apply the selected theme
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else if (theme === 'dark-red') {
    document.documentElement.classList.add('dark-red');
    localStorage.setItem('theme', 'dark-red');
  } else if (theme === 'dark-green') {
    document.documentElement.classList.add('dark-green');
    localStorage.setItem('theme', 'dark-green');
  } else {
    localStorage.setItem('theme', 'light');
  }
  
  // Dispatch a storage event for other components to detect the change
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'theme',
    newValue: theme
  }));
};

export default initializeTheme;
