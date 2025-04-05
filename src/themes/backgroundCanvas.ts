
/**
 * Initializes and runs the background canvas animation
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

  const run = function() {
    if (!$) return;
    
    // Use a more efficient approach for drawing the animation
    // by using larger blocks (pixels) that still maintain the pattern
    const pixelSize = 12; // Use larger pixels for better performance
    
    // Clear the canvas first
    $.clearRect(0, 0, c.width, c.height);
    
    // Calculate how many cells we need to fill the screen
    const cols = Math.ceil(c.width / pixelSize);
    const rows = Math.ceil(c.height / pixelSize);
    
    // Scale factor to maintain the original algorithm's pattern spacing
    const scaleFactorX = 50 / cols;
    const scaleFactorY = 50 / rows;
    
    for(let x = 0; x < cols; x++) {
      for(let y = 0; y < rows; y++) {
        // Map the screen coordinates to the algorithm's expected range
        const mappedX = x * scaleFactorX;
        const mappedY = y * scaleFactorY;
        
        // Calculate color using original algorithm
        const r = R(mappedX, mappedY, t);
        const g = G(mappedX, mappedY, t);
        const b = B(mappedX, mappedY, t);
        
        // Draw a filled rectangle instead of a single pixel
        $.fillStyle = `rgb(${r},${g},${b})`;
        $.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
    
    t = t + 0.080; // Slightly slower animation speed
    window.requestAnimationFrame(run);
  };

  // Start the animation immediately
  console.log('Starting background animation');
  run();
}
