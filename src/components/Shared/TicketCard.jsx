import React from 'react';

const TicketCard = ({ captureImg, moodResult, size = 'normal' }) => {
  const isMini = size === 'mini';

  // 定義 3 種心情的視覺主題 (背景、邊框、文字顏色、浮水印)
  const themeStyles = {
    happy: {
      bg: 'bg-orange-50',
      border: 'border-orange-600',
      textMain: 'text-orange-900',
      textSub: 'text-orange-700',
      stamp: 'text-red-600 border-red-600',
      pattern: 'bg-[radial-gradient(#fdba74_1px,transparent_1px)]'
    },
    sad: {
      bg: 'bg-blue-50',
      border: 'border-blue-600',
      textMain: 'text-blue-900',
      textSub: 'text-blue-700',
      stamp: 'text-blue-800 border-blue-800',
      pattern: 'bg-[radial-gradient(#93c5fd_1px,transparent_1px)]'
    },
    neutral: {
      bg: 'bg-[#FDFBF7]',
      border: 'border-[#8B7355]',
      textMain: 'text-[#4A3728]',
      textSub: 'text-[#6B543F]',
      stamp: 'text-red-700 border-red-700',
      pattern: 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]'
    }
  };

  const currentTheme = themeStyles[moodResult] || themeStyles.neutral;

  // 取得心情對應的文字
  const getMoodText = () => {
    if (moodResult === 'happy') return '晴 朗';
    if (moodResult === 'sad') return '微 雨';
    if (moodResult === 'neutral') return '平 靜';
    return '待 測';
  };

  return (
    <div className={`relative shadow-2xl flex flex-row overflow-hidden border-2 bg-white
      ${currentTheme.border} 
      ${isMini ? 'w-[260px] h-[120px] p-1' : 'w-[520px] h-[240px] p-2'}
    `}>
      
      {/* 復古車票底紋 */}
      <div className={`absolute inset-0 opacity-30 ${currentTheme.pattern} [background-size:16px_16px] pointer-events-none`}></div>

      {/* 左側：照片區 (佔 40%) */}
      <div className="w-[40%] h-full relative z-10 flex flex-col p-1 border-r-2 border-dashed border-gray-400">
         <div className={`w-full h-full bg-gray-200 overflow-hidden border-2 ${currentTheme.border}`}>
            {captureImg ? (
              <img src={captureImg} alt="passenger" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">👤</div>
            )}
         </div>
         {/* 左下角小流水號 */}
         <div className={`absolute bottom-2 left-2 font-mono font-bold tracking-widest ${currentTheme.textSub} ${isMini ? 'text-[8px]' : 'text-xs'}`}>
            No.1970
         </div>
      </div>

      {/* 右側：車票資訊區 (佔 60%) */}
      <div className={`w-[60%] h-full flex flex-col relative z-10 ${isMini ? 'px-3 py-2' : 'px-6 py-4'}`}>
         
         {/* 台鐵風格標題 */}
         <div className={`w-full flex justify-between items-start border-b-2 ${currentTheme.border} ${isMini ? 'pb-1 mb-2' : 'pb-2 mb-4'}`}>
            <h1 className={`font-bold tracking-widest font-serif m-0 ${currentTheme.textMain} ${isMini ? 'text-sm' : 'text-2xl'}`}>
              臺灣民歌鐵路
            </h1>
            <span className={`font-bold tracking-widest ${currentTheme.textSub} ${isMini ? 'text-[10px]' : 'text-sm'}`}>
              代號 520
            </span>
         </div>

         {/* 起迄站 */}
         <div className={`flex justify-between items-center font-bold tracking-widest ${currentTheme.textMain} ${isMini ? 'text-base mb-1' : 'text-3xl mb-2'}`}>
            <span>現 在</span>
            <span className={isMini ? 'text-xs' : 'text-xl'}>➡</span>
            <span>回 憶</span>
         </div>

         {/* 車次與座位 */}
         <div className={`flex justify-between font-mono font-bold tracking-widest opacity-80 ${currentTheme.textSub} ${isMini ? 'text-[9px] mb-2' : 'text-sm mb-4'}`}>
            <span>車次: 青春號</span>
            <span>座位: 自由入座</span>
         </div>

         {/* 心情天氣 & 票價 */}
         <div className="flex justify-between items-end mt-auto">
            <div className="flex flex-col">
              <span className={`font-bold tracking-widest opacity-70 ${currentTheme.textSub} ${isMini ? 'text-[8px]' : 'text-xs'}`}>
                今日天氣
              </span>
              <span className={`font-bold tracking-widest ${currentTheme.textMain} ${isMini ? 'text-lg' : 'text-3xl'}`}>
                {getMoodText()}
              </span>
            </div>
            
            <div className={`font-bold font-mono ${currentTheme.textMain} ${isMini ? 'text-[10px]' : 'text-base'}`}>
              票價 無價
            </div>
         </div>

         {/* 圓形印章 */}
         <div className={`absolute flex items-center justify-center rounded-full border-4 font-bold transform -rotate-12 opacity-80
            ${currentTheme.stamp}
            ${isMini ? 'w-10 h-10 text-[8px] border-2 top-6 right-2' : 'w-20 h-20 text-sm border-[3px] top-12 right-4'}
         `}>
            <div className="text-center leading-tight">
               記憶<br/>乘車
            </div>
         </div>

      </div>

      {/* 邊緣打孔 (台鐵剪票效果) */}
      <div className={`absolute top-1/2 transform -translate-y-1/2 -left-2 bg-[#EAEAEA] rounded-full shadow-inner ${isMini ? 'w-4 h-4' : 'w-6 h-6'}`}></div>
      <div className={`absolute top-1/2 transform -translate-y-1/2 -right-2 bg-[#EAEAEA] rounded-full shadow-inner ${isMini ? 'w-4 h-4' : 'w-6 h-6'}`}></div>
    </div>
  );
};

export default TicketCard;