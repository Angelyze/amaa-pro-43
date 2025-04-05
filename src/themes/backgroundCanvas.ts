
/**
 * Initializes and runs the background canvas animation
 */
export function initBackgroundCanvas(): void {
  const c = document.getElementById('canv') as HTMLCanvasElement;
  if (!c) return;
  
  const $ = c.getContext('2d');
  if (!$) return;

  // Set canvas size to match window size
  const resizeCanvas = () => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
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
    
    // Make the animation visible across the entire canvas
    // Use a lower pixel density for performance
    const pixelSize = 8; // Larger pixels for better performance
    
    // Clear the canvas first
    $.clearRect(0, 0, c.width, c.height);
    
    // Calculate how many pixels we need to fill the screen
    const cols = Math.ceil(c.width / pixelSize);
    const rows = Math.ceil(c.height / pixelSize);
    
    for(let x = 0; x < cols; x++) {
      for(let y = 0; y < rows; y++) {
        // Scale the coordinates to match original algorithm's expected range
        const scaledX = x * 35 / cols;
        const scaledY = y * 35 / rows;
        
        // Calculate color using original algorithm
        const r = R(scaledX, scaledY, t);
        const g = G(scaledX, scaledY, t);
        const b = B(scaledX, scaledY, t);
        
        // Draw a larger rectangle instead of a single pixel
        $.fillStyle = `rgb(${r},${g},${b})`;
        $.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
    
    t = t + 0.120;
    window.requestAnimationFrame(run);
  };

  // Start the animation
  run();
}
