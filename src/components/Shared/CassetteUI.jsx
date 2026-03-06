import React from 'react';

const CassetteUI = ({ title, color = 'bg-[#D64F3E]', size = 'normal' }) => {
  // 透過 size 控制整體縮放比例
  const scaleClass = {
    small: 'scale-75',
    normal: 'scale-100',
    large: 'scale-150'
  }[size];

  return (
    <div className={`w-64 h-40 ${color} rounded-xl border-[4px] border-gray-800 shadow-[6px_6px_0_rgba(0,0,0,0.8)] flex flex-col items-center justify-between p-4 relative bg-opacity-95 backdrop-blur-sm transform ${scaleClass} origin-center`}>
      {/* 頂部標籤底色區 */}
      <div className="w-full h-6 bg-white/30 rounded-md mb-2 border border-black/20"></div>
      
      {/* 歌曲名稱 / 錄音名稱 */}
      <span className="text-white font-bold text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] tracking-widest z-10 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center px-2">
        {title || 'CASSETTE TAPE'}
      </span>
      
      {/* 磁帶齒輪與透明視窗 */}
      <div className="w-[60%] h-[30%] bg-gray-400 rounded-sm border-2 border-gray-800 opacity-80 flex items-center justify-center relative mt-2 overflow-hidden shadow-inner">
         <div className="w-full h-[2px] bg-gray-600"></div>
      </div>

      <div className="absolute bottom-5 flex w-full justify-center gap-12 z-20">
         <div className="w-10 h-10 bg-gray-800 rounded-full border-[3px] border-gray-300 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"><div className="w-2 h-2 bg-white rounded-full"></div></div>
         <div className="w-10 h-10 bg-gray-800 rounded-full border-[3px] border-gray-300 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"><div className="w-2 h-2 bg-white rounded-full"></div></div>
      </div>
      
      {/* 底部裝飾字 */}
      <span className="absolute bottom-1 right-2 text-white/50 text-[8px] font-mono tracking-widest font-bold">TYPE I (NORMAL)</span>
    </div>
  );
};

export default CassetteUI;