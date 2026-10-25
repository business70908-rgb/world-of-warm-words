import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import leafContainerNew from '@/assets/leaf-container-new.png';
import environmentMain from '@/assets/environment-main.png';
import environmentShare from '@/assets/environment-share.png';
import newBackArrow from '@/assets/new-back-arrow.png';
import arrowRight from '@/assets/arrow-right.png';
import filler2 from '@/assets/filler-2.png';
import environment1 from '@/assets/environment-1.png';
import natureImg from '@/assets/Nature.png';
import helpSupportIcon from '@/Icon assets/Help & Support.png';
import { MobileContainer } from '@/components/MobileContainer';
import { scanStorage } from '@/lib/storage/scanStorage';

interface LeaderboardEntry {
  id: string;
  rank: string;
  name: string;
  value: string;
}

interface LeaderboardData {
  title: string;
  entries: LeaderboardEntry[];
}

const DEFAULT_LEADERBOARD: LeaderboardData = {
  title: 'September Leaderboard',
  entries: [
    { id: '1', rank: '1', name: 'Devender Kumar', value: '110.51' },
    { id: '2', rank: '2', name: 'Akash Lukher', value: '108.69' },
    { id: '3', rank: '3', name: 'Anil Kumar', value: '97.09' },
    { id: '4', rank: '4', name: 'amit kumar', value: '92.88' },
    { id: '5', rank: '5', name: 'Ramesh Rana', value: '92.13' }
  ]
};

