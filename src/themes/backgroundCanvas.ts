
/**
 * Initializes and runs the background canvas animation
 * Creates a single 32px element that stretches 100% to fill the screen
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
      
      // Instead of using createPattern, stretch the small canvas to fill the entire screen
      $.save();
      $.imageSmoothingEnabled = false; // Turn off image smoothing for pixelated look
      $.drawImage(patternCanvas, 0, 0, c.width, c.height);
      $.restore();
    }
    
    t = t + 0.03; // Slow animation speed to reduce resource usage
    window.requestAnimationFrame(updatePattern);
  };

  console.log('Starting background animation with stretched pattern');
  updatePattern();
}
