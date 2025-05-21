import "./style.css";
import { BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH } from "./consts";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;

const $score = document.querySelector("span") as HTMLSpanElement;

const startButton = document.querySelector("#start-button") as HTMLSpanElement;

const TIME_REFRESH: number = 500;

type Piece = {
  position: {
    x: number;
    y: number;
  };
  shape: number[][];
  color: string;
};

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

context?.scale(BLOCK_SIZE, BLOCK_SIZE);

let score = 0;

const PIECE_SHAPES: number[][][] = [
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [[1, 1, 1, 1]],
  [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
];

const PIECE_COLORS: string[] = ["blue", "red", "green", "yellow"];

const piece: Piece = {
  position: { x: 6, y: 0 },
  shape: PIECE_SHAPES[0],
  color: PIECE_COLORS[0],
};

const createBoard = (width: number, height: number) => {
  return Array(height)
    .fill(0)
    .map(() => Array(width).fill(0));
};

const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

let dropCounter = 0;
let lastTime: number = 0;

let requestAnimationFrame = 0;

const update = (time: number = 0) => {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;

  if (dropCounter > TIME_REFRESH) {
    piece.position.y++;
    dropCounter = 0;

    if (checkCollision()) {
      piece.position.y--;

      solidifyPiece();
      removeRows();
    }
  }

  draw();

  requestAnimationFrame = window.requestAnimationFrame(update);
};

const draw = () => {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawSquare(x, y, "grey", "white");
      } else {
        drawSquare(x, y, "#ccc", "white");
      }
    });
  });

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawSquare(
          x + piece.position.x,
          y + piece.position.y,
          piece.color,
          "white"
        );
      }
    });
  });

  $score.innerText = score.toString();
};

const drawSquare = (
  x: number,
  y: number,
  color: string,
  borderColor: string
) => {
  context.fillStyle = color;
  context.fillRect(x, y, 1, 1);

  const borderSize = 1 / 10;

  context.strokeStyle = borderColor;
  context.lineWidth = borderSize;
  context.strokeRect(x, y, 1, 1);
};

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    piece.position.x--;

    if (checkCollision()) {
      piece.position.x++;
    }
  }

  if (event.key === "ArrowRight") {
    piece.position.x++;

    if (checkCollision()) {
      piece.position.x--;
    }
  }

  if (event.key === "ArrowDown") {
    piece.position.y++;

    if (checkCollision()) {
      piece.position.y--;

      solidifyPiece();
      removeRows();
    }
  }

  if (event.key === "ArrowUp") {
    const rotated: number[][] = [];

    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = [];

      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i]);
      }

      rotated.push(row);
    }

    const previousShape = piece.shape;

    piece.shape = rotated;

    if (checkCollision()) {
      piece.shape = previousShape;
    }
  }
});

const checkCollision = () => {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 && board[y + piece.position.y]?.[x + piece.position.x] !== 0
      );
    });
  });
};

const solidifyPiece = () => {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1;
      }
    });
  });

  resetMainPiece();

  if (checkCollision()) {
    gameOver();
  }
};

const resetMainPiece = () => {
  // reset position
  piece.position.x = Math.floor(BOARD_WIDTH / 2);
  piece.position.y = 0;

  // get random shape
  piece.shape = PIECE_SHAPES[Math.floor(Math.random() * PIECE_SHAPES.length)];

  // get next color
  piece.color = getNextPieceColor();
};

const removeRows = () => {
  const rowsToRemove: number[] = [];

  board.forEach((row, y) => {
    if (row.every((value) => value === 1)) {
      rowsToRemove.push(y);
    }
  });

  rowsToRemove.forEach((y) => {
    board.splice(y, 1);

    const newRow = Array(BOARD_WIDTH).fill(0);
    board.unshift(newRow);

    score += 10;
  });
};

const getNextPieceColor = () => {
  const currentColorIndex = PIECE_COLORS.indexOf(piece.color);

  if (currentColorIndex + 1 < PIECE_COLORS.length) {
    return PIECE_COLORS[currentColorIndex + 1];
  }

  return PIECE_COLORS[0];
};

const gameOver = () => {
  startButton.textContent = "Start Game";

  window.cancelAnimationFrame(requestAnimationFrame);
};

const startGame = () => {
  board.forEach((row) => row.fill(0));

  resetMainPiece();

  update();

  startButton.textContent = "Restart Game";
};

startButton.onclick = startGame;
