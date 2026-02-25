import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from 'react-use-draggable-scroll';
import { gameModes } from '../../data/gameModes';

const TrainPage = ({ onSelectMode, onBack }) => {
  const scrollRef = useRef();
  const { events } = useDraggable(scrollRef);

  return (
    <div className="w-full h-full bg-transparent flex flex-col justify-center overflow-hidden relative">
      
      {/* 統一風格按鈕 */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={onBack} 
          className="px-5 py-2.5 bg-[#F5F5F5]/90 text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300 tracking-wide flex items-center"
        >
          ← 回首頁
        </button>
      </div>
      
      <div className="text-center mt-10 mb-8 z-10">
        <h2 className="text-5xl font-bold mb-4 text-gray-800 drop-shadow-md">選擇你的旅程方式</h2>
        <p className="text-gray-700 font-bold text-xl drop-shadow">按住滑鼠左右拖曳火車，選擇一種體驗</p>
      </div>

      <div 
        className="w-full overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing flex-1 flex items-center z-10"
        {...events} 
        ref={scrollRef}
      >
        <div className="flex items-end px-20 min-w-max relative translate-y-[10vh]">
          
          {/* 1. 車頭 */}
          <div className="relative w-[525px] h-[375px] flex items-center justify-center shrink-0 z-20">
            <img 
              src="/images/train-head.png" 
              alt="train head" 
              className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-2xl"
            />
          </div>

          {/* 2. 車廂列表 */}
          {gameModes.map((mode) => (
            <motion.div
              key={mode.id}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectMode(mode)}
              className={`
                group relative cursor-pointer w-[525px] h-[375px] flex items-center justify-center shrink-0 
                z-10 hover:z-50
                ${mode.locked ? 'opacity-50 cursor-not-allowed grayscale' : ''}
              `}
            >
              <img 
                src="/images/train.jpg" 
                alt="train car" 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-2xl"
                style={{ mixBlendMode: 'multiply' }} 
              />
              
              {/* 乾淨無模糊的車廂標籤 */}
              <div className="relative z-20 flex flex-col items-center justify-center -mt-8">
                <div className="bg-[#F5F5F5]/95 px-8 py-3 rounded-lg border border-gray-300 shadow-md group-hover:bg-white transition-colors duration-300">
                  <h3 className="text-3xl font-bold tracking-widest text-gray-800 drop-shadow-sm">
                    {mode.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainPage;