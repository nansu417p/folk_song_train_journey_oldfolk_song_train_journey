import React, { useState, useRef, useMemo } from 'react';
import { lyricsData } from '../../../data/lyricsData';

// ★ 修正 1：移除 no humans 與 music 等字眼，強調復古攝影與純淨無字
const BASE_PROMPT = "high quality, masterpiece, best quality, 1980s vintage taiwanese photography aesthetic, retro film grain, pure visual art, pure background, strictly no text, completely textless, nostalgic atmosphere, edge-to-edge full illustration, detailed, vibrant";

// ★ 新增：主角設定資料庫
const SUBJECTS_BANK = [
  { label: "純粹風景", value: "pure beautiful scenery, no humans, empty landscape, scenic view" },
  { label: "復古男歌手", value: "1boy, handsome young taiwanese male singer, 1980s retro hairstyle, holding acoustic guitar, looking at viewer, retro portrait photography" },
  { label: "清純女歌手", value: "1girl, beautiful young taiwanese female singer, 1980s retro long hair, gentle smile, looking at viewer, retro portrait photography" }
];

const PROMPT_BANK = {
  'visit_spring': {
    seasons: [ { label: "春日微風", value: "gentle spring breeze, warm light" }, { label: "細雨迷濛", value: "light misty rain, damp atmosphere" }, { label: "山巔晨霧", value: "morning fog on a mountain peak" } ],
    elements: [ { label: "小山巔", value: "a small distant mountain peak" }, { label: "飛散長髮", value: "long black hair blowing in the wind" }, { label: "詩集書篇", value: "an open vintage poetry book" } ]
  },
  'season_rain': {
    seasons: [ { label: "黃昏暮色", value: "golden hour, beautiful sunset sky" }, { label: "雨季陰天", value: "cloudy rainy season, grey sky" }, { label: "迷濛光影", value: "blurry lights through a rainy window" } ],
    elements: [ { label: "彩色緞帶", value: "colorful ribbons floating in the sky" }, { label: "雨中漫步", value: "walking in the rain concept, umbrella" }, { label: "城市霓虹", value: "city neon lights reflecting on wet street" } ]
  },
  'if': {
    seasons: [ { label: "清晨朝霞", value: "early morning sunrise, fresh dew" }, { label: "白雲藍天", value: "fluffy white clouds in a clear blue sky" }, { label: "綺麗星空", value: "beautiful starry night sky" } ],
    elements: [ { label: "青綠小草", value: "green grass with morning dew drops" }, { label: "綿綿細雨", value: "soft gentle rain falling" }, { label: "白色沙灘", value: "clean white sandy beach" } ]
  },
  'morning_wind': {
    seasons: [ { label: "破曉時分", value: "breaking dawn, first light of the day" }, { label: "日落月升", value: "transition from sunset to moonrise" }, { label: "黎明微光", value: "dim light of dawn" } ],
    elements: [ { label: "半開窗門", value: "a half-open wooden window" }, { label: "海浪潮聲", value: "ocean waves crashing on rocks" }, { label: "隨風落葉", value: "leaves blowing in the strong wind" } ]
  },
  'kapok_road': {
    seasons: [ { label: "盛夏高潮", value: "peak of summer, intense heat, vibrant" }, { label: "沉沉夏夜", value: "heavy warm summer night" }, { label: "燃燒夕陽", value: "burning orange sunset" } ],
    elements: [ { label: "紅木棉花", value: "vibrant red kapok flowers blooming" }, { label: "長長街道", value: "a long empty street perspective" }, { label: "遠方公路", value: "highway to California, freedom concept" } ]
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
  
  // ★ 狀態擴充：加入 subjects (主角設定)
  const [currentOptions, setCurrentOptions] = useState({ subjects: [], seasons: [], elements: [], styles: [] });
  const [selections, setSelections] = useState({ subject: null, season: null, element: null, style: null });
  const [customWord, setCustomWord] = useState(''); 
  const resultRef = useRef(null);

  const getRandomItems = (arr, num) => [...arr].sort(() => 0.5 - Math.random()).slice(0, num);

  const handleExtractLyrics = () => {
    const bank = PROMPT_BANK[song.id] || PROMPT_BANK['kapok_road']; 
    setCurrentOptions({ 
      subjects: SUBJECTS_BANK, // 主角選項固定顯示這三種
      seasons: getRandomItems(bank.seasons, 3), 
      elements: getRandomItems(bank.elements, 3), 
      styles: getRandomItems(STYLES_BANK, 3) 
    });
    setSelections({ subject: null, season: null, element: null, style: null });
    setIsExtracted(true);
  };

  const handleSelect = (category, item) => {
    setSelections(prev => ({
      ...prev,
      [category]: prev[category]?.label === item.label ? null : item
    }));
  };

  const triggerGenerate = () => {
    if (coverStatus === 'generating') return;

    const promptParts = [BASE_PROMPT];
    
    // ★ 將玩家選擇的元素依序推入提示詞
    if (selections.subject) promptParts.push(`(${selections.subject.value})`);
    if (selections.element) promptParts.push(`featuring (${selections.element.value})`);
    if (selections.season) promptParts.push(`during (${selections.season.value})`);
    if (selections.style) promptParts.push(`${selections.style.value}`);
    if (customWord.trim()) promptParts.push(`containing (${customWord.trim()})`);
    
    promptParts.push("center composition");

    const prompt = promptParts.join(", ");
    
    const payload = { 
      prompt, 
      // ★ 修正 2：下達死命令，絕對不准出現文字、浮水印、邊框等元素
      negative_prompt: "text, font, letters, typography, writing, signature, watermark, logo, title, words, english letters, chinese characters, gibberish, poster layout, graphic design, worst quality, lowres, ugly, border, frame, white border, padding", 
      steps: 8, 
      sampler_name: "Euler", 
      scheduler: "Beta", 
      cfg_scale: 3.5, 
      width: 1024,  
      height: 720,  
      batch_size: 1,
      alwayson_scripts: {},
      override_settings: {
        "sd_model_checkpoint": "z_image_turbo_bf16.safetensors" 
      },
      override_settings_restore_afterwards: false
    };
    
    onStartGenerate(payload, 'txt2img');
  };

  const handleClaim = () => {
    if (generatedCoverImg && onCoverGenerated) {
      onCoverGenerated(generatedCoverImg); 
    }
  };

  return (
    <div className="relative w-full h-full bg-transparent flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="text-center mb-6 mt-2 shrink-0">
        <h2 className="text-4xl font-bold text-[#FDFBF7] tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] border-b-2 border-red-500 pb-2 inline-block">封面繪製</h2>
        <p className="text-gray-200 mt-4 tracking-wider text-lg drop-shadow-md">從歌詞中萃取靈感，生成專屬專輯</p>
      </div>

      <div className="flex w-full max-w-7xl h-[75vh] gap-8">
        {/* 左側：歌詞區域 */}
        <div className="w-1/4 bg-[#FDFBF7] rounded-xl shadow-lg border-4 border-[#C0B8A3] p-6 flex flex-col relative h-full">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-800 pb-2">{song.title}</h3>
          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 mb-20">
             <pre className="text-sm text-gray-600 leading-relaxed font-serif whitespace-pre-wrap">{currentLyrics}</pre>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <button 
              onClick={handleExtractLyrics} 
              disabled={coverStatus === 'generating'}
              className="w-full py-4 bg-gray-800 text-white font-bold rounded-lg border-2 border-black shadow-[4px_4px_0_#4b5563] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#4b5563] transition-all tracking-widest text-lg flex justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>🔍</span> {isExtracted ? "重新萃取" : "歌詞萃取"}
            </button>
          </div>
        </div>

        {/* 中間：選項區域 (加入了 overflow-hidden 防止撐破，內部加入 overflow-y-auto 提供滾動) */}
        <div className="w-1/3 bg-[#EAEAEA] p-6 rounded-xl border-4 border-gray-300 flex flex-col justify-between items-center shadow-lg h-full overflow-hidden">
            {coverStatus === 'generating' ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-center w-full">
                  <div className="w-16 h-16 border-8 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                  <h3 className="text-2xl font-bold text-gray-800 tracking-widest">畫筆揮灑中...</h3>
                  <p className="text-gray-500 leading-relaxed font-bold">雲端運算約需 10 ~ 20 秒<br/>您可以先回火車大廳等待</p>
                  <button onClick={onHome} className="w-full py-4 mt-4 bg-gray-800 text-white font-bold rounded-lg border-2 border-black shadow-[4px_4px_0_#4b5563] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#4b5563] transition-all tracking-widest">
                      🚂 返回火車等待
                  </button>
              </div>
            ) : !isExtracted ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 font-bold tracking-widest">
                <span className="text-4xl mb-4 opacity-50">✨</span>
                <p>請先點擊左側「歌詞萃取」</p>
              </div>
            ) : (
              <div className="animate-fade-in-up flex flex-col h-full w-full">
                
                {/* ★ 選項滾動區：利用 flex-1 和 overflow-y-auto 讓內容自適應並可滾動 */}
                <div className="w-full flex-1 overflow-y-auto pr-3 pb-4 custom-scrollbar mb-4">
                  <p className="text-xs text-gray-500 mb-6 tracking-wider font-bold">點擊標籤選擇想要的元素，若不選則由 AI 自由發揮。</p>
                  
                  {/* 動態渲染四大選項群組 */}
                  {[ 
                    { id: 'subjects', title: '主角設定' },
                    { id: 'seasons', title: '季節氛圍' }, 
                    { id: 'elements', title: '歌詞元素' }, 
                    { id: 'styles', title: '藝術風格' } 
                  ].map((group) => (
                    <div key={group.id} className="mb-6 w-full">
                      <h3 className="text-red-600 font-bold mb-3 text-sm uppercase tracking-widest border-l-4 border-red-500 pl-2">{group.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentOptions[group.id].map(item => {
                          // slice(0, -1) 是為了將 'subjects' 轉成 'subject' 等單數對應 state
                          const stateKey = group.id.slice(0, -1);
                          const isSelected = selections[stateKey]?.label === item.label;
                          return (
                            <button 
                              key={item.label} 
                              onClick={() => handleSelect(stateKey, item)}
                              className={`px-4 py-2 text-sm font-bold rounded border-2 transition-all duration-300 tracking-wider
                                ${isSelected ? 'bg-red-600 text-white border-red-800 shadow-[2px_2px_0_#7f1d1d] translate-y-[1px]' : 'bg-[#FDFBF7] text-gray-600 border-gray-300 hover:bg-gray-200'}`}
                            >
                              {item.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="mb-2 w-full">
                     <h3 className="text-gray-700 font-bold mb-3 text-sm uppercase tracking-widest border-l-4 border-gray-500 pl-2">自訂意境 (選填)</h3>
                     <input type="text" value={customWord} onChange={(e) => setCustomWord(e.target.value)} placeholder="例如：眼淚、腳踏車..." className="w-full p-4 border-2 border-gray-300 rounded font-serif text-sm focus:outline-none focus:border-red-400 bg-[#FDFBF7]" />
                  </div>
                </div>

                {/* 底部按鈕區：固定在下方不隨選項滾動 */}
                <div className="mt-auto shrink-0 flex flex-col gap-3 w-full">
                  <button onClick={triggerGenerate} className="w-full py-4 bg-red-600 text-white font-bold rounded-lg border-2 border-red-800 shadow-[4px_4px_0_#7f1d1d] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#7f1d1d] transition-all text-lg tracking-widest">
                    ✨ 開始繪製封面
                  </button>
                  <button onClick={() => onSetMockCover(`/images/${song.audioFileName.replace('.mp3', '.jpg')}`)} className="w-full py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition-all text-sm tracking-widest border border-gray-400">
                    載入預設圖片
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* 右側：生成結果區域 */}
        <div className="w-5/12 flex flex-col items-center justify-center p-4 h-full relative">
           <div ref={resultRef} className="relative w-full shadow-2xl bg-gray-200 flex flex-col rounded-lg overflow-hidden border-4 border-[#C0B8A3] transition-all" style={{ aspectRatio: '1024/720' }}>
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
           
           <div className="h-20 mt-8 flex items-center">
             {coverStatus === 'done' && generatedCoverImg && (
               <div className="flex flex-col items-center gap-3 animate-fade-in-up">
                 <button onClick={handleClaim} className="px-10 py-4 bg-gray-800 text-white rounded-lg font-bold border-2 border-black shadow-[4px_4px_0_#4b5563] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#4b5563] transition-all tracking-widest text-lg">
                   🎫 領取封面，前往換臉！
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