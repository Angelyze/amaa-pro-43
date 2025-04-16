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
    
    // Get base colors and intensity adjustment based on theme
    const isDark = backgroundLightness < 50;
    // Base RGB values - used for all themes as a starting point
    let baseR = 192, baseG = 192, baseB = 192;  // Light theme default base
    let colorMultiplier = 1; // Default intensity
    
    if (isDark) {
      // Using very dark base values for multiplicative blending
      baseR = 5;
      baseG = 5;
      baseB = 5;
      colorMultiplier = 0.3; // Reduced intensity for dark themes
    }
    
    // Convert primary color to RGB for influence
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
      isDark
    };
  };

  // Create RGB generator functions based on theme
  const createColorGenerators = (themeColors: ReturnType<typeof getThemeColors>) => {
    const { 
      primaryRgb,
      baseR,
      baseG,
      baseB,
      colorMultiplier,
      isDark
    } = themeColors;
    
    // Get primary color components for theme influence
    const [primaryR, primaryG, primaryB] = primaryRgb;
    
    // Lower intensity for dark themes
    const intensity = isDark ? 10 : 64;
    
    // Create the color generators with theme-specific adjustments
    return {
      R: (x: number, y: number, t: number) => {
        // Apply wave pattern to get base value
        const waveComponent = Math.cos((x*x-y*y)/300 + t) * intensity * colorMultiplier;
        
        let value;
        if (isDark) {
          // Multiplicative blending for dark themes (darker result)
          // Formula: (base * primaryColor) / 255 to keep result in 0-255 range
          const baseValue = baseR + waveComponent;
          value = (baseValue * primaryR) / 255;
        } else {
          // Keep the original additive formula for light themes
          value = baseR + waveComponent;
        }
        
        return Math.floor(Math.max(0, Math.min(255, value)));
      },
      
      G: (x: number, y: number, t: number) => {
        // Apply wave pattern to get base value
        const waveComponent = Math.sin((x*x*Math.cos(t/4)+y*y*Math.sin(t/3))/300) * intensity * colorMultiplier;
        
        let value;
        if (isDark) {
          // Multiplicative blending for dark themes
          const baseValue = baseG + waveComponent;
          value = (baseValue * primaryG) / 255;
        } else {
          // Keep the original formula for light themes
          value = baseG + waveComponent;
        }
        
        return Math.floor(Math.max(0, Math.min(255, value)));
      },
      
      B: (x: number, y: number, t: number) => {
        // Apply wave pattern to get base value
        const waveComponent = Math.sin(5*Math.sin(t/9) + ((x-100)*(x-100)+(y-100)*(y-100))/1100) * intensity * colorMultiplier;
        
        let value;
        if (isDark) {
          // Multiplicative blending for dark themes
          const baseValue = baseB + waveComponent;
          value = (baseValue * primaryB) / 255;
        } else {
          // Keep the original formula for light themes
          value = baseB + waveComponent;
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
    
    // Same animation speed for all themes for consistent experience
    const speedFactor = 0.02;
    t = t + speedFactor;
    
    window.requestAnimationFrame(updatePattern);
  };

  console.log('Starting background animation with enhanced theme adaptation');
  updatePattern();
}
