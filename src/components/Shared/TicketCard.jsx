import React from 'react';

// ★ 心情與對應的天氣設定 (中文)
export const moodSettings = {
  happy: { text: '晴朗', color: 'text-red-600', bgColor: 'bg-red-600' },
  sad: { text: '微雨', color: 'text-blue-700', bgColor: 'bg-blue-600' },
  neutral: { text: '平靜', color: 'text-gray-700', bgColor: 'bg-gray-600' },
};

// 取得今日日期字串作為票號
export const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

// ★ 新版心情車票設計：縮小字體避免超出邊界，加入 shrink-0 確保比例不變
export const TicketCard = ({ captureImg, moodResult, size = "normal" }) => {
  const isLarge = size === "large";
  const currentMood = moodSettings[moodResult] || moodSettings.neutral;
  const todayStr = getTodayString();
  
  // ★ 修正 1: 縮小字體大小
  const stationSize = isLarge ? "text-3xl" : "text-xl";
  const labelSize = isLarge ? "text-[11px]" : "text-[9px]";
  const moodTextSize = isLarge ? "text-2xl" : "text-lg";

  return (
    // 統一風格：厚黑邊框、實心陰影、復古底色。加入 shrink-0
    <div className={`relative ${isLarge ? 'w-[750px] h-[320px]' : 'w-[560px] h-[240px]'} bg-[#FDFBF7] flex flex-row rounded-sm shadow-[8px_8px_0_rgba(0,0,0,0.8)] border-[4px] border-gray-800 overflow-hidden font-serif shrink-0`}>
      
      {/* 左側：大幅心情寫真 (佔比約 55%) */}
      <div className="w-[55%] h-full relative overflow-hidden bg-gray-200 shrink-0 border-r-[2px] border-gray-300">
        {captureImg ? (
          <img src={captureImg} className="w-full h-full object-cover grayscale-[30%] contrast-125" alt="心情寫真" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold tracking-widest text-sm">影像讀取中...</div>
        )}
        
        {/* 左側裝飾性標題 */}
        <div className="absolute bottom-4 left-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20">
           <div className="text-4xl font-black tracking-widest mb-1">時光風景</div>
           <div className="text-sm font-bold opacity-90 tracking-widest">民歌車站．二零二六</div>
        </div>
      </div>

      {/* 中間：撕開處的粗虛線 Separator */}
      <div className="w-[4px] h-full border-l-[3px] border-dashed border-gray-500 relative bg-[#FDFBF7] z-10 shrink-0"></div>

      {/* ★ 右側：重新設計的票根文字聯 (佔比 45%) */}
      <div className="flex-1 h-full flex flex-col p-4 bg-[#F9F6F0] relative">
        
        {/* 頂部：引導文案 */}
        <div className="flex justify-between items-center border-b-2 border-gray-300 pb-2 mb-2">
            <div className={`${labelSize} font-bold text-gray-500 tracking-widest`}>為您記錄此刻</div>
            <div className="text-right text-[10px] font-bold text-gray-500 tracking-widest">臺灣鐵路局</div>
        </div>

        {/* 區塊一：乘車路線 (FROM -> TO) */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-1 relative">
           <div className="flex flex-col items-center justify-center w-full">
             <h2 className={`${stationSize} font-bold text-gray-800 tracking-widest m-0 leading-none`}>民歌車站</h2>
           </div>

           {/* 復古箭頭 */}
           <div className="w-[60%] flex items-center justify-center gap-2 my-1 opacity-60">
             <div className="h-[2px] flex-1 bg-gray-600"></div>
             <div className="text-base font-black text-gray-800 font-sans">至</div>
             <div className="h-[2px] flex-1 bg-gray-600"></div>
           </div>

           <div className="flex flex-col items-center justify-center w-full">
             <h2 className={`${stationSize} font-bold text-gray-800 tracking-widest m-0 leading-none`}>回憶車站</h2>
           </div>
        </div>

        {/* 區塊二：天氣資訊 */}
        <div className="mt-2 flex flex-col items-center justify-center gap-1.5 relative bg-[#FDFBF7] py-2 rounded border-[2px] border-gray-800 shadow-inner">
           <div className={`${labelSize} text-gray-600 font-bold tracking-widest`}>今日天氣</div>
           <div className={`text-center font-black px-6 py-1 rounded text-white tracking-widest ${moodTextSize} ${currentMood.bgColor}`}>
              【{currentMood.text}】
           </div>
        </div>

        {/* 底部：票號 */}
        <div className="mt-auto flex flex-col px-1 pt-2">
           <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 tracking-widest border-t border-gray-300 pt-2">
             <span>乘車票號</span>
             <span className={`font-mono font-bold text-gray-800 ${isLarge ? 'text-sm' : 'text-xs'}`}>
               {todayStr}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};