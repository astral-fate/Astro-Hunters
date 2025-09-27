import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Eye } from 'lucide-react';

const TransitAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const canvasRef = useRef(null);
  const lightCurveCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Animation parameters
  const orbitRadius = 200;
  const starRadius = 60;
  const planetRadius = 12;
  const animationDuration = 8000; // 8 seconds for full orbit

  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setAnimationTime(prev => (prev + (16 * speed)) % animationDuration);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating, speed]);

  // Calculate planet position
  const progress = (animationTime / animationDuration) * 2 * Math.PI;
  const planetX = Math.cos(progress) * orbitRadius;
  const planetY = Math.sin(progress) * orbitRadius * 0.3; // Flatten orbit for better view

  // Determine if planet is in front of star
  const isTransiting = Math.abs(planetX) < starRadius + planetRadius && planetY > -10;
  const transitDepth = isTransiting ? Math.max(0, 1 - Math.abs(planetX) / (starRadius + planetRadius)) : 0;

  // Draw main animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add stars background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 100; i++) {
      const x = (i * 137.5) % canvas.width;
      const y = (i * 197.3) % canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1 + 0.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw orbit path
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, orbitRadius, orbitRadius * 0.3, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw star with glow effect
    const starCenterX = centerX;
    const starCenterY = centerY;
    
    // Star glow
    const gradient = ctx.createRadialGradient(starCenterX, starCenterY, 0, starCenterX, starCenterY, starRadius * 1.5);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 165, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(starCenterX, starCenterY, starRadius * 1.5, 0, 2 * Math.PI);
    ctx.fill();

    // Star body
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(starCenterX, starCenterY, starRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Star surface texture
    ctx.fillStyle = 'rgba(255, 140, 0, 0.3)';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI + animationTime * 0.001;
      const x = starCenterX + Math.cos(angle) * (starRadius * 0.7);
      const y = starCenterY + Math.sin(angle) * (starRadius * 0.7);
      ctx.beginPath();
      ctx.arc(x, y, 3 + Math.sin(animationTime * 0.003 + i) * 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Calculate planet position in 3D space
    const actualPlanetX = centerX + planetX;
    const actualPlanetY = centerY + planetY;
    const planetZ = Math.sin(progress) * orbitRadius; // Z-depth for 3D effect

    // Draw planet shadow on star during transit
    if (isTransiting && planetZ < 0) {
      const shadowOpacity = transitDepth * 0.8;
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
      ctx.beginPath();
      ctx.arc(actualPlanetX, actualPlanetY, planetRadius * 1.1, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw planet
    const planetGradient = ctx.createRadialGradient(
      actualPlanetX - 4, actualPlanetY - 4, 0,
      actualPlanetX, actualPlanetY, planetRadius
    );
    planetGradient.addColorStop(0, '#4fc3f7');
    planetGradient.addColorStop(0.6, '#1976d2');
    planetGradient.addColorStop(1, '#0d47a1');
    
    ctx.fillStyle = planetGradient;
    ctx.beginPath();
    ctx.arc(actualPlanetX, actualPlanetY, planetRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Planet atmosphere
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(actualPlanetX, actualPlanetY, planetRadius + 2, 0, 2 * Math.PI);
    ctx.stroke();

    // Add direction arrow
    ctx.strokeStyle = '#64b5f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const arrowX = actualPlanetX + Math.cos(progress + Math.PI/2) * 25;
    const arrowY = actualPlanetY + Math.sin(progress + Math.PI/2) * 25 * 0.3;
    ctx.moveTo(actualPlanetX, actualPlanetY);
    ctx.lineTo(arrowX, arrowY);
    ctx.stroke();
    
    // Arrow head
    const arrowAngle = Math.atan2(arrowY - actualPlanetY, arrowX - actualPlanetX);
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 8 * Math.cos(arrowAngle - 0.3), arrowY - 8 * Math.sin(arrowAngle - 0.3));
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 8 * Math.cos(arrowAngle + 0.3), arrowY - 8 * Math.sin(arrowAngle + 0.3));
    ctx.stroke();

    // Add labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Star', starCenterX, starCenterY + starRadius + 25);
    ctx.fillText('Planet', actualPlanetX, actualPlanetY + planetRadius + 25);

    // Show transit indicator
    if (isTransiting) {
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('TRANSIT!', centerX, centerY - starRadius - 30);
      
      // Highlight the transit zone
      ctx.strokeStyle = 'rgba(255, 68, 68, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(centerX - starRadius - 20, centerY - starRadius - 20, 
                    (starRadius + 20) * 2, (starRadius + 20) * 2);
      ctx.setLineDash([]);
    }

  }, [animationTime, planetX, planetY, isTransiting, transitDepth, progress]);

  // Draw light curve
  useEffect(() => {
    const canvas = lightCurveCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.fillStyle = '#0f1419';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      // Vertical lines
      const x = padding + (i / 10) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();

      // Horizontal lines
      const y = padding + (i / 10) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Generate light curve data
    const numPoints = 200;
    const points = [];
    
    // Define transit parameters
    const transitPhase1 = Math.PI * 0.45; // First transit
    const transitPhase2 = Math.PI * 1.55; // Second transit (opposite side)
    const transitWidth = 0.15;
    
    for (let i = 0; i < numPoints; i++) {
      const time = (i / numPoints) * 2 * Math.PI;
      let brightness = 1.0;
      
      if (Math.abs(time - transitPhase1) < transitWidth) {
        const depth = 0.03;
        const factor = Math.cos((time - transitPhase1) / transitWidth * Math.PI * 0.5);
        brightness -= depth * Math.pow(factor, 2);
      }
      
      if (Math.abs(time - transitPhase2) < transitWidth) {
        const depth = 0.03;
        const factor = Math.cos((time - transitPhase2) / transitWidth * Math.PI * 0.5);
        brightness -= depth * Math.pow(factor, 2);
      }
      
      // Add some noise
      brightness += (Math.random() - 0.5) * 0.005;
      
      points.push({
        x: padding + (i / numPoints) * chartWidth,
        y: padding + (1 - brightness + 0.96) * chartHeight / 0.08 // Scale to show variation
      });
    }

    // Draw light curve
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#10b981';
    points.forEach((point, i) => {
      if (i % 5 === 0) { // Every 5th point
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Highlight current position
    const currentIndex = Math.floor((animationTime / animationDuration) * numPoints);
    if (currentIndex < points.length) {
      const currentPoint = points[currentIndex];
      ctx.fillStyle = '#ff6b35';
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Vertical line to show current time
      ctx.strokeStyle = 'rgba(255, 107, 53, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(currentPoint.x, padding);
      ctx.lineTo(currentPoint.x, padding + chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time (orbital period)', canvas.width / 2, canvas.height - 10);
    
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Star Brightness', 0, 0);
    ctx.restore();

    // Transit markers
    const transit1X = padding + (transitPhase1 / (2 * Math.PI)) * chartWidth;
    const transit2X = padding + (transitPhase2 / (2 * Math.PI)) * chartWidth;
    
    ctx.fillStyle = 'rgba(255, 68, 68, 0.3)';
    ctx.fillRect(transit1X - 10, padding, 20, chartHeight);
    ctx.fillRect(transit2X - 10, padding, 20, chartHeight);
    
    ctx.fillStyle = '#ff4444';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Transit', transit1X, padding - 5);
    ctx.fillText('Transit', transit2X, padding - 5);

  }, [animationTime, animationDuration]);

  const handleReset = () => {
    setAnimationTime(0);
    setIsAnimating(false);
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 to-blue-900 bg-opacity-50 p-8 rounded-2xl border border-gray-600">
      <h3 className="text-3xl font-bold mb-6 text-center text-purple-300">
        The Transit Method - Interactive Demo
      </h3>
      
      <div className="grid lg:grid-cols-2 gap-8 mb-6">
        {/* Main Animation */}
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-white text-center">
            Planet Orbit View
          </h4>
          <div className="relative bg-black rounded-xl overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-80"
              style={{ maxWidth: '100%' }}
            />
          </div>
          <p className="text-sm text-gray-300 text-center">
            Watch the planet orbit around its star. When it passes in front (transit), 
            it blocks some starlight.
          </p>
        </div>

        {/* Light Curve */}
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-white text-center">
            Star Brightness Over Time
          </h4>
          <div className="relative bg-black rounded-xl overflow-hidden">
            <canvas
              ref={lightCurveCanvasRef}
              className="w-full h-80"
              style={{ maxWidth: '100%' }}
            />
          </div>
          <p className="text-sm text-gray-300 text-center">
            The red line shows current time. Notice how brightness drops during transits!
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          {isAnimating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isAnimating ? 'Pause' : 'Play'}
        </button>
        
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className="text-gray-300">Speed:</span>
        <input
          type="range"
          min="0.2"
          max="3"
          step="0.2"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-32"
        />
        <span className="text-white">{speed}x</span>
      </div>

      {/* Educational Content */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-black bg-opacity-40 p-4 rounded-lg">
          <div className="text-2xl mb-2">🌟</div>
          <h5 className="font-semibold text-white mb-2">The Star</h5>
          <p className="text-sm text-gray-300">
            Stars emit a steady amount of light. When a planet passes in front, 
            it blocks a tiny fraction of that light.
          </p>
        </div>
        
        <div className="bg-black bg-opacity-40 p-4 rounded-lg">
          <div className="text-2xl mb-2">🪐</div>
          <h5 className="font-semibold text-white mb-2">The Planet</h5>
          <p className="text-sm text-gray-300">
            The planet's size determines how much light is blocked. 
            Larger planets create deeper dips in brightness.
          </p>
        </div>
        
        <div className="bg-black bg-opacity-40 p-4 rounded-lg">
          <div className="text-2xl mb-2">📊</div>
          <h5 className="font-semibold text-white mb-2">The Signal</h5>
          <p className="text-sm text-gray-300">
            The regular dips in the light curve tell us about the planet's 
            size, orbit, and distance from its star.
          </p>
        </div>
      </div>

      {/* Key Learning Points */}
      <div className="mt-8 p-6 bg-blue-900 bg-opacity-30 rounded-lg">
        <h4 className="text-lg font-semibold text-blue-300 mb-4">Key Insights:</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• Transit dips are typically 0.01% - 1% of the star's brightness</li>
          <li>• The shape is U-shaped, not V-shaped (planets have circular shadows)</li>
          <li>• Transit duration depends on planet size, star size, and orbital speed</li>
          <li>• Multiple transits confirm it's a planet, not just noise in the data</li>
          <li>• This method has discovered thousands of exoplanets!</li>
        </ul>
      </div>
    </div>
  );
};

export default TransitAnimation;
