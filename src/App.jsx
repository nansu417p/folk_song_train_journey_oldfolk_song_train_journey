import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// 資料
import { folkSongs } from './data/folkSongs';

// 元件
import TrainPage from './components/Train/TrainPage';
import MoodTrainGame from './components/Games/MoodTrainGame/MoodTrainGame'; 
import AiCoverGame_zimage from './components/Games/AiCoverGame/AiCoverGame_zimage'; 
import FaceSwapGame from './components/Games/FaceSwapGame/FaceSwapGame'; 
import ArGame from './components/Games/ArGame/ArGame'; 
import LyricsGame from './components/Games/LyricsGame/LyricsGame';
import CapsuleGame from './components/Games/CapsuleGame/CapsuleGame'; 

// ★ 新增：全域沉浸特效元件
const GlobalMoodEffects = ({ mood }) => {
  if (!mood) return null;

  const isHappy = mood === 'happy';
  const particles = Array.from({ length: 30 });

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 全域色彩濾鏡 */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${isHappy ? 'bg-orange-500/5' : 'bg-teal-800/10'}`}></div>
      
      {/* 動態粒子 */}
      {particles.map((_, i) => {
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 5;
        const randomDuration = 3 + Math.random() * 4;

        if (isHappy) {
          // 開心：暖色上升光點
          return (
            <motion.div
              key={i}
              className="absolute bottom-0 w-2 h-2 rounded-full bg-yellow-400/60 shadow-[0_0_8px_#facc15]"
              initial={{ x: `${randomX}vw`, y: '100vh', opacity: 0 }}
              animate={{ y: '-10vh', opacity: [0, 1, 0] }}
              transition={{ duration: randomDuration, repeat: Infinity, delay: randomDelay, ease: "linear" }}
            />
          );
        } else {
          // 難過/平靜：冷色下雨特效
          return (
            <motion.div
              key={i}
              className="absolute top-0 w-[2px] h-8 bg-blue-300/40"
              initial={{ x: `${randomX}vw`, y: '-10vh', opacity: 0 }}
              animate={{ y: '110vh', opacity: [0, 1, 0] }}
              transition={{ duration: randomDuration * 0.5, repeat: Infinity, delay: randomDelay, ease: "linear" }}
            />
          );
        }
      })}
    </div>
  );
};

function App() {
  const [activeMode, setActiveMode] = useState(null); 
  
  // 各遊戲選歌狀態
  const [zimageSong, setZimageSong] = useState(null); 
  const [lyricsGameSong, setLyricsGameSong] = useState(null); 
  const [capsuleSong, setCapsuleSong] = useState(null); 

  // ★ 新增：全域心情與音樂狀態
  const [globalMood, setGlobalMood] = useState(null);
  const [bgm, setBgm] = useState('bg_music.mp3');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const homeSectionRef = useRef(null);
  const trainSectionRef = useRef(null);
  const gameSectionRef = useRef(null);

  // 控制音樂播放
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("等待使用者互動才能播放", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, bgm]);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartJourney = () => {
    setIsPlaying(true); // 進入火車區時自動開始播放音樂
    scrollTo(trainSectionRef);
  };

  const handleBackToHome = () => {
    scrollTo(homeSectionRef);
  };

  const handleModeSelect = (mode) => {
    if (mode.locked) return;
    setActiveMode(mode.id);
    setZimageSong(null);
    setLyricsGameSong(null);
    setCapsuleSong(null);
    setTimeout(() => scrollTo(gameSectionRef), 100);
  };

  // 統一的返回按鈕樣式
  const UnifiedBackButton = ({ onClick, text = "← 返回火車" }) => (
    <button 
      onClick={onClick} 
      className="absolute top-6 left-6 z-50 px-5 py-2.5 bg-[#F5F5F5]/90 text-gray-800 font-bold rounded-lg shadow border border-gray-300 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300 tracking-wide flex items-center"
    >
      {text}
    </button>
  );

  // 重構選歌 UI
  const SongSelector = ({ title, onSelect, icon }) => (
    <div className="w-full max-w-5xl px-4 z-10 flex flex-col items-center relative h-full pt-20">
      <UnifiedBackButton onClick={() => scrollTo(trainSectionRef)} />
      <h2 className="text-4xl text-gray-800 font-bold mb-12 tracking-wider drop-shadow-sm">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
        {folkSongs.map((song) => (
          <div 
            key={song.id} 
            onClick={() => onSelect(song)} 
            className="bg-[#FDFBF7]/95 rounded-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl flex overflow-hidden h-32 border border-gray-200 relative group"
          >
            <div className="w-4 h-full bg-red-500 absolute left-0 top-0"></div>
            <div className="pl-10 p-6 flex flex-col justify-center flex-1">
              <h3 className="text-2xl font-bold text-gray-800">{song.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{song.singer}</p>
            </div>
            <div className="w-20 flex items-center justify-center text-3xl bg-gray-100/50 border-l border-gray-200 group-hover:bg-gray-200 transition-colors">
              {icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] text-folk-dark font-serif overflow-x-hidden flex flex-col relative">
      
      {/* ★ 全域音樂標籤 */}
      <audio ref={audioRef} src={`/music/${bgm}`} loop />
      
      {/* ★ 全域沉浸特效 */}
      <GlobalMoodEffects mood={globalMood} />

      {/* Section 1: 首頁 */}
      <section ref={homeSectionRef} className="h-screen w-full flex flex-col items-center justify-center relative shrink-0 bg-cover bg-center bg-no-repeat z-10" style={{ backgroundImage: "url('/home-bg.jpg')" }}>
        <div className="absolute inset-0 bg-black/20 z-0"></div> 
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center flex flex-col items-center z-10 bg-[#F5F5F5]/90 p-12 rounded-lg border border-gray-300 shadow-xl">
          <h1 className="text-7xl font-bold tracking-widest mb-6 text-gray-800 drop-shadow-sm">民歌旅程</h1>
          <p className="text-2xl text-gray-600 tracking-wider mb-10 drop-shadow-sm">那年，我們唱自己的歌</p>
          <button onClick={handleStartJourney} className="px-10 py-4 bg-gray-800 text-[#F5F5F5] rounded-lg hover:bg-gray-700 hover:-translate-y-1 transition-all duration-300 text-lg font-bold tracking-widest shadow-md">
            開啟旅程 ↓
          </button>
        </motion.div>
      </section>

      {/* Section 2: 火車模式選擇 */}
      <section ref={trainSectionRef} className="h-screen w-full relative shrink-0 bg-cover bg-center bg-no-repeat z-10" style={{ backgroundImage: "url('/train-bg.jpg')" }}>
        
        {/* ★ 全域播放器 UI (放在火車區塊右上角) */}
        <div className="absolute top-6 right-6 z-50 flex items-center bg-[#F5F5F5] px-4 py-2 rounded-lg shadow border border-gray-300">
           <div className={`mr-3 text-xl ${isPlaying ? 'animate-spin' : ''}`}>💿</div>
           <div className="flex flex-col mr-6">
             <span className="text-[10px] text-gray-500 font-bold tracking-widest">NOW PLAYING</span>
             <span className="text-sm text-gray-800 font-bold tracking-wider">
               {bgm === 'bg_music.mp3' ? '經典民歌放送中' : bgm.replace('.mp3', '')}
             </span>
           </div>
           <button 
             onClick={() => setIsPlaying(!isPlaying)} 
             className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded text-gray-800 hover:bg-gray-300 transition-colors border border-gray-400"
           >
             {isPlaying ? 'II' : '▶'}
           </button>
        </div>

        <div className="relative z-10 w-full h-full">
          <TrainPage onSelectMode={handleModeSelect} onBack={handleBackToHome} />
        </div>
      </section>

      {/* Section 3: 互動/遊戲區 */}
      <section ref={gameSectionRef} className="h-screen w-full flex flex-col items-center justify-center relative shrink-0 overflow-hidden bg-cover bg-center bg-no-repeat z-10" style={{ backgroundImage: "url('/game-bg.jpg')" }}>
        <div className="absolute inset-0 bg-black/10 z-0"></div> 
        
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          {!activeMode && <div className="text-gray-700 text-2xl font-bold tracking-widest drop-shadow-sm bg-[#F5F5F5]/90 px-8 py-4 rounded-lg shadow border border-gray-300">請先在上方火車選擇一種體驗...</div>}

          {activeMode === 'mood-train' && (
             <div className="relative w-full h-full">
               {/* 傳入 setGlobalMood 讓遊戲可以改變全域狀態 */}
               <MoodTrainGame 
                 onBack={() => scrollTo(trainSectionRef)} 
                 onMoodDetected={(mood) => setGlobalMood(mood)} 
               />
             </div>
          )}

          {activeMode === 'ai-zimage' && (
             <div className="relative w-full h-full flex flex-col items-center justify-center">
               {!zimageSong ? (
                 <SongSelector title="請選擇要創作的歌曲" onSelect={setZimageSong} icon="🎨" />
               ) : (
                 <AiCoverGame_zimage song={zimageSong} onBack={() => setZimageSong(null)} onHome={() => scrollTo(trainSectionRef)} />
               )}
             </div>
          )}

          {activeMode === 'faceswap' && (
            <div className="relative w-full h-full">
              <FaceSwapGame onBack={() => scrollTo(trainSectionRef)} />
            </div>
          )}

          {activeMode === 'ar' && (
             <div className="relative w-full h-full">
               <ArGame onBack={() => scrollTo(trainSectionRef)} />
             </div>
          )}

          {activeMode === 'lyrics' && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {!lyricsGameSong ? (
                <SongSelector title="請選擇一首歌曲進行填詞" onSelect={setLyricsGameSong} icon="📝" />
              ) : (
                <div className="w-full h-full relative flex items-center justify-center">
                   <UnifiedBackButton onClick={() => scrollTo(trainSectionRef)} />
                   <button onClick={() => setLyricsGameSong(null)} className="absolute top-6 left-44 z-50 px-5 py-2.5 bg-gray-800 text-white font-bold rounded-lg shadow hover:bg-gray-700 transition-colors duration-300">
                     ↺ 重選歌曲
                   </button>
                   <LyricsGame song={lyricsGameSong} onRestart={() => setLyricsGameSong(null)} />
                </div>
              )}
            </div>
          )}

          {activeMode === 'capsule' && (
             <div className="relative w-full h-full flex flex-col items-center justify-center">
               {!capsuleSong ? (
                 <SongSelector title="請選擇要打包的歌曲" onSelect={setCapsuleSong} icon="🎁" />
               ) : (
                 <CapsuleGame song={capsuleSong} onBack={() => setCapsuleSong(null)} onHome={() => scrollTo(trainSectionRef)} />
               )}
             </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;