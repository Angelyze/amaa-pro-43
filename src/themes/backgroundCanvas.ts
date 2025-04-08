/**
 * Initializes and runs the background canvas animation
 * Creates a smooth gradient animation that adapts to the current theme
 */
export function initBackgroundCanvas(): void {
  const c = document.getElementById('canv') as HTMLCanvasElement;
  if (!c) {
    console.error('Canvas element not found');
    return;
  }
  
  const $ = c.getContext('2d');
  if (!$) {
    console.error('Could not get 2D context');
    return;
  }

  // Set canvas size to match window size
  const resizeCanvas = () => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    console.log('Canvas resized to:', c.width, 'x', c.height);
  };
  
  // Initial sizing
  resizeCanvas();
  
  // Resize on window size change
  window.addEventListener('resize', resizeCanvas);

  // Get current theme from document class or localStorage
  const getCurrentTheme = (): string => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    return savedTheme;
  };

  // Get theme colors from CSS variables
  const getThemeColors = () => {
    const theme = getCurrentTheme();
    let primaryHue = 191, primarySat = 100, primaryLightness = 35; // Default blue
    let backgroundLightness = 100; // Light background by default
    let colorMultiplier = 1; // Regular intensity for light theme
    
    // Set theme-specific color values
    switch(theme) {
      case 'dark':
        backgroundLightness = 5; // Dark background
        colorMultiplier = 0.5; // Reduce intensity for dark theme
        break;
      case 'dark-red':
        primaryHue = 0; // Red
        primarySat = 100;
        primaryLightness = 50;
        backgroundLightness = 5;
        colorMultiplier = 0.5;
        break;
      case 'dark-green':
        primaryHue = 120; // Green
        primarySat = 100;
        primaryLightness = 50;
        backgroundLightness = 5;
        colorMultiplier = 0.5;
        break;
      case 'dark-yellow':
        primaryHue = 60; // Yellow
        primarySat = 100;
        primaryLightness = 50;
        backgroundLightness = 5;
        colorMultiplier = 0.5;
        break;
      case 'dark-purple':
        primaryHue = 260; // Purple
        primarySat = 100;
        primaryLightness = 50;
        backgroundLightness = 5;
        colorMultiplier = 0.5;
        break;
      default:
        // Light theme - keep defaults
        break;
    }
    
    return { primaryHue, primarySat, primaryLightness, backgroundLightness, colorMultiplier, theme };
  };

  // Create RGB generator functions based on theme
  const createColorGenerators = (themeColors: ReturnType<typeof getThemeColors>) => {
    const { primaryHue, primarySat, primaryLightness, backgroundLightness, colorMultiplier } = themeColors;
    const isDark = backgroundLightness < 50;
    
    // Base values adjusted for theme
    const baseR = isDark ? 40 : 192;
    const baseG = isDark ? 40 : 192;
    const baseB = isDark ? 60 : 192;
    
    // Create color intensity based on theme
    const intensity = isDark ? 40 : 64;
    
    // Adjust hue influence based on theme
    const hueInfluence = isDark ? 0.8 : 1; 
    
    // Use primary color to influence the animation
    return {
      R: (x: number, y: number, t: number) => {
        let value = baseR + intensity * Math.cos((x*x-y*y)/300 + t) * colorMultiplier;
        // Influence from primary color (red component)
        if (primaryHue < 30 || primaryHue > 330) {
          value += 30 * hueInfluence;
        }
        return Math.floor(value);
      },
      
      G: (x: number, y: number, t: number) => {
        let value = baseG + intensity * Math.sin((x*x*Math.cos(t/4)+y*y*Math.sin(t/3))/300) * colorMultiplier;
        // Influence from primary color (green component)
        if (primaryHue > 60 && primaryHue < 180) {
          value += 30 * hueInfluence;
        }
        return Math.floor(value);
      },
      
      B: (x: number, y: number, t: number) => {
        let value = baseB + intensity * Math.sin(5*Math.sin(t/9) + ((x-100)*(x-100)+(y-100)*(y-100))/1100) * colorMultiplier;
        // Influence from primary color (blue component)
        if (primaryHue > 180 && primaryHue < 300) {
          value += 30 * hueInfluence;
        }
        return Math.floor(value);
      }
    };
  };

  let t = 0;
  let currentTheme = getCurrentTheme();
  let themeColors = getThemeColors();
  let colorGen = createColorGenerators(themeColors);
  
  // Create a small canvas for our pattern
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 32;
  patternCanvas.height = 32;
  const patternCtx = patternCanvas.getContext('2d');
  
  if (!patternCtx) {
    console.error('Could not get pattern context');
    return;
  }

  // Listen for theme changes
  window.addEventListener('themechange', () => {
    // When theme changes, update colors
    currentTheme = getCurrentTheme();
    themeColors = getThemeColors();
    colorGen = createColorGenerators(themeColors);
    console.log('Theme changed to:', currentTheme);
  });

  const updatePattern = function() {
    // Generate the pattern only once per frame
    for(let x = 0; x < 32; x++) {
      for(let y = 0; y < 32; y++) {
        const r = colorGen.R(x, y, t);
        const g = colorGen.G(x, y, t);
        const b = colorGen.B(x, y, t);
        
        patternCtx.fillStyle = `rgb(${r},${g},${b})`;
        patternCtx.fillRect(x, y, 1, 1);
      }
    }
    
    // Clear the main canvas
    if ($) {
      $.clearRect(0, 0, c.width, c.height);
      
      // Save context state
      $.save();
      // Enable image smoothing for a gradient-like effect
      $.imageSmoothingEnabled = true;
      // Draw the pattern scaled to fill the screen
      $.drawImage(patternCanvas, 0, 0, c.width, c.height);
      // Restore context state
      $.restore();
    }
    
    // Adjust animation speed based on theme (slower for dark themes)
    const speedFactor = themeColors.theme.startsWith('dark') ? 0.02 : 0.03;
    t = t + speedFactor;
    
    window.requestAnimationFrame(updatePattern);
  };

  console.log('Starting background animation with theme adaptation');
  updatePattern();
}
