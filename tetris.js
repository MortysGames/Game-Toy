const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-green-900' },
  L: { shape: [[1, 0], [1, 0], [1, 1]], color: 'bg-green-900' },
  J: { shape: [[0, 1], [0, 1], [1, 1]], color: 'bg-green-900' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-green-900' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-green-900' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-900' },
  T: { shape: [[1, 1, 1], [0, 1, 0]], color: 'bg-green-900' }
};

const RetroTetris = () => {
  const [gameBoard, setGameBoard] = useState(() => Array.from({ length: 20 }, () => Array(10).fill(0)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [completedLines, setCompletedLines] = useState(0);
  const [highScores, setHighScores] = useState([
    { name: "kevin", score: 1000 },
    { name: "kevin", score: 900 },
    { name: "kevin", score: 800 },
    { name: "", score: 42 },
    { name: "kevin", score: 700 }
  ]);
  const [showHighScores, setShowHighScores] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [blinkingLines, setBlinkingLines] = useState([]);

  const checkCollision = useCallback((piece, pos) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (newX < 0 || newX >= 10 || newY >= 20 || (newY >= 0 && gameBoard[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  }, [gameBoard]);

  const generateNewPiece = useCallback(() => {
    const pieces = Object.keys(TETROMINOES);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    setCurrentPiece({
      shape: TETROMINOES[randomPiece].shape,
      color: TETROMINOES[randomPiece].color
    });
    setPosition({ x: 3, y: 0 });
  }, []);

  const movePiece = useCallback((dx, dy) => {
    if (gameOver || showHighScores || !currentPiece) return;
    const newPos = { x: position.x + dx, y: position.y + dy };
    if (!checkCollision(currentPiece, newPos)) {
      setPosition(newPos);
      return true;
    }
    return false;
  }, [currentPiece, position, gameOver, showHighScores, checkCollision]);

  const rotatePiece = useCallback(() => {
    if (gameOver || showHighScores || !currentPiece) return;
    const rotated = {
      shape: currentPiece.shape[0].map((_, i) => 
        currentPiece.shape.map(row => row[i]).reverse()
      ),
      color: currentPiece.color
    };
    if (!checkCollision(rotated, position)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, position, gameOver, showHighScores, checkCollision]);

  const submitHighScore = () => {
    if (playerName.trim()) {
      const newHighScores = [...highScores];
      newHighScores[3] = { name: playerName, score: 42 };
      setHighScores(newHighScores.sort((a, b) => b.score - a.score));
      resetGame();
    }
  };

  const mergePieceWithBoard = useCallback(() => {
    const newBoard = gameBoard.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const newY = position.y + y;
          const newX = position.x + x;
          if (newY >= 0) newBoard[newY][newX] = 1;
        }
      });
    });
    return newBoard;
  }, [gameBoard, currentPiece, position]);

  const handleControl = useCallback((action) => {
    switch(action) {
      case 'left': movePiece(-1, 0); break;
      case 'right': movePiece(1, 0); break;
      case 'down': movePiece(0, 1); break;
      case 'rotate': rotatePiece(); break;
      default: break;
    }
  }, [movePiece, rotatePiece]);

  const resetGame = useCallback(() => {
    setGameBoard(Array.from({ length: 20 }, () => Array(10).fill(0)));
    setCurrentPiece(null);
    setPosition({ x: 3, y: 0 });
    setGameOver(false);
    setCompletedLines(0);
    setShowHighScores(false);
    setBlinkingLines([]);
    setPlayerName("");
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver || showHighScores) return;
      switch (e.key) {
        case 'ArrowLeft': handleControl('left'); break;
        case 'ArrowRight': handleControl('right'); break;
        case 'ArrowDown': handleControl('down'); break;
        case 'ArrowUp': handleControl('rotate'); break;
        default: break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleControl, gameOver, showHighScores]);

  useEffect(() => {
    if (gameOver || showHighScores) return;

    const gameLoop = setInterval(() => {
      if (!currentPiece) {
        generateNewPiece();
        return;
      }

      if (!movePiece(0, 1)) {
        const newBoard = mergePieceWithBoard();
        setGameBoard(newBoard);
        generateNewPiece();

        if (newBoard[0].some(cell => cell)) {
          setGameOver(true);
          setShowHighScores(true);
        } else {
          const completedRows = newBoard.filter(row => row.every(cell => cell === 1)).length;
          if (completedRows > 0) {
            const filteredBoard = newBoard.filter(row => !row.every(cell => cell === 1));
            while (filteredBoard.length < 20) {
              filteredBoard.unshift(Array(10).fill(0));
            }
            setGameBoard(filteredBoard);
            const newCompletedLines = completedLines + completedRows;
            setCompletedLines(newCompletedLines);
            
            if (newCompletedLines >= 4) {
              setGameOver(true);
              setShowHighScores(true);
            }
          }
        }
      }
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [currentPiece, generateNewPiece, movePiece, mergePieceWithBoard, gameOver, showHighScores, completedLines]);

  const GameButton = ({ action, children, className }) => (
    <button
      className={`${className} active:bg-gray-600 transition-colors touch-none select-none`}
      onTouchStart={(e) => {
        e.preventDefault();
        handleControl(action);
      }}
      onClick={(e) => {
        e.preventDefault();
        handleControl(action);
      }}
    >
      {children}
    </button>
  );

  if (showHighScores) {
    return React.createElement("div", { className: "flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 font-mono" },
      React.createElement("div", { className: "bg-gray-200 p-8 rounded-lg shadow-lg relative" },
        React.createElement("div", { className: "absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gray-300 px-4 py-1 rounded text-sm font-bold" }, "GAME TOY"),
        React.createElement("div", { className: "bg-green-100 p-6 rounded-sm shadow-inner" },
          React.createElement("h2", { className: "text-xl text-green-900 mb-4" }, "High Scores"),
          React.createElement("div", { className: "space-y-2" },
            highScores.map((score, index) =>
              React.createElement("div", { key: index, className: "flex justify-between text-green-900" },
                React.createElement("span", null, index === 3 ?
                  React.createElement("input", {
                    type: "text",
                    value: playerName,
                    onChange: (e) => setPlayerName(e.target.value),
                    className: "bg-green-200 px-2 w-24",
                    maxLength: 10,
                    placeholder: "Your name"
                  }) : score.name),
                React.createElement("span", null, score.score)
              )
            )
          ),
          React.createElement("button", {
            className: "mt-6 w-full bg-green-900 text-green-100 py-2 rounded",
            onClick: submitHighScore
          }, "Submit & Restart")
        )
      )
    );
  }

  return React.createElement("div", { className: "flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 font-mono select-none touch-none" },
    React.createElement("div", { className: "bg-gray-200 p-8 rounded-lg shadow-lg relative" },
      React.createElement("div", { className: "absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gray-300 px-4 py-1 rounded text-sm font-bold" }, "GAME TOY"),
      React.createElement("div", { className: "bg-green-100 p-6 rounded-sm shadow-inner" },
        React.createElement("div", { className: "mb-4 text-2xl text-green-900" }, "Lines: ", completedLines),
        React.createElement("div", { className: "border-4 border-green-900 bg-green-200 p-1" },
          React.createElement("div", { className: "grid grid-cols-10 gap-px" },
            gameBoard.map((row, y) =>
              row.map((cell, x) => {
                let isCurrent = false;
                if (currentPiece) {
                  currentPiece.shape.forEach((pieceRow, pieceY) => {
                    pieceRow.forEach((pieceCell, pieceX) => {
                      if (pieceCell && y === position.y + pieceY && x === position.x + pieceX) {
                        isCurrent = true;
                      }
                    });
                  });
                }
                
                return React.createElement("div", {
                  key: `${y}-${x}`,
                  className: `w-6 h-6 ${
                    blinkingLines.includes(y)
                      ? 'bg-green-200'
                      : cell || isCurrent
                      ? 'bg-green-900'
                      : 'bg-green-200'
                  }`
                });
              })
            )
          )
        )
      ),
      React.createElement("div", { className: "mt-8 flex justify-between" },
        React.createElement("div", { className: "grid grid-cols-3 gap-2" },
          React.createElement("div"),
          React.createElement(GameButton, {
            action: "up",
            className: "w-8 h-8 bg-gray-700 rounded text-gray-200"
          }, "↑"),
          React.createElement("div"),
          React.createElement(GameButton, {
            action: "left",
            className: "w-8 h-8 bg-gray-700 rounded text-gray-200"
          }, "←"),
          React.createElement("div", { className: "w-8 h-8 bg-gray-800 rounded-full" }),
          React.createElement(GameButton, {
            action: "right",
            className: "w-8 h-8 bg-gray-700 rounded text-gray-200"
          }, "→"),
          React.createElement("div"),
          React.createElement(GameButton, {
            action: "down",
            className: "w-8 h-8 bg-gray-700 rounded text-gray-200"
          }, "↓"),
          React.createElement("div")
        ),
        React.createElement("div", { className: "flex gap-4 items-center" },
          React.createElement(GameButton, {
            action: "rotate",
            className: "w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-gray-200"
          }, "B"),
          React.createElement(GameButton, {
            action: "rotate",
            className: "w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-gray-200"
          }, "A")
        )
      ),
      React.createElement("div", { className: "mt-6 flex justify-center gap-8" },
        React.createElement("button", {
          className: "w-16 h-4 bg-gray-700 rounded-full transform -rotate-12 text-xs text-gray-200",
          onClick: resetGame
        }, "SELECT"),
        React.createElement("button", {
          className: "w-16 h-4 bg-gray-700 rounded-full transform rotate-12 text-xs text-gray-200",
          onClick: resetGame
        }, "START")
      )
    )
  );
};

ReactDOM.render(React.createElement(RetroTetris), document.getElementById('root'));
