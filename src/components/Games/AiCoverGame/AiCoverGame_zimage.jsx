import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const API_URL = "https://cory-uninduced-ozell.ngrok-free.dev"; 

const PROMPT_OPTIONS = {
  seasons: [
    { label: "春日暖陽", value: "spring season, warm sunlight, blooming flowers, gentle breeze" },
    { label: "夏日午後", value: "summer afternoon, intense sunlight, cicadas, vibrant green trees" },
    { label: "秋季落葉", value: "autumn season, maple leaves, golden hour, melancholic atmosphere" },
    { label: "冬雨綿綿", value: "winter cold rain, misty grey sky, lonely street reflection" }
  ],
  elements: [
    { label: "木吉他", value: "a wooden acoustic guitar leaning on a tree" },
    { label: "舊窗台", value: "view from an old wooden window frame" },
    { label: "紅磚校園", value: "university campus, old red brick building background" },
    { label: "遼闊大海", value: "calm ocean waves, horizon, sandy beach" },
    { label: "水墨山嵐", value: "foggy mountains, chinese ink painting style background" }
  ],
  styles: [
    { label: "水彩畫", value: "watercolor painting style, soft brush strokes, artistic" },
    { label: "油畫", value: "impasto oil painting texture, rich colors" },
    { label: "復古底片", value: "1970s vintage film photography, film grain, nostalgic vignette" },
    { label: "極簡線條", value: "minimalist line art, vector illustration, clean lines" }
  ]
};

const BASE_PROMPT = "no humans, still life, high quality, masterpiece, best quality, (photorealistic:1.2)";

const AiCoverGame_zimage = ({ song, onBack, onHome }) => {
  const [selections, setSelections] = useState({ season: PROMPT_OPTIONS.seasons[0], element: PROMPT_OPTIONS.elements[0], style: PROMPT_OPTIONS.styles[0] });
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultRef = useRef(null);

  const handleSelect = (category, item) => setSelections(prev => ({ ...prev, [category]: item }));

  const handleGenerate = async () => {
    setIsLoading(true); setGeneratedImage(null);
    const prompt = `${BASE_PROMPT}, a vintage cassette tape object, close up view, painted with (${selections.season.value}) and (${selections.element.value}), text "${song.title}" written on the cassette label in Traditional Chinese calligraphy font, ${selections.style.value}, highly detailed, 8k resolution`.replace(/\s+/g, ' ').trim();
    const payload = { prompt, negative_prompt: "worst quality, lowres, watermark", steps: 8, sampler_name: "Euler", scheduler: "beta", cfg_scale: 3.5, width: 1024, height: 1024, batch_size: 1, override_settings: { sd_model_checkpoint: "z_image_turbo_bf16.safetensors", sd_vae: "ae.safetensors" }};

    try {
      const response = await fetch(`${API_URL}/sdapi/v1/txt2img`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '69420' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`生成失敗`);
      const data = await response.json();
      if (data.images && data.images.length > 0) setGeneratedImage(`data:image/png;base64,${data.images[0]}`);
    } catch (error) { alert(`錯誤: ${error.message}`); } finally { setIsLoading(false); }
  };

  const handleDownload = async () => {
    if (resultRef.current) {
      await document.fonts.ready;
      const canvas = await html2canvas(resultRef.current, { useCORS: true, scale: 2 });
      const link = document.createElement('a'); link.download = `${song.title}_custom_tape.png`; link.href = canvas.toDataURL('image/png'); link.click();
    }
  };

  return (
    <div className="relative w-full h-full bg-transparent flex flex-col lg:flex-row items-center justify-center p-4">
      
      {/* 統一位置與樣式：返回火車 */}
      <button onClick={onHome} className="absolute top-6 left-6 z-50 px-5 py-2.5 bg-[#F5F5F5] text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300 tracking-wide">
        ← 返回火車
      </button>

      {/* 統一位置與樣式：重選歌曲 */}
      <button onClick={onBack} className="absolute top-6 left-44 z-50 px-5 py-2.5 bg-gray-800 text-[#F5F5F5] font-bold rounded-lg shadow hover:bg-gray-700 transition-colors duration-300 tracking-wide hover:-translate-y-1">
        ↺ 重選歌曲
      </button>
      
      <div className="w-full lg:w-1/3 bg-[#F5F5F5] p-8 rounded-lg border border-gray-300 flex flex-col gap-6 z-10 shadow-xl mt-16 lg:mt-0">
         <h2 className="text-3xl font-bold text-gray-800 mb-2">卡帶封面設計師</h2>
         {[ { id: 'seasons', title: '季節氛圍' }, { id: 'elements', title: '核心元素' }, { id: 'styles', title: '藝術風格' } ].map((group) => (
           <div key={group.id}>
             <h3 className="text-red-600 font-bold mb-3 text-sm uppercase tracking-widest">{group.title}</h3>
             <div className="flex flex-wrap gap-2">
               {PROMPT_OPTIONS[group.id].map(item => (
                 <button key={item.label} onClick={() => handleSelect(group.id.slice(0, -1), item)}
                   className={`px-4 py-2 text-sm rounded-lg border transition-all duration-300 ${selections[group.id.slice(0, -1)]?.label === item.label ? 'bg-gray-800 text-[#F5F5F5] shadow-md' : 'bg-[#F5F5F5] text-gray-600 border-gray-300 hover:bg-gray-200 hover:-translate-y-1'}`}>
                   {item.label}
                 </button>
               ))}
             </div>
           </div>
         ))}
         <button onClick={handleGenerate} disabled={isLoading} className="mt-4 w-full py-4 bg-gray-800 text-[#F5F5F5] font-bold rounded-lg shadow-md hover:bg-gray-700 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 text-lg tracking-widest">
           {isLoading ? "🎨 繪製中..." : "✨ 生成卡帶"}
         </button>
      </div>

      <div className="w-full lg:w-2/3 flex flex-col items-center justify-center p-8">
         <div ref={resultRef} className="relative aspect-square w-full max-w-[450px] shadow-xl bg-[#FDFBF7] flex flex-col rounded-lg overflow-hidden border border-gray-300">
            <div className="flex-1 relative bg-gray-200 overflow-hidden flex items-center justify-center">
                {isLoading ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4"><div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div><p className="font-bold tracking-widest">繪製中...</p></div>
                ) : generatedImage ? (
                   <img src={generatedImage} className="w-full h-full object-cover" crossOrigin="anonymous" alt="AI Generated Tape" />
                ) : (
                   <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold"><p>請選擇風格並點擊生成</p></div>
                )}
            </div>
            <div className="h-20 bg-gray-100 flex items-center justify-between px-6 border-t border-gray-300">
               <div><h1 className="text-2xl font-bold text-gray-800 font-serif tracking-widest">{song.title}</h1><p className="text-gray-500 text-xs mt-1 tracking-widest">SIDE A</p></div>
            </div>
         </div>
         {generatedImage && !isLoading && <button onClick={handleDownload} className="mt-8 px-10 py-3 bg-[#F5F5F5] text-gray-800 rounded-lg font-bold shadow hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300 tracking-widest text-lg border border-gray-300">⬇ 下載設計圖</button>}
      </div>
    </div>
  );
};

export default AiCoverGame_zimage;