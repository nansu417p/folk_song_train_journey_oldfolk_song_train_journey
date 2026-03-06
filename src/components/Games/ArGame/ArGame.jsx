import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { folkSongs } from '../../../data/folkSongs';
import CassetteUI from '../../Shared/CassetteUI'; // ★ 引入統一卡帶元件

const ArGame = ({ onConfirmSong, onPreviewSong }) => {
  const webcamRef = useRef(null);
  
  const [handLandmarker, setHandLandmarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);

  const cassetteRefs = useRef([]);
  const fingerDomRef = useRef(null);
  
  const elementsDataRef = useRef(
    folkSongs.map((song, index) => {
      const colors = ["bg-[#D64F3E]", "bg-[#2A9D8F]", "bg-[#E9C46A]", "bg-[#F4A261]", "bg-[#264653]"];
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.25; 
      return {
        id: song.id,
        title: song.title,
        color: colors[index % colors.length],
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 40,
        vx: Math.cos(angle) * speed, 
        vy: Math.sin(angle) * speed  
      };
    })
  );

  const grabbedIdRef = useRef(null);
  const fingerPosRef = useRef({ x: -100, y: -100 });

  const [particles, setParticles] = useState([]); 
  const [, setTriggerRender] = useState(0); 
  const [playingSong, setPlayingSong] = useState(null); 
  const [showHint, setShowHint] = useState(true);

  const callbacksRef = useRef({ onPreviewSong });
  useEffect(() => { callbacksRef.current = { onPreviewSong }; }, [onPreviewSong]);

  useEffect(() => {
    const initLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" },
        runningMode: "VIDEO", numHands: 1
      });
      setHandLandmarker(landmarker);
      setIsLoading(false);
      setTimeout(() => setShowHint(false), 6000);
    };
    initLandmarker();
  }, []);

  useEffect(() => {
    if (!isCameraActive || !handLandmarker) return;

    let animationFrameId;

    const loop = () => {
      let now = performance.now();
      let fX = fingerPosRef.current.x;
      let fY = fingerPosRef.current.y;

      if (webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video;
        if (video.readyState === 4) {
          const result = handLandmarker.detectForVideo(video, now);
          if (result.landmarks && result.landmarks.length > 0) {
            const indexTip = result.landmarks[0][8];
            fX = (1 - indexTip.x) * 100;
            fY = indexTip.y * 100;
            fingerPosRef.current = { x: fX, y: fY };
          }
        }
      }

      let els = elementsDataRef.current;
      let currentGrab = grabbedIdRef.current;

      els.forEach(el => {
        if (el.id === currentGrab) return; 
        el.x += el.vx;
        el.y += el.vy;
        
        if (el.x < 8) { el.x = 8; el.vx = Math.abs(el.vx); }
        if (el.x > 92) { el.x = 92; el.vx = -Math.abs(el.vx); }
        if (el.y < 8) { el.y = 8; el.vy = Math.abs(el.vy); }
        if (el.y > 65) { el.y = 65; el.vy = -Math.abs(el.vy); } 
      });

      for (let i = 0; i < els.length; i++) {
        for (let j = i + 1; j < els.length; j++) {
          let e1 = els[i];
          let e2 = els[j];
          if (e1.id === currentGrab || e2.id === currentGrab) continue;

          let dx = e2.x - e1.x;
          let dy = e2.y - e1.y;
          let dist = Math.hypot(dx, dy);
          let minDist = 22; 

          if (dist < minDist && dist > 0) {
            let overlap = minDist - dist;
            let nx = dx / dist;
            let ny = dy / dist;
            
            e1.x -= nx * (overlap / 2);
            e1.y -= ny * (overlap / 2);
            e2.x += nx * (overlap / 2);
            e2.y += ny * (overlap / 2);

            let tvx = e1.vx, tvy = e1.vy;
            e1.vx = e2.vx; e1.vy = e2.vy;
            e2.vx = tvx; e2.vy = tvy;
          }
        }
      }

      const isInPlayerZone = (fX > 35 && fX < 65 && fY > 75);
      
      if (currentGrab) {
        let grabbedEl = els.find(el => el.id === currentGrab);
        if (grabbedEl) {
          grabbedEl.x = fX;
          grabbedEl.y = fY;
        }

        if (isInPlayerZone) {
          const originalSong = folkSongs.find(s => s.id === currentGrab);
          if (originalSong) {
            setPlayingSong({ ...originalSong, color: grabbedEl.color });
            if (callbacksRef.current.onPreviewSong) {
              callbacksRef.current.onPreviewSong(originalSong);
            }
          }
          
          triggerParticles(); 
          grabbedIdRef.current = null;
          
          if (grabbedEl) {
             grabbedEl.x = 20 + Math.random() * 60;
             grabbedEl.y = 10 + Math.random() * 20;
             grabbedEl.vx = (Math.random() - 0.5) * 0.8;
             grabbedEl.vy = (Math.random() - 0.5) * 0.8;
          }
        }
      } else {
        const hitElement = els.find(el => Math.hypot(el.x - fX, el.y - fY) < 12);
        if (hitElement && fX !== 0) {
          grabbedIdRef.current = hitElement.id;
        }
      }

      els.forEach((el, i) => {
        if (cassetteRefs.current[i]) {
          const isGrabbed = currentGrab === el.id;
          cassetteRefs.current[i].style.left = `${el.x}%`;
          cassetteRefs.current[i].style.top = `${el.y}%`;
          cassetteRefs.current[i].style.transform = `translate(-50%, -50%) scale(${isGrabbed ? 1.1 : 1})`;
          cassetteRefs.current[i].style.zIndex = isGrabbed ? 50 : 10;
        }
      });

      if (fingerDomRef.current) {
        const isGrabbing = currentGrab !== null;
        fingerDomRef.current.style.left = `${fX}%`;
        fingerDomRef.current.style.top = `${fY}%`;
        fingerDomRef.current.style.transform = `translate(-50%, -50%) scale(${isGrabbing ? 1.5 : 1})`;
        fingerDomRef.current.style.backgroundColor = isGrabbing ? '#facc15' : '#ef4444'; 
      }

      animationFrameId = requestAnimationFrame(loop);
    };
    
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [handLandmarker, isCameraActive]);

  const triggerParticles = () => {
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 10,
      y: 80,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 3 - 2,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1500); 
  };

  const handleConfirmClick = () => {
    setIsCameraActive(false); 
    onConfirmSong(playingSong); 
  };

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden select-none border-[6px] border-gray-800 rounded-xl shadow-2xl">
      
      <div className="absolute top-6 left-0 w-full flex justify-center pointer-events-none z-40">
         <div className="bg-[#FDFBF7]/90 backdrop-blur px-8 py-3 rounded-lg border-4 border-gray-800 shadow-[6px_6px_0_#4b5563]">
            <h2 className="text-3xl font-bold text-gray-800 tracking-widest m-0">捕捉民歌</h2>
         </div>
      </div>

      {playingSong && (
        <button 
          onClick={handleConfirmClick} 
          className="absolute top-6 right-8 z-50 px-8 py-3 bg-red-600 text-white font-bold text-lg rounded-lg border-2 border-red-800 shadow-[4px_4px_0_#7f1d1d] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#7f1d1d] transition-all tracking-widest pointer-events-auto animate-pulse"
        >
          ✅ 確認歌曲並返回
        </button>
      )}

      {isLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#FDFBF7] text-gray-800">
          <div className="w-16 h-16 border-8 border-gray-300 border-t-red-600 rounded-full animate-spin mb-6"></div>
          <p className="animate-pulse text-2xl font-bold tracking-widest border-b-2 border-red-500 pb-2">AR 引擎與空間掃描中...</p>
        </div>
      )}

      {isCameraActive && (
        <Webcam ref={webcamRef} className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] opacity-60" audio={false} />
      )}

      <div className="absolute inset-0 pointer-events-none">
        
        {showHint && !isLoading && (
          <div className="absolute top-32 left-0 w-full text-center animate-bounce z-40">
            <span className="bg-[#FDFBF7] text-gray-800 border-4 border-gray-800 px-6 py-3 rounded-lg shadow-[4px_4px_0_#4b5563] font-bold tracking-widest text-lg">
              👆 食指觸碰空中卡帶，拖入下方收音機
            </span>
          </div>
        )}

        {particles.map(p => (
          <div key={p.id} className="absolute w-3 h-3 rounded-full bg-yellow-300 shadow-[0_0_10px_#facc15] transition-transform duration-1000 ease-out"
               style={{ left: `${p.x + p.vx * 10}%`, top: `${p.y + p.vy * 10}%`, opacity: 0 }} />
        ))}

        {/* 漂浮卡帶 */}
        {elementsDataRef.current.map((el, i) => (
          <div 
            key={el.id} 
            ref={node => cassetteRefs.current[i] = node} 
            className="absolute flex flex-col items-center justify-center transition-transform duration-100" 
            style={{ left: `${el.x}%`, top: `${el.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* ★ 統一卡帶，設為 small 尺寸 (約原本 0.75倍) */}
            <CassetteUI title={el.title} color={el.color} size="small" />
          </div>
        ))}

        {!isLoading && (
          <div 
            ref={fingerDomRef}
            className="absolute w-8 h-8 rounded-full border-4 border-[#FDFBF7] shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors duration-150" 
            style={{ left: '-100%', top: '-100%', transform: 'translate(-50%, -50%)' }}
          ></div>
        )}

        {/* ★ 下方播放器縮小至 350px 寬度，並保留原卡帶黑邊 */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[350px] h-[180px]">
          <div className="w-full h-full bg-[#EAEAEA] rounded-t-3xl border-t-[10px] border-x-[10px] border-gray-800 flex flex-col items-center justify-end pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-2 w-48 h-3 bg-black/40 rounded-full blur-[2px]"></div>
            
            {/* 播放槽 */}
            <div className={`w-[220px] h-[130px] rounded-xl flex flex-col items-center justify-center transition-colors duration-500 relative overflow-hidden ${playingSong ? 'bg-[#111]' : 'bg-gray-800 border-4 border-gray-900 shadow-inner'}`}>
              {playingSong ? (
                <div className="animate-fade-in-up transform scale-[0.8] origin-center mt-2">
                  <CassetteUI title={playingSong.title} color={playingSong.color} size="normal" />
                </div>
              ) : (
                <div className="text-gray-400 font-bold text-sm tracking-widest flex items-center gap-2 border-2 border-dashed border-gray-600 w-full h-full justify-center rounded-xl">
                  <span className="text-2xl animate-bounce">↓</span> 投入卡帶
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
               <div className="w-8 h-3 bg-gray-500 rounded-sm border-2 border-gray-700 shadow-inner"></div>
               <div className="w-8 h-3 bg-gray-500 rounded-sm border-2 border-gray-700 shadow-inner"></div>
               <div className="w-8 h-3 bg-red-600 rounded-sm border-2 border-red-800 shadow-inner"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArGame;