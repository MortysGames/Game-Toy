/*<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Retro Tetris</title>
  <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900">
  <div id="root"></div>
  <script type="text/babel">
    const TETROMINOES = {
      I: { shape: [[1, 1, 1, 1]], color: 'bg-green-900' },
      L: { shape: [[1, 0], [1, 0], [1, 1]], color: 'bg-green-900' },
      J: { shape: [[0, 1], [0, 1], [1, 1]], color: 'bg-green-900' },
      O: { shape: [[1, 1], [1, 1]], color: 'bg-green-900' },
      Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-green-900' },
      S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-900' },
      T: { shape: [[1, 1, 1], [0, 1, 0]], color: 'bg-green-900' }
    };

    function RetroTetris() {
      const [gameBoard, setGameBoard] = React.useState(() => Array.from({ length: 20 }, () => Array(10).fill(0)));
      const [currentPiece, setCurrentPiece] = React.useState(null);
      const [position, setPosition] = React.useState({ x: 3, y: 0 });
      const [gameOver, setGameOver] = React.useState(false);

      const generateNewPiece = () => {
        const pieces = Object.keys(TETROMINOES);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        setCurrentPiece({ shape: TETROMINOES[randomPiece].shape, color: TETROMINOES[randomPiece].color });
        setPosition({ x: 3, y: 0 });
      };

      React.useEffect(() => {
        generateNewPiece();
      }, []);

      const handleKeyPress = (e) => {
        if (gameOver) return;
        switch (e.key) {
          case 'ArrowLeft': setPosition(pos => ({ ...pos, x: pos.x - 1 })); break;
          case 'ArrowRight': setPosition(pos => ({ ...pos, x: pos.x + 1 })); break;
          case 'ArrowDown': setPosition(pos => ({ ...pos, y: pos.y + 1 })); break;
          case 'ArrowUp':
            const rotated = {
              shape: currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse()),
              color: currentPiece.color
            };
            setCurrentPiece(rotated);
            break;
          default: break;
        }
      };

      React.useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
      });

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 font-mono">
          <div className="bg-gray-200 p-8 rounded-lg shadow-lg">
            <div className="text-green-900 mb-4">Retro Tetris</div>
            <div className="grid grid-cols-10 gap-0.5 border-4 border-green-900">
              {gameBoard.map((row, y) =>
                row.map((cell, x) => {
                  let isCurrent = false;
                  if (currentPiece) {
                    currentPiece.shape.forEach((pieceRow, py) => {
                      pieceRow.forEach((pieceCell, px) => {
                        if (pieceCell && y === position.y + py && x === position.x + px) {
                          isCurrent = true;
                        }
                      });
                    });
                  }

                  return (
                    <div
                      key={`${y}-${x}`}
                      className={`w-6 h-6 ${isCurrent ? currentPiece.color : 'bg-green-200'}`}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      );
    }

    ReactDOM.render(<RetroTetris />, document.getElementById('root'));
  </script>
</body>
</html>
