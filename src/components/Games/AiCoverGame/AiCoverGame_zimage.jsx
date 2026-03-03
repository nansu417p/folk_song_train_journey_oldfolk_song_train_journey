import React, { useState, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { lyricsData } from '../../../data/lyricsData';

// ★ 修正：從 BASE_PROMPT 中徹底移除 "album cover scenery" (專輯封面風景)。
// 舊的 prompt 可能導致 AI 生成實體專輯邊框。新的 prompt 聚焦於生成滿版的優美復古風景插畫。
const BASE_PROMPT = "no humans, high quality, masterpiece, best quality, beautiful retro folk music illustrative scenery, nostalgic atmosphere, composition focused, edge-to-edge full landscape illustration, detailed, vibrant";

const PROMPT_BANK = {
  'visit_spring': {
    seasons: [ { label: "春日微風", value: "gentle spring breeze, warm light" }, { label: "細雨迷濛", value: "light misty rain, damp atmosphere" }, { label: "山巔晨霧", value: "morning fog on a mountain peak" }, { label: "詩意午後", value: "poetic afternoon, soft sunbeams" } ],
    elements: [ { label: "小山巔", value: "a small distant mountain peak" }, { label: "飛散長髮", value: "long black hair blowing in the wind" }, { label: "詩集書篇", value: "an open vintage poetry book" }, { label: "雨滴", value: "raindrops falling gently" } ]
  },
  'season_rain': {
    seasons: [ { label: "黃昏暮色", value: "golden hour, beautiful sunset sky" }, { label: "雨季陰天", value: "cloudy rainy season, grey sky" }, { label: "迷濛光影", value: "blurry lights through a rainy window" }, { label: "冷冽街頭", value: "cold rainy street atmosphere" } ],
    elements: [ { label: "彩色緞帶", value: "colorful ribbons floating in the sky" }, { label: "雨中漫步", value: "walking in the rain concept, umbrella" }, { label: "消失的足跡", value: "fading footprints on a wet road" }, { label: "城市霓虹", value: "city neon lights reflecting on wet street" } ]
  },
  'if': {
    seasons: [ { label: "清晨朝霞", value: "early morning sunrise, fresh dew" }, { label: "白雲藍天", value: "fluffy white clouds in a clear blue sky" }, { label: "微風拂曉", value: "gentle morning breeze" }, { label: "綺麗星空", value: "beautiful starry night sky" } ],
    elements: [ { label: "青綠小草", value: "green grass with morning dew drops" }, { label: "綿綿細雨", value: "soft gentle rain falling" }, { label: "遼闊大海", value: "vast calm blue ocean" }, { label: "白色沙灘", value: "clean white sandy beach" } ]
  },
  'morning_wind': {
    seasons: [ { label: "破曉時分", value: "breaking dawn, first light of the day" }, { label: "日落月升", value: "transition from sunset to moonrise" }, { label: "黎明微光", value: "dim light of dawn" }, { label: "無盡永恆", value: "timeless, ethereal atmosphere" } ],
    elements: [ { label: "半開窗門", value: "a half-open wooden window" }, { label: "海浪潮聲", value: "ocean waves crashing on rocks" }, { label: "隨風落葉", value: "leaves blowing in the strong wind" }, { label: "晨間日光", value: "sunrays shining through a window" } ]
  },
  'kapok_road': {
    seasons: [ { label: "盛夏高潮", value: "peak of summer, intense heat, vibrant" }, { label: "沉沉夏夜", value: "heavy warm summer night" }, { label: "燃燒夕陽", value: "burning orange sunset" }, { label: "夢中回憶", value: "nostalgic dream-like memory" } ],
    elements: [ { label: "紅木棉花", value: "vibrant red kapok flowers blooming" }, { label: "長長街道", value: "a long empty street perspective" }, { label: "遠方公路", value: "highway to California, freedom concept" }, { label: "凋謝落花", value: "withered flowers falling on the street" } ]
  }
};

const STYLES_BANK = [
  { label: "水彩暈染", value: "watercolor painting style, soft brush strokes, artistic" },
  { label: "厚塗油畫", value: "impasto oil painting texture, rich vivid colors" },
  { label: "復古底片", value: "1970s vintage film photography, film grain, nostalgic vignette, polaroid" },
  { label: "極簡線條", value: "minimalist line art, clean vector illustration, white background" }
];

const AiCoverGame_zimage = ({ song, onHome, coverStatus, generatedCoverImg, onStartGenerate, onSetMockCover, onCoverGenerated }) => {
  
  const currentLyrics = useMemo(() => lyricsData[song.id] || "（找不到歌詞）", [song.id]);
  
  const [isExtracted, setIsExtracted] = useState(false);
  const [currentOptions, setCurrentOptions] = useState({ seasons: [], elements: [], styles: [] });
  const [selections, setSelections] = useState({ season: null, element: null, style: null });
  const [customWord, setCustomWord] = useState(''); 
  const [isClaiming, setIsClaiming] = useState(false); 
  const resultRef = useRef(null);

  const getRandomItems = (arr, num) => [...arr].sort(() => 0.5 - Math.random()).slice(0, num);

  const handleExtractLyrics = () => {
    const bank = PROMPT_BANK[song.id] || PROMPT_BANK['kapok_road']; 
    const randomSeasons = getRandomItems(bank.seasons, 4);
    const randomElements = getRandomItems(bank.elements, 4);
    const randomStyles = getRandomItems(STYLES_BANK, 4);

    setCurrentOptions({ seasons: randomSeasons, elements: randomElements, styles: randomStyles });
    setSelections({ season: randomSeasons[0], element: randomElements[0], style: randomStyles[0] });
    setIsExtracted(true);
  };

  const handleSelect = (category, item) => setSelections(prev => ({ ...prev, [category]: item }));

  const triggerGenerate = () => {
    const customPromptPart = customWord.trim() ? `, containing (${customWord.trim()})` : '';
    
    // 將 illegal 的 JSX 註解修正為標準 JavaScript 註解
    // ★ 優化 Prompt：徹底拔除 Typography 要求，這裡只處理內容
    const prompt = `${BASE_PROMPT}, featuring (${selections.element.value}) during (${selections.season.value})${customPromptPart}, ${selections.style.value}, center composition`.replace(/\s+/g, ' ').trim();
    
    // ★ 修正：強化負面提示詞（negative_prompt）。
    // 我們明確加入 "frame", "white border", "black border", "vignetting", "matting" 等詞，強烈抑制任何邊框生成。
    const payload = { 
      prompt, 
      negative_prompt: "worst quality, lowres, watermark, text, writing, typography, chinese characters, letters, ugly, 3d, border, frame, white border, black border, vignetting, matting, padding", 
      steps: 8, 
      sampler_name: "Euler", 
      scheduler: "Beta", 
      cfg_scale: 3.5, 
      width: 512, 
      height: 512, 
      batch_size: 1 
    };
    onStartGenerate(payload);
  };

  const handleClaim = async () => {
    if (resultRef.current && onCoverGenerated) {
      setIsClaiming(true);
      try {
        await document.fonts.ready;
        {/* ★ 優化：加入稍微延遲，確保 html2canvas 對純淨圖片的抓取穩定 */}
        setTimeout(async () => {
          const canvas = await html2canvas(resultRef.current, { useCORS: true, scale: 2 });
          onCoverGenerated(canvas.toDataURL('image/png')); 
          setIsClaiming(false);
        }, 100);
      } catch (err) {
        console.error("截圖失敗:", err);
        setIsClaiming(false);
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-transparent flex flex-col items-center p-8 overflow-hidden">
      
      <button onClick={onHome} className="absolute top-6 left-6 z-50 px-5 py-2.5 bg-[#F5F5F5] text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300 tracking-wide">
        ← 返回火車
      </button>

      <div className="text-center mb-6 mt-8">
        <h2 className="text-4xl font-bold text-gray-800 tracking-widest drop-shadow-sm">封面繪製</h2>
        <p className="text-gray-600 mt-2 tracking-wider">從歌詞中萃取靈感，生成專屬專輯</p>
      </div>

      <div className="flex w-full max-w-7xl h-[65vh] gap-6">
        
        {/* 左側：歌詞本 */}
        <div className="w-1/4 bg-[#FDFBF7] rounded-lg shadow-lg border border-gray-300 p-6 flex flex-col relative">
          <h3 className="text-xl font-bold text-gray-800 mb-2 border-b border-gray-300 pb-2">{song.title}</h3>
          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 mb-16">
             <pre className="text-sm text-gray-600 leading-relaxed font-serif whitespace-pre-wrap">{currentLyrics}</pre>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <button onClick={handleExtractLyrics} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-500 hover:-translate-y-1 transition-all duration-300 tracking-widest text-lg flex justify-center gap-2">
              <span>🔍</span> {isExtracted ? "重新萃取" : "歌詞萃取"}
            </button>
          </div>
        </div>

        {/* 中間：選項區 or 等待區 */}
        <div className="w-1/3 bg-[#F5F5F5] p-6 rounded-lg border border-gray-300 flex flex-col justify-center items-center shadow-lg overflow-y-auto custom-scrollbar relative">
           
           {coverStatus === 'generating' ? (
             <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in-up text-center w-full">
                 <div className="w-16 h-16 border-8 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                 <h3 className="text-2xl font-bold text-gray-800 tracking-widest">畫筆揮灑中...</h3>
                 <p className="text-gray-500 leading-relaxed font-bold">雲端運算約需 10 ~ 20 秒<br/>您可以先回火車大廳等待，畫好會提醒您！</p>
                 <button onClick={onHome} className="w-full py-4 mt-4 bg-gray-800 text-white font-bold rounded-lg shadow hover:bg-gray-700 transition-all tracking-widest border border-gray-600">
                     🚂 返回火車等待
                 </button>
             </div>
           ) : !isExtracted ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 font-bold tracking-widest">
               <span className="text-4xl mb-4 opacity-50">✨</span>
               <p>請先點擊左側「歌詞萃取」</p>
             </div>
           ) : (
             <div className="animate-fade-in-up flex flex-col h-full w-full">
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                 {[ { id: 'seasons', title: '季節氛圍' }, { id: 'elements', title: '歌詞元素' }, { id: 'styles', title: '藝術風格' } ].map((group) => (
                   <div key={group.id} className="mb-5 w-full">
                     <h3 className="text-red-600 font-bold mb-2 text-sm uppercase tracking-widest border-l-4 border-red-500 pl-2">{group.title}</h3>
                     <div className="flex flex-wrap gap-2">
                       {currentOptions[group.id].map(item => (
                         <button key={item.label} onClick={() => handleSelect(group.id.slice(0, -1), item)}
                           className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-300 ${selections[group.id.slice(0, -1)]?.label === item.label ? 'bg-gray-800 text-[#F5F5F5] shadow-md border-gray-800' : 'bg-[#FDFBF7] text-gray-600 border-gray-300 hover:bg-gray-200'}`}>
                           {item.label}
                         </button>
                       ))}
                     </div>
                   </div>
                 ))}

                 <div className="mb-4 w-full">
                    <h3 className="text-gray-700 font-bold mb-2 text-sm uppercase tracking-widest border-l-4 border-gray-500 pl-2">自訂意境 (選填)</h3>
                    <input type="text" value={customWord} onChange={(e) => setCustomWord(e.target.value)} placeholder="例如：眼淚、腳踏車..." className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-[#FDFBF7]" />
                 </div>
               </div>

               <div className="mt-4 flex flex-col gap-2 w-full">
                 <button onClick={triggerGenerate} className="w-full py-4 bg-gray-800 text-[#F5F5F5] font-bold rounded-lg shadow hover:bg-gray-700 transition-all text-lg tracking-widest">
                   ✨ 開始繪製封面
                 </button>
                 <button onClick={() => onSetMockCover(`/images/${song.audioFileName.replace('.mp3', '.jpg')}`)} className="w-full py-2 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition-all text-sm tracking-widest border border-gray-400">
                   載入預設圖片 (測試用)
                 </button>
               </div>
             </div>
           )}
        </div>

        {/* 右側：生成結果 */}
        <div className="w-5/12 flex flex-col items-center justify-center p-4 h-full relative">
           
           {/* ★ 終極修復：拔除所有 HTML 文字疊加層，這裡只顯示純圖片。 */}
           <div ref={resultRef} className="relative aspect-square w-full max-w-[400px] shadow-2xl bg-gray-200 flex flex-col rounded-lg overflow-hidden border-[6px] border-white transition-all">
              
              {coverStatus === 'done' && generatedCoverImg ? (
                 <img src={generatedCoverImg} className="w-full h-full object-cover animate-fade-in" crossOrigin="anonymous" alt="AI Generated Cover" />
              ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 font-bold gap-3 opacity-50">
                   {coverStatus === 'generating' ? (
                     <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                   ) : (
                     <span className="text-4xl">🖌️</span>
                   )}
                 </div>
              )}
           </div>
           
           <div className="h-16 mt-6 flex items-center">
             {coverStatus === 'done' && generatedCoverImg && (
               <div className="flex flex-col items-center gap-2 animate-fade-in-up">
                 {/* 这里的文字是網頁 UI，不是要拍下來的 */}
                 <p className="text-gray-100 font-bold tracking-widest text-sm drop-shadow-md">✨ 生成完成！點擊領取</p>
                 <button onClick={handleClaim} disabled={isClaiming} className="px-10 py-3 bg-red-600 text-white rounded-lg font-bold shadow-lg hover:bg-red-500 hover:-translate-y-1 transition-all duration-300 tracking-widest text-lg border-2 border-red-400 disabled:opacity-50 m-0">
                   {isClaiming ? "⏳ 封裝中..." : "🎫 領取封面"}
                 </button>
               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default AiCoverGame_zimage;