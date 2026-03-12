import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

export const moodSettings = {
  happy: { text: '晴朗', color: 'text-red-600', bgColor: 'bg-red-600' },
  sad: { text: '微雨', color: 'text-blue-700', bgColor: 'bg-blue-600' },
  neutral: { text: '平靜', color: 'text-gray-700', bgColor: 'bg-gray-600' },
};

export const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

// ★ 修正重點：加入 leading-none 與精確的行高，防止 html2canvas 文字偏移
export const TicketCard = ({ captureImg, moodResult, size = "normal" }) => {
  const isLarge = size === "large";
  const currentMood = moodSettings[moodResult] || moodSettings.neutral;
  const todayStr = getTodayString();
  
  const stationSize = isLarge ? "text-4xl" : "text-xl";
  const labelSize = isLarge ? "text-[12px]" : "text-[8px]";
  const moodTextSize = isLarge ? "text-3xl" : "text-lg";
  const paddingClass = isLarge ? "p-4" : "p-2.5";
  const gapClass = isLarge ? "gap-2" : "gap-0.5";

  return (
    <div className={`relative ${isLarge ? 'w-[750px] h-[320px]' : 'w-[560px] h-[240px]'} bg-[#FDFBF7] flex flex-row rounded-sm shadow-[8px_8px_0_rgba(0,0,0,0.8)] border-[4px] border-gray-800 overflow-hidden font-serif shrink-0`}>
      
      <div className="w-[55%] h-full relative overflow-hidden bg-gray-200 shrink-0 border-r-[2px] border-gray-300">
        {captureImg ? (
          <img src={captureImg} className="w-full h-full object-cover grayscale-[30%] contrast-125" alt="心情寫真" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold tracking-widest text-sm">影像讀取中...</div>
        )}
        
        <div className="absolute bottom-4 left-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20">
           <div className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-black tracking-widest mb-1 leading-none`}>時光風景</div>
           <div className={`${isLarge ? 'text-sm' : 'text-[10px]'} font-bold opacity-90 tracking-widest leading-none mt-2`}>民歌車站．二零二六</div>
        </div>
      </div>

      <div className="w-[4px] h-full border-l-[3px] border-dashed border-gray-500 relative bg-[#FDFBF7] z-10 shrink-0"></div>

      <div className={`flex-1 h-full flex flex-col ${paddingClass} bg-[#F9F6F0] relative`}>
        
        <div className={`flex justify-between items-center border-b-2 border-gray-300 ${isLarge ? 'pb-2 mb-2' : 'pb-1 mb-1'}`}>
            <div className={`${labelSize} font-bold text-gray-500 tracking-widest leading-none`}>為您記錄此刻</div>
            <div className={`text-right ${labelSize} font-bold text-gray-500 tracking-widest leading-none`}>臺灣鐵路局</div>
        </div>

        <div className={`flex-1 flex flex-col items-center justify-center ${gapClass} px-1 relative`}>
           <div className="flex flex-col items-center justify-center w-full">
             <h2 className={`${stationSize} font-bold text-gray-800 tracking-widest m-0 leading-none block`}>民歌車站</h2>
           </div>

           <div className={`w-[60%] flex items-center justify-center gap-2 ${isLarge ? 'my-1' : 'my-0'} opacity-60`}>
             <div className="h-[2px] flex-1 bg-gray-600"></div>
             <div className={`${isLarge ? 'text-base' : 'text-xs'} font-black text-gray-800 font-sans leading-none pb-0.5`}>至</div>
             <div className="h-[2px] flex-1 bg-gray-600"></div>
           </div>

           <div className="flex flex-col items-center justify-center w-full">
             <h2 className={`${stationSize} font-bold text-gray-800 tracking-widest m-0 leading-none block`}>回憶車站</h2>
           </div>
        </div>

        <div className={`${isLarge ? 'mt-2 py-2' : 'mt-1 py-1'} flex flex-col items-center justify-center gap-1.5 relative bg-[#FDFBF7] rounded border-[2px] border-gray-800 shadow-inner`}>
           <div className={`${labelSize} text-gray-600 font-bold tracking-widest leading-none`}>今日天氣</div>
           {/* 使用固定高度與 line-height 來置中 */}
           <div className={`text-center font-black px-6 ${isLarge ? 'h-[36px] leading-[36px]' : 'h-[24px] leading-[24px]'} rounded text-white tracking-widest ${moodTextSize} ${currentMood.bgColor} block`}>
              【{currentMood.text}】
           </div>
        </div>

        <div className={`mt-auto flex flex-col px-1 ${isLarge ? 'pt-2' : 'pt-1'}`}>
           <div className={`flex justify-between items-center ${labelSize} font-bold text-gray-500 tracking-widest border-t border-gray-300 pt-2 leading-none`}>
             <span>乘車票號</span>
             <span className={`font-mono font-bold text-gray-800 ${isLarge ? 'text-sm' : 'text-xs'} leading-none`}>
               {todayStr}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};

const MoodTrainGame = ({ onMoodDetected, onTicketGenerated }) => {
  const webcamRef = useRef(null);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  
  const [step, setStep] = useState('intro');
  const [moodResult, setMoodResult] = useState(null); 
  const [captureImg, setCaptureImg] = useState(null); 
  const [flash, setFlash] = useState(false); 
  const [isCameraActive, setIsCameraActive] = useState(true);

  useEffect(() => {
    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true 
      });
      setFaceLandmarker(landmarker);
    };
    init();
  }, []);

  const startScan = () => {
    if (!faceLandmarker || !webcamRef.current?.video) {
        alert("驗票閘門系統啟動中，請稍候...");
        return;
    }
    
    setStep('scanning');

    let scanCount = 0;
    let smileScore = 0;
    let sadScore = 0;
    
    const interval = setInterval(() => {
       const video = webcamRef.current.video;
       if(video && video.readyState === 4) {
           const startTimeMs = performance.now();
           const result = faceLandmarker.detectForVideo(video, startTimeMs);
           
           if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
               const shapes = result.faceBlendshapes[0].categories;
               
               const smileL = shapes.find(s => s.categoryName === 'mouthSmileLeft')?.score || 0;
               const smileR = shapes.find(s => s.categoryName === 'mouthSmileRight')?.score || 0;
               smileScore += Math.max(smileL, smileR);

               const frownL = shapes.find(s => s.categoryName === 'mouthFrownLeft')?.score || 0;
               const frownR = shapes.find(s => s.categoryName === 'mouthFrownRight')?.score || 0;
               const browDownL = shapes.find(s => s.categoryName === 'browDownLeft')?.score || 0;
               const browDownR = shapes.find(s => s.categoryName === 'browDownRight')?.score || 0;
               
               const currentSad = (Math.max(frownL, frownR) * 1.5) + Math.max(browDownL, browDownR);
               sadScore += currentSad;
               
               scanCount++;
           }
       }
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        
        setFlash(true);
        setTimeout(() => setFlash(false), 300);

        const avgSmile = scanCount > 0 ? smileScore / scanCount : 0;
        const avgSad = scanCount > 0 ? sadScore / scanCount : 0;
        
        let finalMood = 'neutral';
        if (avgSmile > 0.25) finalMood = 'happy'; 
        else if (avgSad > 0.015) finalMood = 'sad';

        const imageSrc = webcamRef.current.getScreenshot();
        
        setCaptureImg(imageSrc);
        setMoodResult(finalMood);
        setStep('result');
        onMoodDetected(finalMood);
    }, 3000);
  };

  const getConductorMessage = () => {
    if(step !== 'result') {
      return "各位旅客您好，請您看向前方的鏡頭，讓我看看您今日的心情天氣，好為您印製一張專屬的乘車券。";
    }

    switch(moodResult) {
      case 'happy': 
        return "看您笑得這麼開心，今天心裡一定是個大晴天吧！這趟旅程，溫暖的陽光會一路陪著您。";
      case 'sad': 
        return "眉頭怎麼稍微鎖上了呢？沒關係的，今天窗外落起了溫柔的微雨，就讓雨水洗去您的疲憊，我們聽首溫柔的歌再出發。";
      default: 
        return "旅途的風景總是平穩而悠長，今日的天氣也清爽宜人。請您靠在窗邊，讓我們悠閒地享受這段民歌時光。";
    }
  };
  
  const handleReScan = () => {
    setStep('intro');
    setCaptureImg(null);
    onMoodDetected('neutral'); 
  };

  return (
    <div className="relative w-full h-full bg-transparent flex flex-col items-center p-8 overflow-hidden font-sans">
      
      <div className={`absolute inset-0 bg-white z-[60] pointer-events-none transition-opacity duration-300 ${flash ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className="text-center mb-6 mt-4">
        <h2 className="text-4xl font-bold text-[#FDFBF7] tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] border-b-2 border-red-500 pb-2 inline-block font-serif">心情車站</h2>
        <p className="text-gray-200 mt-4 tracking-wider text-lg drop-shadow-md font-bold">通往內心的時光鐵道</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl items-center justify-center h-[65vh]">
        
        <div className="flex flex-col gap-6 w-full md:w-[40%] h-full justify-center">
          <div className="bg-[#EAEAEA] p-6 rounded-xl shadow-[8px_8px_0_rgba(0,0,0,0.6)] border-[4px] border-gray-800 flex flex-col items-center relative overflow-hidden h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-widest border-b-[3px] border-gray-800 pb-2 w-full text-center font-serif">剪票口相機</h2>
            
            <div className="w-full aspect-square md:aspect-[4/3] bg-gray-300 rounded-sm overflow-hidden relative border-[4px] border-gray-800 shadow-inner flex items-center justify-center">
              {isCameraActive ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${step === 'result' ? 'opacity-20 blur-sm' : 'opacity-100'}`}
                  mirrored={true}
                />
              ) : (
                <span className="text-gray-500 font-bold tracking-widest">相機已關閉</span>
              )}
              
              {step === 'scanning' && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-[40%] h-[60%] border-[4px] border-yellow-400 border-dashed rounded animate-pulse shadow-[0_0_15px_#facc15]"></div>
                </div>
              )}
              
              {step === 'result' && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <p className="bg-[#FDFBF7] px-6 py-2 border-[3px] border-gray-800 rounded font-bold text-gray-800 tracking-widest shadow-[4px_4px_0_#4b5563]">取像成功</p>
                </div>
              )}
            </div>

            <div className="w-full text-center mt-4 mb-2">
               <span className="bg-[#FDFBF7] text-gray-800 border-[3px] border-gray-800 px-6 py-2 rounded shadow-[4px_4px_0_#4b5563] font-bold tracking-widest text-sm inline-block">
                 請看著相機保持不動
               </span>
            </div>

            <div className="mt-auto w-full">
              {step === 'intro' && (
                <button onClick={startScan} className="w-full py-4 bg-gray-800 text-[#FDFBF7] font-bold rounded border-[3px] border-black shadow-[4px_4px_0_#4b5563] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#4b5563] transition-all tracking-widest text-lg">
                  讀取心情並製票
                </button>
              )}

              {step === 'scanning' && (
                <div className="w-full py-4 text-center text-gray-600 font-bold animate-pulse tracking-widest bg-[#FDFBF7] rounded border-[3px] border-gray-800 shadow-inner">正在分析面部特徵...</div>
              )}

              {step === 'result' && (
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={handleReScan} 
                    className="flex-1 py-4 bg-[#FDFBF7] text-gray-800 font-bold rounded border-[3px] border-gray-800 shadow-[4px_4px_0_#4b5563] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#4b5563] transition-all tracking-widest"
                  >
                    重新拍照
                  </button>
                  <button 
                    onClick={() => { setIsCameraActive(false); onTicketGenerated(captureImg, moodResult); }} 
                    className="flex-1 py-4 bg-red-600 text-[#FDFBF7] font-bold rounded border-[3px] border-red-900 shadow-[4px_4px_0_#7f1d1d] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#7f1d1d] transition-all tracking-widest"
                  >
                    領取車票
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-[60%] flex flex-col items-center justify-center gap-6 h-full relative">
            <div className="w-full bg-[#FDFBF7] p-6 rounded shadow-[6px_6px_0_rgba(0,0,0,0.6)] border-[4px] border-gray-800 relative z-20">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-[#FDFBF7] text-sm font-bold shadow-md border-[3px] border-[#FDFBF7] tracking-widest">廣播</div>
              <h3 className="font-bold text-gray-800 mb-2 tracking-widest text-lg font-serif">車長廣播：</h3>
              <p className="text-gray-700 leading-relaxed font-bold tracking-wide">
                {getConductorMessage()}
              </p>
            </div>

            <div className={`transition-all duration-700 origin-center w-full flex justify-center
                ${step === 'result' ? 'opacity-100 scale-100' : 'opacity-40 scale-95 blur-[2px] pointer-events-none'}
            `}>
              <TicketCard captureImg={captureImg} moodResult={moodResult} size="large" />
            </div>
        </div>

      </div>
    </div>
  );
};

export default MoodTrainGame;