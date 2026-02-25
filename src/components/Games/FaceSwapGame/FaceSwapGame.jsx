import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const API_URL = "https://cory-uninduced-ozell.ngrok-free.dev"; 

const TEMPLATES = [
  { id: 'spring', title: '拜訪春天', singer: '施孝榮', imgSrc: '/images/cover-spring.jpg', faceCount: 4 },
  { id: 'wood', title: '木棉道', singer: '王夢麟', imgSrc: '/images/cover-wood.jpg', faceCount: 1 }
];

const FaceSwapGame = ({ onBack }) => {
  const webcamRef = useRef(null);
  const [step, setStep] = useState('select'); 
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [base64Template, setBase64Template] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template);
    try {
      const response = await fetch(template.imgSrc);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => { setBase64Template(reader.result.split(',')[1]); setStep('capture'); };
      reader.readAsDataURL(blob);
    } catch (err) { alert("無法載入封面圖"); }
  };

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot({width: 512, height: 512}); 
    if (imageSrc && base64Template) {
      setStep('processing'); setIsLoading(true);
      try { await swapFace(imageSrc.split(',')[1], base64Template); } 
      catch (error) { alert(`換臉失敗: ${error.message}`); setStep('capture'); } 
      finally { setIsLoading(false); }
    }
  };

  const swapFace = async (source, target) => {
    const count = selectedTemplate.faceCount || 1; 
    const payload = { source_image: source, target_image: target, source_faces_index: Array(count).fill(0), face_index: Array.from({length: count}, (_, i) => i), upscaler: "None", scale: 1, codeformer_fidelity: 0.5, restore_face: true, gender_source: 0, gender_target: 0 };
    const response = await fetch(`${API_URL}/reactor/image`, { method: "POST", headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "69420" }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    setResultImage(`data:image/png;base64,${data.image}`);
    setStep('result');
  };

  return (
    <div className="w-full h-full bg-transparent flex flex-col items-center justify-center relative p-4">
      
      {/* 統一位置與樣式 */}
      <button onClick={onBack} className="absolute top-6 left-6 z-50 px-5 py-2.5 bg-[#F5F5F5]/90 text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300 tracking-wide">
        ← 返回火車
      </button>

      {step === 'select' && (
        <div className="flex flex-col items-center gap-8 max-w-5xl">
          <h2 className="text-4xl font-bold mb-4 text-gray-800 drop-shadow-md">請選擇一張經典封面</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TEMPLATES.map(t => (
              <div key={t.id} onClick={() => handleSelectTemplate(t)} className="bg-[#F5F5F5]/95 rounded-lg overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 border border-gray-300 shadow-md hover:shadow-xl group">
                <img src={t.imgSrc} alt={t.title} className="w-full h-64 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-800">{t.title}</h3>
                  <p className="text-gray-500 mt-1">{t.singer}</p>
                  <span className="text-xs bg-gray-200 border border-gray-300 text-gray-700 px-3 py-1 rounded-lg mt-3 inline-block font-bold tracking-widest">👥 {t.faceCount} 人合唱</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'capture' && (
        <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
          <div className="relative border-8 border-gray-200 bg-gray-100 rounded-lg overflow-hidden w-full aspect-video max-w-2xl shadow-xl">
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width={512} height={512} className="w-full h-full object-cover" mirrored={true} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-48 h-64 border-4 border-white/80 border-dashed rounded-[50%]"></div></div>
          </div>
          <button onClick={capture} className="px-12 py-4 bg-gray-800 text-white text-2xl rounded-lg font-bold shadow hover:bg-gray-700 hover:-translate-y-1 transition-all duration-300 tracking-widest">📸 變身主角</button>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center flex flex-col items-center bg-[#F5F5F5]/95 p-12 rounded-lg border border-gray-300 shadow-xl">
          <div className="w-20 h-20 border-8 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-8"></div>
          <h2 className="text-4xl font-bold mb-4 text-gray-800">AI 正在融合五官...</h2>
          <p className="text-gray-600 text-lg">正在處理 {selectedTemplate.faceCount} 張臉孔</p>
        </div>
      )}

      {step === 'result' && resultImage && (
        <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
          <h2 className="text-4xl font-bold text-gray-800 drop-shadow-sm">✨ 換臉完成！</h2>
          <div className="flex gap-8 items-center justify-center flex-wrap bg-[#F5F5F5]/90 p-8 rounded-lg border border-gray-300 shadow-xl w-full">
             <div className="hidden md:block opacity-80"><p className="text-center mb-3 font-bold tracking-widest text-sm text-gray-600">原版</p><img src={selectedTemplate.imgSrc} className="h-64 rounded-lg shadow-sm border border-gray-200" alt="Original" /></div>
             <div className="hidden md:block text-4xl text-gray-400 font-bold">➔</div>
             <div className="relative shadow-2xl border-4 border-white rounded-lg overflow-hidden max-h-[50vh]"><img src={resultImage} alt="Result" className="max-h-full object-contain" /></div>
          </div>
          <div className="flex gap-6 mt-4">
             <button onClick={() => setStep('select')} className="px-8 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 text-lg shadow hover:-translate-y-1">🔄 換一張</button>
             <a href={resultImage} download={`faceswap.png`} className="px-12 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-700 transition-all duration-300 shadow-lg flex items-center gap-2 text-lg hover:-translate-y-1">💾 下載相片</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceSwapGame;