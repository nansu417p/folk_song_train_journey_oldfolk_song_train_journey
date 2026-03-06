import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import TicketCard from '../../Shared/TicketCard'; 

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
    if(step !== 'result') return "各位旅客您好，請看向相機，為您印製帶有今日天氣的專屬乘車券。";
    switch(moodResult) {
      case 'happy': return "看您面帶微笑，心情想必十分愉悅！為您切換至【晴朗】模式，這趟旅程將為您披上暖陽。";
      case 'sad': return "看您眉頭微鎖，似乎有些心事。為您切換至【微雨】模式，讓窗外的雨水洗滌疲憊，聽首溫柔的歌吧。";
      default: return "旅途的風景總是平靜而悠長。為您切換至【平靜】模式，請慢慢享受這趟民歌之旅。";
    }
  };
  
  const handleReScan = () => {
    setStep('intro');
    setCaptureImg(null);
    onMoodDetected('neutral'); 
  };

  return (
    <div className="relative w-full h-full bg-transparent flex flex-col items-center p-8 overflow-hidden">
      
      <div className={`absolute inset-0 bg-white z-[60] pointer-events-none transition-opacity duration-300 ${flash ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className="text-center mb-6 mt-4">
        <h2 className="text-4xl font-bold text-[#FDFBF7] tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] border-b-2 border-red-500 pb-2 inline-block">心情風景</h2>
        <p className="text-gray-200 mt-4 tracking-wider text-lg drop-shadow-md">通往內心的時光鐵道</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl items-center justify-center h-[65vh]">
        
        {/* 左側：相機與控制區 */}
        <div className="flex flex-col gap-6 w-full md:w-[40%] h-full justify-center">
          <div className="bg-[#EAEAEA] p-6 rounded-xl shadow-xl border-4 border-[#C0B8A3] flex flex-col items-center relative overflow-hidden h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-widest border-b-2 border-gray-800 pb-2 w-full text-center">剪票口相機</h2>
            
            {/* ★ 相機鏡頭框統一 */}
            <div className="w-full aspect-square md:aspect-[4/3] bg-gray-300 rounded-lg overflow-hidden relative border-4 border-gray-800 shadow-inner flex items-center justify-center">
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
                  <div className="w-[40%] h-[60%] border-4 border-yellow-400 border-dashed rounded animate-pulse shadow-[0_0_15px_#facc15]"></div>
                </div>
              )}
              
              {step === 'result' && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <p className="bg-[#FDFBF7] px-6 py-2 border-2 border-gray-400 rounded-lg font-bold text-gray-800 tracking-widest shadow-[2px_2px_0_#9ca3af]">✅ 取像成功</p>
                </div>
              )}
            </div>

            {/* ★ 統一的提示框設計 */}
            <div className="w-full text-center mt-4 mb-2">
               <span className="bg-[#FDFBF7] text-gray-800 border-2 border-gray-400 px-6 py-2 rounded-lg shadow-[2px_2px_0_#9ca3af] font-bold tracking-widest text-sm inline-block">
                 📷 請看著相機保持不動
               </span>
            </div>

            <div className="mt-auto w-full">
              {step === 'intro' && (
                <button onClick={startScan} className="w-full py-4 bg-gray-800 text-white font-bold rounded-lg border-2 border-black shadow-[4px_4px_0_#4b5563] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#4b5563] transition-all tracking-widest text-lg">
                  📷 讀取心情並製票
                </button>
              )}

              {step === 'scanning' && (
                <div className="w-full py-4 text-center text-gray-600 font-bold animate-pulse tracking-widest bg-[#FDFBF7] rounded-lg border-2 border-gray-400 shadow-inner">正在分析面部特徵...</div>
              )}

              {step === 'result' && (
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={handleReScan} 
                    className="flex-1 py-4 bg-[#FDFBF7] text-gray-800 font-bold rounded-lg border-2 border-gray-400 shadow-[4px_4px_0_#9ca3af] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#9ca3af] transition-all tracking-wide"
                  >
                    🔄 重新拍照
                  </button>
                  <button 
                    onClick={() => { setIsCameraActive(false); onTicketGenerated(captureImg, moodResult); }} 
                    className="flex-1 py-4 bg-red-600 text-white font-bold rounded-lg border-2 border-red-800 shadow-[4px_4px_0_#7f1d1d] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#7f1d1d] transition-all tracking-wide"
                  >
                    🎫 領取車票
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右側：廣播與橫式車票預覽 */}
        <div className="w-full md:w-[60%] flex flex-col items-center justify-center gap-6 h-full relative">
            <div className="w-full bg-[#FDFBF7] p-6 rounded-lg shadow-md border-l-4 border-gray-800 relative z-20">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white text-xl shadow-md border-2 border-white">👨‍✈️</div>
              <h3 className="font-bold text-gray-800 mb-2 tracking-widest">車長廣播：</h3>
              <p className="text-gray-600 leading-relaxed font-bold">
                {getConductorMessage()}
              </p>
            </div>

            <div className={`transition-all duration-700 origin-center w-full flex justify-center
                ${step === 'result' ? 'opacity-100 scale-100' : 'opacity-40 scale-95 blur-[2px] pointer-events-none'}
            `}>
              <TicketCard captureImg={captureImg} moodResult={moodResult} size="normal" />
            </div>
        </div>

      </div>
    </div>
  );
};

export default MoodTrainGame;