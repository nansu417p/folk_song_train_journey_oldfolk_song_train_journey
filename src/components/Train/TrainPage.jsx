import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraggable } from 'react-use-draggable-scroll';
import { gameModes } from '../../data/gameModes';
import TicketCard from '../Shared/TicketCard';

const TrainPage = ({ onSelectMode, onBack, ticket, cover, coverStatus, swapped, faceswapStatus, lyrics, recording, mainSong, onPauseMusic }) => {
  const scrollRef = useRef();
  const { events } = useDraggable(scrollRef);
  
  const [lightbox, setLightbox] = useState(null); 

  return (
    <div className="w-full h-full bg-transparent flex flex-col justify-center overflow-hidden relative">
      
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-4 items-start">
        <button 
          onClick={onBack} 
          className="px-5 py-2.5 bg-[#F5F5F5]/90 text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300 tracking-wide flex items-center w-max"
        >
          ← 回首頁
        </button>

        <div className="flex flex-row gap-8 items-start mt-2 select-none">
            {ticket && (
              <motion.div 
                initial={{ opacity: 0, x: -20, rotate: -15 }}
                animate={{ opacity: 1, x: 0, rotate: -6 }}
                whileHover={{ rotate: -2, scale: 1.05 }} 
                transition={{ type: "spring", stiffness: 100, damping: 12 }}
                onClick={() => setLightbox({ type: 'ticket', data: ticket })}
                className="relative drop-shadow-lg cursor-pointer z-50 hover:z-[60]"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#fef08a]/80 backdrop-blur-[2px] shadow-sm z-30 rotate-3 border border-yellow-200/50"></div>
                <div className="pointer-events-none">
                  <TicketCard captureImg={ticket.image} moodResult={ticket.mood} size="mini" />
                </div>
              </motion.div>
            )}

            {cover && (
              <motion.div 
                initial={{ opacity: 0, x: -20, rotate: 10 }}
                animate={{ opacity: 1, x: 0, rotate: 4 }}
                whileHover={{ rotate: 0, scale: 1.05 }} 
                transition={{ type: "spring", stiffness: 100, damping: 12 }}
                onClick={() => setLightbox({ type: 'cover', data: cover })}
                className="relative drop-shadow-xl cursor-pointer z-40 -mt-4 hover:z-[60]"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#fca5a5]/80 backdrop-blur-[2px] shadow-sm z-30 rotate-[-5deg] border border-red-200/50"></div>
                <div className="bg-white p-2 pb-1 rounded-sm shadow-md border border-gray-200 w-[200px] flex flex-col pointer-events-none">
                  <img src={cover.image} alt="collected cover" className="w-full aspect-square object-cover border border-gray-300" draggable="false" />
                  <div className="w-full flex items-center justify-center py-2 min-h-8">
                    <h3 className="font-bold text-gray-800 tracking-widest text-sm font-serif leading-none m-0 text-center relative -top-[1px]">
                      {cover.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            )}

            {swapped && (
              <motion.div 
                initial={{ opacity: 0, x: -20, rotate: -5 }}
                animate={{ opacity: 1, x: 0, rotate: -2 }}
                whileHover={{ rotate: 0, scale: 1.05 }} 
                transition={{ type: "spring", stiffness: 100, damping: 12 }}
                onClick={() => setLightbox({ type: 'swapped', data: swapped })}
                className="relative drop-shadow-xl cursor-pointer z-30 -mt-2 hover:z-[60]"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#bae6fd]/80 backdrop-blur-[2px] shadow-sm z-30 rotate-2 border border-blue-200/50"></div>
                <div className="bg-white p-2 pb-1 rounded-sm shadow-md border border-gray-200 w-[250px] flex flex-col pointer-events-none">
                  <img 
                    src={swapped.image} 
                    alt="swapped cover" 
                    className="w-full object-cover border border-gray-300" 
                    style={{ aspectRatio: '1024/720' }} 
                    draggable="false"
                  />
                  <div className="w-full flex flex-col items-center justify-center py-2 min-h-8">
                    <h3 className="font-bold text-gray-800 tracking-widest text-sm font-serif leading-none m-0 text-center relative -top-[1px]">
                      {swapped.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            )}

            {lyrics && (
              <motion.div 
                initial={{ opacity: 0, x: -20, rotate: 8 }}
                animate={{ opacity: 1, x: 0, rotate: 3 }}
                whileHover={{ rotate: 0, scale: 1.05 }} 
                transition={{ type: "spring", stiffness: 100, damping: 12 }}
                onClick={() => setLightbox({ type: 'lyrics', data: lyrics })}
                className="relative drop-shadow-xl cursor-pointer z-20 mt-1 hover:z-[60]"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-100/80 backdrop-blur-[2px] shadow-sm z-30 rotate-[-4deg] border border-yellow-300/50"></div>
                <div className="bg-[#FDFBF7] p-4 rounded-sm shadow-md border border-[#C0B8A3] w-[180px] h-[220px] flex flex-col relative overflow-hidden pointer-events-none">
                   <h4 className="font-bold text-gray-800 text-center border-b border-gray-300 pb-1 mb-2 tracking-widest text-sm">{lyrics.title}</h4>
                   <div className="text-[7px] text-gray-500 leading-relaxed font-serif whitespace-pre-wrap opacity-70">
                     {lyrics.content.substring(0, 180)}...
                   </div>
                   <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#FDFBF7] to-transparent"></div>
                </div>
              </motion.div>
            )}

            {/* ★ 新增：民歌錄音收集品 */}
            {recording && (
              <motion.div 
                initial={{ opacity: 0, x: -20, rotate: -3 }}
                animate={{ opacity: 1, x: 0, rotate: 1 }}
                whileHover={{ rotate: 0, scale: 1.05 }} 
                transition={{ type: "spring", stiffness: 100, damping: 12 }}
                onClick={() => setLightbox({ type: 'recording', data: recording })}
                className="relative drop-shadow-xl cursor-pointer z-20 mt-4 hover:z-[60]"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-green-100/80 backdrop-blur-[2px] shadow-sm z-30 rotate-2 border border-green-300/50"></div>
                <div className="bg-[#FDFBF7] p-2 pb-1 rounded-sm shadow-md border border-gray-200 w-[200px] flex flex-col pointer-events-none">
                  {/* 復古錄音帶圖示設計 */}
                  <div className="w-full aspect-square bg-[#2A2A2A] rounded-sm flex flex-col items-center justify-center border-4 border-gray-300 shadow-inner overflow-hidden relative">
                      <span className="text-6xl drop-shadow-md relative -top-2">📼</span>
                      <div className="absolute bottom-4 text-[#F5F5F5] text-[10px] font-bold tracking-widest bg-red-600 px-3 py-0.5 rounded-sm shadow border border-red-800">
                         RECORDING
                      </div>
                  </div>
                  <div className="w-full flex items-center justify-center py-2 min-h-8">
                    <h3 className="font-bold text-gray-800 tracking-widest text-sm font-serif leading-none m-0 text-center relative -top-[1px]">
                      {recording.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            )}
        </div>
      </div>
      
      <div className="text-center mt-10 mb-8 z-10 pointer-events-none">
        <h2 className="text-5xl font-bold mb-4 text-gray-800 drop-shadow-md">選擇你的旅程方式</h2>
        <p className="text-gray-700 font-bold text-xl drop-shadow">按住滑鼠左右拖曳火車，選擇一種體驗</p>
      </div>

      <div 
        className="w-full overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing flex-1 flex items-center z-10"
        {...events} 
        ref={scrollRef}
      >
        <div className="flex items-end px-20 min-w-max relative translate-y-[10vh]">
          
          <div className="relative w-[525px] h-[375px] flex items-center justify-center shrink-0 z-20 pointer-events-none">
            <img src="/images/train-head.png" alt="train head" className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl" draggable="false" />
          </div>

          {gameModes.map((mode) => {
            const isAiCover = mode.id === 'ai-zimage';
            const isFaceSwap = mode.id === 'faceswap';

            const isLocked = mode.locked || (isFaceSwap && mainSong && !mainSong.hasFace);

            return (
            <motion.div
              key={mode.id}
              whileHover={isLocked ? {} : { scale: 1.05 }} 
              whileTap={isLocked ? {} : { scale: 0.95 }}
              onClick={() => onSelectMode(mode)}
              className={`
                group relative cursor-pointer w-[525px] h-[375px] flex items-center justify-center shrink-0 
                z-10 hover:z-50
                ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''}
              `}
            >
              <img 
                src="/images/train.jpg" 
                alt="train car" 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-2xl"
                style={{ mixBlendMode: 'multiply' }} 
                draggable="false"
              />
              
              <div className="relative z-20 flex flex-col items-center justify-center -mt-8">
                <div className="absolute bottom-full mb-5 left-1/2 transform -translate-x-1/2 w-max flex justify-center pointer-events-none z-[60]">
                  {isAiCover && coverStatus === 'generating' && (
                    <div className="bg-yellow-400 text-gray-800 px-6 py-2 rounded-full font-bold shadow-lg animate-pulse border-2 border-yellow-500 tracking-widest">⏳ 畫家正在繪製中...</div>
                  )}
                  {isAiCover && coverStatus === 'done' && !cover && (
                    <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow-[0_0_20px_#22c55e] animate-bounce border-2 border-green-400 tracking-widest">✨ 繪製完成！點擊入內領取</div>
                  )}
                  {isFaceSwap && faceswapStatus === 'generating' && (
                    <div className="bg-blue-400 text-gray-800 px-6 py-2 rounded-full font-bold shadow-lg animate-pulse border-2 border-blue-500 tracking-widest">⏳ 暗房正在融合五官...</div>
                  )}
                  {isFaceSwap && faceswapStatus === 'done' && !swapped && (
                    <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow-[0_0_20px_#22c55e] animate-bounce border-2 border-green-400 tracking-widest">✨ 寫真完成！點擊入內領取</div>
                  )}
                  {isFaceSwap && mainSong && !mainSong.hasFace && faceswapStatus === 'idle' && (
                     <div className="bg-gray-800 text-white px-4 py-1.5 rounded-full font-bold shadow-lg text-sm border border-gray-600 tracking-widest">🔒 此歌曲無人臉可替換</div>
                  )}
                </div>

                <div className={`
                  bg-gradient-to-b from-gray-700 to-gray-900 px-10 py-3 rounded-sm border-2 border-gray-500 ring-4 ring-black/30 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.2)] transition-all duration-300 relative
                  ${isLocked ? '' : 'group-hover:from-gray-600 group-hover:to-gray-800'}
                `}>
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-inner"></div>
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-inner"></div>
                  <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-inner"></div>
                  <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-inner"></div>
                  <h3 className={`text-3xl font-bold tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] transition-colors duration-300 ${isLocked ? 'text-gray-400' : 'text-yellow-400 group-hover:text-yellow-300'}`}>
                    {mode.title}
                  </h3>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-8 select-none"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }} transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()} 
              className="relative flex flex-col items-center justify-center max-h-full max-w-full"
            >
               {lightbox.type === 'ticket' && (
                 <div className="scale-150 transform origin-center drop-shadow-2xl">
                   <TicketCard captureImg={lightbox.data.image} moodResult={lightbox.data.mood} size="normal" />
                 </div>
               )}

               {lightbox.type === 'cover' && (
                 <div className="bg-white p-4 pb-14 rounded-sm shadow-2xl border border-gray-200 flex flex-col relative w-[500px]">
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-10 bg-[#fca5a5]/90 backdrop-blur-[2px] shadow-sm z-30 rotate-[-2deg] border border-red-300"></div>
                   <img src={lightbox.data.image} className="w-full aspect-square object-cover border border-gray-300" draggable="false" />
                   <div className="absolute bottom-4 w-full left-0 text-center"><h3 className="text-3xl font-bold text-gray-800 tracking-widest font-serif">{lightbox.data.title}</h3></div>
                 </div>
               )}

               {lightbox.type === 'swapped' && (
                 <div className="bg-white p-4 pb-14 rounded-sm shadow-2xl border border-gray-200 flex flex-col relative w-[700px]">
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-10 bg-[#bae6fd]/90 backdrop-blur-[2px] shadow-sm z-30 rotate-[2deg] border border-blue-300"></div>
                   <img src={lightbox.data.image} className="w-full object-cover border border-gray-300" style={{ aspectRatio: '1024/720' }} draggable="false" />
                   <div className="absolute bottom-4 w-full left-0 text-center"><h3 className="text-3xl font-bold text-gray-800 tracking-widest font-serif">{lightbox.data.title}</h3></div>
                 </div>
               )}

               {lightbox.type === 'lyrics' && (
                 <div className="bg-[#FDFBF7] p-10 rounded-sm shadow-2xl border border-[#C0B8A3] w-[500px] max-h-[85vh] flex flex-col relative overflow-y-auto custom-scrollbar">
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-10 bg-yellow-100/90 backdrop-blur-[2px] shadow-sm z-30 rotate-[-1deg] border border-yellow-300"></div>
                   <h2 className="text-3xl font-bold text-gray-800 text-center border-b-2 border-gray-300 pb-4 mb-6 tracking-widest font-serif">{lightbox.data.title}</h2>
                   <div className="text-lg text-gray-700 leading-loose font-serif whitespace-pre-wrap text-center px-4">
                     {lightbox.data.content}
                   </div>
                 </div>
               )}

               {/* ★ 新增：民歌錄音 Lightbox 播放器 */}
               {lightbox.type === 'recording' && (
                 <div className="bg-[#FDFBF7] p-10 rounded-sm shadow-2xl border border-[#C0B8A3] w-[450px] flex flex-col items-center relative">
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-10 bg-green-100/90 backdrop-blur-[2px] shadow-sm z-30 rotate-[1deg] border border-green-300"></div>
                   <div className="text-9xl mb-6 drop-shadow-xl mt-4">📼</div>
                   <h2 className="text-2xl font-bold text-gray-800 text-center border-b-2 border-gray-300 pb-4 mb-8 tracking-widest font-serif w-full">
                     {lightbox.data.title} - 專屬錄音
                   </h2>
                   {/* 播放時觸發 onPauseMusic 讓大廳安靜 */}
                   <audio 
                     src={lightbox.data.audioUrl} 
                     controls 
                     className="w-full outline-none shadow-md rounded-full"
                     onPlay={() => { if (onPauseMusic) onPauseMusic(); }}
                   />
                 </div>
               )}

               <button onClick={() => setLightbox(null)} className="absolute -top-12 -right-12 text-white/70 hover:text-white text-4xl font-bold transition-colors">
                 ×
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TrainPage;