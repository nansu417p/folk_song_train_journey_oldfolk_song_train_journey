import React from 'react';

const TicketCard = ({ captureImg, moodResult, size = 'normal' }) => {
  // 判斷是否為迷你尺寸
  const isMini = size === 'mini';

  return (
    <div className={`bg-[#EAEAEA] rounded-sm shadow-2xl flex flex-col relative overflow-hidden border border-gray-400 
      ${isMini ? 'w-[200px] p-1.5' : 'w-[300px] p-2'}
    `}>
      
      {/* 左右兩側的半圓形打孔 (根據尺寸調整高度) */}
      <div className={`absolute -left-3 bg-transparent rounded-full border-r border-gray-400 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.1)] z-10 ${isMini ? 'top-14 w-5 h-5' : 'top-20 w-6 h-6'}`}></div>
      <div className={`absolute -right-3 bg-transparent rounded-full border-l border-gray-400 shadow-[inset_2px_0_4px_rgba(0,0,0,0.1)] z-10 ${isMini ? 'top-14 w-5 h-5' : 'top-20 w-6 h-6'}`}></div>
      
      <div className={`border-[3px] border-gray-800 flex flex-col relative bg-[#FDFBF7] 
        ${isMini ? 'p-3 h-[280px]' : 'p-4 h-[420px]'}
      `}>
        
        {/* 票頭標題 */}
        <div className={`text-center border-b-2 border-dashed border-gray-500 ${isMini ? 'pb-2 mb-2' : 'pb-3 mb-3'}`}>
          <h1 className={`font-bold text-gray-800 tracking-[0.3em] ${isMini ? 'text-lg' : 'text-2xl'}`}>臺灣民歌鐵路</h1>
          <p className={`text-gray-500 font-mono tracking-widest ${isMini ? 'text-[8px] mt-0.5' : 'text-xs mt-1'}`}>TAIWAN FOLK RAILWAY</p>
        </div>
        
        {/* 起迄站資訊 */}
        <div className={`flex justify-between items-center text-gray-800 font-bold px-1 ${isMini ? 'text-sm mb-2' : 'text-xl mb-4 px-2'}`}>
          <span>現 在</span>
          <span className={isMini ? 'text-[10px]' : 'text-sm'}>➡</span>
          <span>回 憶</span>
        </div>

        {/* 車次與座位 */}
        <div className={`flex justify-between text-gray-600 font-mono border-b border-gray-300 px-1 ${isMini ? 'text-[10px] mb-2 pb-2' : 'text-sm mb-4 pb-4 px-2'}`}>
          <span>車次: 1970</span>
          <span>座位: 自由座</span>
        </div>

        {/* 照片與心情結果區塊 */}
        <div className={`flex flex-col items-center justify-center flex-1 ${isMini ? 'gap-3' : 'gap-6'}`}>
          <div className={`border-2 border-gray-400 bg-white rotate-[-3deg] shadow-md flex items-center justify-center overflow-hidden 
            ${isMini ? 'w-16 h-20 p-1' : 'w-28 h-32 p-1.5'}
          `}>
             {captureImg ? (
                <img src={captureImg} alt="passenger" className="w-full h-full object-cover" />
             ) : (
                <span className={`text-gray-400 ${isMini ? 'text-3xl' : 'text-5xl'}`}>👤</span>
             )}
          </div>
          
          <div className="flex flex-col items-center text-center">
            <span className={`text-gray-500 tracking-[0.2em] font-bold mb-1 ${isMini ? 'text-[9px]' : 'text-xs'}`}>心情天氣</span>
            <span className={`font-bold tracking-widest ${isMini ? 'text-2xl' : 'text-4xl'}`}>
              {moodResult === 'happy' ? <span className="text-red-600">晴 朗</span> :
               moodResult === 'sad' ? <span className="text-blue-600">微 雨</span> : 
               moodResult === 'neutral' ? <span className="text-gray-800">平 靜</span> :
               <span className={`text-gray-400 ${isMini ? 'text-lg' : 'text-2xl'}`}>待 打 卡</span>}
            </span>
          </div>
        </div>

        {/* 票號流水號 */}
        <div className={`absolute bottom-1 right-1.5 text-gray-400 font-mono font-bold tracking-wider ${isMini ? 'text-[8px]' : 'text-[10px] bottom-2 right-2'}`}>
          No. 8830192
        </div>
      </div>
    </div>
  );
};

export default TicketCard;