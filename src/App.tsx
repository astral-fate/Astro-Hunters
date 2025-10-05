import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
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
  BookOpen,
  RotateCcw,
  Calendar,
  Camera,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Video,
  Menu,
  X
} from 'lucide-react';

// --- TYPE DEFINITIONS (MERGED FROM BOTH FILES) ---

type ApodData = {
  copyright: string;
  date: string;
  explanation: string;
  hdurl: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
};

type MarsPhoto = {
  id: number;
  sol: number;
  camera: { id: number; name: string; rover_id: number; full_name: string };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
  };
};

type Planet = {
    name: string;
    distance?: number;
    size: number;
    color: string;
    speed?: number;
    description: string;
    facts: { [key: string]: string | number };
    phenomena: { id: string; title: string; description: string; icon: string }[];
    period?: number;
};

type StatusState = {
    [key: string]: boolean | string | null;
}

interface LightCurvePoint {
  time: number;
  brightness: number;
}

interface FeedbackData {
  isSuccess: boolean;
  title: string;
  message: string;
  correctSelections: any[];
  incorrectSelections: any[];
  missedTransits: any[];
}


const App = () => {
  // --- STATE MANAGEMENT (MERGED FROM BOTH FILES) ---

  const [activeSection, setActiveSection] = useState('hero');
  const [solarSystemAnimation, setSolarSystemAnimation] = useState(false);
  const [currentExoplanetType, setCurrentExoplanetType] = useState(0);
  const [animationTime, setAnimationTime] = useState(Date.now());
  const [lightCurveData, setLightCurveData] = useState<LightCurvePoint[]>([]);
  const [userSelections, setUserSelections] = useState<{ start: number; end: number }[]>([]);
  const [actualTransits, setActualTransits] = useState<{ start: number; end: number }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [starsAnalyzed, setStarsAnalyzed] = useState(1);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [showFieldGuide, setShowFieldGuide] = useState(false);
  const [fieldGuideSection, setFieldGuideSection] = useState('main');

  const [showModal, setShowModal] = useState<string | null>(null);
  const [moonPhase, setMoonPhase] = useState(180);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);

  const [apodData, setApodData] = useState<ApodData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [marsPhotos, setMarsPhotos] = useState<MarsPhoto[]>([]);
  const [earthEvents, setEarthEvents] = useState<any[]>([]);
  const [nearEarthObjects, setNearEarthObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<StatusState>({});
  const [apiErrors, setApiErrors] = useState<StatusState>({});

  // --- CORRECTED API KEY ---
  const NASA_API_KEY = '8cvVfO7F62medHZ3Q1CIQqigHbGGlXH3G2sPfNX6';

  // --- DATA ARrays (FROM SPACE.TSX) ---
  const planetData: Planet[] = [
    { name: 'Mercury', distance: 80, size: 8, color: '#8c7853', period: 88, description: "The smallest planet in our solar system and nearest to the Sun.", facts: { "Diameter": "4,879 km", "Day Length": "59 Earth days", "Orbital Period": "88 Earth days" }, phenomena: [] },
    { name: 'Venus', distance: 110, size: 12, color: '#ffc649', period: 225, description: "Venus spins slowly in the opposite direction from most planets.", facts: { "Diameter": "12,104 km", "Day Length": "243 Earth days", "Surface Temp": "465°C" }, phenomena: [] },
    { name: 'Earth', distance: 150, size: 14, color: '#6b93d6', period: 365, description: "Our home planet is the only place we know of so far that's inhabited by living things.", facts: { "Diameter": "12,742 km", "Population": "8 Billion", "Moons": "1" }, phenomena: [ { id: 'moon-phases', title: 'Moon Phases & Eclipses', description: 'Simulate the Moon\'s journey and observe eclipses.', icon: '🌕' }, { id: 'earth-events', title: 'Live Earth Events', description: 'Current natural events happening on Earth right now.', icon: '🌍' } ] },
    { name: 'Mars', distance: 190, size: 10, color: '#c1440e', period: 687, description: "Mars is a dusty, cold, desert world with a very thin atmosphere.", facts: { "Diameter": "6,779 km", "Day Length": "24.6 hours", "Moons": "2" }, phenomena: [ { id: 'mars-rover-photos', title: 'Live Mars Rover Photos', description: 'Latest images from NASA rovers exploring Mars surface.', icon: '📷' } ] },
    { name: 'Jupiter', distance: 280, size: 40, color: '#d8ca9d', period: 4333, description: "Jupiter is more than twice as massive than the other planets combined.", facts: { "Diameter": "139,820 km", "Moons": "95", "Type": "Gas Giant" }, phenomena: [] },
    { name: 'Saturn', distance: 350, size: 35, color: '#fad5a5', period: 10759, description: "Adorned with a dazzling, complex system of icy rings.", facts: { "Diameter": "116,460 km", "Rings": "7", "Moons": "146" }, phenomena: [] },
    { name: 'Uranus', distance: 420, size: 25, color: '#4fd0e4', period: 30687, description: "Uranus rotates at a nearly 90-degree angle from the plane of its orbit.", facts: { "Diameter": "50,724 km", "Tilt": "97.8 degrees", "Type": "Ice Giant" }, phenomena: [] },
    { name: 'Neptune', distance: 480, size: 24, color: '#4b70dd', period: 60190, description: "The eighth and most distant major planet orbiting our Sun.", facts: { "Diameter": "49,244 km", "Winds": "2,000 km/h", "Moons": "14" }, phenomena: [] }
  ];

  // --- API FUNCTIONS (WITH IMPROVED ERROR HANDLING) ---
  const fetchAPOD = useCallback(async (date: string) => {
    setLoading(prev => ({ ...prev, apod: true }));
    setApiErrors(prev => ({ ...prev, apod: null }));
    try {
      const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: 'Could not parse error response.' }));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.msg || 'Failed to fetch data.'}`);
      }
      const data = await response.json();
      setApodData(data);
    } catch (error: any) {
      console.error("Error fetching APOD:", error);
      setApiErrors(prev => ({ ...prev, apod: `Failed to fetch Picture of the Day. (${error.message})` }));
    } finally {
      setLoading(prev => ({ ...prev, apod: false }));
    }
  }, [NASA_API_KEY]);

  const fetchMarsRoverPhotos = useCallback(async () => {
    setLoading(prev => ({ ...prev, mars: true }));
    setApiErrors(prev => ({ ...prev, mars: null }));
    try {
      const response = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/latest_photos?api_key=${NASA_API_KEY}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: 'Could not parse error response.' }));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.errors || 'Failed to fetch data.'}`);
      }
      const data = await response.json();
      setMarsPhotos(data.latest_photos.slice(0, 20));
    } catch (error: any) {
      console.error("Error fetching Mars Rover Photos:", error);
      setApiErrors(prev => ({ ...prev, mars: `Could not load images from Mars. (${error.message})` }));
    } finally {
      setLoading(prev => ({ ...prev, mars: false }));
    }
  }, [NASA_API_KEY]);

  const fetchEarthEvents = useCallback(async () => {
    setLoading(prev => ({ ...prev, earth: true }));
    setApiErrors(prev => ({ ...prev, earth: null }));
    try {
      const response = await fetch(`https://eonet.gsfc.nasa.gov/api/v2.1/events?limit=20&status=open`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEarthEvents(data.events);
    } catch (error: any) {
      console.error("Error fetching Earth Events:", error);
      setApiErrors(prev => ({ ...prev, earth: `Could not fetch live earth events data. (${error.message})` }));
    } finally {
      setLoading(prev => ({ ...prev, earth: false }));
    }
  }, []);

  const fetchNEO = useCallback(async () => {
    setLoading(prev => ({ ...prev, neo: true }));
    setApiErrors(prev => ({ ...prev, neo: null }));
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Could not parse error response.' }));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || 'Failed to fetch data.'}`);
      }
      const data = await response.json();
      const neoData = data.near_earth_objects[today] || [];
      neoData.sort((a: any, b: any) => a.close_approach_data[0].miss_distance.kilometers - b.close_approach_data[0].miss_distance.kilometers);
      setNearEarthObjects(neoData.slice(0, 5));
    } catch (error: any) {
      console.error("Error fetching Near Earth Objects:", error);
      setApiErrors(prev => ({ ...prev, neo: `Failed to track near-earth objects. (${error.message})` }));
    } finally {
      setLoading(prev => ({ ...prev, neo: false }));
    }
  }, [NASA_API_KEY]);


  // --- USEEFFECT HOOKS (MERGED) ---

  useEffect(() => {
    fetchAPOD(selectedDate);
    fetchEarthEvents();
    fetchNEO();
  }, [fetchAPOD, fetchEarthEvents, fetchNEO, selectedDate]);

  useEffect(() => {
    let animationId: number | undefined;
    if (solarSystemAnimation) {
      const animate = () => {
        setAnimationTime(Date.now());
        animationId = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [solarSystemAnimation]);

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setMoonPhase(prev => (prev + 2) % 360);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  const generateLightCurve = useCallback(() => {
    const data: LightCurvePoint[] = [];
    const numPoints = 200;
    const transitWidth = 12;
    const transitDepth = 0.02 + Math.random() * 0.08;
    const newActualTransits: { start: number; end: number }[] = [];

    const numTransits = Math.floor(Math.random() * 3) + 1;
    const transitPositions: number[] = [];

    for (let i = 0; i < numTransits; i++) {
        let pos: number | null = null;
        let validPosition = false;
        while (!validPosition) {
            const potentialPos = Math.floor(Math.random() * (numPoints - transitWidth - 30)) + 15;
            validPosition = !transitPositions.some(p => Math.abs(p - potentialPos) < transitWidth * 2);
            if (validPosition) pos = potentialPos;
        }
        if (pos !== null) {
            transitPositions.push(pos);
            newActualTransits.push({ start: pos, end: pos + transitWidth });
        }
    }

    for (let i = 0; i < numPoints; i++) {
      let brightness = 1.0;
      for (const transit of newActualTransits) {
        if (i >= transit.start && i <= transit.end) {
          const transitProgress = (i - transit.start) / (transit.end - transit.start);
          brightness -= transitDepth * Math.sin(transitProgress * Math.PI);
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

  const StarsBackground = () => {
    const stars = Array.from({ length: 300 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2, twinkle: Math.random() * 4 + 2
    }));
    return (
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black"></div>
        {stars.map(star => (
          <div key={star.id} className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.x}%`, top: `${star.y}%`, width: `${star.size}px`, height: `${star.size}px`,
              opacity: star.opacity, animationDuration: `${star.twinkle}s`, animationDelay: `${Math.random() * 2}s`
            }} />
        ))}
      </div>
    );
  };

  const APIDebugPanel = () => {
    const getStatusIcon = (loading: boolean | null | string, data: any, error: boolean | null | string) => {
      if (loading) return '🟡';
      if (error) return '🔴';
      if (data && (Array.isArray(data) ? data.length > 0 : data)) return '🟢';
      return '🔴';
    };
    return (
      <div className="fixed top-20 right-2 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs z-50 max-w-xs sm:max-w-sm">
        <h4 className="font-bold mb-2 text-sm">API Status</h4>
        <div className="space-y-1">
          <div><span>APOD:</span><span className="float-right">{getStatusIcon(loading.apod, apodData, apiErrors.apod)}</span></div>
          <div><span>Mars Photos:</span><span className="float-right">{getStatusIcon(loading.mars, marsPhotos, apiErrors.mars)}</span></div>
          <div><span>Earth Events:</span><span className="float-right">{getStatusIcon(loading.earth, earthEvents, apiErrors.earth)}</span></div>
          <div><span>NEO:</span><span className="float-right">{getStatusIcon(loading.neo, nearEarthObjects, apiErrors.neo)}</span></div>
        </div>
      </div>
    );
  };

  type ApiContentHandlerProps = {
    loading: boolean; error: string | null; data: any[]; onRetry: () => void;
    loadingText?: string; emptyText?: string; children: (data: any) => ReactNode;
  };

  const ApiContentHandler = ({ loading, error, data, onRetry, loadingText, emptyText, children }: ApiContentHandlerProps) => {
    if (loading) return ( <div className="text-center p-8 flex flex-col justify-center items-center min-h-[300px]"><div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-purple-400 mx-auto"></div><p className="mt-4 text-lg">{loadingText || "Fetching cosmic data..."}</p></div> );
    if (error) return ( <div className="text-center p-8 flex flex-col justify-center items-center min-h-[300px]"><AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" /><p className="text-red-300 max-w-md">{error}</p><button onClick={onRetry} className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center mx-auto"><RefreshCw className="w-4 h-4 mr-2" />Try Again</button></div> );
    if (!data || data.length === 0) return ( <div className="text-center p-8 flex flex-col justify-center items-center min-h-[300px]"><Search className="w-12 h-12 text-gray-500 mx-auto mb-4" /><p>{emptyText || "No data found."}</p></div> );
    return <>{children(data)}</>;
  };

  const Modal = ({ onClose, children }: { onClose: () => void; children: ReactNode }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative p-6 sm:p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white border-opacity-20 bg-gray-900 bg-opacity-95">
        <button onClick={onClose} className="absolute top-4 right-5 text-white text-2xl cursor-pointer hover:rotate-90 transition-transform duration-200 z-10">×</button>
        {children}
      </div>
    </div>
  );

  const TimeMachine = () => (
    <div className="bg-black bg-opacity-50 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-gray-700 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Calendar className="w-8 h-8 text-purple-400" />
        <h3 className="text-2xl sm:text-3xl font-bold text-purple-300">Cosmic Time Machine</h3>
      </div>
      <p className="text-gray-300 mb-6 max-w-3xl">Using NASA's Astronomy Picture of the Day (APOD) API, we can view a real image or video from space for any day since June 16, 1995.</p>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Travel to any date</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={new Date().toISOString().split('T')[0]} min="1995-06-16" className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" />
            <button onClick={() => fetchAPOD(selectedDate)} disabled={!!loading.apod} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center">{loading.apod ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Go'}</button>
          </div>
          {apiErrors.apod && <p className="text-red-400 text-sm mt-2">{String(apiErrors.apod)}</p>}
        </div>
        <ApiContentHandler loading={!!loading.apod} error={apiErrors.apod as string} data={apodData ? [apodData] : []} onRetry={() => fetchAPOD(selectedDate)} loadingText="Traveling through time..." emptyText="Select a date to see the picture of the day.">
        {(data) => (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                {data[0].media_type === 'image' ? (
                    <img src={data[0].url} alt={data[0].title} className="w-full h-full object-cover" onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.currentTarget.parentNode as HTMLElement).innerHTML = '<p class="text-center p-4">Image failed to load.</p>'; }} />
                ) : (
                    <div className="flex items-center justify-center h-full"><p className="text-gray-400">Video content - view at NASA</p></div>
                )}
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">{data[0].title}</h4>
              <p className="text-gray-300 text-sm">{selectedDate}</p>
              <p className="text-gray-400 text-sm mt-2 line-clamp-3">{data[0].explanation}</p>
              {data[0].copyright && <p className="text-xs text-gray-500 mt-1">© {data[0].copyright}</p>}
            </div>
          </div>
        )}
        </ApiContentHandler>
      </div>
    </div>
  );

  const NearEarthObjects = () => (
    <div className="bg-black bg-opacity-50 backdrop-blur-md p-6 rounded-2xl border border-gray-700">
      <div className="flex items-center gap-4 mb-6"><AlertTriangle className="w-8 h-8 text-yellow-400" /><h3 className="text-xl sm:text-2xl font-bold text-yellow-300">Near Earth Objects</h3><button onClick={fetchNEO} disabled={!!loading.neo} className="ml-auto px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm">{loading.neo ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Update'}</button></div>
      <p className="text-gray-300 mb-6 max-w-3xl">Tracking asteroids and comets that will have a close approach to Earth. This data is updated daily.</p>
      <ApiContentHandler loading={!!loading.neo} error={apiErrors.neo as string} data={nearEarthObjects} onRetry={fetchNEO} loadingText="Tracking asteroids..." emptyText="No significant objects tracked for today.">
        {(data) => ( <div className="space-y-3">{data.map((neo: any) => ( <div key={neo.id} className="bg-yellow-900 bg-opacity-30 p-3 rounded-lg"><div className="flex justify-between items-start"><div><h4 className="font-bold text-white">{neo.name}</h4><p className={`text-sm font-bold ${neo.is_potentially_hazardous_asteroid ? 'text-red-400' : 'text-green-400'}`}>{neo.is_potentially_hazardous_asteroid ? 'Potentially Hazardous' : 'Not Hazardous'}</p></div></div></div> ))}</div> )}
      </ApiContentHandler>
    </div>
  );

  const LiveEarthEvents = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6"><Globe className="w-8 h-8 text-blue-400" /><h3 className="text-2xl sm:text-3xl font-bold text-blue-300">Live Earth Events</h3><button onClick={fetchEarthEvents} disabled={!!loading.earth} className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">{loading.earth ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Refresh'}</button></div>
      <ApiContentHandler loading={!!loading.earth} error={apiErrors.earth as string} data={earthEvents} onRetry={fetchEarthEvents} loadingText="Scanning the globe..." emptyText="No current major natural events found.">
        {(data) => ( <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">{data.map((event: any) => ( <div key={event.id} className="bg-gradient-to-r from-blue-900 to-green-900 p-4 rounded-xl border border-white/20"><div className="flex items-start gap-3"><div className="text-2xl">{event.categories[0]?.title.includes('Wildfires') ? '🔥' : event.categories[0]?.title.includes('Severe Storms') ? '⛈️' : event.categories[0]?.title.includes('Volcanoes') ? '🌋' : '🌍'}</div><div className="flex-1"><h4 className="font-bold text-white">{event.title}</h4></div></div></div> ))}</div> )}
      </ApiContentHandler>
    </div>
  );

  const MarsRoverPhotos = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6"><Camera className="w-8 h-8 text-red-400" /><h3 className="text-2xl sm:text-3xl font-bold text-red-300">Live from Mars</h3><button onClick={fetchMarsRoverPhotos} disabled={!!loading.mars} className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm">{loading.mars ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Get Latest'}</button></div>
      <ApiContentHandler loading={!!loading.mars} error={apiErrors.mars as string} data={marsPhotos} onRetry={fetchMarsRoverPhotos} loadingText="Contacting Curiosity Rover..." emptyText="No recent photos found.">
        {(data) => ( <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto pr-2">{data.map((photo: MarsPhoto) => ( <div key={photo.id} className="bg-gray-800 rounded-lg overflow-hidden"><img src={photo.img_src.replace('http://', 'https://')} alt={`Mars by ${photo.camera.name}`} className="w-full h-32 object-cover" /><div className="p-2"><p className="text-xs text-gray-300 truncate">{photo.camera.full_name}</p><p className="text-xs text-gray-500">{new Date(photo.earth_date).toLocaleDateString()}</p></div></div> ))}</div> )}
      </ApiContentHandler>
    </div>
  );

  const MoonPhaseSimulator = () => {
  const getPhaseInfo = (angle: number) => {
    const normalizedAngle = (angle - 180 + 360) % 360;
    if (normalizedAngle >= 355 || normalizedAngle < 5) return { phase: "New Moon", eclipse: "Solar Eclipse Possible!" };
    if (normalizedAngle < 85) return { phase: "Waxing Crescent", eclipse: "" };
    if (normalizedAngle < 95) return { phase: "First Quarter", eclipse: "" };
    if (normalizedAngle < 175) return { phase: "Waxing Gibbous", eclipse: "" };
    if (normalizedAngle < 185) return { phase: "Full Moon", eclipse: "Lunar Eclipse Possible!" };
    if (normalizedAngle < 265) return { phase: "Waning Gibbous", eclipse: "" };
    if (normalizedAngle < 275) return { phase: "Third Quarter", eclipse: "" };
    return { phase: "Waning Crescent", eclipse: "" };
  };

  // Create stable callback functions with dependencies to fix animation
  const handleAnimationToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(prev => !prev);
  }, [setIsAnimating]);

  const handleReset = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMoonPhase(180);
    setIsAnimating(false);
  }, [setMoonPhase, setIsAnimating]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMoonPhase(parseInt(e.target.value));
  }, [setMoonPhase]);

  const phaseInfo = getPhaseInfo(moonPhase);
  const shadowX = -100 + ((moonPhase - 180 + 360) % 360 / 180) * 200;

  return (
    <div className="space-y-6 text-center">
      <h3 className="text-2xl font-bold mb-4 text-indigo-300">Moon Phases & Eclipses</h3>
      <p className="text-gray-400 mb-4 max-w-md mx-auto">Drag the slider to orbit the Moon around Earth and see its phases from our perspective.</p>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-6">
        <div className="relative">
          <p className="absolute text-yellow-300 font-semibold -left-16 top-1/2 -translate-y-1/2 hidden sm:block">Sunlight</p>
          <div className="relative border-2 border-dashed border-gray-500 rounded-full w-64 h-64 sm:w-72 sm:h-72">
            <div className="absolute bg-blue-500 rounded-full w-14 h-14 sm:w-16 sm:h-16 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${moonPhase}deg) translateX(120px) sm:translateX(136px)`
              }} />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">View from Earth</h3>
          <div className="relative bg-gray-300 rounded-full border-2 border-white mx-auto overflow-hidden w-24 h-24">
            <div className="absolute top-0 bg-gray-800 rounded-full transition-transform duration-300 w-24 h-24"
              style={{ transform: `translateX(${shadowX}px)` }} />
          </div>
          <p className="mt-2 text-xl font-bold">{phaseInfo.phase}</p>
          {phaseInfo.eclipse && <p className="mt-2 text-lg font-semibold text-yellow-400">{phaseInfo.eclipse}</p>}
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="360"
        value={moonPhase}
        onChange={handleSliderChange}
        className="w-full max-w-xs mx-auto"
      />
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={handleAnimationToggle}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-full transition-colors"
          type="button"
        >
          {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isAnimating ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
          type="button"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

  const FeedbackModal = () => {
    const modalChartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!showFeedbackModal || !feedbackData || !modalChartRef.current || lightCurveData.length === 0) return;

        const canvas = modalChartRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

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

        const xScale = (time: number) => padding + (time / maxTime) * chartWidth;
        const yScale = (brightness: number) => padding + (1 - (brightness - minBrightness) / (maxBrightness - minBrightness)) * chartHeight;

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
            <div className="relative p-6 sm:p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white border-opacity-20 text-center bg-gray-900 bg-opacity-95">
                <button
                    onClick={() => {
                      setShowFeedbackModal(false);
                      setFeedbackData(null);
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

                <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${
                    feedbackData.isSuccess ? 'text-green-400' : 'text-red-400'
                }`}>
                    {feedbackData.title}
                </h2>

                <p className="text-gray-300 mb-6 text-base sm:text-lg leading-relaxed">
                    {feedbackData.message}
                </p>

                <div className="mb-6">
                    <canvas
                        ref={modalChartRef}
                        className="w-full h-48 bg-gray-900 rounded-lg"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => {
                            setShowFeedbackModal(false);
                            setFeedbackData(null);
                        }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <Star className="w-5 h-5" />
                        Continue Analysis
                    </button>
                </div>
            </div>
        </div>
    );
  };

  // --- NEW TRANSIT SECTION ---
  const EnhancedTransitSection = () => {
    const [activeTab, setActiveTab] = useState('explanation');

    const TransitAnimation = () => {
      const [isAnimating, setIsAnimating] = useState(false);
      const [animationTime, setAnimationTime] = useState(0);
      const [speed, setSpeed] = useState(1);
      const canvasRef = useRef<HTMLCanvasElement>(null);
      const lightCurveCanvasRef = useRef<HTMLCanvasElement>(null);
      const animationFrameRef = useRef<number | null>(null);

      // Animation parameters
      const orbitRadius = 150;
      const starRadius = 45;
      const planetRadius = 10;
      const animationDuration = 8000;

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

      const progress = (animationTime / animationDuration) * 2 * Math.PI;
      const planetX = Math.cos(progress) * orbitRadius;
      const planetY = Math.sin(progress) * orbitRadius * 0.3;
      const isTransiting = Math.abs(planetX) < starRadius + planetRadius && planetY > -10;
      const transitDepth = isTransiting ? Math.max(0, 1 - Math.abs(planetX) / (starRadius + planetRadius)) : 0;

      // Draw main animation
      useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if(!ctx) return;
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
        for (let i = 0; i < 50; i++) {
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

        // Calculate planet position
        const actualPlanetX = centerX + planetX;
        const actualPlanetY = centerY + planetY;
        const planetZ = Math.sin(progress) * orbitRadius;

        // Draw planet shadow on star during transit
        if (isTransiting && planetZ < 0) {
          const shadowOpacity = transitDepth * 0.6;
          ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
          ctx.beginPath();
          ctx.arc(actualPlanetX, actualPlanetY, planetRadius * 1.1, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Draw planet
        const planetGradient = ctx.createRadialGradient(
          actualPlanetX - 3, actualPlanetY - 3, 0,
          actualPlanetX, actualPlanetY, planetRadius
        );
        planetGradient.addColorStop(0, '#4fc3f7');
        planetGradient.addColorStop(0.6, '#1976d2');
        planetGradient.addColorStop(1, '#0d47a1');

        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(actualPlanetX, actualPlanetY, planetRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Add direction arrow
        ctx.strokeStyle = '#64b5f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const arrowX = actualPlanetX + Math.cos(progress + Math.PI/2) * 20;
        const arrowY = actualPlanetY + Math.sin(progress + Math.PI/2) * 20 * 0.3;
        ctx.moveTo(actualPlanetX, actualPlanetY);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Star', starCenterX, starCenterY + starRadius + 20);
        ctx.fillText('Planet', actualPlanetX, actualPlanetY + planetRadius + 20);

        // Show transit indicator
        if (isTransiting) {
          ctx.fillStyle = '#ff4444';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText('TRANSIT!', centerX, centerY - starRadius - 20);
        }

      }, [animationTime, planetX, planetY, isTransiting, transitDepth, progress]);

      // Draw light curve
      useEffect(() => {
        const canvas = lightCurveCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if(!ctx) return;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Clear canvas
        ctx.fillStyle = '#0f1419';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const padding = 30;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // Draw grid
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
          const x = padding + (i / 5) * chartWidth;
          ctx.beginPath();
          ctx.moveTo(x, padding);
          ctx.lineTo(x, padding + chartHeight);
          ctx.stroke();

          const y = padding + (i / 5) * chartHeight;
          ctx.beginPath();
          ctx.moveTo(padding, y);
          ctx.lineTo(padding + chartWidth, y);
          ctx.stroke();
        }

        // Generate light curve data
        const numPoints = 200;
        const points = [];

        // Define transit parameters
        const transitPhase1 = Math.PI * 0.45;
        const transitPhase2 = Math.PI * 1.55;
        const transitWidth = 0.15;

        for (let i = 0; i < numPoints; i++) {
          const time = (i / numPoints) * 2 * Math.PI;
          let brightness = 1.0;

          // Create transit dips
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
            y: padding + (1 - brightness + 0.96) * chartHeight / 0.08
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
          if (i % 8 === 0) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 1.5, 0, 2 * Math.PI);
            ctx.fill();
          }
        });

        // Highlight current position
        const currentIndex = Math.floor((animationTime / animationDuration) * numPoints);
        if (currentIndex < points.length) {
          const currentPoint = points[currentIndex];
          ctx.fillStyle = '#ff6b35';
          ctx.beginPath();
          ctx.arc(currentPoint.x, currentPoint.y, 4, 0, 2 * Math.PI);
          ctx.fill();

          // Vertical line to show current time
          ctx.strokeStyle = 'rgba(255, 107, 53, 0.5)';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(currentPoint.x, padding);
          ctx.lineTo(currentPoint.x, padding + chartHeight);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Labels
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Time', canvas.width / 2, canvas.height - 5);

        ctx.save();
        ctx.translate(10, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Brightness', 0, 0);
        ctx.restore();

        // Transit markers
        const transit1X = padding + (transitPhase1 / (2 * Math.PI)) * chartWidth;
        const transit2X = padding + (transitPhase2 / (2 * Math.PI)) * chartWidth;

        ctx.fillStyle = 'rgba(255, 68, 68, 0.2)';
        ctx.fillRect(transit1X - 8, padding, 16, chartHeight);
        ctx.fillRect(transit2X - 8, padding, 16, chartHeight);

      }, [animationTime, animationDuration]);

      const handleReset = () => {
        setAnimationTime(0);
        setIsAnimating(false);
      };

      return (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Main Animation */}
            <div className="space-y-4">
              <h5 className="text-lg font-semibold text-white text-center">
                Planet Orbit View
              </h5>
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video lg:aspect-auto lg:h-64">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Light Curve */}
            <div className="space-y-4">
              <h5 className="text-lg font-semibold text-white text-center">
                Brightness Measurement
              </h5>
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video lg:aspect-auto lg:h-64">
                <canvas
                  ref={lightCurveCanvasRef}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center items-center gap-3">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isAnimating ? 'Pause' : 'Play'}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>

            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-sm">Speed:</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-white text-sm">{speed}x</span>
            </div>
          </div>

          <div className="text-sm text-gray-300 text-center max-w-2xl mx-auto">
            Watch how the planet's orbit creates the characteristic dips in starlight that astronomers use to detect exoplanets!
          </div>
        </div>
      );
    };

    const SimpleExplanation = () => (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            When a planet passes between its star and an observer, it blocks a tiny amount of starlight.
            This creates a dip in the star's brightness that we can detect.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            The size of the dip tells us the planet's size, and the time between dips tells us its orbit.
          </p>
          <button
            onClick={() => setActiveTab('simulation')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Video className="w-5 h-5" />
            See Animation
          </button>
        </div>
        <div className="relative h-48 bg-black/50 rounded-xl overflow-hidden p-4">
          <p className="text-sm text-gray-400 text-center mb-2">Star Brightness Over Time</p>
          <div className="relative w-full h-24">
            <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
              <path
                d="M 0 10 H 90 C 95 10, 95 40, 100 40 S 105 10, 110 10 H 200"
                stroke="#34D399"
                fill="none"
                strokeWidth="2"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            The U-shaped dip indicates a planet transit
          </p>
        </div>
      </div>
    );

    const LightCurveTab = () => (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xl font-semibold text-white mb-4">What Scientists See</h4>
            <p className="text-gray-300 mb-4">
              Astronomers don't see the planet directly. Instead, they measure tiny changes in starlight over time.
            </p>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Transit dips are typically 0.01% - 1% of star brightness</li>
              <li>• The shape is U-shaped, not V-shaped</li>
              <li>• Duration depends on planet size and orbital speed</li>
              <li>• Multiple transits confirm it's a real planet</li>
            </ul>
          </div>
          <div className="bg-black rounded-lg p-4">
            <img
              src="https://placehold.co/400x200/1a1a2e/10b981?text=Real+Kepler+Light+Curve"
              alt="Real light curve data"
              className="w-full rounded"
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              Real data from NASA's Kepler Space Telescope
            </p>
          </div>
        </div>
      </div>
    );

    return (
      <div className="mt-16 bg-gradient-to-r from-purple-900 to-blue-900 bg-opacity-50 p-6 sm:p-8 rounded-2xl border border-gray-600">
        <h3 className="text-3xl font-bold mb-6 text-center text-purple-300">The Transit Method</h3>

        {/* Tab Navigation - Added z-10 and relative positioning to fix click issue */}
        <div className="relative z-10 flex justify-center mb-8">
          <div className="bg-black bg-opacity-40 rounded-lg p-1 flex flex-wrap justify-center gap-1">
            <button
              onClick={() => setActiveTab('explanation')}
              className={`px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'explanation'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'simulation'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              Animation
            </button>
            <button
              onClick={() => setActiveTab('lightcurve')}
              className={`px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'lightcurve'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Data Analysis
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[350px]">
          {activeTab === 'explanation' && <SimpleExplanation />}
          {activeTab === 'simulation' && <TransitAnimation />}
          {activeTab === 'lightcurve' && <LightCurveTab />}
        </div>
      </div>
    );
  };

  const HeroSection = () => (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
          Astro Hunters
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Join the quest to discover new worlds. Learn to detect exoplanets, explore real NASA data, and become a citizen scientist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button onClick={() => setActiveSection('simulation')} className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-lg font-semibold hover:scale-105 transition-transform flex items-center gap-2"><Telescope className="w-5 h-5" />Start Hunting</button>
          <button onClick={() => setActiveSection('education')} className="px-8 py-4 border-2 border-purple-500 rounded-full text-lg font-semibold hover:bg-purple-500/20 transition-colors flex items-center gap-2"><BookOpen className="w-5 h-5" />Learn First</button>
        </div>
      </div>
      <ChevronDown className="absolute bottom-8 w-8 h-8 text-white animate-bounce cursor-pointer" onClick={() => setActiveSection('education')} />
    </section>
  );

  const SolarSystemSection = () => (
    <section className="relative min-h-screen py-20 px-4 overflow-hidden">
      <div className="z-10 relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Our Solar System</h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8">Explore our cosmic neighborhood. Click any planet to see detailed facts and discover unique, real-time phenomena powered by NASA APIs.</p>
          <button onClick={() => setSolarSystemAnimation(!solarSystemAnimation)} className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-full flex items-center gap-2 mx-auto transition-colors">
            {solarSystemAnimation ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {solarSystemAnimation ? 'Pause Animation' : 'Start Animation'}
          </button>
        </div>
        <div className="relative flex items-center justify-center mb-16 h-96 sm:h-[500px] scale-[0.4] sm:scale-75 md:scale-100">
          <div className="absolute z-20 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-transform" style={{ width: '60px', height: '60px', background: 'radial-gradient(circle, #ffd700, #ff8c00)', boxShadow: '0 0 30px #ff8c00' }}></div>
          {planetData.map((planet) => (
            <div key={planet.name}>
              <div className="absolute border border-gray-600/30 rounded-full" style={{ width: `${planet.distance! * 2}px`, height: `${planet.distance! * 2}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
              <div className="absolute rounded-full cursor-pointer hover:scale-125 transition-all duration-300 z-10"
                style={{
                  width: `${planet.size}px`, height: `${planet.size}px`, backgroundColor: planet.color, top: '50%', left: '50%',
                  transform: solarSystemAnimation ? `translate(-50%, -50%) rotate(${animationTime / (planet.period! * 20)}deg) translateX(${planet.distance}px)` : `translate(-50%, -50%) translateX(${planet.distance}px)`
                }}
                onClick={() => { setSelectedPlanet(planet); setShowModal('planet'); }}
              />
              {planet.name === 'Saturn' && (
                <div className="absolute border-2 border-yellow-300/40 rounded-full pointer-events-none" style={{ width: `${planet.size * 2.2}px`, height: `${planet.size * 2.2}px`, top: '50%', left: '50%', transform: solarSystemAnimation ? `translate(-50%, -50%) rotate(${animationTime / (planet.period! * 20)}deg) translateX(${planet.distance}px) rotateX(70deg)` : `translate(-50%, -50%) translateX(${planet.distance}px) rotateX(70deg)` }} />
              )}
            </div>
          ))}
        </div>

        <EnhancedTransitSection />
      </div>
    </section>
  );

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
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Scientists have discovered thousands of exoplanets, each with unique characteristics. Here are the main categories we've identified.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {exoplanetTypes.map((type, index) => (
              <div
                key={type.name}
                className={`p-6 sm:p-8 rounded-2xl border border-gray-600 cursor-pointer transition-all duration-500 hover:scale-105 ${
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
          <div className="bg-black bg-opacity-60 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-gray-600">
            <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-green-400">Size Comparison</h3>
            <div className="flex items-end justify-center gap-4 sm:gap-8 mb-6 h-32">
              <div className="text-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full mb-2 mx-auto"></div>
                <span className="text-xs sm:text-sm text-gray-400">Earth</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full mb-2 mx-auto"></div>
                <span className="text-xs sm:text-sm text-gray-400">Super-Earth</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-500 rounded-full mb-2 mx-auto"></div>
                <span className="text-xs sm:text-sm text-gray-400">Mini-Neptune</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-500 rounded-full mb-2 mx-auto"></div>
                <span className="text-xs sm:text-sm text-gray-400">Hot Jupiter</span>
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

  const SimulationSection = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [activeTab, setActiveTab] = useState('task');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || lightCurveData.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

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

        const xScale = (time: number) => padding + (time / maxTime) * chartWidth;
        const yScale = (brightness: number) => padding + (1 - (brightness - minBrightness) / (maxBrightness - minBrightness)) * chartHeight;

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

    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
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

    const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || dragStart === null || !canvasRef.current || feedbackData) return;

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

    const handleNewStar = () => {
      setFeedbackData(null);
      setUserSelections([]);
      setStarsAnalyzed(prev => prev + 1);
      generateLightCurve();
    }

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

        let correctSelections: { start: number; end: number }[] = [];
        let incorrectSelections: { start: number; end: number }[] = [];
        let missedTransits = [...actualTransits];

        const maxTime = Math.max(...lightCurveData.map(d => d.time));
        const timePerPoint = maxTime > 0 ? maxTime / lightCurveData.length : 0;

        userSelections.forEach(userSel => {
            let matchFound = false;
            let matchedIndex = -1;

            actualTransits.forEach((actual, actualIndex) => {
                if(matchedIndex !== -1) return;
                const actualStart = actual.start * timePerPoint;
                const actualEnd = actual.end * timePerPoint;
                const overlap = Math.max(0, Math.min(userSel.end, actualEnd) - Math.max(userSel.start, actualStart));
                const userRange = userSel.end - userSel.start;

                if (userRange > 0 && overlap / userRange > 0.3) {
                    matchFound = true;
                    matchedIndex = actualIndex;
                }
            });

            if (matchFound) {
              correctSelections.push(userSel);
              missedTransits = missedTransits.filter((_, index) => index !== matchedIndex);
            } else {
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
            message = `No correct transits identified. Look for small, U-shaped dips in brightness.`;
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
                    <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                        Analyze starlight to discover new worlds.
                    </p>
                </div>
                <div className="grid lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 bg-black bg-opacity-60 backdrop-blur-md p-4 rounded-2xl border border-gray-600 relative">
                        <div className="flex-grow h-80 sm:h-96">
                            <canvas
                                ref={canvasRef}
                                className="w-full h-full bg-gray-900 rounded-lg cursor-crosshair"
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
                                onClick={() => setShowFieldGuide(true)}
                                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white transition-colors"
                                title="Field Guide"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-black bg-opacity-60 backdrop-blur-md p-6 rounded-2xl border border-gray-600">
                        <div className="flex space-x-4 border-b border-gray-700 mb-4">
                            <button onClick={() => setActiveTab('task')} className={`pb-2 text-lg font-semibold border-b-2 transition-colors ${activeTab === 'task' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400'}`}>Task</button>
                            <button onClick={() => setActiveTab('tutorial')} className={`pb-2 text-lg font-semibold border-b-2 transition-colors ${activeTab === 'tutorial' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400'}`}>Tutorial</button>
                        </div>

                        {activeTab === 'task' && (
                          <div>
                              <h2 className="text-xl font-semibold text-white mb-4">Do you spot a transit?</h2>
                              <p className="text-gray-300 text-sm mb-6">
                                  An exoplanet passing in front of its star causes a 'transit'. Click and drag on the graph to mark the areas where you think this is occurring.
                              </p>
                              <div className="space-y-4">
                                  <button onClick={checkTransits} className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                      <Target className="w-5 h-5" /> Check My Transits
                                  </button>
                                  <button onClick={() => setUserSelections([])} className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"> Reset Selections </button>
                                  <button onClick={handleNewStar} className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                      <Star className="w-5 h-5" /> Analyze a New Star
                                  </button>
                              </div>
                              <div className="mt-6 text-center text-lg">
                                  <p className="text-gray-300">Score: <span className="font-bold text-white">{score}</span></p>
                                  <p className="text-gray-300">Stars Analyzed: <span className="font-bold text-white">{starsAnalyzed}</span></p>
                              </div>
                          </div>
                        )}

                        {activeTab === 'tutorial' && (
                          <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4 text-sm text-gray-300">
                              <h2 className="text-xl font-semibold text-white mb-2">Welcome to Astro Hunters!</h2>
                              <p>This short tutorial will teach you how to search for exoplanets.</p>
                              <h3 className="text-lg font-semibold mt-4 text-white">Transits</h3>
                              <p>Transits will be a few low points, usually in a U-shape. You're looking for several points on the lightcurve that appear lower than the rest.</p>
                              <img src="https://placehold.co/600x150/0a0a1a/e0e0e0?text=U-Shaped+Dip+is+a+Transit" alt="Transit example" className="rounded-lg w-full" />
                              <h3 className="text-lg font-semibold mt-4 text-white">Marking a Transit</h3>
                              <p>To mark a transit, click your mouse on one side of the dip, drag your mouse across to the other side, and release. A shaded box will appear.</p>
                              <img src="https://placehold.co/600x150/0a0a1a/e0e0e0?text=Click+and+drag+to+select" alt="Marking transit example" className="rounded-lg w-full" />
                              <h3 className="text-lg font-semibold mt-4 text-white">Dive In!</h3>
                              <p>You're ready to start! If you need help while classifying, the **Field Guide** (the '?' button next to the graph) has examples of planet transits and other phenomena you'll encounter. Good luck!</p>
                          </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
  };

  const FieldGuideModal = () => {
    if (!showFieldGuide) return null;

    const GuideSection = ({ title, color, children }: {title: string, color: string, children: React.ReactNode}) => (
        <div className="max-h-[70vh] overflow-y-auto pr-4">
            <button
                className={`mb-4 flex items-center text-${color}-400 hover:text-${color}-300 cursor-pointer`}
                onClick={() => setFieldGuideSection('main')}
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Field Guide
            </button>
            <h3 className={`text-2xl font-bold text-${color}-400 mb-4`}>{title}</h3>
            {children}
        </div>
    );

    const GuideSubSection = ({ title, children }: {title: string, children: React.ReactNode}) => (
        <>
            <h4 className="text-lg font-semibold mt-6 mb-2 text-gray-300 border-b border-gray-600 pb-1">{title}</h4>
            <div className="space-y-4 text-gray-300">{children}</div>
        </>
    );

    const guideContent: { [key: string]: JSX.Element } = {
        main: (
            <div>
                <h2 className="text-3xl font-bold mb-6 text-white border-b border-gray-600 pb-3">Astro Hunters Field Guide</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="guide-item col-span-1 p-4 rounded-lg flex items-center space-x-4 bg-gray-700 hover:bg-gray-600 transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => setFieldGuideSection('planet-transits')}>
                        <img src="https://thumbnails.zooniverse.org/100x100/panoptes-uploads.zooniverse.org/field_guide_attached_image/af5cf99c-57e3-4a26-a1f3-e441269a6412.png" alt="Planet Transit Icon" className="rounded-md w-16 h-16" />
                        <div><h3 className="font-bold text-lg text-white">Planet Transits</h3><p className="text-sm text-gray-300">The U-shaped dips you're looking for.</p></div>
                    </div>
                    <div className="guide-item col-span-1 p-4 rounded-lg flex items-center space-x-4 bg-gray-700 hover:bg-gray-600 transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => setFieldGuideSection('eclipsing-binaries')}>
                        <img src="https://thumbnails.zooniverse.org/100x100/panoptes-uploads.zooniverse.org/field_guide_attached_image/2043ca16-9dd4-4cdd-af32-94971b692383.jpeg" alt="Eclipsing Binary Icon" className="rounded-md w-16 h-16" />
                        <div><h3 className="font-bold text-lg text-white">Eclipsing Binaries</h3><p className="text-sm text-gray-300">V-shaped dips from orbiting stars.</p></div>
                    </div>
                    <div className="guide-item col-span-1 p-4 rounded-lg flex items-center space-x-4 bg-gray-700 hover:bg-gray-600 transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => setFieldGuideSection('stellar-variability')}>
                        <img src="https://thumbnails.zooniverse.org/100x100/panoptes-uploads.zooniverse.org/field_guide_attached_image/eb5408b3-7555-4050-896a-300fc3680e76.png" alt="Stellar Variability Icon" className="rounded-md w-16 h-16" />
                        <div><h3 className="font-bold text-lg text-white">Stellar Variability</h3><p className="text-sm text-gray-300">Natural brightness changes in stars.</p></div>
                    </div>
                    <div className="guide-item col-span-1 p-4 rounded-lg flex items-center space-x-4 bg-gray-700 hover:bg-gray-600 transition-all duration-200 cursor-pointer hover:scale-105" onClick={() => setFieldGuideSection('systematic-effects')}>
                        <img src="https://thumbnails.zooniverse.org/100x100/panoptes-uploads.zooniverse.org/field_guide_attached_image/704ec094-56cb-477e-b650-b22fc0e34d56.jpeg" alt="Systematic Effects Icon" className="rounded-md w-16 h-16" />
                        <div><h3 className="font-bold text-lg text-white">Systematic Effects</h3><p className="text-sm text-gray-300">Instrument glitches and data artifacts.</p></div>
                    </div>
                </div>
            </div>
        ),
        'planet-transits': (
            <GuideSection title="Planet Transits" color="blue">
                <p>Spotting transiting planets from lightcurves can be tricky...</p>
                <GuideSubSection title="SHORT PERIOD PLANET/MANY TRANSIT">
                    <p>Some transits have a characteristic U-shape. It is always good to look out for this!</p>
                    <img src="https://thumbnails.zooniverse.org/999x/panoptes-uploads.zooniverse.org/production/project_attached_image/2161844e-51e8-44ba-90f8-911f71c8c483.png" alt="U-shaped transit" className="w-full rounded-lg bg-gray-800" />
                    <p>Some like to hide in the stellar variability and may be more difficult to find.</p>
                    <img src="https://thumbnails.zooniverse.org/999x/panoptes-uploads.zooniverse.org/production/project_attached_image/7996e525-17f4-476d-8daa-3218a9547698.png" alt="Hidden transit" className="w-full rounded-lg bg-gray-800" />
                    <p>The smaller the gap between subsequent transits, the quicker the planet completes a full orbit around the host star.</p>
                    <img src="https://thumbnails.zooniverse.org/999x/panoptes-uploads.zooniverse.org/production/project_attached_image/e7ba53cf-7ebb-4719-83bf-06ffd28a2a6d.png" alt="Short period transit" className="w-full rounded-lg bg-gray-800" />
                </GuideSubSection>
                <GuideSubSection title="LONG PERIOD PLANET/SINGLE TRANSIT">
                    <p>If the orbital period is very long, there may only be one transit visible!</p>
                    <img src="https://thumbnails.zooniverse.org/999x/panoptes-uploads.zooniverse.org/production/project_attached_image/9dc7800c-0bfd-4d6a-b261-5f8cc68cfba4.png" alt="Single long transit" className="w-full rounded-lg bg-gray-800" />
                </GuideSubSection>
                 <GuideSubSection title="MULTI-PLANET SYSTEMS">
                    <p>Uneven spacing is indicative of there being multiple planets.</p>
                    <img src="https://thumbnails.zooniverse.org/999x/panoptes-uploads.zooniverse.org/production/project_attached_image/453af6d6-aed4-4d1a-8870-703da96c03de.png" alt="Multi-planet system" className="w-full rounded-lg bg-gray-800" />
                </GuideSubSection>
            </GuideSection>
        ),
        'eclipsing-binaries': (
            <GuideSection title="Eclipsing Binaries" color="yellow">
                 <p>When one star passes in front of the other we see a dip in the lightcurve, known as an eclipsing binary. These tend to be more V-shaped.</p>
                 <GuideSubSection title="ALTERNATING DIPS">
                    <p>Lightcurves of eclipsing binaries can often be identified due to the repetition two dips of different depths.</p>
                    <img src="https://thumbnails.zooniverse.org/999x/panoptes-uploads.zooniverse.org/production/project_attached_image/8976ae89-b559-4fc5-8e03-8e6ff53d3635.png" alt="Alternating dips example 1" className="w-full rounded-lg bg-gray-800" />
                    <img src="https://thumbnails.zooniverse.org/999x/panoptes-uploads.zooniverse.org/production/project_attached_image/8cbc0038-1c9e-48f5-abe5-ad07281e4737.png" alt="Alternating dips example 2" className="w-full rounded-lg bg-gray-800" />
                 </GuideSubSection>
            </GuideSection>
        ),
        'stellar-variability': (
            <GuideSection title="Stellar Variability" color="purple">
                <p>The natural variability of stars can have a strong effect on the observed lightcurves, making the transits harder to spot.</p>
                <GuideSubSection title="STARSPOTS">
                    <p>As stars rotate, these spots move around with them, resulting in variable lightcurves.</p>
                    <img src="https://thumbnails.zooniverse.org/999x/panoptes-uploads.zooniverse.org/production/project_attached_image/71b4a825-5fe6-4835-bfa7-6299a9e46701.png" alt="Starspots example" className="w-full rounded-lg bg-gray-800" />
                </GuideSubSection>
                <GuideSubSection title="PULSATING">
                    <p>Certain stars periodically increase and decrease in brightness. These variations can be very rapid, and can make transiting planets very difficult to see.</p>
                    <img src="https://thumbnails.zooniverse.org/999x/panoptes-uploads.zooniverse.org/production/project_attached_image/c23c6bac-25ba-4d53-ad69-d34b2077cc11.png" alt="Pulsating star example" className="w-full rounded-lg bg-gray-800" />
                </GuideSubSection>
            </GuideSection>
        ),
        'systematic-effects': (
            <GuideSection title="Systematic Effects" color="red">
                <p>Glitches in the equipment can cause strange shapes in the data.</p>
                <p>Sometimes it shows up as a set of unusually scattered point over this time range.</p>
                <img src="https://thumbnails.zooniverse.org/999x/panoptes-uploads.zooniverse.org/production/project_attached_image/30140fd0-08e4-4a6a-a618-62c1f0528367.png" alt="Scattered data points" className="w-full rounded-lg bg-gray-800" />
                <p>Other times, you might see a sudden jump in the lightcurve.</p>
                <img src="https://thumbnails.zooniverse.org/999x/panoptes-uploads.zooniverse.org/production/project_attached_image/36a91693-a95d-48f3-8308-00ebfbcd356e.png" alt="Sudden data jump" className="w-full rounded-lg bg-gray-800" />
            </GuideSection>
        )
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative p-6 sm:p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] border border-white border-opacity-20 text-left bg-gray-900 bg-opacity-95">
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
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              You don't need a PhD to contribute to space science. Join millions of citizen scientists making real discoveries from their computers.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
            <div className="text-center p-4 sm:p-6 bg-black bg-opacity-40 rounded-xl border border-gray-600">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">5,000+</div>
              <div className="text-gray-300 text-sm">Exoplanets Discovered</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-black bg-opacity-40 rounded-xl border border-gray-600">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">2M+</div>
              <div className="text-gray-300 text-sm">Citizen Scientists</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-black bg-opacity-40 rounded-xl border border-gray-600">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">100+</div>
              <div className="text-gray-300 text-sm">Research Papers</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-black bg-opacity-40 rounded-xl border border-gray-600">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-gray-300 text-sm">Data Collection</div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {initiatives.map((initiative) => (
              <div
                key={initiative.title}
                className="group p-6 sm:p-8 bg-black bg-opacity-40 backdrop-blur-md rounded-2xl border border-gray-600 hover:border-gray-400 transition-all duration-300 hover:scale-105"
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

  const NasaExplorerSection = () => (
    <section className="relative py-20 px-4">
      <div className="z-10 relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">NASA Data Explorer</h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">Interact with live and historical data directly from NASA's public APIs. See today's space picture or check for nearby asteroids.</p>
        </div>
        <TimeMachine />
        <NearEarthObjects />
      </div>
    </section>
  );

  const Footer = () => (
    <footer className="relative py-16 px-4 border-t border-gray-800">
      <div className="z-10 relative max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Astro Hunters
            </h3>
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering the next generation of space explorers through interactive education and real scientific contribution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setActiveSection('education')} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Start Learning
              </button>
              <button onClick={() => setActiveSection('citizen-science')} className="px-6 py-2 border border-gray-600 hover:border-gray-400 rounded-lg transition-colors">
                Join Community
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="https://exoplanetarchive.ipac.caltech.edu/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">NASA Exoplanet Archive</a></li>
              <li><a href="https://science.nasa.gov/mission/kepler/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Kepler Mission</a></li>
              <li><a href="https://science.nasa.gov/mission/tess/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TESS Mission</a></li>
              <li><a href="https://www.esa.int/Science_Exploration/Space_Science" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">ESA Missions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Community</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="https://www.zooniverse.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Zooniverse Platform</a></li>
              <li><a href="https://www.cloudynights.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Astronomy Forums</a></li>
              <li><a href="https://citizenscience.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Citizen Science Hub</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © 2025 Astro Hunters. Educational content inspired by real space missions and citizen science initiatives.
          </p>
        </div>
      </div>
    </footer>
  );

  const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const handleLinkClick = (section: string) => {
        setActiveSection(section);
        setIsMenuOpen(false);
    }

    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => handleLinkClick('hero')} className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Astro Hunters</button>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => handleLinkClick('education')} className={`hover:text-white transition-colors ${activeSection === 'education' ? 'text-white' : 'text-gray-400'}`}>Learn</button>
            <button onClick={() => handleLinkClick('simulation')} className={`hover:text-white transition-colors ${activeSection === 'simulation' ? 'text-white' : 'text-gray-400'}`}>Exoplanet Simulator</button>
            <a href="https://huggingface.co/spaces/FatimahEmadEldin/Astro-Hunters" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Discover</a>
            <button onClick={() => handleLinkClick('nasa-explorer')} className={`hover:text-white transition-colors ${activeSection === 'nasa-explorer' ? 'text-white' : 'text-gray-400'}`}>NASA Explorer</button>
            <button onClick={() => handleLinkClick('citizen-science')} className={`hover:text-white transition-colors ${activeSection === 'citizen-science' ? 'text-white' : 'text-gray-400'}`}>Contribute</button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel - Fixed for better tap targets */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black bg-opacity-90 backdrop-blur-md border-t border-gray-800">
            <div className="flex flex-col">
              <button onClick={() => handleLinkClick('education')} className={`block w-full text-left p-4 transition-colors ${activeSection === 'education' ? 'text-white bg-purple-600/20' : 'text-gray-300 hover:bg-gray-700'}`}>Learn</button>
              <button onClick={() => handleLinkClick('simulation')} className={`block w-full text-left p-4 transition-colors ${activeSection === 'simulation' ? 'text-white bg-purple-600/20' : 'text-gray-300 hover:bg-gray-700'}`}>Exoplanet Simulator</button>
              <a href="https://huggingface.co/spaces/FatimahEmadEldin/Astro-Hunters" target="_blank" rel="noopener noreferrer" className="block w-full text-left p-4 text-gray-300 hover:bg-gray-700 transition-colors">Discover</a>
              <button onClick={() => handleLinkClick('nasa-explorer')} className={`block w-full text-left p-4 transition-colors ${activeSection === 'nasa-explorer' ? 'text-white bg-purple-600/20' : 'text-gray-300 hover:bg-gray-700'}`}>NASA Explorer</button>
              <button onClick={() => handleLinkClick('citizen-science')} className={`block w-full text-left p-4 transition-colors ${activeSection === 'citizen-science' ? 'text-white bg-purple-600/20' : 'text-gray-300 hover:bg-gray-700'}`}>Contribute</button>
            </div>
          </div>
        )}
      </nav>
    );
  };


  return (
    <div className="relative min-h-screen text-white overflow-x-hidden bg-black">
      <StarsBackground />
      <Navigation />
      <APIDebugPanel />
      <FeedbackModal />
      <FieldGuideModal />

      <main className="relative z-10 pt-16">
        {activeSection === 'hero' && <HeroSection />}
        {activeSection === 'education' && <><SolarSystemSection /><ExoplanetTypesSection /></>}
        {activeSection === 'simulation' && <SimulationSection />}
        {activeSection === 'nasa-explorer' && <NasaExplorerSection />}
        {activeSection === 'citizen-science' && <CitizenScienceSection />}

        {activeSection === 'hero' && (
          <>
            <SolarSystemSection />
            <ExoplanetTypesSection />
            <SimulationSection />
            <NasaExplorerSection />
            <CitizenScienceSection />
          </>
        )}
      </main>

      {showModal === 'moon-phases' && <Modal onClose={() => setShowModal(null)}><MoonPhaseSimulator /></Modal>}
      {showModal === 'earth-events' && <Modal onClose={() => setShowModal(null)}><LiveEarthEvents /></Modal>}
      {showModal === 'mars-rover-photos' && <Modal onClose={() => setShowModal(null)}><MarsRoverPhotos /></Modal>}
      {showModal === 'planet' && selectedPlanet && (
        <Modal onClose={() => setShowModal(null)}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center">{selectedPlanet.name}</h2>
          <p className="text-base sm:text-lg text-gray-300 mb-6 text-center max-w-2xl mx-auto">{selectedPlanet.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left mb-6">{Object.entries(selectedPlanet.facts).map(([key, value]) => ( <div key={key} className="bg-white/10 p-3 rounded-lg"><h4 className="font-semibold text-purple-300">{key}</h4><p>{String(value)}</p></div> ))}</div>
          {selectedPlanet.phenomena.length > 0 && <h3 className="text-2xl font-bold mb-4 text-blue-300 text-center">Explore Phenomena</h3>}
          <div className="space-y-4">
            {selectedPlanet.phenomena.map((phenomenon) => (
              <div key={phenomenon.id} className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 rounded-xl border border-white/20 cursor-pointer hover:scale-105 transition-transform" onClick={() => { if(phenomenon.id === 'mars-rover-photos') fetchMarsRoverPhotos(); setShowModal(phenomenon.id); }}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{phenomenon.icon}</div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-white">{phenomenon.title}</h4>
                    <p className="text-gray-300 text-sm sm:text-base">{phenomenon.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
};

export default App;
