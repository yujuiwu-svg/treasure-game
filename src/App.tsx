import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Toaster } from 'sonner';
import { Button } from './components/ui/button';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { saveScore, getScores } from './lib/auth';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';
import keyCursor from './assets/key.png';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

type AppState = 'landing' | 'game' | 'scores';

export default function App() {
  const { user, loading, signout } = useAuth();

  const [appState, setAppState] = useState<AppState>('landing');
  const [isGuest, setIsGuest] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'signin' | 'signup' }>({
    open: false,
    tab: 'signin',
  });

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const scoreSavedRef = useRef(false);

  const [scoreHistory, setScoreHistory] = useState<{ score: number; played_at: string }[]>([]);

  const initializeGame = () => {
    // Pick 1 random index to be the evil box; the other 2 are treasure
    const evilBoxIndex = Math.floor(Math.random() * 3);
    setBoxes(
      Array.from({ length: 3 }, (_, index) => ({
        id: index,
        isOpen: false,
        hasTreasure: index !== evilBoxIndex,
      }))
    );
    setScore(0);
    setGameEnded(false);
    scoreSavedRef.current = false;
  };

  // Auto-save score when game ends (signed-in users only)
  useEffect(() => {
    if (gameEnded && user && !scoreSavedRef.current) {
      scoreSavedRef.current = true;
      saveScore(score);
    }
  }, [gameEnded]);

  const openBox = (boxId: number) => {
    if (gameEnded) return;

    const box = boxes.find((b) => b.id === boxId);
    new Audio(box?.hasTreasure ? chestOpenSound : evilLaughSound).play();

    setBoxes((prevBoxes) => {
      const updatedBoxes = prevBoxes.map((box) => {
        if (box.id === boxId && !box.isOpen) {
          const newScore = box.hasTreasure ? score + 50 : score - 50;
          setScore(newScore);
          return { ...box, isOpen: true };
        }
        return box;
      });

      const evilOpened = updatedBoxes.some((box) => box.isOpen && !box.hasTreasure);
      const allTreasuresOpened = updatedBoxes.filter((box) => box.hasTreasure).every((box) => box.isOpen);
      if (evilOpened || allTreasuresOpened) {
        setGameEnded(true);
      }

      return updatedBoxes;
    });
  };

  const startGame = (guest: boolean) => {
    setIsGuest(guest);
    initializeGame();
    setAppState('game');
  };

  const openHistory = async () => {
    const scores = await getScores();
    setScoreHistory(scores);
    setAppState('scores');
  };

  const handleSignOut = async () => {
    await signout();
    setAppState('landing');
    setIsGuest(false);
  };

  // When user signs in from landing, go straight to game
  const handleAuthSuccess = () => {
    setAuthModal({ open: false, tab: 'signin' });
    startGame(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center">
        <p className="text-amber-800 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col">
      {/* Header */}
      {(user || isGuest) && appState !== 'landing' && (
        <div className="flex justify-between items-center px-6 py-3 bg-amber-200/60 border-b border-amber-300">
          <span className="text-amber-900 font-medium">
            {user ? `⚓ ${user.username}` : '👤 Guest'}
          </span>
          <div className="flex gap-2">
            {user && appState === 'game' && gameEnded && (
              <Button
                variant="outline"
                size="sm"
                className="border-amber-400 text-amber-800"
                onClick={openHistory}
              >
                Score History
              </Button>
            )}
            {user && (
              <Button
                variant="outline"
                size="sm"
                className="border-amber-400 text-amber-800"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            )}
            {isGuest && (
              <Button
                variant="outline"
                size="sm"
                className="border-amber-400 text-amber-800"
                onClick={() => {
                  setIsGuest(false);
                  setAppState('landing');
                }}
              >
                Exit
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Landing Screen */}
        {appState === 'landing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md w-full"
          >
            <h1 className="text-4xl mb-2 text-amber-900">🏴‍☠️ Treasure Hunt</h1>
            <p className="text-amber-700 mb-8">Open chests, find treasure, track your scores!</p>

            <div className="bg-amber-200/60 rounded-2xl p-8 border-2 border-amber-300 shadow-lg space-y-3">
              {user ? (
                <>
                  <p className="text-amber-900 mb-4">Welcome back, <strong>{user.username}</strong>!</p>
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-lg py-6"
                    onClick={() => startGame(false)}
                  >
                    Play Game
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-amber-400 text-amber-800"
                    onClick={openHistory}
                  >
                    View Score History
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-amber-600"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-lg py-6"
                    onClick={() => setAuthModal({ open: true, tab: 'signin' })}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-amber-500 text-amber-800 text-lg py-6"
                    onClick={() => setAuthModal({ open: true, tab: 'signup' })}
                  >
                    Sign Up
                  </Button>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-amber-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-amber-200/60 px-2 text-amber-600">or</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full text-amber-600"
                    onClick={() => startGame(true)}
                  >
                    Play as Guest
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Game Screen */}
        {appState === 'game' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
              <p className="text-amber-800 mb-4">Click on the treasure chests to discover what's inside!</p>
              <p className="text-amber-700 text-sm">💰 Treasure: +$50 | 💀 Skeleton: -$50</p>
            </div>

            <div className="mb-8 flex items-center gap-4">
              <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
                <span className="text-amber-900">Current Score: </span>
                <span className={score >= 0 ? 'text-green-600' : 'text-red-600'}>${score}</span>
              </div>
              {gameEnded && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`text-3xl font-bold p-4 rounded-lg shadow-lg border-2 ${
                    score > 0
                      ? 'bg-green-100 border-green-400 text-green-700'
                      : score === 0
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                      : 'bg-red-100 border-red-400 text-red-700'
                  }`}
                >
                  {score > 0 ? '贏 🎉' : score === 0 ? '平手 🤝' : '輸 💀'}
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {boxes.map((box) => (
                <motion.div
                  key={box.id}
                  className="flex flex-col items-center"
                  style={{ cursor: box.isOpen ? 'default' : `url(${keyCursor}) 8 8, pointer` }}
                  whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
                  whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
                  onClick={() => openBox(box.id)}
                >
                  <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: box.isOpen ? 180 : 0, scale: box.isOpen ? 1.1 : 1 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <img
                      src={box.isOpen ? (box.hasTreasure ? treasureChest : skeletonChest) : closedChest}
                      alt={box.isOpen ? (box.hasTreasure ? 'Treasure!' : 'Skeleton!') : 'Treasure Chest'}
                      className="w-48 h-48 object-contain drop-shadow-lg"
                    />
                    {box.isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                      >
                        {box.hasTreasure ? (
                          <div className="text-2xl animate-bounce">✨💰✨</div>
                        ) : (
                          <div className="text-2xl animate-pulse">💀👻💀</div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                  <div className="mt-4 text-center">
                    {box.isOpen ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                        className={`text-lg p-2 rounded-lg ${
                          box.hasTreasure
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {box.hasTreasure ? '+$50' : '-$50'}
                      </motion.div>
                    ) : (
                      <div className="text-amber-700 p-2">Click to open!</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {gameEnded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
                  <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
                  <p className="text-lg text-amber-800">
                    Final Score:{' '}
                    <span className={score >= 0 ? 'text-green-600' : 'text-red-600'}>${score}</span>
                  </p>
                  <p className="text-sm text-amber-600 mt-2">
                    {boxes.some((box) => box.isOpen && !box.hasTreasure)
                      ? 'You hit the evil box! Better luck next time! 💀'
                      : 'You found all the treasures! Amazing! 🎉'}
                  </p>
                  {user && (
                    <p className="text-xs text-amber-500 mt-1">✓ Score saved to your account</p>
                  )}
                  {isGuest && (
                    <p className="text-xs text-amber-500 mt-1">
                      Sign up to track your scores across games!
                    </p>
                  )}
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => startGame(isGuest)}
                    className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Play Again
                  </Button>
                  {user && (
                    <Button
                      variant="outline"
                      onClick={openHistory}
                      className="text-lg px-8 py-4 border-amber-400 text-amber-800"
                    >
                      Score History
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Score History Screen */}
        {appState === 'scores' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <h2 className="text-3xl text-amber-900 mb-6 text-center">📜 Score History</h2>
            <div className="bg-amber-200/60 rounded-2xl border-2 border-amber-300 shadow-lg overflow-hidden mb-6">
              {scoreHistory.length === 0 ? (
                <p className="text-center text-amber-700 py-8">No scores yet. Play a game!</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-amber-300/60 border-b border-amber-300">
                      <th className="text-left px-4 py-3 text-amber-900">#</th>
                      <th className="text-left px-4 py-3 text-amber-900">Score</th>
                      <th className="text-left px-4 py-3 text-amber-900">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreHistory.map((entry, i) => (
                      <tr key={i} className="border-b border-amber-200 last:border-0">
                        <td className="px-4 py-3 text-amber-700">{i + 1}</td>
                        <td
                          className={`px-4 py-3 font-medium ${
                            entry.score > 0
                              ? 'text-green-700'
                              : entry.score < 0
                              ? 'text-red-700'
                              : 'text-amber-700'
                          }`}
                        >
                          ${entry.score}
                        </td>
                        <td className="px-4 py-3 text-amber-600 text-sm">
                          {new Date(entry.played_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => startGame(false)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg"
              >
                Play Again
              </Button>
              <Button
                variant="outline"
                onClick={() => setAppState('landing')}
                className="border-amber-400 text-amber-800 px-8 py-4 text-lg"
              >
                Home
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <AuthModal
        open={authModal.open}
        defaultTab={authModal.tab}
        onClose={() => setAuthModal({ open: false, tab: 'signin' })}
        onSuccess={handleAuthSuccess}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}
