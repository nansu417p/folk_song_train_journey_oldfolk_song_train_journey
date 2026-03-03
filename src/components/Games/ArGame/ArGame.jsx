import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { folkSongs } from '../../../data/folkSongs';

const ArGame = ({ onBack, onConfirmSong, onPreviewSong }) => {
  const webcamRef = useRef(null);
  
  const [handLandmarker, setHandLandmarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);

  // 卡帶的物理屬性與 DOM Ref 分離
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

  // 儲存 callbacks 避免 useEffect 重啟
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
      setTimeout(() => setShowHint(false), 5000);
    };
    initLandmarker();
  }, []);

  // 物理與手勢迴圈
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

      // 彈性碰撞
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
          // ★ 關鍵修復：取得「最原始」的 folkSong 物件傳給 App.jsx
          const originalSong = folkSongs.find(s => s.id === currentGrab);
          
          if (originalSong) {
            setPlayingSong(originalSong);
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
        const hitElement = els.find(el => Math.hypot(el.x - fX, el.y - fY) < 10);
        if (hitElement && fX !== 0) {
          grabbedIdRef.current = hitElement.id;
        }
      }

      // 直接操作 DOM 更新卡帶位置
      els.forEach((el, i) => {
        if (cassetteRefs.current[i]) {
          const isGrabbed = currentGrab === el.id;
          cassetteRefs.current[i].style.left = `${el.x}%`;
          cassetteRefs.current[i].style.top = `${el.y}%`;
          cassetteRefs.current[i].style.transform = `translate(-50%, -50%) scale(${isGrabbed ? 1.25 : 1})`;
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

  const handleBackClick = () => {
    setIsCameraActive(false); 
    onBack();
  };

  const handleConfirmClick = () => {
    setIsCameraActive(false); 
    onConfirmSong(playingSong); 
  };

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden select-none border-4 border-gray-600 rounded-lg shadow-2xl">
      
      <button 
        onClick={handleBackClick} 
        className="absolute top-6 left-6 z-50 px-5 py-2.5 bg-[#F5F5F5] text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300 tracking-wide pointer-events-auto"
      >
        ← 返回火車
      </button>

      {playingSong && (
        <button 
          onClick={handleConfirmClick} 
          className="absolute top-6 right-6 z-50 px-8 py-3 bg-red-600 text-white font-bold rounded-lg shadow-xl hover:bg-red-500 hover:-translate-y-1 transition-all duration-300 tracking-widest pointer-events-auto border-2 border-red-400 animate-pulse"
        >
          ✅ 確認歌曲並返回
        </button>
      )}

      {isLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#F5F5F5] text-gray-800">
          <div className="w-16 h-16 border-8 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-6"></div>
          <p className="animate-pulse text-2xl font-bold tracking-widest">AR 引擎與空間掃描中...</p>
        </div>
      )}

      {isCameraActive && (
        <Webcam ref={webcamRef} className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] opacity-70" audio={false} />
      )}

      <div className="absolute inset-0 pointer-events-none">
        
        {showHint && !isLoading && (
          <div className="absolute top-24 left-0 w-full text-center animate-bounce z-40">
            <span className="bg-[#F5F5F5] text-gray-800 border border-gray-300 px-6 py-3 rounded-lg shadow-lg font-bold tracking-widest">
              👆 食指觸碰空中卡帶，拖入下方收音機
            </span>
          </div>
        )}

        {particles.map(p => (
          <div key={p.id} className="absolute w-3 h-3 rounded-full bg-yellow-300 shadow-[0_0_10px_#facc15] transition-transform duration-1000 ease-out"
               style={{ left: `${p.x + p.vx * 10}%`, top: `${p.y + p.vy * 10}%`, opacity: 0 }} />
        ))}

        {elementsDataRef.current.map((el, i) => (
          <div 
            key={el.id} 
            ref={node => cassetteRefs.current[i] = node} 
            className={`absolute flex flex-col items-center justify-center transition-transform duration-100`} 
            style={{ left: `${el.x}%`, top: `${el.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-32 h-20 ${el.color} rounded-lg border-4 border-gray-800 shadow-xl flex flex-col items-center justify-between p-2 relative bg-opacity-90 backdrop-blur-sm`}>
              <div className="w-full h-3 bg-white/30 rounded-sm mb-1"></div>
              <span className="text-white font-bold text-sm drop-shadow-md tracking-wider z-10 whitespace-nowrap">{el.title}</span>
              <div className="flex w-full justify-center gap-4 mt-1 opacity-80">
                 <div className="w-5 h-5 bg-gray-800 rounded-full border-2 border-gray-300 flex items-center justify-center"><div className="w-1 h-1 bg-white rounded-full"></div></div>
                 <div className="w-5 h-5 bg-gray-800 rounded-full border-2 border-gray-300 flex items-center justify-center"><div className="w-1 h-1 bg-white rounded-full"></div></div>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && (
          <div 
            ref={fingerDomRef}
            className={`absolute w-6 h-6 rounded-full border-2 border-[#F5F5F5] shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-colors duration-150`} 
            style={{ left: '-100%', top: '-100%', transform: 'translate(-50%, -50%)' }}
          ></div>
        )}

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[400px] h-[160px]">
          <div className="w-full h-full bg-[#EAEAEA] rounded-t-3xl border-t-[12px] border-x-[12px] border-gray-400 flex flex-col items-center justify-end pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative">
            <div className="absolute top-2 w-64 h-4 bg-black/30 rounded-full blur-[2px]"></div>
            <div className={`w-72 h-24 border-4 rounded-xl flex flex-col items-center justify-center transition-colors duration-500 relative overflow-hidden shadow-inner ${playingSong ? 'bg-[#EAF4E2] border-[#2A9D8F]' : 'bg-gray-800 border-gray-600'}`}>
              {playingSong ? (
                <div className="z-10 text-center">
                  <div className="text-[#2A9D8F] text-[10px] tracking-[0.3em] mb-1 font-bold animate-pulse">NOW PLAYING</div>
                  <div className="text-gray-800 font-bold text-2xl tracking-widest">{playingSong.title}</div>
                </div>
              ) : (
                <div className="text-gray-400 font-bold text-sm tracking-widest flex items-center gap-2">
                  <span className="text-2xl animate-bounce">↓</span> 投入卡帶播放
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
               <div className="w-10 h-3 bg-gray-400 rounded-sm"></div>
               <div className="w-10 h-3 bg-gray-400 rounded-sm"></div>
               <div className="w-10 h-3 bg-red-400 rounded-sm"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArGame;