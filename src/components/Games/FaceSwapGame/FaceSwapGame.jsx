import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

const FaceSwapGame = ({ song, onHome, faceswapStatus, generatedSwappedImg, onStartGenerate, onSetMockSwap, onSwapGenerated }) => {
  const webcamRef = useRef(null);
  
  const [base64Template, setBase64Template] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch(`/images/${song.audioFileName.replace('.mp3', '.jpg')}`);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setBase64Template(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("無法讀取封面:", err);
      }
    };
    if (song && song.hasFace && faceswapStatus === 'idle') {
      loadTemplate();
    }
  }, [song, faceswapStatus]);

  const handleCaptureAndSwap = async () => {
    if (!webcamRef.current || !base64Template) return;
    
    const imageSrc = webcamRef.current.getScreenshot({width: 1024, height: 720}); 
    if (imageSrc) {
      const sourceB64 = imageSrc.split(',')[1];
      const count = song.faceCount || 1;
      
      const payload = { 
        source_image: sourceB64, 
        target_image: base64Template, 
        source_faces_index: Array(count).fill(0), 
        face_index: Array.from({length: count}, (_, i) => i), 
        upscaler: "None", 
        scale: 1, 
        codeformer_fidelity: 0.5, 
        restore_face: true, 
        gender_source: 0, 
        gender_target: 0 
      };
      
      onStartGenerate(payload);
    }
  };

  const handleClaim = () => {
    if (onSwapGenerated && generatedSwappedImg) {
      setIsClaiming(true);
      onSwapGenerated(generatedSwappedImg);
    }
  };

  return (
    <div className="relative w-full h-full bg-transparent flex flex-col items-center justify-center p-8 overflow-hidden">
      
      <div className="text-center mb-8 mt-4">
        <h2 className="text-4xl font-bold text-[#FDFBF7] tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] border-b-2 border-red-500 pb-2 inline-block">一日歌手</h2>
        <p className="text-gray-200 mt-4 tracking-wider text-lg drop-shadow-md">化身經典封面主角，重溫那年的青春</p>
      </div>

      <div className="flex w-full max-w-[80vw] h-[65vh] gap-8 items-center justify-center">
        
        <div className="w-1/2 flex flex-col items-center bg-[#FDFBF7] rounded-xl shadow-xl border-4 border-[#C0B8A3] p-6 h-full">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-800 pb-2 w-full text-center tracking-widest">
            經典原版封面
          </h3>
          <div className="w-full relative shadow-inner border-4 border-gray-300 bg-[#EAEAEA] flex-1 flex items-center justify-center overflow-hidden" style={{ aspectRatio: '1024/720' }}>
            <img src={`/images/${song.audioFileName.replace('.mp3', '.jpg')}`} alt="Original Cover" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="w-1/2 flex flex-col items-center bg-[#EAEAEA] rounded-xl shadow-xl border-4 border-gray-300 p-6 h-full">
          
          {faceswapStatus === 'generating' ? (
             <div className="w-full h-full flex flex-col items-center justify-center text-center animate-pulse gap-6">
                <div className="w-16 h-16 border-8 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                <h3 className="text-2xl font-bold text-gray-800 tracking-widest">封面融合中...</h3>
                <p className="text-gray-600 leading-relaxed font-bold">正在處理您的五官，約需 5 ~ 10 秒。<br/>您可以先回火車大廳等待，好了會提醒您！</p>
                {/* ★ 補回返回按鈕 */}
                <button onClick={onHome} className="w-[80%] py-4 mt-4 bg-gray-800 text-white font-bold rounded-lg border-2 border-black shadow-[4px_4px_0_#4b5563] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#4b5563] transition-all tracking-widest">
                    🚂 返回火車等待
                </button>
             </div>
          ) : faceswapStatus === 'done' && generatedSwappedImg ? (
             <div className="w-full h-full flex flex-col items-center animate-fade-in-up">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-800 pb-2 w-full text-center tracking-widest">
                  您的專屬封面
                </h3>
                <div className="w-full relative shadow-xl border-4 border-white bg-gray-200 flex-1 flex items-center justify-center overflow-hidden" style={{ aspectRatio: '1024/720' }}>
                  <img src={generatedSwappedImg} alt="Swapped" className="w-full h-full object-contain" />
                </div>
                <div className="mt-6 w-full flex justify-center">
                  <button onClick={handleClaim} disabled={isClaiming} className="w-[80%] py-4 bg-red-600 text-white rounded-lg font-bold border-2 border-red-800 shadow-[4px_4px_0_#7f1d1d] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#7f1d1d] transition-all tracking-widest text-lg disabled:opacity-50">
                    {isClaiming ? "⏳ 封裝中..." : "🎫 領取專屬封面"}
                  </button>
                </div>
             </div>
          ) : (
             <div className="w-full h-full flex flex-col items-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-800 pb-2 w-full text-center tracking-widest">
                  準備拍攝
                </h3>
                
                <div className="w-full relative shadow-inner border-[4px] border-gray-800 bg-gray-300 flex-1 flex items-center justify-center overflow-hidden rounded-lg" style={{ aspectRatio: '1024/720' }}>
                  <Webcam 
                    ref={webcamRef} 
                    screenshotFormat="image/jpeg" 
                    width={1024} 
                    height={720} 
                    videoConstraints={{ aspectRatio: 1024 / 720 }}
                    className="w-full h-full object-cover" 
                    mirrored={true} 
                    onUserMedia={() => setIsCameraReady(true)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[35%] h-[60%] border-4 border-white/80 border-dashed rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
                  </div>
                  {!isCameraReady && (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 font-bold tracking-widest">
                      啟動相機中...
                    </div>
                  )}
                </div>
                
                <div className="w-full text-center mt-4 mb-4">
                   <span className="bg-[#FDFBF7] text-gray-800 border-2 border-gray-400 px-6 py-2 rounded-lg shadow-[2px_2px_0_#9ca3af] font-bold tracking-widest text-sm inline-block">
                     📷 請將臉部對準虛線框內
                   </span>
                </div>
                
                <div className="flex w-full gap-4 mt-auto">
                  <button 
                    onClick={handleCaptureAndSwap} 
                    disabled={!isCameraReady || !base64Template} 
                    className="flex-1 py-4 bg-gray-800 text-white rounded-lg border-2 border-black shadow-[4px_4px_0_#4b5563] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#4b5563] transition-all tracking-widest text-lg font-bold disabled:opacity-50"
                  >
                    📸 拍下照片並融合
                  </button>
                  <button 
                    onClick={() => onSetMockSwap(`/images/${song.audioFileName.replace('.mp3', '.jpg')}`)}
                    className="px-6 py-4 bg-[#FDFBF7] text-gray-800 font-bold rounded-lg border-2 border-gray-400 shadow-[4px_4px_0_#9ca3af] hover:bg-gray-100 hover:translate-y-[2px] hover:shadow-[2px_2px_0_#9ca3af] transition-all tracking-widest"
                  >
                    預設封面
                  </button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceSwapGame;