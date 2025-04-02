/**
 * Animated background controller that uses canvas to create fluid, colorful backgrounds
 * that adapt to the current theme colors
 */

// Initialize and manage the animated background
export const initializeBackground = () => {
  // Remove any existing canvas
  const existingCanvas = document.getElementById('background-canvas');
  if (existingCanvas) {
    existingCanvas.remove();
  }

  // Create new canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'background-canvas';
  canvas.width = 60;  // Low resolution for performance
  canvas.height = 60;
  
  // Add required styles to ensure the canvas doesn't interfere with interactions
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-100'; // Much further behind all content
  canvas.style.pointerEvents = 'none'; // Ignore all pointer events
  
  // Insert canvas into the DOM
  document.body.appendChild(canvas);

  // Get canvas context
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Animation timing
  let time = 0;
  
  // Get theme colors from CSS variables
  const getThemeColors = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    const patternColorRGB = computedStyle.getPropertyValue('--pattern-color-rgb').trim();
    const patternAccentRGB = computedStyle.getPropertyValue('--pattern-accent-rgb').trim();
    
    // Parse RGB values
    const [r1, g1, b1] = patternColorRGB.split(',').map(val => parseInt(val.trim(), 10));
    const [r2, g2, b2] = patternAccentRGB.split(',').map(val => parseInt(val.trim(), 10));
    
    return { 
      primary: { r: r1, g: g1, b: b1 },
      accent: { r: r2, g: g2, b: b2 }
    };
  };
  
  // Draw a single pixel
  const drawPixel = (x: number, y: number, r: number, g: number, b: number, a: number = 1) => {
    if (!ctx) return;
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.fillRect(x, y, 1, 1);
  };
  
  // Color functions based on position and time
  const calculateR = (x: number, y: number, t: number, colors: any) => {
    const base = colors.primary.r;
    const range = 40; // Smaller range for subtlety
    return Math.floor(base + range * Math.cos((x*x-y*y)/300 + t));
  };
  
  const calculateG = (x: number, y: number, t: number, colors: any) => {
    const base = colors.primary.g;
    const range = 40;
    return Math.floor(base + range * Math.sin((x*x*Math.cos(t/4)+y*y*Math.sin(t/3))/300));
  };
  
  const calculateB = (x: number, y: number, t: number, colors: any) => {
    const base = colors.primary.b;
    const range = 40;
    return Math.floor(base + range * Math.sin(5*Math.sin(t/9) + ((x-30)*(x-30)+(y-30)*(y-30))/1100));
  };
  
  // Animation loop
  const animate = () => {
    const colors = getThemeColors();
    
    // Draw every pixel
    for (let x = 0; x <= canvas.width; x++) {
      for (let y = 0; y <= canvas.height; y++) {
        const r = calculateR(x, y, time, colors);
        const g = calculateG(x, y, time, colors);
        const b = calculateB(x, y, time, colors);
        
        // Add some variation with the accent color
        const factor = Math.sin((x+y)/20 + time/5) * 0.5 + 0.5;
        const finalR = Math.min(255, Math.max(0, Math.floor(r * (1-factor) + colors.accent.r * factor)));
        const finalG = Math.min(255, Math.max(0, Math.floor(g * (1-factor) + colors.accent.g * factor)));
        const finalB = Math.min(255, Math.max(0, Math.floor(b * (1-factor) + colors.accent.b * factor)));
        
        drawPixel(x, y, finalR, finalG, finalB);
      }
    }
    
    // Significantly reduced time increment for slower animation
    time += 0.01; // Reduced to make animation much slower
    
    // Request next frame
    requestAnimationFrame(animate);
  };
  
  // Start animation
  animate();
  
  // Listen for theme changes to update colors
  window.addEventListener('themechange', () => {
    console.log('[Background] Theme changed, updating colors');
    // No need to restart animation, the next frame will use new colors
  });
};

export default initializeBackground;
