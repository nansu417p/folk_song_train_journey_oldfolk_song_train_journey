import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

const MoodTrainGame = ({ onBack, onMoodDetected }) => {
  const webcamRef = useRef(null);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  
  // 狀態管理：'intro' (歡迎), 'scanning' (掃描中), 'result' (出票)
  const [step, setStep] = useState('intro');
  const [moodResult, setMoodResult] = useState(null); // 'happy', 'sad', 'neutral'
  const [captureImg, setCaptureImg] = useState(null); // 拍下的照片
  
  // 初始化 AI 模型
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
    
    const interval = setInterval(() => {
       const video = webcamRef.current.video;
       if(video.readyState === 4) {
           const startTimeMs = performance.now();
           const result = faceLandmarker.detectForVideo(video, startTimeMs);
           
           if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
               const shapes = result.faceBlendshapes[0].categories;
               const smileL = shapes.find(s => s.categoryName === 'mouthSmileLeft')?.score || 0;
               const smileR = shapes.find(s => s.categoryName === 'mouthSmileRight')?.score || 0;
               const currentSmile = (smileL + smileR) / 2;
               
               smileScore += currentSmile;
               scanCount++;
           }
       }
    }, 100);

    // 3秒後結算並拍照
    setTimeout(() => {
        clearInterval(interval);
        const avgSmile = scanCount > 0 ? smileScore / scanCount : 0;
        
        let finalMood = 'neutral';
        if (avgSmile > 0.4) finalMood = 'happy';
        else if (avgSmile < 0.1) finalMood = 'sad';

        const imageSrc = webcamRef.current.getScreenshot();
        
        setCaptureImg(imageSrc);
        setMoodResult(finalMood);
        setStep('result');
        
        // 呼叫 App.jsx 觸發全域特效
        onMoodDetected(finalMood);
    }, 3000);
  };

  // 車長預設對話
  const getConductorMessage = () => {
    switch(moodResult) {
      case 'happy': return "看您面帶微笑，心情想必十分愉悅！這趟旅程將為您披上暖陽，願您有個美好的一天。";
      case 'sad': return "看您眉頭微鎖，似乎有些心事。沒關係的，讓窗外的雨水洗滌疲憊，聽首溫柔的歌吧。";
      default: return "旅途的風景總是平靜而悠長。為您印製了專屬乘車券，請慢慢享受這趟民歌之旅。";
    }
  };

  return (
    <div className="relative w-full h-full bg-transparent flex items-center justify-center p-8">
      
      {/* 統一的返回按鈕 */}
      <button 
        onClick={onBack} 
        className="absolute top-6 left-6 z-50 px-5 py-2.5 bg-[#F5F5F5] text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300 tracking-wide"
      >
        ← 返回火車
      </button>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl items-center justify-center">
        
        {/* 左側：鏡頭與車長對話區 */}
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          
          <div className="bg-[#F5F5F5] p-4 rounded-lg shadow-xl border border-gray-300 flex flex-col items-center relative overflow-hidden">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-widest border-b-2 border-red-500 pb-2">剪票口監視器</h2>
            
            <div className="w-full aspect-video bg-gray-200 rounded overflow-hidden relative border-4 border-gray-300">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className={`w-full h-full object-cover ${step === 'result' ? 'opacity-0' : 'opacity-100'}`}
                mirrored={true}
              />
              
              {/* 掃描框 */}
              {step === 'scanning' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-64 border-4 border-yellow-400 border-dashed rounded animate-pulse"></div>
                </div>
              )}

              {/* 拍照定格 */}
              {step === 'result' && captureImg && (
                <img src={captureImg} className="absolute inset-0 w-full h-full object-cover grayscale" alt="captured" />
              )}
            </div>

            {step === 'intro' && (
              <button onClick={startScan} className="mt-6 px-8 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-500 hover:-translate-y-1 transition-all tracking-widest">
                📷 讀取心情並製票
              </button>
            )}

            {step === 'scanning' && (
              <p className="mt-6 text-gray-600 font-bold animate-pulse tracking-widest">正在分析面部表情...</p>
            )}
          </div>

          {/* 車長對話框 */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-800 relative">
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white text-xl shadow-md">👨‍✈️</div>
            <h3 className="font-bold text-gray-800 mb-2 tracking-widest">車長廣播：</h3>
            <p className="text-gray-600 leading-relaxed">
              {step === 'intro' && "各位旅客您好，請看向監視器，為您印製帶有今日心情的專屬乘車券。"}
              {step === 'scanning' && "資料讀取中，請保持自然..."}
              {step === 'result' && getConductorMessage()}
            </p>
          </div>

        </div>

        {/* 右側：實體車票 UI (結果出現才顯示) */}
        {step === 'result' && (
          <div className="w-full md:w-1/3 flex flex-col items-center animate-fade-in-up">
            <div className="bg-[#EAEAEA] w-[300px] rounded-sm shadow-2xl flex flex-col relative overflow-hidden border border-gray-400 p-2">
              
              {/* 車票打孔設計 */}
              <div className="absolute -left-3 top-20 w-6 h-6 bg-transparent rounded-full border-r border-gray-400 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.1)]"></div>
              <div className="absolute -right-3 top-20 w-6 h-6 bg-transparent rounded-full border-l border-gray-400 shadow-[inset_2px_0_4px_rgba(0,0,0,0.1)]"></div>
              
              <div className="border-[3px] border-gray-800 p-4 h-full flex flex-col relative">
                
                {/* 票頭 */}
                <div className="text-center border-b-2 border-dashed border-gray-500 pb-3 mb-3">
                  <h1 className="text-2xl font-bold text-gray-800 tracking-[0.3em]">臺灣民歌鐵路</h1>
                  <p className="text-xs text-gray-500 mt-1 font-mono">TAIWAN FOLK RAILWAY</p>
                </div>
                
                {/* 乘車資訊 */}
                <div className="flex justify-between items-center text-gray-800 font-bold text-xl mb-4">
                  <span>現 在</span>
                  <span className="text-sm">➡</span>
                  <span>回 憶</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600 mb-4 font-mono">
                  <span>車次: 1970</span>
                  <span>座位: 自由座</span>
                </div>

                {/* 影像與心情 */}
                <div className="flex items-end gap-3 mt-auto">
                  <div className="w-20 h-24 border-2 border-gray-400 p-1 bg-white rotate-[-3deg]">
                     <img src={captureImg} alt="passenger" className="w-full h-full object-cover filter sepia contrast-125" />
                  </div>
                  <div className="flex flex-col pb-1">
                    <span className="text-[10px] text-gray-500 tracking-widest">MOOD INDEX</span>
                    <span className="text-3xl font-bold text-red-600 tracking-widest">
                      {moodResult === 'happy' && "晴 朗"}
                      {moodResult === 'sad' && "微 雨"}
                      {moodResult === 'neutral' && "平 靜"}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 font-mono">No. 8830192</div>
              </div>
            </div>
            
            <button onClick={() => setStep('intro')} className="mt-6 text-gray-500 underline hover:text-gray-800 text-sm">重新驗票</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MoodTrainGame;