const getInitialData = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const Environment = () => {
  const navigate = useNavigate();
  const [displayNumber, setDisplayNumber] = useState('0');
  const [animationClass, setAnimationClass] = useState('');
  const [scanCount, setScanCount] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>(() => 
    getInitialData('leaderboardData', DEFAULT_LEADERBOARD)
  );
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number }>>(() => 
    getInitialData('leaderboardPositions', {})
  );
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartX = useRef<number>(0);
  const hasMigrated = useRef(false);

  // Memoized computed values
  const formattedCount = useMemo(() => {
    return scanCount > 999 ? (scanCount / 1000).toFixed(2) : scanCount.toString();
  }, [scanCount]);

  const unit = useMemo(() => scanCount > 999 ? 'Kg' : 'g', [scanCount]);

  // Initialize scan count and animation
  useEffect(() => {
    const loadScanCount = async () => {
      const count = await scanStorage.getScanCount();
      setScanCount(count);
    };
    
    loadScanCount();
    setAnimationClass('animate-slide-from-top');
    const timer = setTimeout(() => setDisplayNumber(formattedCount), 1500);
    return () => clearTimeout(timer);
  }, [formattedCount]);

  // One-time migration check
  useEffect(() => {
    if (hasMigrated.current) return;
    
    const savedRaw = localStorage.getItem('leaderboardData');
    if (savedRaw) {
      try {
        const saved = JSON.parse(savedRaw);
        if (saved?.title === 'August Leaderboard') {
          setLeaderboardData(DEFAULT_LEADERBOARD);
          hasMigrated.current = true;
        }
      } catch {}
    }
  }, []);

  // Persist leaderboard data
  useEffect(() => {
    localStorage.setItem('leaderboardData', JSON.stringify(leaderboardData));
  }, [leaderboardData]);

  // Persist positions
  useEffect(() => {
    localStorage.setItem('leaderboardPositions', JSON.stringify(positions));
  }, [positions]);

  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  const handleDoubleClick = useCallback((id: string, field: string) => {
    setEditingId(`${id}-${field}`);
  }, []);
  
  const handleTitleEdit = useCallback(() => {
    setEditingId('title');
  }, []);
  
  const handleInputChange = useCallback((value: string, id?: string, field?: string) => {
    if (id && field) {
      setLeaderboardData(prev => ({
        ...prev,
        entries: prev.entries.map(entry => 
          entry.id === id ? { ...entry, [field]: value } : entry
        )
      }));
    } else {
      setLeaderboardData(prev => ({ ...prev, title: value }));
    }
  }, []);
  
  const handleInputBlur = useCallback(() => {
    setEditingId(null);
  }, []);
  
  const handleLongPressStart = useCallback((e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX - (positions[id]?.x || 0);
    
    longPressTimer.current = setTimeout(() => {
      setAdjustingId(id);
    }, 500);
  }, [positions]);
  
  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setAdjustingId(null);
  }, []);
  
  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (adjustingId) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const newX = clientX - dragStartX.current;
      setPositions(prev => ({
        ...prev,
        [adjustingId]: { x: Math.max(-200, Math.min(200, newX)) }
      }));
    }
  }, [adjustingId]);

  return (
    <MobileContainer width={768} height={1440}>
      <div className="w-[768px] h-[1440px] relative bg-black/0 overflow-hidden">
          <div className="w-[768px] h-[1440px] left-0 top-0 absolute bg-black/0 overflow-y-auto scrollbar-hide">
            <div className="w-[768px] h-[3805px] left-0 top-0 absolute bg-black/0">
              <div className="w-[768px] h-[539px] left-0 top-[900px] absolute" style={{backgroundColor: '#fefefd'}} />
              
              <div className="w-[768px] h-[1352px] left-0 top-[87px] absolute bg-black/0">
                <div className="w-[768px] h-[539px] left-0 top-[813px] absolute bg-black/0">
                  <div className="w-[710px] h-64 left-[28px] top-[291px] absolute bg-black/0">
                    <div className="w-[706px] h-60 left-[4px] top-[3px] absolute bg-white rounded-tl-[35px] rounded-tr-[39px] rounded-bl-xl rounded-br-2xl border-2 border-stone-100" />
                    <div className="w-[666px] h-28 left-[24px] top-[136px] absolute bg-black/0">
                      <div className="w-[654px] h-28 left-[5px] top-[2px] absolute bg-lime-200 rounded-tl-3xl rounded-tr-3xl border border-stone-300" />
                      <div className="w-8 h-6 left-[589px] top-[63px] absolute justify-center text-neutral-500 text-base font-bold font-['Inter']">(kg)</div>
                      <div className="w-36 h-8 left-[477px] top-[32px] absolute justify-center text-stone-600 text-2xl font-bold font-['Inter']">CO,e saved</div>
                      <div className="w-20 h-7 left-[255px] top-[33px] absolute justify-center text-stone-600 text-2xl font-bold font-['Inter']">Name</div>
                      <div className="w-14 h-7 left-[45px] top-[33px] absolute justify-center text-neutral-600 text-2xl font-bold font-['Inter']">Rank</div>
                    </div>
                    {editingId === 'title' ? (
                      <input
                        type="text"
                        value={leaderboardData.title}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onBlur={handleInputBlur}
                        className="w-[708px] h-11 left-[15px] top-[48px] absolute text-center text-gray-500 text-3xl font-bold font-['Inter'] bg-transparent border-b-2 border-gray-400 outline-none"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="w-[708px] h-11 left-[15px] top-[48px] absolute text-center text-gray-500 text-3xl font-bold font-['Inter'] cursor-pointer"
                        onDoubleClick={handleTitleEdit}
                      >
                        {leaderboardData.title}
                      </div>
                    )}
                  </div>
                </div>
                {/* Text content above image */}
                <div className="w-[719px] h-96 left-[24px] top-[656px] absolute bg-black/0 z-10">
                  <div className="w-[768px] h-60 left-[-24px] top-[156px] absolute bg-black/0">
                    <div className="w-[692px] h-32 left-[20px] top-[117px] absolute bg-black/0">
                      <div className="w-96 h-10 left-[181px] top-[90px] absolute justify-center text-gray-500 text-3xl font-bold font-['Inter'] whitespace-nowrap">This Month CO,e Saved:</div>
                      <div className="absolute left-[510px] top-[85px] text-left text-gray-600 text-4xl font-bold font-['Inter'] whitespace-nowrap">{formattedCount} {unit}</div>
                      <img className="w-11 h-11 left-[92px] top-[86px] absolute rounded-3xl" src={leafContainerNew} />
                    </div>
                  </div>
                  <div className="w-[718px] h-64 left-[-1px] top-[2px] absolute bg-black/0">
                    <div className="w-[642px] h-24 left-[42px] top-[190px] absolute text-center justify-center text-neutral-400 text-2xl font-normal font-['Inter'] leading-loose">
                      Book bus & metro tickets, take direct rides and<br/>maximize your CO,e savings. Keep riding, keep<br/>saving, and get featured as a sustainability champion!
                    </div>
                    <div className="w-[525px] h-24 left-[101px] top-[90px] absolute text-center justify-center text-gray-600 text-4xl font-bold font-['Inter'] leading-10">
                      Get Featured as a Sustainability<br/>Champion!
                    </div>
                  </div>
                </div>
                
                <div className="w-[768px] h-[1084px] left-0 top-0 absolute bg-black/0">
                  <img className="w-[768px] h-[1084px] left-0 top-0 absolute" src={environmentMain} />
                  
                  <div className="h-11 left-1/2 -translate-x-1/2 top-[473px] absolute text-center text-white text-4xl font-normal font-['Inter']">CO,e saved so far!</div>
                  
                  <div className="h-24 left-1/2 -translate-x-1/2 top-[346px] absolute text-center text-white text-8xl font-bold font-['Inter'] whitespace-nowrap">
                    <span className={`inline-block ${animationClass}`}>{displayNumber}</span>
                    <span> {unit}</span>
                  </div>
                </div>
              </div>
              
              <div className="w-[768px] h-[87px] left-0 top-0 fixed z-50" style={{backgroundColor: '#02954a'}}>
                <img className="w-16 h-16 left-[666px] top-[12px] absolute" src={environmentShare} />
                <img 
                  className="w-8 h-7 left-[32px] top-[32px] absolute cursor-pointer" 
                  src={newBackArrow} 
                  alt="Back"
                  onClick={handleBackClick}
                />
              </div>
              
              {/* New Layout Section */}
              <div className="w-[768px] h-[1345px] left-0 top-[1440px] absolute bg-black/0 overflow-hidden">
                <div className="w-[768px] h-[1345px] left-0 top-0 absolute bg-white">
                  <div className="w-[768px] h-[1188px] left-0 top-0 absolute bg-black/0">
                    <div className="w-[768px] h-[1188px] left-0 top-0 absolute bg-white" />
                    <div 
                      className="w-[710px] h-36 left-[28px] top-[1021px] absolute bg-black/0 cursor-pointer"
                      onClick={() => navigate('/contact')}
                    >
                      <div className="w-[705px] h-36 left-[3px] top-[3px] absolute bg-white rounded-[39px] border border-gray-200" />
                      <img className="w-6 h-7 left-[643px] top-[60px] absolute" src={arrowRight} />
                      <div className="w-32 h-11 left-[131px] top-[53px] absolute justify-center text-gray-600 text-3xl font-bold font-['Inter']">Support</div>
                      <img className="w-11 h-11 left-[63px] top-[51px] absolute" src={helpSupportIcon} />
                    </div>
                    <div className="w-[711px] h-36 left-[27px] top-[816px] absolute bg-black/0">
                      <div className="w-[704px] h-36 left-[4px] top-[3px] absolute bg-white rounded-[39px] border-2 border-gray-200" />
                      <img className="w-6 h-7 left-[644px] top-[61px] absolute" src={arrowRight} />
                      <div className="w-80 h-11 left-[134px] top-[51px] absolute justify-center text-gray-600 text-3xl font-normal font-['Inter']">CO,e Savings History</div>
                      <img className="w-12 h-12 left-[60px] top-[47px] absolute" src={environment1} />
                    </div>
                      <div className="w-[707px] h-[760px] left-[30px] top-0 absolute bg-black/0">
                        <div className="w-[707px] h-[756px] left-0 top-0 absolute bg-white/95 rounded-tl-lg rounded-tr rounded-bl-[32px] rounded-br-[35px]" />
                        <div className="w-[707px] h-64 left-0 top-[506px] absolute bg-black/0">
                          <img className="w-3 h-5 left-[432px] top-[174px] absolute" src={arrowRight} />
                          <div className="w-44 h-11 left-[265px] top-[165px] absolute justify-center text-gray-600 text-3xl font-bold font-['Inter']">Show more</div>
                          <div className="w-[665px] h-28 left-[21px] top-[8px] absolute bg-black/0">
                            <img className="w-[700px] h-28 left-[-3px] top-[9px] absolute rounded-2xl rotate-180" src={filler2} alt="Filler background" />
                          <div className="absolute right-[65px] top-[39px] text-right text-neutral-600 text-3xl font-bold font-['Inter']">{formattedCount}</div>
                          <div className="w-14 h-9 left-[318px] top-[38px] absolute justify-center text-gray-600 text-3xl font-bold font-['Inter']">You</div>
                          <div className="w-10 h-7 left-[46px] top-[42px] absolute justify-center text-slate-600 text-2xl font-bold font-['Inter']">NA</div>
                        </div>
                      </div>
                      <div className="w-[673px] h-[481px] left-[15px] top-0 absolute bg-black/0">
                        {leaderboardData.entries.map((entry: any, index: number) => {
                          const bgColor = index % 2 === 1 ? 'bg-lime-200' : 'bg-slate-300';
                          const topPosition = index === 0 ? 0 : index * 94;
                          const isLastEntry = index === leaderboardData.entries.length - 1;
                          const roundedClass = index === 0 ? '' : isLastEntry ? 'rounded-bl-3xl rounded-br-3xl' : '';
                          const leftOffset = positions[`entry-${entry.id}`]?.x || 0;
                          
                          return (
                            <div 
                              key={entry.id}
                              className={`w-[665px] h-24 absolute bg-black/0`}
                              style={{ 
                                left: `${9 + leftOffset}px`, 
                                top: `${topPosition}px`,
                                cursor: adjustingId === `entry-${entry.id}` ? 'grabbing' : 'grab'
                              }}
                              onMouseDown={(e) => handleLongPressStart(e, `entry-${entry.id}`)}
                              onMouseUp={handleLongPressEnd}
                              onMouseMove={handleDragMove}
                              onMouseLeave={handleLongPressEnd}
                              onTouchStart={(e) => handleLongPressStart(e, `entry-${entry.id}`)}
                              onTouchEnd={handleLongPressEnd}
                              onTouchMove={handleDragMove}
                            >
                              <div className={`w-[658px] h-24 left-0 top-0 absolute ${bgColor} ${roundedClass}`} />
                              
                              {/* Value */}
                              {editingId === `${entry.id}-value` ? (
                                <input
                                  type="text"
                                  value={entry.value}
                                  onChange={(e) => handleInputChange(e.target.value, entry.id, 'value')}
                                  onBlur={handleInputBlur}
                                  className="w-16 h-7 left-[547px] top-[33px] absolute text-center text-gray-600 text-2xl font-bold font-['Inter'] bg-transparent border-b border-gray-500 outline-none"
                                  autoFocus
                                />
                              ) : (
                                <div 
                                  className="w-16 h-7 left-[547px] top-[33px] absolute justify-center text-gray-600 text-2xl font-bold font-['Inter'] cursor-pointer"
                                  onDoubleClick={() => handleDoubleClick(entry.id, 'value')}
                                >
                                  {entry.value}
                                </div>
                              )}
                              
                              {/* Name */}
                              {editingId === `${entry.id}-name` ? (
                                <input
                                  type="text"
                                  value={entry.name}
                                  onChange={(e) => handleInputChange(e.target.value, entry.id, 'name')}
                                  onBlur={handleInputBlur}
                                  className="w-48 left-[203px] top-[32px] absolute text-center text-gray-600 text-2xl font-bold font-['Inter'] bg-transparent border-b border-gray-500 outline-none"
                                  autoFocus
                                />
                              ) : (
                                <div 
                                  className="w-48 left-[203px] top-[32px] absolute justify-center text-gray-600 text-2xl font-bold font-['Inter'] cursor-pointer"
                                  onDoubleClick={() => handleDoubleClick(entry.id, 'name')}
                                >
                                  {entry.name}
                                </div>
                              )}
                              
                              {/* Rank */}
                              {editingId === `${entry.id}-rank` ? (
                                <input
                                  type="text"
                                  value={entry.rank}
                                  onChange={(e) => handleInputChange(e.target.value, entry.id, 'rank')}
                                  onBlur={handleInputBlur}
                                  className="w-5 h-7 left-[42px] top-[32px] absolute text-center text-gray-600 text-2xl font-bold font-['Inter'] bg-transparent border-b border-gray-500 outline-none"
                                  autoFocus
                                />
                              ) : (
                                <div 
                                  className="w-5 h-7 left-[42px] top-[32px] absolute text-center justify-center text-gray-600 text-2xl font-bold font-['Inter'] cursor-pointer"
                                  onDoubleClick={() => handleDoubleClick(entry.id, 'rank')}
                                >
                                  {entry.rank}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Third Layout Section */}
              <div className="w-[768px] h-[1020px] left-0 top-[2785px] absolute bg-black/0 overflow-hidden">
                <div className="w-[768px] h-[1020px] left-0 top-0 absolute bg-white">
                  <img className="w-[768px] h-[595px] left-0 top-[425px] absolute" src={natureImg} />
                  <div className="w-48 h-9 left-[292px] top-[221px] absolute justify-center text-gray-600 text-3xl font-normal font-['Inter']">-Robert Swan</div>
                  <div className="w-[597px] h-20 left-[92px] top-[119px] absolute text-center justify-center text-gray-600 text-3xl font-bold font-['Inter'] leading-9">"The greatest threat to our planet is the<br/>belief that someone else will save it."</div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </MobileContainer>
  );
};

export default Environment;
