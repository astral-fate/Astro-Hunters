import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
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
  Target,
  Award,
  BookOpen
} from 'lucide-react';

const ExoplanetDiscoveryLanding = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [solarSystemAnimation, setSolarSystemAnimation] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [transitSimulationActive, setTransitSimulationActive] = useState(false);
  const [lightCurveData, setLightCurveData] = useState([]);
  const [userSelections, setUserSelections] = useState([]);
  const [actualTransits, setActualTransits] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [score, setScore] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [showFieldGuide, setShowFieldGuide] = useState(false);
  const [fieldGuideSection, setFieldGuideSection] = useState('main');
  const [animationTime, setAnimationTime] = useState(0);

  const generateLightCurve = useCallback(() => {
    const data = [];
    const numPoints = 200;
    const transitWidth = 12;
    const transitDepth = 0.02 + Math.random() * 0.08;
    const newActualTransits = [];

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

    for (let i = 0; i < numPoints; i++) {
      let brightness = 1.0;
      
      for (const transit of newActualTransits) {
        if (i >= transit.start && i <= transit.end) {
          const transitProgress = (i - transit.start) / (transit.end - transit.start);
          const transitShape = Math.sin(transitProgress * Math.PI);
          brightness -= transitDepth * transitShape;
          break;
        }
      }
      
      brightness += (Math.random() - 0.5) * 0.015;
      data.push({ time: i * 0.1, brightness });
    }

    setLightCurveData(data);
    setActualTransits(newActualTransits);
    setUserSelections([]);
  }, []);

  useEffect(() => {
    generateLightCurve();
  }, [generateLightCurve]);

  useEffect(() => {
    let animationId;
    if (solarSystemAnimation || transitSimulationActive) {
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
  }, [solarSystemAnimation, transitSimulationActive]);

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

          <div className="relative flex items-center justify-center mb-16 h-96">
            <div 
              className="absolute z-20 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-transform"
              style={{
                width: '60px',
                height: '60px',
                background: 'radial-gradient(circle, #ffd700, #ff8c00)',
                boxShadow: '0 0 30px #ff8c00'
              }}
              onClick={() => setSelectedPlanet({ name: 'Sun', description: 'Our star, a main sequence G-type star that provides energy for all life on Earth' })}
            />

            {planets.map((planet) => (
              <div key={planet.name}>
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
                <div className="absolute top-1/2 left-8 w-16 h-16 bg-yellow-400 rounded-full transform -translate-y-1/2 shadow-lg"></div>
                <div 
                  className="absolute top-1/2 w-4 h-4 bg-blue-600 rounded-full transform -translate-y-1/2 transition-all duration-1000"
                  style={{
                    left: transitSimulationActive ? 
                      `${25 + (Math.sin(animationTime * 0.002) * 20)}%` : '25%'
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4 h-1 bg-gray-600 rounded">
                  <div 
                    className="h-full bg-red-500 rounded transition-all duration-500"
                    style={{
                      width: transitSimulationActive ? 
                        `${Math.max(0, 100 - Math.abs(Math.sin(animationTime * 0.002)) * 50)}%` : '100%',
                      marginLeft: '0%'
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <button 
                onClick={() => {
                  setTransitSimulationActive(!transitSimulationActive);
                  if (!transitSimulationActive) {
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

  const SimulationSection = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || lightCurveData.length === 0) return;

      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const padding = 60;
      const chartWidth = canvas.width - padding * 2;
      const chartHeight = canvas.height - padding * 2;

      const maxTime = Math.max(...lightCurveData.map(d => d.time));
      const minBrightness = Math.min(...lightCurveData.map(d => d.brightness));
      const maxBrightness = Math.max(...lightCurveData.map(d => d.brightness));

      const xScale = (time) => padding + (time / maxTime) * chartWidth;
      const yScale = (brightness) => padding + (1 - (brightness - minBrightness) / (maxBrightness - minBrightness)) * chartHeight;

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

      if (feedbackData) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
        feedbackData.correctSelections.forEach(selection => {
          const startX = xScale(selection.start);
          const endX = xScale(selection.end);
          ctx.fillRect(startX, padding, endX - startX, chartHeight);
        });
        
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        feedbackData.incorrectSelections.forEach(selection => {
          const startX = xScale(selection.start);
          const endX = xScale(selection.end);
          ctx.fillRect(startX, padding, endX - startX, chartHeight);
        });
        
        ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
        feedbackData.missedTransits.forEach(transit => {
          const startX = xScale(transit.start);
          const endX = xScale(transit.end);
          ctx.fillRect(startX, padding, endX - startX, chartHeight);
          
          ctx.strokeStyle = 'rgb(251, 191, 36)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(startX, padding, endX - startX, chartHeight);
          ctx.setLineDash([]);
        });
      } else {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        userSelections.forEach(selection => {
          const startX = xScale(selection.start);
          const endX = xScale(selection.end);
          ctx.fillRect(startX, padding, endX - startX, chartHeight);
        });
      }

      ctx.fillStyle = '#10b981';
      lightCurveData.forEach(point => {
        const x = xScale(point.time);
        const y = yScale(point.brightness);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Time (days)', canvas.width / 2, canvas.height - 20);
      
      ctx.save();
      ctx.translate(20, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Relative Brightness', 0, 0);
      ctx.restore();

    }, [lightCurveData, userSelections, feedbackData]);

    const handleCanvasMouseDown = (e) => {
      if (!canvasRef.current || feedbackData) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const padding = 60;
      const chartWidth = rect.width - padding * 2;
      const maxTime = Math.max(...lightCurveData.map(d => d.time));
      
      const time = ((x - padding) / chartWidth) * maxTime;
      setDragStart(time);
      setIsDragging(true);
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
      
      const maxTime = Math.max(...lightCurveData.map(d => d.time));
      const timePerPoint = maxTime / lightCurveData.length;
      
      userSelections.forEach(userSel => {
        let matchFound = false;
        actualTransits.forEach((actual, actualIndex) => {
          const actualStart = actual.start * timePerPoint;
          const actualEnd = actual.end * timePerPoint;
          
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
        <div className="z-10 relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
              Exoplanet Detection Simulator
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Analyze real starlight data to discover exoplanets. Look for small, periodic dips in brightness that indicate a planet passing in front of its star.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-black bg-opacity-60 backdrop-blur-md p-4 rounded-2xl border border-gray-600 relative">
              <div className="flex-grow">
                <canvas
                  ref={canvasRef}
                  className="w-full h-96 bg-gray-900 rounded-lg cursor-crosshair"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={() => {
                    setIsDragging(false);
                    setDragStart(null);
                  }}
                />
              </div>
              
              <div className="absolute top-4 right-4 flex flex-col items-center space-y-4 p-2 bg-black bg-opacity-60 rounded-lg">
                <h3 className="text-sm font-semibold text-white">Tools</h3>
                <button 
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors"
                  title="Zoom In"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3h-6"></path>
                  </svg>
                </button>
                <button 
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors"
                  title="Zoom Out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
                  </svg>
                </button>
                <button 
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors"
                  title="Reset Zoom"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5"></path>
                  </svg>
                </button>
                <div className="flex-grow"></div>
                <button 
                  onClick={() => setShowFieldGuide(true)}
                  className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white transition-colors"
                  title="Field Guide"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-black bg-opacity-60 backdrop-blur-md p-6 rounded-2xl border border-gray-600">
              <div className="flex space-x-4 border-b border-gray-700 mb-4">
                <button className="text-lg font-semibold border-b-2 border-blue-600 text-white pb-2">Task</button>
                <button className="text-lg font-semibold text-gray-400 pb-2">Tutorial</button>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Do you spot a transit?</h2>
                <p className="text-gray-300 text-sm mb-6">
                  If so, please mark it on the lightcurve to the left! An exoplanet passing in front of its star causes a 'transit'. Click and drag on the graph to mark the areas where you think this is occurring.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={checkTransits}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Target className="w-5 h-5" />
                    Check My Transits
                  </button>
                  <button
                    onClick={() => {
                      setUserSelections([]);
                      setFeedbackData(null);
                    }}
                    className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Reset Selections
                  </button>
                  <button
                    onClick={() => {
                      setUserSelections([]);
                      setFeedbackData(null);
                      generateLightCurve();
                    }}
                    className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Star className="w-5 h-5" />
                    Analyze a New Star
                  </button>
                </div>
                
                <div className="mt-6 text-center text-lg">
                  <p className="text-gray-300">Score: <span className="font-bold text-white">{score}</span></p>
                  <p className="text-gray-300">Stars Analyzed: <span className="font-bold text-white">1</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const FieldGuideModal = () => {
    if (!showFieldGuide) return null;

    const guideContent = {
      main: (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-white border-b border-gray-600 pb-3">Exoplanet Hunter Field Guide</h2>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="guide-item col-span-2 md:col-span-1 p-4 rounded-lg flex items-center space-x-4 bg-gray-700 hover:bg-gray-600 transition-all duration-200 cursor-pointer hover:scale-105"
              onClick={() => setFieldGuideSection('planet-transits')}
            >
              <img src="https://thumbnails.zooniverse.org/100x100/panoptes-uploads.zooniverse.org/field_guide_attached_image/af5cf99c-57e3-4a26-a1f3-e441269a6412.png" alt="Planet Transit Icon" className="rounded-md w-16 h-16" />
              <div>
                <h3 className="font-bold text-lg text-white">Planet Transits</h3>
                <p className="text-sm text-gray-300">The U-shaped dips you're looking for.</p>
              </div>
            </div>
            <div 
              className="guide-item col-span-2 md:col-span-1 p-4 rounded-lg flex items-center space-x-4 bg-gray-700 hover:bg-gray-600 transition-all duration-200 cursor-pointer hover:scale-105"
              onClick={() => setFieldGuideSection('eclipsing-binaries')}
            >
              <img src="https://thumbnails.zooniverse.org/100x100/panoptes-uploads.zooniverse.org/field_guide_attached_image/2043ca16-9dd4-4cdd-af32-94971b692383.jpeg" alt="Eclipsing Binary Icon" className="rounded-md w-16 h-16" />
              <div>
                <h3 className="font-bold text-lg text-white">Eclipsing Binaries</h3>
                <p className="text-sm text-gray-300">V-shaped dips from orbiting stars.</p>
              </div>
            </div>
            <div 
              className="guide-item col-span-2 md:col-span-1 p-4 rounded-lg flex items-center space-x-4 bg-gray-700 hover:bg-gray-600 transition-all duration-200 cursor-pointer hover:scale-105"
              onClick={() => setFieldGuideSection('stellar-variability')}
            >
              <img src="https://thumbnails.zooniverse.org/100x100/panoptes-uploads.zooniverse.org/field_guide_attached_image/eb5408b3-7555-4050-896a-300fc3680e76.png" alt="Stellar Variability Icon" className="rounded-md w-16 h-16" />
              <div>
                <h3 className="font-bold text-lg text-white">Stellar Variability</h3>
                <p className="text-sm text-gray-300">Natural brightness changes in stars.</p>
              </div>
            </div>
            <div 
              className="guide-item col-span-2 md:col-span-1 p-4 rounded-lg flex items-center space-x-4 bg-gray-700 hover:bg-gray-600 transition-all duration-200 cursor-pointer hover:scale-105"
              onClick={() => setFieldGuideSection('systematic-effects')}
            >
              <img src="https://thumbnails.zooniverse.org/100x100/panoptes-uploads.zooniverse.org/field_guide_attached_image/704ec094-56cb-477e-b650-b22fc0e34d56.jpeg" alt="Systematic Effects Icon" className="rounded-md w-16 h-16" />
              <div>
                <h3 className="font-bold text-lg text-white">Systematic Effects</h3>
                <p className="text-sm text-gray-300">Instrument glitches and data artifacts.</p>
              </div>
            </div>
          </div>
        </div>
      ),
      'planet-transits': (
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <button 
            className="mb-4 flex items-center text-blue-400 hover:text-blue-300 cursor-pointer"
            onClick={() => setFieldGuideSection('main')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Field Guide
          </button>
          <h3 className="text-2xl font-bold text-blue-400 mb-4">Planet Transits</h3>
          <p className="text-gray-300 mb-4">Spotting transiting planets from lightcurves can be tricky...</p>
          
          <h4 className="text-lg font-semibold mt-6 mb-2 text-gray-300 border-b border-gray-600 pb-1">SHORT PERIOD PLANET/MANY TRANSIT</h4>
          <p className="text-gray-300 mb-4">Some transits have a characteristic U-shape. It is always good to look out for this!</p>
          <img 
            src="https://thumbnails.zooniverse.org/999x/panoptes-uploads.zooniverse.org/production/project_attached_image/2161844e-51e8-44ba-90f8-911f71c8c483.png" 
            alt="U-shaped transit example" 
            className="w-full rounded-lg mb-4 bg-gray-800"
          />
        </div>
      ),
      'eclipsing-binaries': (
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <button 
            className="mb-4 flex items-center text-yellow-400 hover:text-yellow-300 cursor-pointer"
            onClick={() => setFieldGuideSection('main')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Field Guide
          </button>
          <h3 className="text-2xl font-bold text-yellow-400 mb-4">Eclipsing Binaries</h3>
          <p className="text-gray-300 mb-4">When one star passes in front of the other we see a dip in the lightcurve, known as an eclipsing binary. These tend to be more V-shaped.</p>
        </div>
      ),
      'stellar-variability': (
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <button 
            className="mb-4 flex items-center text-purple-400 hover:text-purple-300 cursor-pointer"
            onClick={() => setFieldGuideSection('main')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Field Guide
          </button>
          <h3 className="text-2xl font-bold text-purple-400 mb-4">Stellar Variability</h3>
          <p className="text-gray-300 mb-4">The natural variability of stars can have a strong effect on the observed lightcurves, making the transits harder to spot.</p>
        </div>
      ),
      'systematic-effects': (
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <button 
            className="mb-4 flex items-center text-red-400 hover:text-red-300 cursor-pointer"
            onClick={() => setFieldGuideSection('main')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Field Guide
          </button>
          <h3 className="text-2xl font-bold text-red-400 mb-4">Systematic Effects</h3>
          <p className="text-gray-300 mb-4">Glitches in the equipment can cause strange shapes in the data.</p>
        </div>
      )
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="relative p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white border-opacity-20 text-left bg-gray-900 bg-opacity-95">
          <button
            onClick={() => {
              setShowFieldGuide(false);
              setFieldGuideSection('main');
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 text-2xl"
          >
            ×
          </button>
          
          {guideContent[fieldGuideSection]}
        </div>
      </div>
    );
  };

  const FeedbackModal = () => {
    const modalChartRef = useRef(null);

    useEffect(() => {
      if (!showFeedbackModal || !feedbackData || !modalChartRef.current) return;

      const canvas = modalChartRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const padding = 40;
      const chartWidth = canvas.width - padding * 2;
      const chartHeight = canvas.height - padding * 2;

      const maxTime = Math.max(...lightCurveData.map(d => d.time));
      const minBrightness = Math.min(...lightCurveData.map(d => d.brightness));
      const maxBrightness = Math.max(...lightCurveData.map(d => d.brightness));

      const xScale = (time) => padding + (time / maxTime) * chartWidth;
      const yScale = (brightness) => padding + (1 - (brightness - minBrightness) / (maxBrightness - minBrightness)) * chartHeight;

      ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
      feedbackData.correctSelections.forEach(selection => {
        const startX = xScale(selection.start);
        const endX = xScale(selection.end);
        ctx.fillRect(startX, padding, endX - startX, chartHeight);
      });
      
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      feedbackData.incorrectSelections.forEach(selection => {
        const startX = xScale(selection.start);
        const endX = xScale(selection.end);
        ctx.fillRect(startX, padding, endX - startX, chartHeight);
      });
      
      ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
      feedbackData.missedTransits.forEach(transit => {
        const startX = xScale(transit.start);
        const endX = xScale(transit.end);
        ctx.fillRect(startX, padding, endX - startX, chartHeight);
        
        ctx.strokeStyle = 'rgb(251, 191, 36)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(startX, padding, endX - startX, chartHeight);
        ctx.setLineDash([]);
      });

      ctx.fillStyle = 'rgba(167, 243, 208, 0.7)';
      lightCurveData.forEach(point => {
        const x = xScale(point.time);
        const y = yScale(point.brightness);
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });

    }, [showFeedbackModal, feedbackData, lightCurveData]);

    if (!showFeedbackModal || !feedbackData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="relative p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white border-opacity-20 text-center bg-gray-900 bg-opacity-95">
          <button
            onClick={() => {
              setShowFeedbackModal(false);
              setFeedbackData(null);
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
          
          <p className="text-gray-300 mb-6 text-lg leading-relaxed">
            {feedbackData.message}
          </p>
          
          <div className="mb-6">
            <canvas
              ref={modalChartRef}
              className="w-full h-48 bg-gray-900 rounded-lg"
            />
          </div>
          
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
                  <div className="w-4 h-4 bg-yellow-500 border-2 border-dashed border-yellow-300 rounded"></div>
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
              Continue Analysis
            </button>
          </div>
        </div>
      </div>
    );
  };

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
        </div>
      </div>
    </nav>
  );

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden bg-black">
      <StarsBackground />
      <Navigation />
      
      <main className="relative z-10">
        {activeSection === 'hero' && <HeroSection />}
        {activeSection === 'education' && <SolarSystemSection />}
        {activeSection === 'simulation' && <SimulationSection />}
        
        {activeSection === 'hero' && (
          <>
            <SolarSystemSection />
            <SimulationSection />
          </>
        )}
      </main>
      
      <FeedbackModal />
      <FieldGuideModal />
    </div>
  );
};

export default ExoplanetDiscoveryLanding;
