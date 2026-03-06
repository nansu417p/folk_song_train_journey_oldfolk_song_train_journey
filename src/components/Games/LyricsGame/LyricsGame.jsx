import React, { useState, useEffect, useRef } from 'react';
import { 
  DndContext, useDraggable, useDroppable, DragOverlay, 
  useSensor, useSensors, PointerSensor 
} from '@dnd-kit/core';
import { useDraggable as useScrollDraggable } from 'react-use-draggable-scroll';
import { processLyricsForGame } from '../../../utils/lyricsParser';
import { lyricsData } from '../../../data/lyricsData';

function StickerItem({ id, word }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data: { word } });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={`relative w-full px-4 py-3 bg-[#FDFBF7] text-gray-800 border border-gray-300 font-serif text-lg md:text-xl rounded-sm shadow-md cursor-grab touch-none select-none flex items-center justify-center text-center ${isDragging ? 'opacity-0' : 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200'}`}>
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-yellow-100/60 backdrop-blur-sm border border-yellow-200/50 shadow-sm rotate-[-4deg]"></div>
      {word}
    </div>
  );
}

function DropZone({ id, currentWord, correctWord, isHintActive }) {
  const { isOver, setNodeRef } = useDroppable({ id, data: { correctWord } });
  if (currentWord) {
    return (
      <div className="relative inline-flex items-center justify-center px-4 py-1 mx-2 bg-[#FDFBF7] border border-gray-300 text-gray-800 shadow-sm rounded-sm -rotate-1 font-bold text-xl transition-all z-10">
        <div className="absolute -top-1.5 left-2 w-6 h-3 bg-red-200/50 backdrop-blur-sm border border-red-300/50 shadow-sm rotate-6"></div>
        {currentWord}
      </div>
    );
  }
  const shouldGlow = isHintActive && isHintActive.includes(id);
  return (
    <div ref={setNodeRef} className={`inline-flex items-center justify-center min-w-[250px] h-10 mx-2 border-b-2 transition-all duration-300 align-middle ${shouldGlow ? 'border-yellow-400 bg-yellow-100/50 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-105' : 'border-dashed border-gray-400 bg-gray-200/40'} ${isOver ? 'bg-blue-100/50 border-blue-400 scale-110' : ''}`}>
      <span className="text-gray-400 text-sm tracking-widest opacity-50">將記憶碎片貼於此...</span>
    </div>
  );
}

const LyricsGamePlay = ({ song, gameData, initialStickers, onHome, onLyricsGenerated, isPlaying, progress, togglePlay, audioRef }) => {
  const [filledGaps, setFilledGaps] = useState({});
  const [stickers, setStickers] = useState(initialStickers);
  const [hintIds, setHintIds] = useState([]); 
  const [activeStickerData, setActiveStickerData] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const lyricsScrollRef = useRef(null);
  const { events: lyricsScrollEvents } = useScrollDraggable(lyricsScrollRef);
  const stickersScrollRef = useRef(null);
  const { events: stickersScrollEvents } = useScrollDraggable(stickersScrollRef);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleProgressClick = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    audioRef.current.currentTime = percentage * audioRef.current.duration;
  };

  const handleDragStart = (event) => {
    const activeId = event.active.id;
    const sticker = stickers.find(s => s.id === activeId);
    if (sticker) setActiveStickerData(sticker);

    const emptyGaps = [];
    gameData.lines.forEach(line => {
      if (line.isGap && !filledGaps[line.id]) emptyGaps.push(line);
    });

    let correctGapId = null;
    const fakeGaps = [];
    emptyGaps.forEach(gap => {
      if (gap.text === sticker.text && !correctGapId) correctGapId = gap.id; 
      else fakeGaps.push(gap.id);
    });

    let fakeId = null;
    if (fakeGaps.length > 0) fakeId = fakeGaps[Math.floor(Math.random() * fakeGaps.length)];
    setHintIds(fakeId && correctGapId ? [correctGapId, fakeId] : [correctGapId]);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setHintIds([]); 
    setActiveStickerData(null);
    if (!over) return;

    const draggedWord = active.data.current.word;
    const correctWord = over.data.current.correctWord;

    if (draggedWord === correctWord) {
      setFilledGaps(prev => ({ ...prev, [over.id]: draggedWord }));
      setStickers(prev => {
        const newStickers = prev.filter(s => s.id !== active.id);
        if (newStickers.length === 0) {
          setTimeout(() => {
            setIsCompleted(true);
            if (onLyricsGenerated) onLyricsGenerated({ title: song.title, content: lyricsData[song.id] });
          }, 500); 
        }
        return newStickers;
      });
    }
  };

  // ★ 快速修復測試按鈕功能
  const handleQuickFix = () => {
    const allGaps = {};
    gameData.lines.forEach(line => {
      if (line.isGap) allGaps[line.id] = line.text;
    });
    setFilledGaps(allGaps);
    setStickers([]);
    setIsCompleted(true);
    if (onLyricsGenerated) onLyricsGenerated({ title: song.title, content: lyricsData[song.id] });
  };

  const customModifiers = [({ transform }) => ({ ...transform })];

  return (
    <DndContext sensors={sensors} modifiers={customModifiers} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
       <div className="absolute top-6 left-6 z-50 flex gap-4">
         <button onClick={onHome} className="px-5 py-2.5 bg-[#F5F5F5] text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 transition-all tracking-wide">
           ← 返回火車
         </button>
         {/* ★ 快速修復按鈕 */}
         {!isCompleted && (
           <button onClick={handleQuickFix} className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-lg shadow border border-red-700 hover:bg-red-500 transition-all tracking-wide animate-pulse">
             ⚡ 快速修復 (測試)
           </button>
         )}
       </div>

       <div className="w-full max-w-6xl h-full flex flex-col bg-[#E0D8C3] rounded-xl shadow-2xl border border-[#C0B8A3] overflow-hidden">
           <div className="w-full bg-[#D64F3E] p-4 px-6 flex justify-between items-center shadow-md z-10 border-b border-[#B83E2F]">
             <div className="flex items-center gap-4 min-w-[200px]">
               <div className={`w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>💿</div>
               <div className="flex flex-col">
                 <span className="text-white/80 text-[10px] tracking-widest font-bold">RESTORING MEMORY</span>
                 <div className="flex items-baseline gap-3">
                   <h2 className="text-[#F5F5F5] text-xl font-bold tracking-widest font-serif drop-shadow">{song.title}</h2>
                   <span className="text-white/80 text-sm font-serif tracking-wider">{song.singer}</span>
                 </div>
               </div>
             </div>
             
             <div className="flex-1 flex items-center gap-6 max-w-xl">
               <button onClick={togglePlay} className="w-12 h-12 bg-[#F5F5F5] text-[#D64F3E] rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md text-xl pl-1">
                 {isPlaying ? 'II' : '▶'}
               </button>
               <div className="flex-1 h-3 bg-black/20 rounded-full overflow-hidden relative shadow-inner border border-black/10 cursor-pointer" onClick={handleProgressClick}>
                 <div className="absolute top-0 left-0 h-full bg-yellow-400 transition-all duration-75 ease-linear pointer-events-none" style={{ width: `${progress}%` }}></div>
               </div>
             </div>
           </div>

           <div className="flex flex-1 overflow-hidden relative">
              <div ref={lyricsScrollRef} {...lyricsScrollEvents} className="flex-[2] bg-[#FDFBF7] p-8 overflow-y-auto custom-scrollbar relative cursor-grab active:cursor-grabbing">
                 <p className="text-center text-gray-400 font-bold tracking-widest mb-10 border-b pb-4 pointer-events-none">請一邊聆聽音樂，一邊將右側的句子貼回歌詞本中</p>
                 <div className="flex flex-col gap-6 text-center font-serif text-xl md:text-2xl text-gray-700 leading-loose">
                    {gameData.lines.map((line) => {
                       if (!line.text) return <div key={line.id} className="h-4 pointer-events-none"></div>; 
                       if (line.isGap) {
                          return <div key={line.id}><DropZone id={line.id} currentWord={filledGaps[line.id]} correctWord={line.text} isHintActive={hintIds} /></div>;
                       }
                       return <div key={line.id} className="tracking-wide pointer-events-none">{line.text}</div>;
                    })}
                 </div>
                 <div className="h-20 pointer-events-none"></div>
              </div>

              <div ref={stickersScrollRef} {...stickersScrollEvents} className={`flex-[1] bg-[#EAEAEA] p-6 overflow-y-auto custom-scrollbar border-l-4 border-dashed border-[#C0B8A3] shadow-inner flex flex-col items-center justify-center gap-6 cursor-grab active:cursor-grabbing transition-opacity duration-500`}>
                  {isCompleted ? (
                    <div className="text-center flex flex-col items-center justify-center animate-fade-in-up w-full px-4">
                       <div className="text-6xl mb-4">📜✨</div>
                       <h3 className="text-2xl font-bold text-gray-800 tracking-widest mb-2 font-serif">歌詞修復完成</h3>
                       <p className="text-gray-500 font-bold tracking-wider mb-8 text-sm leading-relaxed">您已經完美還原了《{song.title}》的記憶，可以在左側欣賞完整的歌詞。</p>
                       <button onClick={onHome} className="w-[80%] py-4 bg-red-600 text-[#F5F5F5] rounded-lg hover:bg-red-500 transition-all duration-300 font-bold tracking-widest shadow-md text-lg">
                         🚂 帶著回憶返回大廳
                       </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-gray-500 font-bold tracking-widest text-sm bg-white px-4 py-2 rounded-full shadow-sm pointer-events-none mb-2 mt-auto">🧩 記憶碎片</h3>
                      {stickers.map((item) => <StickerItem key={item.id} id={item.id} word={item.text} />)}
                      <div className="h-10 pointer-events-none mt-auto"></div>
                    </>
                  )}
              </div>
           </div>
       </div>

       <DragOverlay dropAnimation={null}>
         {activeStickerData ? (
           <div className="relative w-full min-w-[200px] px-4 py-3 bg-[#FDFBF7] text-gray-800 border border-gray-300 font-serif text-xl rounded-sm shadow-2xl z-[9999] flex items-center justify-center text-center rotate-2 scale-105 opacity-95 cursor-grabbing pointer-events-none">
             <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-yellow-100/60 backdrop-blur-sm border border-yellow-200/50 shadow-sm rotate-[-4deg]"></div>
             {activeStickerData.text}
           </div>
         ) : null}
       </DragOverlay>
    </DndContext>
  );
};


const LyricsGame = ({ song, onRestart, onHome, onLyricsGenerated }) => {
  const [gameState, setGameState] = useState({ status: 'loading', data: null, stickers: [] });
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (song) {
      const rawText = lyricsData[song.id];
      if (rawText) {
        const { lines, stickers } = processLyricsForGame(rawText, 7);
        setGameState({ status: 'playing', data: { lines }, stickers });
      }
    }
  }, [song]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  if (gameState.status === 'loading') return <div className="text-gray-800 text-2xl font-bold p-8">載入中...</div>;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-transparent pt-16 pb-8 px-8">
      <audio ref={audioRef} src={`/music/${song.audioFileName}`} autoPlay loop onTimeUpdate={handleTimeUpdate} className="hidden" />
      <LyricsGamePlay 
        song={song} gameData={gameState.data} initialStickers={gameState.stickers} onHome={onHome} onLyricsGenerated={onLyricsGenerated} isPlaying={isPlaying} progress={progress} togglePlay={togglePlay} audioRef={audioRef}
      />
    </div>
  );
};

export default LyricsGame;