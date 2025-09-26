import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  RotateCcw, 
  Search, 
  Users, 
  Globe, 
  Telescope, 
  Star,
  Sun,
  Moon,
  Eye,
  ArrowRight,
  ExternalLink,
  Zap,
  Target,
  Award,
  BookOpen,
  Camera
} from 'lucide-react';

const ExoplanetDiscoveryLanding = () => {
  // State management
  const [activeSection, setActiveSection] = useState('hero');
  const [solarSystemAnimation, setSolarSystemAnimation] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [transitSimulationActive, setTransitSimulationActive] = useState(false);
  const [currentExoplanetType, setCurrentExoplanetType] = useState(0);

  // Light curve simulation states
  const [lightCurveData, setLightCurveData] = useState([]);
  const [userSelections, setUserSelections] = useState([]);
  const [actualTransits, setActualTransits] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [score, setScore] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  // Animation loops
  useEffect(() => {
    let animationId;
    if (solarSystemAnimation) {
      const animate = () => {
        setAnimationTime(Date.now());
        animationId = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [solarSystemAnimation]);

  useEffect(() => {
    let animationId;
    if (transitSimulationActive) {
      const animate = () => {
        setAnimationTime(Date.now());
        animationId = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [transitSimulationActive]);

  // Stars background component
  const StarsBackground = () => {
    const stars = Array.from({ length: 300 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() * 4 + 2
    }));

    return (
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black"></div>
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: `${star.twinkle}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    );
  };

  // Feedback Modal Component
  const FeedbackModal = () => {
    if (!showFeedbackModal || !feedbackData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="relative p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white border-opacity-20 text-center bg-gray-900 bg-opacity-95">
          <button
            onClick={() => {
              setShowFeedbackModal(false);
              setFeedbackData(null);
              // Reset selections after showing feedback
              setTimeout(() => {
                setUserSelections([]);
                generateLightCurve();
              }, 500);
            }}
            className="absolute top-4 right-5 text-white text-2xl cursor-pointer hover:rotate-90 transition-transform duration-200 z-10"
          >
            ×
          </button>
          
          <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
            feedbackData.isSuccess ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {feedbackData.isSuccess ? (
              <Award className="w-8 h-8 text-white" />
            ) : (
              <Search className="w-8 h-8 text-white" />
            )}
          </div>
          
          <h2 className={`text-3xl font-bold mb-4 ${
            feedbackData.isSuccess ? 'text-green-400' : 'text-red-400'
          }`}>
            {feedbackData.title}
          </h2>
          
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            {feedbackData.message}
          </p>
          
          {/* Mini light curve visualization */}
          <div className="bg-black bg-opacity-50 p-4 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Analysis Results</h3>
            <div className="flex justify-center gap-6 text-sm">
              {feedbackData.correctSelections.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-300">Correct ({feedbackData.correctSelections.length})</span>
                </div>
              )}
              {feedbackData.incorrectSelections.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-300">Incorrect ({feedbackData.incorrectSelections.length})</span>
                </div>
              )}
              {feedbackData.missedTransits.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-gray-300">Missed ({feedbackData.missedTransits.length})</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setShowFeedbackModal(false);
                setFeedbackData(null);
                setUserSelections([]);
                generateLightCurve();
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Star className="w-5 h-5" />
              Try New Star
            </button>
            
            <button
              onClick={() => {
                setShowFeedbackModal(false);
                setFeedbackData(null);
              }}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
            >
              Continue Analysis
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Hero Section
  const HeroSection = () => (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="z-10 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
          Exoplanet Hunter
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Join the quest to discover new worlds beyond our solar system. Learn how scientists detect exoplanets by analyzing starlight and become a citizen scientist yourself.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => setActiveSection('simulation')}
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Telescope className="w-5 h-5" />
            Start Hunting
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => setActiveSection('education')}
            className="px-8 py-4 border-2 border-purple-500 rounded-full text-lg font-semibold hover:bg-purple-500 hover:bg-opacity-20 transition-all duration-300 flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Learn First
          </button>
        </div>
      </div>
      <ChevronDown className="absolute bottom-8 w-8 h-8 text-white animate-bounce cursor-pointer" onClick={() => setActiveSection('education')} />
    </section>
  );

  // Educational Solar System Section
  const SolarSystemSection = () => {
    const planets = [
      { name: 'Mercury', distance: 80, size: 8, color: '#8c7853', period: 88, description: "Closest to the Sun, tidally locked" },
      { name: 'Venus', distance: 110, size: 12, color: '#ffc649', period: 225, description: "Hottest planet, thick atmosphere" },
      { name: 'Earth', distance: 150, size: 14, color: '#6b93d6', period: 365, description: "Our home, perfect for life" },
      { name: 'Mars', distance: 190, size: 10, color: '#c1440e', period: 687, description: "The Red Planet, possible ancient life" },
      { name: 'Jupiter', distance: 280, size: 40, color: '#d8ca9d', period: 4333, description: "Gas giant, protects inner planets" },
      { name: 'Saturn', distance: 350, size: 35, color: '#fad5a5', period: 10759, description: "Beautiful rings, many moons" },
      { name: 'Uranus', distance: 420, size: 25, color: '#4fd0e4', period: 30687, description: "Ice giant, rotates on its side" },
      { name: 'Neptune', distance: 480, size: 24, color: '#4b70dd', period: 60190, description: "Windiest planet in solar system" }
    ];

    return (
      <section className="relative min-h-screen py-20 px-4">
        <div className="z-10 relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Our Solar System
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Understanding our own planetary system helps us recognize the signatures of distant worlds. Watch how planets transit across their star.
            </p>
            <button 
              onClick={() => setSolarSystemAnimation(!solarSystemAnimation)}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-full flex items-center gap-2 mx-auto transition-colors"
            >
              {solarSystemAnimation ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {solarSystemAnimation ? 'Pause Animation' : 'Start Animation'}
            </button>
          </div>

          {/* Solar System Visualization */}
          <div className="relative flex items-center justify-center mb-16 h-96">
            {/* Sun */}
            <div 
              className="absolute z-20 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-transform"
              style={{
                width: '60px',
                height: '60px',
                background: 'radial-gradient(circle, #ffd700, #ff8c00)',
                boxShadow: '0 0 30px #ff8c00'
              }}
              onClick={() => setSelectedPlanet({ name: 'Sun', description: 'Our star, a main sequence G-type star that provides energy for all life on Earth' })}
            >
            </div>

            {/* Planetary Orbits */}
            {planets.map((planet, index) => (
              <div key={planet.name}>
                {/* Orbit path */}
                <div 
                  className="absolute border border-gray-600 border-opacity-30 rounded-full"
                  style={{
                    width: `${planet.distance * 2}px`,
                    height: `${planet.distance * 2}px`,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                
                {/* Planet */}
                <div
                  className="absolute rounded-full cursor-pointer hover:scale-125 transition-all duration-300 z-10"
                  style={{
                    width: `${planet.size}px`,
                    height: `${planet.size}px`,
                    backgroundColor: planet.color,
                    top: '50%',
                    left: '50%',
                    transform: solarSystemAnimation 
                      ? `translate(-50%, -50%) rotate(${animationTime / (planet.period * 20)}deg) translateX(${planet.distance}px)`
                      : `translate(-50%, -50%) translateX(${planet.distance}px)`,
                    boxShadow: planet.name === 'Earth' ? '0 0 10px rgba(107, 147, 214, 0.6)' : 'none'
                  }}
                  onClick={() => setSelectedPlanet(planet)}
                />
                
                {/* Saturn's rings */}
                {planet.name === 'Saturn' && (
                  <div
                    className="absolute border-2 border-yellow-300 border-opacity-40 rounded-full pointer-events-none"
                    style={{
                      width: `${planet.size * 2.2}px`,
                      height: `${planet.size * 2.2}px`,
                      top: '50%',
                      left: '50%',
                      transform: solarSystemAnimation 
                        ? `translate(-50%, -50%) rotate(${animationTime / (planet.period * 20)}deg) translateX(${planet.distance}px)`
                        : `translate(-50%, -50%) translateX(${planet.distance}px)`
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Planet Info Panel */}
          {selectedPlanet && (
            <div className="bg-black bg-opacity-60 backdrop-blur-md p-8 rounded-2xl border border-gray-600 max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold mb-4 text-yellow-400">{selectedPlanet.name}</h3>
              <p className="text-gray-300 text-lg leading-relaxed">{selectedPlanet.description}</p>
              {selectedPlanet.period && (
                <p className="text-sm text-gray-400 mt-4">Orbital Period: {selectedPlanet.period} Earth days</p>
              )}
              <button 
                onClick={() => setSelectedPlanet(null)}
                className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Transit Explanation */}
          <div className="mt-16 bg-gradient-to-r from-purple-900 to-blue-900 bg-opacity-50 p-8 rounded-2xl border border-gray-600">
            <h3 className="text-3xl font-bold mb-6 text-center text-purple-300">The Transit Method</h3>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  When a planet passes between its star and Earth, it blocks a tiny amount of starlight. This creates a characteristic dip in the star's brightness that we can detect with sensitive instruments.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  The depth of the transit tells us the planet's size, while the period between transits reveals its orbital distance from the star.
                </p>
              </div>
              <div className="relative h-48 bg-black bg-opacity-50 rounded-xl overflow-hidden">
                {/* Simplified transit visualization */}
                <div className="absolute top-1/2 left-8 w-16 h-16 bg-yellow-400 rounded-full transform -translate-y-1/2 shadow-lg"></div>
                <div 
                  className="absolute top-1/2 w-4 h-4 bg-blue-600 rounded-full transform -translate-y-1/2 transition-all duration-1000"
                  style={{
                    left: transitSimulationActive ? 
                      `${25 + (Math.sin(animationTime * 0.002) * 20)}%` : '25%'
                  }}
                ></div>
                <div className="absolute bottom-4 left-4 right-4 h-1 bg-gray-600 rounded">
                  <div 
                    className="h-full bg-red-500 rounded transition-all duration-500"
                    style={{
                      width: transitSimulationActive ? 
                        `${Math.max(0, 100 - Math.abs(Math.sin(animationTime * 0.002)) * 50)}%` : '100%',
                      marginLeft: '0%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <button 
                onClick={() => {
                  setTransitSimulationActive(!transitSimulationActive);
                  if (!transitSimulationActive) {
                    // Reset animation after 8 seconds
                    setTimeout(() => setTransitSimulationActive(false), 8000);
                  }
                }}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors flex items-center gap-2 mx-auto"
              >
                <Eye className="w-5 h-5" />
                {transitSimulationActive ? 'Reset' : 'Watch Transit'}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Exoplanet Types Section
  const ExoplanetTypesSection = () => {
    const exoplanetTypes = [
      {
        name: "Hot Jupiters",
        description: "Gas giants that orbit very close to their stars, completing an orbit in just a few days. These were among the first exoplanets discovered.",
        size: "Large",
        temperature: "Very Hot (>1000K)",
        example: "HD 209458 b",
        color: "#ff6b35",
        icon: "🔥"
      },
      {
        name: "Super-Earths",
        description: "Rocky planets larger than Earth but smaller than Neptune. They're the most common type of exoplanet in our galaxy.",
        size: "1.5-2x Earth",
        temperature: "Varies",
        example: "Kepler-452b",
        color: "#4a90e2",
        icon: "🌍"
      },
      {
        name: "Mini-Neptunes",
        description: "Small gas planets with thick atmospheres, between the size of Earth and Neptune. Very common around other stars.",
        size: "2-4x Earth",
        temperature: "Cool to Warm",
        example: "K2-18b",
        color: "#7b68ee",
        icon: "💨"
      },
      {
        name: "Rogue Planets",
        description: "Planets that have been ejected from their solar systems and now wander through space without a host star.",
        size: "Varies",
        temperature: "Very Cold",
        example: "PSO J318.5-22",
        color: "#2f2f2f",
        icon: "🌑"
      }
    ];

    return (
      <section className="relative py-20 px-4">
        <div className="z-10 relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Types of Exoplanets
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Scientists have discovered thousands of exoplanets, each with unique characteristics. Here are the main categories we've identified.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {exoplanetTypes.map((type, index) => (
              <div 
                key={type.name}
                className={`p-8 rounded-2xl border border-gray-600 cursor-pointer transition-all duration-500 hover:scale-105 ${
                  currentExoplanetType === index ? 'bg-opacity-80 scale-105' : 'bg-opacity-40'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${type.color}40, ${type.color}20)`
                }}
                onClick={() => setCurrentExoplanetType(index)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{type.icon}</span>
                  <h3 className="text-2xl font-bold text-white">{type.name}</h3>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">{type.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white">{type.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Temperature:</span>
                    <span className="text-white">{type.temperature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Example:</span>
                    <span className="text-white">{type.example}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Planet Comparison */}
          <div className="bg-black bg-opacity-60 backdrop-blur-md p-8 rounded-2xl border border-gray-600">
            <h3 className="text-3xl font-bold mb-6 text-center text-green-400">Size Comparison</h3>
            <div className="flex items-end justify-center gap-8 mb-6 h-32">
              <div className="text-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full mb-2 mx-auto"></div>
                <span className="text-sm text-gray-400">Earth</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-500 rounded-full mb-2 mx-auto"></div>
                <span className="text-sm text-gray-400">Super-Earth</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-500 rounded-full mb-2 mx-auto"></div>
                <span className="text-sm text-gray-400">Mini-Neptune</span>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-red-500 rounded-full mb-2 mx-auto"></div>
                <span className="text-sm text-gray-400">Hot Jupiter</span>
              </div>
            </div>
            <p className="text-center text-gray-300">
              Most exoplanets fall into categories that don't exist in our solar system!
            </p>
          </div>
        </div>
      </section>
    );
  };

  // Transit Detection Simulation
  const generateLightCurve = useCallback(() => {
    const data = [];
    const numPoints = 200;
    const transitWidth = 12;
    const transitDepth = 0.02 + Math.random() * 0.08;
    const newActualTransits = [];

    // Generate 1-3 transits
    const numTransits = Math.floor(Math.random() * 3) + 1;
    const transitPositions = [];
    
    for (let i = 0; i < numTransits; i++) {
      let pos;
      let validPosition = false;
      while (!validPosition) {
        pos = Math.floor(Math.random() * (numPoints - transitWidth - 30)) + 15;
        validPosition = !transitPositions.some(p => Math.abs(p - pos) < transitWidth * 2);
      }
      transitPositions.push(pos);
      newActualTransits.push({ start: pos, end: pos + transitWidth });
    }

    // Generate light curve data
    for (let i = 0; i < numPoints; i++) {
      let brightness = 1.0;
      
      // Check if this point is in a transit
      for (const transit of newActualTransits) {
        if (i >= transit.start && i <= transit.end) {
          // Create U-shaped transit
          const transitProgress = (i - transit.start) / (transit.end - transit.start);
          const transitShape = Math.sin(transitProgress * Math.PI);
          brightness -= transitDepth * transitShape;
          break;
        }
      }
      
      // Add stellar noise
      brightness += (Math.random() - 0.5) * 0.015;
      
      data.push({ time: i * 0.1, brightness });
    }

    setLightCurveData(data);
    setActualTransits(newActualTransits);
    setUserSelections([]);
  }, []);

  // Initialize light curve on mount
  useEffect(() => {
    generateLightCurve();
  }, [generateLightCurve]);

  const SimulationSection = () => {
    const canvasRef = useRef(null);

    // Draw light curve
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || lightCurveData.length === 0) return;

      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set up scales
      const padding = 60;
      const chartWidth = canvas.width - padding * 2;
      const chartHeight = canvas.height - padding * 2;

      const maxTime = Math.max(...lightCurveData.map(d => d.time));
      const minBrightness = Math.min(...lightCurveData.map(d => d.brightness));
      const maxBrightness = Math.max(...lightCurveData.map(d => d.brightness));

      const xScale = (time) => padding + (time / maxTime) * chartWidth;
      const yScale = (brightness) => padding + (1 - (brightness - minBrightness) / (maxBrightness - minBrightness)) * chartHeight;

      // Draw grid
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const x = padding + (i / 10) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + chartHeight);
        ctx.stroke();

        const y = padding + (i / 10) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
      }

      // Draw user selections with different colors based on feedback
      if (feedbackData) {
        // Draw correct selections in green
        ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
        feedbackData.correctSelections.forEach(selection => {
          const startX = xScale(selection.start);
          const endX = xScale(selection.end);
          ctx.fillRect(startX, padding, endX - startX, chartHeight);
        });
        
        // Draw incorrect selections in red
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        feedbackData.incorrectSelections.forEach(selection => {
          const startX = xScale(selection.start);
          const endX = xScale(selection.end);
          ctx.fillRect(startX, padding, endX - startX, chartHeight);
        });
        
        // Draw missed transits in yellow with dashed border
        ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
        feedbackData.missedTransits.forEach(transit => {
          const startX = xScale(transit.start);
          const endX = xScale(transit.end);
          ctx.fillRect(startX, padding, endX - startX, chartHeight);
          
          // Dashed border for missed transits
          ctx.strokeStyle = 'rgb(251, 191, 36)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(startX, padding, endX - startX, chartHeight);
          ctx.setLineDash([]);
        });
      } else {
        // Normal user selections in blue
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        userSelections.forEach(selection => {
          const startX = xScale(selection.start);
          const endX = xScale(selection.end);
          ctx.fillRect(startX, padding, endX - startX, chartHeight);
        });
      }

      // Draw light curve
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      lightCurveData.forEach((point, index) => {
        const x = xScale(point.time);
        const y = yScale(point.brightness);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw data points
      ctx.fillStyle = '#10b981';
      lightCurveData.forEach(point => {
        const x = xScale(point.time);
        const y = yScale(point.brightness);
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw axes labels
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Time (days)', canvas.width / 2, canvas.height - 20);
      
      ctx.save();
      ctx.translate(20, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Relative Brightness', 0, 0);
      ctx.restore();

    }, [lightCurveData, userSelections]);

    const handleCanvasMouseDown = (e) => {
      if (!canvasRef.current || feedbackData) return; // Disable interaction when showing feedback
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const padding = 60;
      const chartWidth = rect.width - padding * 2;
      const maxTime = Math.max(...lightCurveData.map(d => d.time));
      
      const time = ((x - padding) / chartWidth) * maxTime;
      setDragStart(time);
      setIsDragging(true);
    };

    const handleCanvasMouseMove = (e) => {
      if (!isDragging || !canvasRef.current || feedbackData) return;
      // Force re-render to show drag preview
      canvasRef.current.style.cursor = 'crosshair';
    };

    const handleCanvasMouseUp = (e) => {
      if (!isDragging || !canvasRef.current || feedbackData) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const padding = 60;
      const chartWidth = rect.width - padding * 2;
      const maxTime = Math.max(...lightCurveData.map(d => d.time));
      
      const endTime = ((x - padding) / chartWidth) * maxTime;
      
      if (Math.abs(endTime - dragStart) > 0.5) {
        const selection = {
          start: Math.min(dragStart, endTime),
          end: Math.max(dragStart, endTime)
        };
        setUserSelections(prev => [...prev, selection]);
      }
      
      setIsDragging(false);
      setDragStart(null);
    };

    const checkTransits = () => {
      if (userSelections.length === 0) {
        setFeedbackData({
          title: 'No Transits Marked',
          message: 'You haven\'t marked any potential transits. Click and drag on the graph to select areas where you see a dip in brightness.',
          isSuccess: false,
          correctSelections: [],
          incorrectSelections: [],
          missedTransits: actualTransits
        });
        setShowFeedbackModal(true);
        return;
      }

      let correctSelections = [];
      let incorrectSelections = [];
      let missedTransits = [...actualTransits];
      
      // Convert actual transits to time units
      const maxTime = Math.max(...lightCurveData.map(d => d.time));
      const timePerPoint = maxTime / lightCurveData.length;
      
      userSelections.forEach(userSel => {
        let matchFound = false;
        actualTransits.forEach((actual, actualIndex) => {
          const actualStart = actual.start * timePerPoint;
          const actualEnd = actual.end * timePerPoint;
          
          // Check for overlap
          const overlap = Math.max(0, Math.min(userSel.end, actualEnd) - Math.max(userSel.start, actualStart));
          const userRange = userSel.end - userSel.start;
          
          if (overlap / userRange > 0.3) {
            correctSelections.push(userSel);
            missedTransits = missedTransits.filter((_, index) => index !== actualIndex);
            matchFound = true;
          }
        });
        
        if (!matchFound) {
          incorrectSelections.push(userSel);
        }
      });

      const correctCount = correctSelections.length;
      const newScore = correctCount * 100 - incorrectSelections.length * 50;
      const totalScore = Math.max(0, score + newScore);
      setScore(totalScore);

      let title, message, isSuccess;
      if (correctCount === actualTransits.length && incorrectSelections.length === 0) {
        title = 'Perfect Discovery!';
        message = `Excellent work! You correctly identified all ${actualTransits.length} transit(s). +${newScore} points`;
        isSuccess = true;
      } else if (correctCount > 0) {
        title = 'Good Observations!';
        message = `You found ${correctCount} out of ${actualTransits.length} transit(s). Missed: ${missedTransits.length}, False positives: ${incorrectSelections.length}. Score: ${newScore >= 0 ? '+' : ''}${newScore}`;
        isSuccess = correctCount >= actualTransits.length / 2;
      } else {
        title = 'Keep Searching!';
        message = `No correct transits identified. Look for small, U-shaped dips in brightness. Green selections are correct, red are incorrect, yellow are missed. Score: ${newScore >= 0 ? '+' : ''}${newScore}`;
        isSuccess = false;
      }

      setFeedbackData({
        title,
        message,
        isSuccess,
        correctSelections,
        incorrectSelections,
        missedTransits: missedTransits.map(transit => ({
          start: transit.start * timePerPoint,
          end: transit.end * timePerPoint
        }))
      });
      setShowFeedbackModal(true);
    };

    return (
      <section className="relative py-20 px-4">
        <div className="z-10 relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
              Exoplanet Detection Simulator
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Analyze real starlight data to discover exoplanets. Look for small, periodic dips in brightness that indicate a planet passing in front of its star.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Light Curve Chart */}
            <div className="lg:col-span-2">
              <div className="bg-black bg-opacity-60 backdrop-blur-md p-6 rounded-2xl border border-gray-600">
                <h3 className="text-2xl font-bold mb-4 text-white">Star Brightness Over Time</h3>
                <p className="text-gray-300 text-sm mb-4">Click and drag to select potential transits (small dips in brightness)</p>
                <canvas
                  ref={canvasRef}
                  className="w-full h-80 bg-gray-900 rounded-lg cursor-crosshair"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={() => {
                    setIsDragging(false);
                    setDragStart(null);
                  }}
                />
              </div>
            </div>

            {/* Controls Panel */}
            <div className="space-y-6">
              <div className="bg-black bg-opacity-60 backdrop-blur-md p-6 rounded-2xl border border-gray-600">
                <h3 className="text-xl font-bold mb-4 text-white">Mission Control</h3>
                <div className="space-y-4">
                  <button
                    onClick={checkTransits}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Target className="w-5 h-5" />
                    Check My Findings
                  </button>
                  <button
                    onClick={() => setUserSelections([])}
                    className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Clear Selections
                  </button>
                  <button
                    onClick={generateLightCurve}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Star className="w-5 h-5" />
                    New Star System
                  </button>
                </div>
              </div>

              <div className="bg-black bg-opacity-60 backdrop-blur-md p-6 rounded-2xl border border-gray-600">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">Your Score</h3>
                <div className="text-3xl font-bold text-center text-white mb-2">{score}</div>
                <p className="text-sm text-gray-400 text-center">Points earned from discoveries</p>
              </div>

              <div className="bg-black bg-opacity-60 backdrop-blur-md p-6 rounded-2xl border border-gray-600">
                <h3 className="text-xl font-bold mb-4 text-purple-400">Tips</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Look for small, U-shaped dips</li>
                  <li>• Transits are periodic (repeating)</li>
                  <li>• Deeper dips = larger planets</li>
                  <li>• Wider dips = closer planets</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Method Explanation */}
          <div className="mt-12 bg-gradient-to-r from-indigo-900 to-purple-900 bg-opacity-50 p-8 rounded-2xl border border-gray-600">
            <h3 className="text-3xl font-bold mb-6 text-center text-indigo-300">How Transit Detection Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Sun className="w-8 h-8 text-yellow-900" />
                </div>
                <h4 className="text-xl font-semibold mb-2 text-white">1. Monitor Star</h4>
                <p className="text-gray-300 text-sm">Continuously measure the brightness of distant stars using space telescopes</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Moon className="w-8 h-8 text-blue-900" />
                </div>
                <h4 className="text-xl font-semibold mb-2 text-white">2. Detect Transit</h4>
                <p className="text-gray-300 text-sm">When a planet crosses in front of the star, it blocks a small fraction of starlight</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-8 h-8 text-green-900" />
                </div>
                <h4 className="text-xl font-semibold mb-2 text-white">3. Analyze Pattern</h4>
                <p className="text-gray-300 text-sm">Regular dips confirm a planet and reveal its size and orbital period</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Citizen Science Section
  const CitizenScienceSection = () => {
    const initiatives = [
      {
        title: "Planet Hunters TESS",
        organization: "NASA & Zooniverse",
        description: "Help discover new planets by examining real data from NASA's TESS mission. Thousands of volunteers have already found dozens of new exoplanets.",
        participants: "200,000+",
        discoveries: "50+ planets",
        link: "https://www.zooniverse.org/projects/nora-dot-eisner/planet-hunters-tess",
        icon: <Telescope className="w-8 h-8" />,
        color: "from-blue-500 to-purple-600"
      },
      {
        title: "Asteroid Hunters",
        organization: "International Asteroid Search Campaign",
        description: "Search for potentially hazardous asteroids and help protect Earth from cosmic threats. Students and amateur astronomers worldwide participate.",
        participants: "10,000+",
        discoveries: "2,000+ asteroids",
        link: "https://iasc.cosmosearch.org/",
        icon: <Target className="w-8 h-8" />,
        color: "from-orange-500 to-red-600"
      },
      {
        title: "Galaxy Zoo",
        organization: "Oxford University & Zooniverse",
        description: "Classify galaxies and help understand the universe's structure. Your contributions help astronomers study galaxy evolution.",
        participants: "500,000+",
        discoveries: "Countless galaxy types",
        link: "https://www.zooniverse.org/projects/zookeeper/galaxy-zoo/",
        icon: <Star className="w-8 h-8" />,
        color: "from-purple-500 to-pink-600"
      },
      {
        title: "eBird",
        organization: "Cornell Lab of Ornithology",
        description: "While not space-related, eBird shows how citizen science works. Report bird observations to help scientists track biodiversity changes.",
        participants: "1,000,000+",
        discoveries: "Global bird patterns",
        link: "https://ebird.org/",
        icon: <Globe className="w-8 h-8" />,
        color: "from-green-500 to-blue-600"
      }
    ];

    return (
      <section className="relative py-20 px-4">
        <div className="z-10 relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Join the Discovery
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              You don't need a PhD to contribute to space science. Join millions of citizen scientists making real discoveries from their computers.
            </p>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-6 bg-black bg-opacity-40 rounded-xl border border-gray-600">
              <div className="text-3xl font-bold text-blue-400 mb-2">5,000+</div>
              <div className="text-gray-300">Exoplanets Discovered</div>
            </div>
            <div className="text-center p-6 bg-black bg-opacity-40 rounded-xl border border-gray-600">
              <div className="text-3xl font-bold text-green-400 mb-2">2M+</div>
              <div className="text-gray-300">Citizen Scientists</div>
            </div>
            <div className="text-center p-6 bg-black bg-opacity-40 rounded-xl border border-gray-600">
              <div className="text-3xl font-bold text-purple-400 mb-2">100+</div>
              <div className="text-gray-300">Research Papers</div>
            </div>
            <div className="text-center p-6 bg-black bg-opacity-40 rounded-xl border border-gray-600">
              <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-gray-300">Data Collection</div>
            </div>
          </div>

          {/* Initiative Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {initiatives.map((initiative, index) => (
              <div 
                key={initiative.title}
                className="group p-8 bg-black bg-opacity-40 backdrop-blur-md rounded-2xl border border-gray-600 hover:border-gray-400 transition-all duration-300 hover:scale-105"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${initiative.color} mb-6`}>
                  {initiative.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{initiative.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{initiative.organization}</p>
                <p className="text-gray-300 mb-6 leading-relaxed">{initiative.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-lg font-semibold text-blue-400">{initiative.participants}</div>
                    <div className="text-sm text-gray-400">Participants</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-400">{initiative.discoveries}</div>
                    <div className="text-sm text-gray-400">Discoveries</div>
                  </div>
                </div>
                
                <a 
                  href={initiative.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors group-hover:bg-blue-500"
                >
                  <Users className="w-4 h-4" />
                  Join Project
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          {/* How to Get Started */}
          <div className="bg-gradient-to-r from-cyan-900 to-blue-900 bg-opacity-50 p-8 rounded-2xl border border-gray-600">
            <h3 className="text-3xl font-bold mb-8 text-center text-cyan-300">How to Get Started</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <h4 className="text-xl font-semibold mb-3 text-white">Choose a Project</h4>
                <p className="text-gray-300 text-sm">Pick a citizen science project that interests you. No special skills required - just curiosity!</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <h4 className="text-xl font-semibold mb-3 text-white">Learn the Basics</h4>
                <p className="text-gray-300 text-sm">Complete the tutorial to understand what you're looking for. Most take just 10-15 minutes.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <h4 className="text-xl font-semibold mb-3 text-white">Start Contributing</h4>
                <p className="text-gray-300 text-sm">Begin analyzing real data! Your classifications help scientists make new discoveries.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Footer
  const Footer = () => (
    <footer className="relative py-16 px-4 border-t border-gray-800">
      <div className="z-10 relative max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Exoplanet Hunter
            </h3>
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering the next generation of space explorers through interactive education and real scientific contribution.
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Start Learning
              </button>
              <button className="px-6 py-2 border border-gray-600 hover:border-gray-400 rounded-lg transition-colors">
                Join Community
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">NASA Exoplanet Archive</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kepler Mission</a></li>
              <li><a href="#" className="hover:text-white transition-colors">TESS Mission</a></li>
              <li><a href="#" className="hover:text-white transition-colors">ESA Missions</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Community</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Zooniverse Platform</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Astronomy Forums</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Citizen Science Hub</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Educational Materials</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © 2024 Exoplanet Hunter. Built for NASA Space Apps Challenge. 
            Educational content inspired by real space missions and citizen science initiatives.
          </p>
        </div>
      </div>
    </footer>
  );

  // Navigation
  const Navigation = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Exoplanet Hunter
        </h1>
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveSection('education')}
            className={`hover:text-white transition-colors ${activeSection === 'education' ? 'text-white' : 'text-gray-400'}`}
          >
            Learn
          </button>
          <button 
            onClick={() => setActiveSection('simulation')}
            className={`hover:text-white transition-colors ${activeSection === 'simulation' ? 'text-white' : 'text-gray-400'}`}
          >
            Simulate
          </button>
          <button 
            onClick={() => setActiveSection('citizen-science')}
            className={`hover:text-white transition-colors ${activeSection === 'citizen-science' ? 'text-white' : 'text-gray-400'}`}
          >
            Contribute
          </button>
        </div>
      </div>
    </nav>
  );

  // Main render with conditional sections
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden bg-black">
      <StarsBackground />
      <Navigation />
      
      <main className="relative z-10">
        {activeSection === 'hero' && <HeroSection />}
        {activeSection === 'education' && (
          <>
            <SolarSystemSection />
            <ExoplanetTypesSection />
          </>
        )}
        {activeSection === 'simulation' && <SimulationSection />}
        {activeSection === 'citizen-science' && <CitizenScienceSection />}
        
        {/* Show all sections by default */}
        {activeSection === 'hero' && (
          <>
            <SolarSystemSection />
            <ExoplanetTypesSection />
            <SimulationSection />
            <CitizenScienceSection />
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ExoplanetDiscoveryLanding
