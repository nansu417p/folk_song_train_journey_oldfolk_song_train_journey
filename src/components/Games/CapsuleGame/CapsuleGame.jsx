import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { TicketCard } from '../MoodTrainGame/MoodTrainGame';

const getTodayFullDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `二零二六年 ${mm}月 ${dd}日`;
};

// ★ 明信片設計 (1280x720) 
// 修正重點：把標籤與標題改為固定高度與 block 顯示，徹底解決 html2canvas 文字位移 Bug。
const PostcardTemplate = ({ song, ticket, selectedCoverImg, customMessage, lyrics }) => {
  const todayDate = getTodayFullDate();

  return (
    <div id="postcard-preview-content" className="w-[1280px] h-[720px] bg-[#FDFBF7] flex flex-row overflow-hidden border-[6px] border-gray-800 shadow-[12px_12px_0_rgba(0,0,0,0.8)] font-serif relative box-border">
      
      {/* ================= 左側：圖樣與圖片區 (寬度 890px) ================= */}
      <div className="w-[890px] h-full flex flex-col relative bg-[#EAEAEA] shrink-0 border-r-[3px] border-gray-300">
        
        {/* 上半區：16:9 封面圖片 */}
        <div className="w-[890px] h-[500px] relative overflow-hidden border-b-[4px] border-gray-800 bg-gray-300 shrink-0 z-30">
          {selectedCoverImg ? (
            <img src={selectedCoverImg} className="w-full h-full object-cover" alt="封面圖" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold tracking-widest text-2xl">無封面圖片</div>
          )}
          
          {/* ★ 修正位移 Bug: 使用固定高度 h-[46px] 和 leading-[38px] 置中，不用 flex */}
          <div className="absolute top-6 left-6 bg-red-600 text-white px-5 h-[46px] leading-[38px] text-center block text-xl tracking-widest font-bold shadow-[4px_4px_0_rgba(0,0,0,0.5)] border-[3px] border-gray-900 -rotate-2">
            民歌記憶．時光修復
          </div>
        </div>

        {/* 下半區：完整心情車票展示區 */}
        <div className="flex-1 w-full p-4 relative bg-[#FDFBF7] flex items-center justify-center overflow-hidden">
           <img 
             src="/images/Capsule_bg.jpg" 
             alt="背景圖樣" 
             className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[110%] opacity-90 z-10 pointer-events-none object-cover" 
           />

           <div className="absolute top-4 left-6 text-gray-800 drop-shadow-sm z-20">
             {/* ★ 修正位移 Bug: 使用固定高度與 leading */}
             <div className="text-xl font-black tracking-widest bg-white/50 px-2 h-[34px] leading-[34px] text-center block rounded backdrop-blur-sm">乘車紀錄</div>
           </div>

           {ticket ? (
             <div className="w-full h-full flex items-center justify-center pt-2 z-20">
                <div className="transform scale-[0.85] origin-center rotate-1 drop-shadow-xl z-20">
                  <TicketCard captureImg={ticket.image} moodResult={ticket.mood} size="normal" />
                </div>
             </div>
           ) : (
             <div className="text-gray-500 border-[4px] border-dashed border-gray-400 w-[60%] h-[70%] flex items-center justify-center text-center rounded font-bold tracking-widest text-xl shadow-inner bg-gray-100 z-20">無心情車票</div>
           )}
        </div>
      </div>

      {/* ================= 中間：撕開處的粗虛線 Separator ================= */}
      <div className="w-[6px] h-full border-l-[4px] border-dashed border-gray-500 relative bg-[#FDFBF7] shrink-0 z-30"></div>

      {/* ================= 右側：主要文字設計 (寬度 384px) ================= */}
      <div className="w-[384px] h-full p-6 flex flex-col bg-[#FDFBF7] relative shrink-0 z-20">
        
        {/* ★ 修正位移 Bug: 加上 leading-none */}
        <div className="text-right text-[12px] text-gray-500 font-bold mb-4 tracking-widest leading-none">臺灣鐵路局</div>
        
        {/* 歌曲與歌手 */}
        <div className="border-b-[4px] border-gray-800 pb-3 mb-4 flex flex-col items-start gap-2">
          <h1 className="text-4xl font-bold font-serif text-gray-900 m-0 tracking-widest text-left text-shadow-[2px_2px_0_rgba(0,0,0,0.1)] leading-none">{song.title}</h1>
          <span className="text-gray-700 font-serif tracking-wider font-bold text-lg text-left leading-none">{song.singer}</span>
        </div>
        
        {/* 留言對話框 */}
        <div className="bg-red-50/80 border-l-[6px] border-red-700 p-4 italic text-gray-800 font-serif min-h-[80px] mb-4 text-sm leading-relaxed shadow-md font-bold">
          「{customMessage || '這是一段專屬於民歌時代的美好回憶。'}」
        </div>

        {/* 歌詞區 */}
        <div className="flex-1 w-full bg-[#EAEAEA] border-[4px] border-gray-800 p-4 pt-10 rounded text-gray-800 font-serif overflow-hidden relative mb-4 shadow-inner flex flex-col">
          {/* ★ 修正位移 Bug: 使用固定高度 h-[32px] 與 leading-[32px] */}
          <div className="absolute top-0 left-0 w-full h-[32px] leading-[32px] text-center block bg-gray-800 text-xs text-white font-bold tracking-widest">
            — 歌詞修復記憶 —
          </div>
          <div className="leading-loose tracking-widest whitespace-pre-wrap text-sm font-bold opacity-80 mt-1 h-full overflow-hidden border-b-2 border-dashed border-gray-400 pb-2">
            {lyrics ? lyrics.content : '記憶尚未修復...'}
          </div>
        </div>

        {/* 底部票證資訊 */}
        <div className="w-full flex flex-col border-t-[4px] border-gray-800 pt-3 shrink-0 bg-[#F9F6F0] p-3 rounded shadow-inner">
          <div className="flex justify-between items-end text-sm text-gray-800 font-black tracking-widest mb-2 border-b-2 border-gray-300 pb-2 leading-none">
            <span>紀念日期</span>
            <span className="text-xs leading-none">{todayDate}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-bold tracking-widest leading-none">
            <span>票種</span>
            <span>特快車．單程紀念聯</span>
          </div>
        </div>

      </div>
    </div>
  );
};

const CapsuleGame = ({ song, ticket, cover, swapped, lyrics, recording, onHome }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedCoverType, setSelectedCoverType] = useState('cover'); 

  const selectedCoverImg = selectedCoverType === 'swapped' && swapped ? swapped.image : (cover ? cover.image : null);

  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      const captureContainer = document.createElement('div');
      captureContainer.style.position = 'fixed';
      captureContainer.style.top = '-9999px';
      captureContainer.style.left = '0';
      document.body.appendChild(captureContainer);

      const previewElement = document.getElementById('postcard-preview-content');
      const clone = previewElement.cloneNode(true);
      captureContainer.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2, 
        useCORS: true, 
        backgroundColor: 'transparent',
        logging: false
      });
      
      const imageURL = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `${song.title}_民歌回憶明信片.png`;
      link.href = imageURL;
      link.click();

      document.body.removeChild(captureContainer);
    } catch (e) {
      alert("圖片生成失敗，請重試！");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAudio = () => {
    if (!recording || !recording.audioUrl) return;
    const link = document.createElement('a');
    link.href = recording.audioUrl;
    link.download = `${song.title}_我的演唱錄音.webm`; 
    link.click();
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-transparent p-8 pt-16 font-sans">
      <div className="w-full max-w-7xl h-[85vh] bg-[#EAEAEA] rounded-xl shadow-2xl border-[4px] border-[#C0B8A3] flex overflow-hidden">
          
         <div className="w-[30%] bg-[#FDFBF7] p-8 border-r-[4px] border-dashed border-gray-400 flex flex-col justify-between z-20 shadow-xl min-w-[320px]">
            <div className="flex flex-col gap-2 shrink-0">
              <h2 className="text-3xl font-bold text-gray-800 tracking-widest font-serif border-b-[3px] border-red-600 pb-2 w-max">回憶封裝桌</h2>
              <p className="text-gray-500 text-sm font-bold tracking-widest mt-2">選擇封面並寫下留言，印製專屬紀念。</p>
            </div>

            <div className="flex flex-col gap-2 mt-6 shrink-0">
               <h3 className="font-bold text-white bg-gray-800 px-3 py-1 rounded w-max text-xs tracking-widest shadow-[2px_2px_0_#4b5563]">步驟一：選擇明信片封面</h3>
               <div className="flex gap-4">
                  <div onClick={() => setSelectedCoverType('cover')} className={`flex-1 cursor-pointer rounded-sm overflow-hidden border-[3px] transition-all ${selectedCoverType === 'cover' ? 'border-red-600 shadow-[4px_4px_0_#7f1d1d] scale-[1.02]' : 'border-gray-400 opacity-60 hover:opacity-100'}`}>
                    {cover ? <img src={cover.image} className="w-full aspect-[16/9] object-cover bg-gray-200" alt="意境封面" /> : <div className="w-full aspect-[16/9] bg-gray-300 flex items-center justify-center text-xs font-bold tracking-widest">無封面</div>}
                    <div className="bg-gray-800 text-white text-center text-xs py-1.5 tracking-widest font-bold border-t-[2px] border-gray-600">意境風景聯</div>
                  </div>
                  <div onClick={() => setSelectedCoverType('swapped')} className={`flex-1 cursor-pointer rounded-sm overflow-hidden border-[3px] transition-all ${selectedCoverType === 'swapped' ? 'border-red-600 shadow-[4px_4px_0_#7f1d1d] scale-[1.02]' : 'border-gray-400 opacity-60 hover:opacity-100'}`}>
                    {swapped ? <img src={swapped.image} className="w-full aspect-[16/9] object-cover bg-gray-200" alt="合照封面" /> : <div className="w-full aspect-[16/9] bg-gray-300 flex items-center justify-center text-xs font-bold tracking-widest">無合照</div>}
                    <div className="bg-gray-800 text-white text-center text-xs py-1.5 tracking-widest font-bold border-t-[2px] border-gray-600">歌手合照聯</div>
                  </div>
               </div>
            </div>

            <div className="flex-1 flex flex-col mt-6">
               <h3 className="font-bold text-white mb-2 bg-gray-800 px-3 py-1 rounded w-max text-xs tracking-widest shadow-[2px_2px_0_#4b5563]">步驟二：寫下心情留言</h3>
               <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="寫下這首歌帶給您的感觸..." className="flex-1 w-full bg-[#EAEAEA] border-[3px] border-gray-400 rounded-sm p-4 font-serif text-gray-800 font-bold resize-none focus:outline-none focus:border-red-600 shadow-inner leading-relaxed text-sm"></textarea>
            </div>

            <div className="flex flex-col gap-4 mt-6 shrink-0">
               <button onClick={handleDownloadImage} disabled={isGenerating} className={`w-full py-4 text-[#FDFBF7] text-base md:text-lg rounded font-bold border-[3px] transition-all tracking-widest flex items-center justify-center ${isGenerating ? 'bg-gray-500 border-gray-600 cursor-wait' : 'bg-red-600 border-red-900 shadow-[4px_4px_0_#7f1d1d] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#7f1d1d]'}`}>
                 {isGenerating ? "正在印製圖片..." : "下載民歌明信片"}
               </button>
               {recording ? (
                 <button onClick={handleDownloadAudio} className="w-full py-3 text-white text-sm md:text-base rounded font-bold border-[3px] border-black shadow-[4px_4px_0_#4b5563] transition-all tracking-widest bg-gray-800 hover:translate-y-[2px] hover:shadow-[2px_2px_0_#4b5563]">下載演唱錄音</button>
               ) : (
                 <div className="w-full py-3 bg-[#FDFBF7] text-gray-500 text-center rounded font-bold text-sm tracking-widest border-[3px] border-gray-400 border-dashed">此次無錄音紀錄</div>
               )}
            </div>
         </div>

         <div className="flex-1 bg-[#C0B8A3] flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-4 left-6 text-gray-600/40 font-bold tracking-widest text-2xl font-serif">印製聯預覽</div>
            <div className="transform scale-[0.45] xl:scale-[0.55] rotate-1 hover:scale-[0.47] xl:hover:scale-[0.57] hover:rotate-0 transition-all duration-500 origin-center drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] cursor-pointer">
               <PostcardTemplate song={song} ticket={ticket} selectedCoverImg={selectedCoverImg} customMessage={customMessage} lyrics={lyrics} />
            </div>
         </div>

      </div>
    </div>
  );
};

export default CapsuleGame;