
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
    
    // Create a scaled version to render more efficiently
    const scale = 12; // Adjust this for performance vs. quality
    const width = Math.ceil(c.width / scale);
    const height = Math.ceil(c.height / scale);
    
    // Clear the canvas first
    $.clearRect(0, 0, c.width, c.height);
    
    // Scale the context to fill the screen
    $.save();
    $.scale(scale, scale);
    
    for(let x = 0; x <= width; x++) {
      for(let y = 0; y <= height; y++) {
        col(x, y, R(x, y, t), G(x, y, t), B(x, y, t));
      }
    }
    
    $.restore();
    
    t = t + 0.120;
    window.requestAnimationFrame(run);
  };

  // Start the animation
  run();
}
