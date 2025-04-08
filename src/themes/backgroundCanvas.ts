
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

  // Read CSS variables to get exact theme colors
  const getCSSVariable = (varName: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };

  // Convert CSS HSL variable to RGB values
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // Get theme colors from CSS variables for more accuracy
  const getThemeColors = () => {
    const theme = getCurrentTheme();
    
    // Default values in case CSS variables aren't available
    let primaryHue = 191, primarySat = 100, primaryLightness = 35; // Default blue
    let backgroundLightness = 100; // Light background by default
    let colorMultiplier = 1; // Regular intensity for light theme
    
    // Try to read the primary color from CSS variables
    try {
      const primaryVar = getCSSVariable('--primary').trim();
      if (primaryVar) {
        const hslMatch = primaryVar.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
        if (hslMatch) {
          primaryHue = parseInt(hslMatch[1], 10);
          primarySat = parseInt(hslMatch[2], 10);
          primaryLightness = parseInt(hslMatch[3], 10);
        }
      }
      
      // Get background lightness to determine if we're in a dark theme
      const bgVar = getCSSVariable('--background').trim();
      if (bgVar) {
        const hslMatch = bgVar.match(/\d+\s+\d+%\s+(\d+)%/);
        if (hslMatch) {
          backgroundLightness = parseInt(hslMatch[1], 10);
        }
      }
    } catch (e) {
      console.warn('Could not read CSS variables, using fallback colors', e);
    }
    
    // Theme-specific adjustments
    let baseR = 192, baseG = 192, baseB = 192;  // Light theme defaults
    let themeColorInfluence = 1; // Default influence
    
    switch(theme) {
      case 'dark':
        baseR = 20;
        baseG = 20;
        baseB = 30;
        backgroundLightness = 5;
        colorMultiplier = 0.4;
        themeColorInfluence = 1.2;
        break;
      case 'dark-red':
        primaryHue = 0; // Red
        primarySat = 100;
        primaryLightness = 50;
        baseR = 40; // Higher red base
        baseG = 10;
        baseB = 15;
        backgroundLightness = 5;
        colorMultiplier = 0.4;
        themeColorInfluence = 1.5; // Stronger red influence
        break;
      case 'dark-green':
        primaryHue = 120; // Green
        primarySat = 100;
        primaryLightness = 50;
        baseR = 10;
        baseG = 35; // Higher green base
        baseB = 15;
        backgroundLightness = 5;
        colorMultiplier = 0.4;
        themeColorInfluence = 1.5; // Stronger green influence
        break;
      case 'dark-yellow':
        primaryHue = 60; // Yellow
        primarySat = 100;
        primaryLightness = 50;
        baseR = 40;
        baseG = 35;
        baseB = 10; // Lower blue for more yellow feel
        backgroundLightness = 5;
        colorMultiplier = 0.4;
        themeColorInfluence = 1.5; // Stronger yellow influence
        break;
      case 'dark-purple':
        primaryHue = 260; // Purple
        primarySat = 100;
        primaryLightness = 50;
        baseR = 25;
        baseG = 15;
        baseB = 40; // Higher blue/red for purple base
        backgroundLightness = 5;
        colorMultiplier = 0.4;
        themeColorInfluence = 1.5; // Stronger purple influence
        break;
      default:
        // Light theme - keep defaults
        break;
    }
    
    // Get the actual theme RGB color for influence
    const primaryRgb = hslToRgb(primaryHue, primarySat, primaryLightness);
    
    return { 
      primaryHue, 
      primarySat, 
      primaryLightness, 
      backgroundLightness, 
      colorMultiplier, 
      theme,
      primaryRgb,
      baseR,
      baseG, 
      baseB,
      themeColorInfluence
    };
  };

  // Create RGB generator functions based on theme
  const createColorGenerators = (themeColors: ReturnType<typeof getThemeColors>) => {
    const { 
      primaryHue, 
      backgroundLightness, 
      colorMultiplier, 
      primaryRgb,
      baseR,
      baseG,
      baseB,
      themeColorInfluence
    } = themeColors;
    
    const isDark = backgroundLightness < 50;
    
    // Create color intensity based on theme
    const intensity = isDark ? 30 : 64;
    
    // Use primary RGB for color influence
    const [primaryR, primaryG, primaryB] = primaryRgb;
    
    // Color bias based on primary color (stronger in dark themes)
    const rBias = isDark ? (primaryR / 255) * themeColorInfluence : 1;
    const gBias = isDark ? (primaryG / 255) * themeColorInfluence : 1;
    const bBias = isDark ? (primaryB / 255) * themeColorInfluence : 1;
    
    return {
      R: (x: number, y: number, t: number) => {
        // Apply sine wave animation with theme-appropriate base and intensity
        let value = baseR + (intensity * Math.cos((x*x-y*y)/300 + t) * colorMultiplier * rBias);
        
        // Influence from primary color (red component)
        if (isDark && primaryHue < 30 || primaryHue > 330) {
          value += 25 * themeColorInfluence; // Boosted in red themes
        }
        
        return Math.floor(Math.max(0, Math.min(255, value)));
      },
      
      G: (x: number, y: number, t: number) => {
        // Different wave pattern for green
        let value = baseG + (intensity * Math.sin((x*x*Math.cos(t/4)+y*y*Math.sin(t/3))/300) * colorMultiplier * gBias);
        
        // Influence from primary color (green component)
        if (isDark && primaryHue > 60 && primaryHue < 180) {
          value += 25 * themeColorInfluence; // Boosted in green themes
        }
        
        return Math.floor(Math.max(0, Math.min(255, value)));
      },
      
      B: (x: number, y: number, t: number) => {
        // Different wave pattern for blue
        let value = baseB + (intensity * Math.sin(5*Math.sin(t/9) + ((x-100)*(x-100)+(y-100)*(y-100))/1100) * colorMultiplier * bBias);
        
        // Influence from primary color (blue/purple component)
        if (isDark && primaryHue > 180 && primaryHue < 300) {
          value += 25 * themeColorInfluence; // Boosted in blue/purple themes
        }
        
        return Math.floor(Math.max(0, Math.min(255, value)));
      }
    };
  };

  let t = 0;
  let currentTheme = getCurrentTheme();
  let themeColors = getThemeColors();
  let colorGen = createColorGenerators(themeColors);
  
  // Create a pattern canvas for better performance
  const patternSize = 32; // Small enough for performance, large enough for detail
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = patternSize;
  patternCanvas.height = patternSize;
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
    for(let x = 0; x < patternSize; x++) {
      for(let y = 0; y < patternSize; y++) {
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
      $.imageSmoothingQuality = 'high';
      
      // Draw the pattern scaled to fill the screen
      $.drawImage(patternCanvas, 0, 0, c.width, c.height);
      
      // Restore context state
      $.restore();
    }
    
    // Adjust animation speed based on theme (slower for dark themes)
    const speedFactor = themeColors.theme.startsWith('dark') ? 0.015 : 0.025;
    t = t + speedFactor;
    
    window.requestAnimationFrame(updatePattern);
  };

  console.log('Starting background animation with enhanced theme adaptation');
  updatePattern();
}
