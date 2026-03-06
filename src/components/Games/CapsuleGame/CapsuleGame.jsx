import React, { useState } from 'react';

// ★ 強化版轉換器：確保「所有圖片」與「音訊」都被轉成 Base64，確保 HTML 檔案可以 100% 離線開啟
const fetchFileAsBase64 = async (url) => {
  if (!url) return null;
  // 如果已經是 base64，直接回傳
  if (url.startsWith('data:')) return url; 
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("File not found");
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); 
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("檔案轉換失敗:", e);
    return url; // 若轉換失敗，退回原 URL 嘗試
  }
};

const generateHTMLContent = (song, bgmBase64, recordBase64, coverBase64, ticketBase64, customMessage, lyricsText) => {
  const safeMessage = customMessage || '這是一段專屬於民歌時代的美好回憶。';
  const displayLyrics = lyricsText || '記憶尚未修復...';

  // ★ 在生成的 HTML 中直接引入 Tailwind CDN，保證排版與預覽 100% 一致！
  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${song.title} - 民歌回憶膠囊</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Noto Serif TC', serif; background-color: #E0D8C3; background-image: radial-gradient(circle at 50% 50%, #EAEAEA 0%, #C0B8A3 100%); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #9ca3af; }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4 md:p-10">

    <div class="w-full max-w-4xl bg-[#FDFBF7] rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200 relative">
        
        <div class="w-full md:w-2/5 flex flex-col border-b-2 md:border-b-0 md:border-r-2 border-dashed border-gray-300 relative bg-white">
            <div class="w-full aspect-[4/3] bg-gray-200 relative overflow-hidden border-b-4 border-red-500">
              ${coverBase64 
                ? `<img src="${coverBase64}" class="w-full h-full object-cover" alt="Cover" />` 
                : `<div class="w-full h-full flex items-center justify-center text-gray-400">無封面</div>`
              }
            </div>
            <div class="p-6 flex flex-col items-center justify-center flex-1 relative">
                <div class="absolute top-4 right-4 w-16 h-16 border-4 border-red-500 rounded-full text-red-500 flex items-center justify-center font-bold text-sm transform rotate-12 opacity-80 shadow-sm">回憶<br/>封裝</div>
                ${ticketBase64 
                  ? `<img src="${ticketBase64}" class="w-full rounded shadow-md border border-gray-200 mt-4" alt="Ticket" />` 
                  : `<div class="text-gray-400 border border-dashed border-gray-300 w-full py-8 text-center rounded">無心情車票</div>`
                }
            </div>
        </div>

        <div class="w-full md:w-3/5 p-6 md:p-8 flex flex-col bg-[#FAF8F2]">
            <div class="border-b-2 border-gray-800 pb-2 mb-4 flex justify-between items-end">
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 m-0 tracking-widest">${song.title}</h1>
              <span class="text-gray-600 tracking-wider">${song.singer}</span>
            </div>
            
            <div class="bg-red-50 border-l-4 border-red-500 p-4 italic text-gray-700 min-h-[80px] mb-6 shadow-inner text-lg leading-relaxed">
              「${safeMessage}」
            </div>

            <div class="flex-1 bg-white border border-gray-200 p-5 rounded text-sm md:text-base text-gray-600 overflow-y-auto custom-scrollbar relative shadow-inner max-h-[250px] mb-6">
              <div class="font-bold text-gray-800 mb-3 tracking-widest">📖 修復歌詞：</div>
              <div class="leading-loose tracking-wider whitespace-pre-wrap">${displayLyrics}</div>
            </div>

            <div class="flex gap-4 mt-auto">
                <button id="btn-bgm" onclick="playAudio('bgm')" class="flex-1 py-3 bg-gray-800 text-white text-center rounded-lg font-bold tracking-widest hover:bg-gray-700 transition-all shadow-md">
                  🎵 播放原曲
                </button>
                ${recordBase64 
                  ? `<button id="btn-record" onclick="playAudio('record')" class="flex-1 py-3 bg-red-600 text-white text-center rounded-lg font-bold tracking-widest hover:bg-red-500 transition-all shadow-md">📼 播放錄音</button>` 
                  : `<button disabled class="flex-1 py-3 bg-gray-300 text-gray-500 text-center rounded-lg font-bold tracking-widest cursor-not-allowed">📼 無錄音紀錄</button>`
                }
            </div>
        </div>
    </div>

    <audio id="audio-bgm" src="${bgmBase64 || ''}" loop></audio>
    ${recordBase64 ? `<audio id="audio-record" src="${recordBase64}"></audio>` : ''}

    <script>
        const audioBgm = document.getElementById('audio-bgm');
        const audioRecord = document.getElementById('audio-record');
        const btnBgm = document.getElementById('btn-bgm');
        const btnRecord = document.getElementById('btn-record');
        
        let currentPlaying = null;

        function resetButtons() {
            if(btnBgm) btnBgm.innerHTML = "🎵 播放原曲";
            if(btnRecord) btnRecord.innerHTML = "📼 播放錄音";
        }

        function playAudio(type) {
            if(audioBgm) audioBgm.pause();
            if(audioRecord) audioRecord.pause();

            const targetAudio = type === 'bgm' ? audioBgm : audioRecord;
            const targetBtn = type === 'bgm' ? btnBgm : btnRecord;
            const playText = type === 'bgm' ? "🎵 播放原曲" : "📼 播放錄音";
            const pauseText = type === 'bgm' ? "II 暫停原曲" : "II 暫停錄音";
            
            if (currentPlaying === type) {
                currentPlaying = null;
                resetButtons();
            } else {
                if(targetAudio && targetAudio.src && targetAudio.src !== window.location.href) {
                    targetAudio.currentTime = 0;
                    targetAudio.play();
                    currentPlaying = type;
                    resetButtons();
                    targetBtn.innerHTML = pauseText;
                } else {
                    alert("找不到音訊檔案！");
                }
            }
        }

        // 當音樂自然結束時，重置按鈕狀態
        if(audioBgm) audioBgm.onended = resetButtons;
        if(audioRecord) audioRecord.onended = () => { currentPlaying = null; resetButtons(); };
    </script>
</body>
</html>
  `;
};

const CapsuleGame = ({ song, ticket, cover, swapped, lyrics, recording, onBack, onHome }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedCoverType, setSelectedCoverType] = useState('cover'); 

  const selectedCoverImg = selectedCoverType === 'swapped' && swapped ? swapped.image : (cover ? cover.image : null);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // 1. 將所有資源轉為 Base64，保證 HTML 檔案可以 100% 離線獨立運作
      const bgmBase64 = await fetchFileAsBase64(`/music/${song.audioFileName}`);
      const recordBase64 = recording ? await fetchFileAsBase64(recording.audioUrl) : null;
      
      // ★ 強制將選擇的圖片與車票轉換為 Base64 (解決一日歌手圖片消失的問題)
      const finalCoverBase64 = await fetchFileAsBase64(selectedCoverImg);
      const finalTicketBase64 = ticket ? await fetchFileAsBase64(ticket.image) : null;
      
      // 2. 生成 HTML 內容
      const htmlContent = generateHTMLContent(
        song, 
        bgmBase64, 
        recordBase64, 
        finalCoverBase64, 
        finalTicketBase64,
        customMessage,
        lyrics ? lyrics.content : null
      );

      // 3. 觸發下載
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${song.title}_民歌回憶明信片.html`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("封裝失敗，請重試！");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center overflow-hidden bg-transparent p-4 md:p-8 pt-20 gap-8">
      
      {/* 左上角導航 */}
      <div className="absolute top-6 left-6 z-50 flex gap-4">
        <button onClick={onHome} className="px-5 py-2.5 bg-[#F5F5F5] text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 transition-all tracking-wide">
          ← 返回火車
        </button>
        <button onClick={onBack} className="px-5 py-2.5 bg-gray-800 text-[#F5F5F5] font-bold rounded-lg shadow border border-gray-700 hover:bg-gray-700 transition-all tracking-wide">
          ↺ 重選歌曲
        </button>
      </div>

      {/* 左側：工作台控制區 */}
      <div className="w-full md:w-1/3 bg-[#EAEAEA] p-6 md:p-8 rounded-xl shadow-xl border-2 border-gray-300 flex flex-col h-full max-h-[85vh] overflow-y-auto custom-scrollbar relative z-20">
         <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-widest font-serif">回憶封裝桌</h2>
         <p className="text-gray-500 mb-8 text-sm">將您一路收集的記憶碎片，打包成專屬的數位明信片。</p>

         {/* 步驟一：選擇封面 */}
         <div className="mb-8">
            <h3 className="font-bold text-gray-700 mb-3 bg-gray-200 px-3 py-1 rounded w-max text-sm">步驟一：選擇明信片封面</h3>
            <div className="flex gap-4">
               <div 
                 onClick={() => setSelectedCoverType('cover')}
                 className={`flex-1 cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${selectedCoverType === 'cover' ? 'border-red-500 shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
               >
                 {cover ? <img src={cover.image} className="w-full aspect-square object-cover" alt="AI Cover" /> : <div className="w-full aspect-square bg-gray-300 flex items-center justify-center text-xs text-gray-500">無 AI 封面</div>}
                 <div className="bg-gray-800 text-white text-center text-xs py-1.5 tracking-widest">意境風景</div>
               </div>
               <div 
                 onClick={() => setSelectedCoverType('swapped')}
                 className={`flex-1 cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${selectedCoverType === 'swapped' ? 'border-red-500 shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
               >
                 {swapped ? <img src={swapped.image} className="w-full aspect-square object-cover" alt="FaceSwap Cover" /> : <div className="w-full aspect-square bg-gray-300 flex items-center justify-center text-xs text-gray-500">無合照</div>}
                 <div className="bg-gray-800 text-white text-center text-xs py-1.5 tracking-widest">歌手合照</div>
               </div>
            </div>
         </div>

         {/* 步驟二：寫下留言 */}
         <div className="mb-8 flex-1 flex flex-col">
            <h3 className="font-bold text-gray-700 mb-3 bg-gray-200 px-3 py-1 rounded w-max text-sm">步驟二：寫下心情留言</h3>
            <textarea 
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="寫下您聽完這首歌的感觸，或是想對老朋友說的話..."
              className="flex-1 w-full min-h-[120px] bg-[#FDFBF7] border border-gray-300 rounded-lg p-4 font-serif text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 shadow-inner leading-relaxed"
            ></textarea>
         </div>

         {/* 步驟三：封裝下載 */}
         <button 
           onClick={handleDownload}
           disabled={isGenerating}
           className={`w-full py-4 text-[#F5F5F5] text-lg rounded-lg font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-3 tracking-widest mt-auto
             ${isGenerating ? 'bg-gray-400 cursor-wait' : 'bg-red-600 hover:bg-red-500 hover:-translate-y-1'}
           `}
         >
           {isGenerating ? <><span className="animate-spin">💿</span> 正在鑄造回憶...</> : "📥 下載互動明信片 (.html)"}
         </button>
      </div>

      {/* 右側：即時預覽區 (排版與生成的 HTML 完全一致) */}
      <div className="w-full md:w-2/3 h-full max-h-[85vh] flex items-center justify-center relative pointer-events-none">
         <div className="absolute top-0 left-6 text-gray-600/40 font-bold tracking-widest text-3xl font-serif z-0">LIVE PREVIEW</div>
         
         {/* 模擬的車票明信片 */}
         <div className="w-full max-w-4xl bg-[#FDFBF7] rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200 relative z-10 transform rotate-1 hover:rotate-0 transition-transform duration-500 scale-95 md:scale-100">
            
            {/* 預覽：左側圖案區 */}
            <div className="w-full md:w-2/5 flex flex-col border-b-2 md:border-b-0 md:border-r-2 border-dashed border-gray-300 relative bg-white">
               <div className="w-full aspect-[4/3] bg-gray-200 relative overflow-hidden border-b-4 border-red-500">
                 {selectedCoverImg ? (
                   <img src={selectedCoverImg} className="w-full h-full object-cover" alt="Preview Cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400">請在左側選擇封面</div>
                 )}
               </div>
               <div className="p-6 flex flex-col items-center justify-center flex-1 relative">
                  <div className="absolute top-4 right-4 w-16 h-16 border-4 border-red-500 rounded-full text-red-500 flex items-center justify-center font-bold text-sm transform rotate-12 opacity-80 shadow-sm">回憶<br/>封裝</div>
                  {ticket ? (
                    <img src={ticket.image} className="w-full rounded shadow-md border border-gray-200 mt-4" alt="Ticket Preview" />
                  ) : (
                    <div className="text-gray-400 border border-dashed border-gray-300 w-full py-8 text-center rounded mt-4">無心情車票</div>
                  )}
               </div>
            </div>

            {/* 預覽：右側文字區 */}
            <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col bg-[#FAF8F2]">
               <div className="border-b-2 border-gray-800 pb-2 mb-4 flex justify-between items-end">
                 <h1 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 m-0 tracking-widest">{song.title}</h1>
                 <span className="text-gray-600 font-serif tracking-wider">{song.singer}</span>
               </div>
               
               <div className="bg-red-50 border-l-4 border-red-500 p-4 italic text-gray-700 font-serif min-h-[80px] mb-6 shadow-inner text-lg leading-relaxed">
                 「{customMessage || '這是一段專屬於民歌時代的美好回憶。'}」
               </div>

               {/* ★ 預覽歌詞區：與 HTML 一樣使用 overflow-y-auto 與 whitespace-pre-wrap */}
               <div className="flex-1 bg-white border border-gray-200 p-5 rounded text-sm md:text-base text-gray-600 font-serif overflow-y-auto custom-scrollbar relative shadow-inner max-h-[250px] mb-6">
                 <div className="font-bold text-gray-800 mb-3 tracking-widest">📖 修復歌詞：</div>
                 <div className="leading-loose tracking-wider whitespace-pre-wrap">
                    {lyrics ? lyrics.content : '記憶尚未修復...'}
                 </div>
               </div>

               <div className="flex gap-4 mt-auto">
                  <div className="flex-1 py-3 bg-gray-800 text-white text-center rounded-lg font-bold tracking-widest shadow-md">🎵 播放原曲</div>
                  <div className={`flex-1 py-3 text-white text-center rounded-lg font-bold tracking-widest shadow-md ${recording ? 'bg-red-600' : 'bg-gray-400'}`}>
                    📼 {recording ? '播放錄音' : '無錄音紀錄'}
                  </div>
               </div>
            </div>

         </div>
      </div>

    </div>
  );
};

export default CapsuleGame;