
/**
 * Initializes and runs the background canvas animation
 * Creates a single 32px element that stretches 100% to fill the screen
 * Adapts colors to match the current theme
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

  // Apply filter based on theme
  const applyThemeFilter = (context: CanvasRenderingContext2D | null) => {
    if (!context) return;
    
    const theme = getCurrentTheme();
    
    // Reset any previously applied filters
    context.filter = 'none';
    
    // Apply theme-specific filters
    switch(theme) {
      case 'dark':
        context.filter = 'brightness(0.5) contrast(1.2)';
        break;
      case 'dark-red':
        context.filter = 'brightness(0.5) contrast(1.2) sepia(0.2) hue-rotate(320deg)';
        break;
      case 'dark-green':
        context.filter = 'brightness(0.5) contrast(1.2) sepia(0.2) hue-rotate(90deg)';
        break;
      case 'dark-yellow':
        context.filter = 'brightness(0.5) contrast(1.2) sepia(0.3) hue-rotate(40deg)';
        break;
      case 'dark-purple':
        context.filter = 'brightness(0.5) contrast(1.2) sepia(0.2) hue-rotate(250deg)';
        break;
      default:
        // Light theme - no filter
        break;
    }
  };

  const col = function(x: number, y: number, r: number, g: number, b: number) {
    if (!$) return;
    $.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    $.fillRect(x, y, 1, 1);
  };

  const R = function(x: number, y: number, t: number) {
    return Math.floor(192 + 64*Math.cos((x*x-y*y)/300 + t));
  };

  const G = function(x: number, y: number, t: number) {
    return Math.floor(192 + 64*Math.sin((x*x*Math.cos(t/4)+y*y*Math.sin(t/3))/300));
  };

  const B = function(x: number, y: number, t: number) {
    return Math.floor(192 + 64*Math.sin(5*Math.sin(t/9) + ((x-100)*(x-100)+(y-100)*(y-100))/1100));
  };

  let t = 0;
  
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
    // When theme changes, re-apply the filter
    applyThemeFilter($);
  });

  // Initial filter application
  applyThemeFilter($);

  const updatePattern = function() {
    // Generate the pattern only once per frame
    for(let x = 0; x < 32; x++) {
      for(let y = 0; y < 32; y++) {
        const r = R(x, y, t);
        const g = G(x, y, t);
        const b = B(x, y, t);
        
        patternCtx.fillStyle = `rgb(${r},${g},${b})`;
        patternCtx.fillRect(x, y, 1, 1);
      }
    }
    
    // Clear the main canvas
    if ($) {
      $.clearRect(0, 0, c.width, c.height);
      
      // Apply the current theme filter
      applyThemeFilter($);

      // Stretch the small canvas to fill the entire screen
      $.save();
      $.imageSmoothingEnabled = false; // Turn off image smoothing for pixelated look
      $.drawImage(patternCanvas, 0, 0, c.width, c.height);
      $.restore();
    }
    
    t = t + 0.03; // Slow animation speed to reduce resource usage
    window.requestAnimationFrame(updatePattern);
  };

  console.log('Starting background animation with stretched pattern and theme adaptation');
  updatePattern();
}
