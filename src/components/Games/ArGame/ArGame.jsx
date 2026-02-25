import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { folkSongs } from '../../../data/folkSongs';

const ArGame = ({ onBack }) => {
  const webcamRef = useRef(null);
  const audioRef = useRef(null); 
  const [handLandmarker, setHandLandmarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [elements, setElements] = useState(() => {
    const colors = ["bg-[#D64F3E]", "bg-[#2A9D8F]", "bg-[#E9C46A]", "bg-[#F4A261]", "bg-[#264653]"];
    return folkSongs.map((song, index) => ({
      id: song.id,
      title: song.title,
      audioFile: song.audioFileName, 
      color: colors[index % colors.length],
      x: Math.random() > 0.5 ? (10 + Math.random() * 20) : (70 + Math.random() * 20),
      y: 15 + Math.random() * 50
    }));
  });

  const [grabbedId, setGrabbedId] = useState(null); 
  const [fingerPos, setFingerPos] = useState({ x: 0, y: 0 }); 
  const [playingSongTitle, setPlayingSongTitle] = useState(null);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const initLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" },
        runningMode: "VIDEO", numHands: 1
      });
      setHandLandmarker(landmarker);
      setIsLoading(false);
      setTimeout(() => setShowHint(false), 5000);
    };
    initLandmarker();
  }, []);

  useEffect(() => {
    let animationFrameId;
    const loop = () => {
      if (webcamRef.current && webcamRef.current.video && handLandmarker) {
        const video = webcamRef.current.video;
        if (video.readyState === 4) {
          const result = handLandmarker.detectForVideo(video, performance.now());
          if (result.landmarks && result.landmarks.length > 0) {
            const indexTip = result.landmarks[0][8];
            setFingerPos({ x: (1 - indexTip.x) * 100, y: indexTip.y * 100 });
            updateGamePhysics((1 - indexTip.x) * 100, indexTip.y * 100);
          }
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [handLandmarker, elements, grabbedId]);

  const updateGamePhysics = (fx, fy) => {
    const isInPlayerZone = (fx > 35 && fx < 65 && fy > 70);
    if (grabbedId) {
      setElements(prev => prev.map(el => el.id === grabbedId ? { ...el, x: fx, y: fy } : el));
      if (isInPlayerZone) {
        const song = elements.find(el => el.id === grabbedId);
        playMusic(song); setGrabbedId(null);
        setElements(prev => prev.map(el => el.id === grabbedId ? { ...el, x: Math.random() * 80 + 10, y: Math.random() * 40 + 10 } : el));
      }
    } else {
      const hitElement = elements.find(el => Math.hypot(el.x - fx, el.y - fy) < 8);
      if (hitElement) setGrabbedId(hitElement.id);
    }
  };

  const playMusic = (song) => {
    if (audioRef.current) {
      audioRef.current.src = `/music/${song.audioFile}`; 
      audioRef.current.play().catch(e => console.log("播放失敗:", e));
      setPlayingSongTitle(song.title);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#EAEAEA] overflow-hidden select-none">
      <audio ref={audioRef} loop />

      {/* ★ 統一位置與樣式的返回按鈕 */}
      <button 
        onClick={onBack} 
        className="absolute top-6 left-6 z-50 px-5 py-2.5 bg-[#F5F5F5] text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300 tracking-wide pointer-events-auto"
      >
        ← 返回火車
      </button>

      {isLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#F5F5F5] text-gray-800">
          <div className="w-16 h-16 border-8 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-6"></div>
          <p className="animate-pulse text-2xl font-bold tracking-widest">AR 引擎啟動中...</p>
        </div>
      )}

      <Webcam ref={webcamRef} className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" audio={false} />

      <div className="absolute inset-0 pointer-events-none">
        {showHint && !isLoading && (
          <div className="absolute top-24 left-0 w-full text-center animate-bounce z-40">
            <span className="bg-[#F5F5F5] text-gray-800 border border-gray-300 px-6 py-3 rounded-lg shadow-lg font-bold tracking-widest">
              👆 食指觸碰方塊，拖入下方播放
            </span>
          </div>
        )}

        {elements.map(el => (
          <div key={el.id} className={`absolute transition-transform duration-300 flex flex-col items-center justify-center ${grabbedId === el.id ? 'z-50 scale-110' : 'z-10 hover:scale-105'}`} style={{ left: `${el.x}%`, top: `${el.y}%`, transform: 'translate(-50%, -50%)' }}>
            <div className={`w-28 h-16 ${el.color} rounded-lg border-2 border-[#F5F5F5] shadow-md flex items-center justify-center`}>
              <span className="text-[#F5F5F5] font-bold text-sm drop-shadow-sm tracking-wider">{el.title}</span>
            </div>
          </div>
        ))}

        {!isLoading && <div className={`absolute w-6 h-6 rounded-full border-2 border-[#F5F5F5] -translate-x-1/2 -translate-y-1/2 transition-colors duration-300 shadow-[0_0_10px_rgba(0,0,0,0.3)] ${grabbedId ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ left: `${fingerPos.x}%`, top: `${fingerPos.y}%` }}></div>}

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[320px] h-[140px]">
          <div className="w-full h-full bg-[#F5F5F5] rounded-t-2xl border-t-2 border-x-2 border-gray-300 flex flex-col items-center justify-end pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
            <div className={`w-56 h-20 border-2 rounded-lg flex items-center justify-center transition-colors duration-500 relative overflow-hidden shadow-inner ${playingSongTitle ? 'bg-[#EAF4E2] border-[#2A9D8F]' : 'bg-gray-200 border-gray-300'}`}>
              {playingSongTitle ? (
                <div className="z-10 text-center animate-pulse"><div className="text-[#2A9D8F] text-xs tracking-widest mb-1 font-bold">NOW PLAYING</div><div className="text-gray-800 font-bold text-xl">{playingSongTitle}</div></div>
              ) : (
                <div className="text-gray-500 font-bold text-sm tracking-widest">請放入歌曲卡帶</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArGame;