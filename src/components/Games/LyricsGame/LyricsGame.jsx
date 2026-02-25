import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { processLyricsForGame } from '../../../utils/lyricsParser';

function FloatingWord({ id, word, position }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { word }
  });
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    top: position.top,
    left: position.left,
    position: 'absolute',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`
        px-4 py-2 bg-[#F5F5F5] text-gray-800 border-2 border-red-500 font-bold rounded-lg shadow-lg cursor-grab z-50 touch-none select-none transition-transform duration-300
        ${isDragging ? 'opacity-50 scale-110 rotate-3' : 'hover:scale-105 hover:-translate-y-1 rotate-[-2deg]'}
      `}
    >
      {word}
    </div>
  );
}

function DropZone({ id, currentWord }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <span 
      ref={setNodeRef}
      className={`
        inline-flex items-center justify-center min-w-[80px] h-10 mx-1 border-b-[3px] 
        transition-all duration-300 px-3 vertical-align-middle mb-2 rounded-lg
        ${currentWord 
          ? 'bg-red-100 text-red-600 font-bold border-red-500' 
          : 'border-dashed border-gray-400 bg-gray-200'}
        ${isOver && !currentWord ? 'bg-yellow-100 scale-105 border-yellow-500' : ''}
      `}
    >
      {currentWord || "____"}
    </span>
  );
}

const LyricsGame = ({ song, onRestart, onHome }) => {
  const [gameData, setGameData] = useState([]); 
  const [level, setLevel] = useState(0); 
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [floatingWords, setFloatingWords] = useState([]);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (song) {
      setIsLoading(true);
      const processed = processLyricsForGame(song.lyrics);
      setGameData(processed);
      setIsLoading(false);
      setLevel(0);
      setShowEndScreen(false);
    }
  }, [song]);

  useEffect(() => {
    if (gameData.length > 0 && level < gameData.length) {
      const currentLevelData = gameData[level];
      const words = currentLevelData.answers.map((ans, idx) => ({
        id: `word-${level}-${idx}-${ans}`, 
        word: ans,
        pos: getRandomPosition()
      }));
      setFloatingWords(words);
      setCurrentAnswers({});
    } else if (gameData.length > 0 && level >= gameData.length) {
      setShowEndScreen(true);
    }
  }, [level, gameData]);

  const getRandomPosition = () => {
    const edge = Math.random() > 0.5 ? 'width' : 'height';
    const isStart = Math.random() > 0.5;
    return {
      top: edge === 'height' ? (isStart ? `${5 + Math.random() * 15}%` : `${80 + Math.random() * 15}%`) : `${15 + Math.random() * 70}%`,
      left: edge === 'width' ? (isStart ? `${5 + Math.random() * 15}%` : `${80 + Math.random() * 15}%`) : `${5 + Math.random() * 90}%`,
    };
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const currentLevelData = gameData[level];
    
    let correctAnswer = null;
    currentLevelData.lines.forEach(line => {
      line.forEach(segment => {
        if (segment.id === over.id) correctAnswer = segment.text;
      });
    });

    const draggedWord = active.data.current.word;

    if (draggedWord === correctAnswer) {
      const newAnswers = { ...currentAnswers, [over.id]: draggedWord };
      setCurrentAnswers(newAnswers);
      setFloatingWords(prev => prev.filter(w => w.id !== active.id));

      const totalGaps = currentLevelData.answers.length;
      if (Object.keys(newAnswers).length === totalGaps) {
        setTimeout(() => setLevel(prev => prev + 1), 800);
      }
    }
  };

  const renderLyricsContent = () => {
    if (level >= gameData.length) return null;
    const currentLevelLines = gameData[level].lines;

    return (
      <div className="flex flex-col gap-4 items-center text-center">
        {currentLevelLines.map((line, lIdx) => (
          <div key={lIdx} className="text-xl md:text-2xl font-serif text-gray-800 leading-loose flex flex-wrap justify-center items-center">
            {line.map((seg, sIdx) => {
              if (seg.isGap) {
                return (
                  <DropZone 
                    key={seg.id} 
                    id={seg.id}
                    currentWord={currentAnswers[seg.id]}
                  />
                );
              }
              return <span key={sIdx} className="mx-1">{seg.text}</span>;
            })}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) return <div className="text-gray-800 text-2xl font-bold bg-[#F5F5F5] px-6 py-3 rounded-lg border border-gray-300">載入歌詞中...</div>;

  if (showEndScreen) {
    return (
      <div className="relative w-full h-full bg-transparent flex flex-col items-center justify-center p-4">
        <button onClick={onHome} className="absolute top-6 left-6 z-50 px-5 py-2.5 bg-[#F5F5F5] text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300 tracking-wide">
          ← 返回火車
        </button>
        <div className="text-gray-800 text-center flex flex-col items-center justify-center bg-[#F5F5F5] rounded-lg p-12 shadow-xl border border-gray-300">
          <h2 className="text-5xl font-bold mb-6 drop-shadow-sm">🎵 演奏完畢</h2>
          <p className="text-2xl mb-10 text-gray-600">《{song.title}》的記憶已修復</p>
          <button 
            onClick={onRestart}
            className="px-10 py-4 bg-gray-800 text-[#F5F5F5] rounded-lg hover:bg-gray-700 hover:-translate-y-1 transition-all duration-300 font-bold text-xl shadow-md"
          >
            選擇下一首歌
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-transparent">

        {/* 統一位置與樣式：返回火車 */}
        <button 
          onClick={onHome} 
          className="absolute top-6 left-6 z-50 px-5 py-2.5 bg-[#F5F5F5] text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300 tracking-wide"
        >
          ← 返回火車
        </button>

        {/* 統一位置與樣式：重選歌曲 */}
        <button 
          onClick={onRestart} 
          className="absolute top-6 left-44 z-50 px-5 py-2.5 bg-gray-800 text-[#F5F5F5] font-bold rounded-lg shadow border border-gray-700 hover:bg-gray-700 hover:-translate-y-1 transition-all duration-300 tracking-wide"
        >
          ↺ 重選歌曲
        </button>

        {/* 卡帶本體 */}
        <div className="relative w-[80%] max-w-[800px] h-[500px] bg-[#E0D8C3] rounded-lg shadow-xl flex flex-col items-center p-6 border border-[#C0B8A3] mt-10">
           
           <div className="w-full bg-[#D64F3E] rounded-md p-4 flex justify-between items-center shadow-sm mb-4">
             <span className="text-[#F5F5F5] font-bold tracking-widest text-sm bg-black/20 px-3 py-1 rounded">SIDE A</span>
             <h2 className="text-[#F5F5F5] text-3xl font-bold tracking-widest drop-shadow-sm">{song.title}</h2>
             <span className="text-[#F5F5F5] text-sm tracking-widest border border-[#F5F5F5]/50 px-2 py-1 rounded">DOLBY SYSTEM</span>
           </div>
           
           <div className="flex-1 w-full bg-[#F5F5F5] rounded-md shadow-inner p-8 overflow-y-auto relative flex items-center justify-center border border-[#C0B8A3]">
              <div className="absolute w-full flex justify-between px-20 opacity-10 pointer-events-none">
                 <div className="w-32 h-32 rounded-full border-8 border-black flex items-center justify-center"><div className="w-24 h-24 bg-black rounded-full"></div></div>
                 <div className="w-32 h-32 rounded-full border-8 border-black flex items-center justify-center"><div className="w-24 h-24 bg-black rounded-full"></div></div>
              </div>
              <div className="z-10 w-full">
                <p className="text-center text-gray-500 font-bold tracking-widest mb-6">--- 第 {level + 1} 段 ---</p>
                {renderLyricsContent()}
              </div>
           </div>
        </div>

        {/* 漂浮字卡 */}
        {floatingWords.map((item) => (
          <FloatingWord 
            key={item.id} 
            id={item.id} 
            word={item.word} 
            position={item.pos}
          />
        ))}

      </div>
    </DndContext>
  );
};

export default LyricsGame;