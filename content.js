window.__chessAssistantLoaded = true;
console.log('Chess Assistant content script loaded!');

function getPieceMap() {
  const board = document.querySelector('wc-chess-board');
  if (!board) return null;
  
  const pieces = board.querySelectorAll('.piece');
  const pieceMap = {};
  
  pieces.forEach(piece => {
    const classes = Array.from(piece.classList);
    const squareClass = classes.find(c => c.startsWith('square-'));
    const pieceClass = classes.find(c => ['wp','wr','wn','wb','wq','wk','bp','br','bn','bb','bq','bk'].includes(c));
    
    if (squareClass && pieceClass) {
      const file = parseInt(squareClass[7]);
      const rank = parseInt(squareClass[8]);
      pieceMap[`${file}${rank}`] = pieceClass;
    }
  });
  
  return pieceMap;
}

function pieceMapToFen(pieceMap) {
  const pieceToFen = {
    'wp': 'P', 'wr': 'R', 'wn': 'N', 'wb': 'B', 'wq': 'Q', 'wk': 'K',
    'bp': 'p', 'br': 'r', 'bn': 'n', 'bb': 'b', 'bq': 'q', 'bk': 'k'
  };
  
  let fen = '';
  for (let rank = 8; rank >= 1; rank--) {
    let empty = 0;
    for (let file = 1; file <= 8; file++) {
      const piece = pieceMap[`${file}${rank}`];
      if (piece) {
        if (empty > 0) { fen += empty; empty = 0; }
        fen += pieceToFen[piece];
      } else {
        empty++;
      }
    }
    if (empty > 0) fen += empty;
    if (rank > 1) fen += '/';
  }
  return fen;
}

function getActiveColor() {
  const moveList = document.querySelector('wc-simple-move-list');
  if (!moveList) return 'w';
  const nodes = moveList.querySelectorAll('.node');
  const lastNode = nodes[nodes.length - 1];
  if (!lastNode) return 'w';
  return lastNode.classList.contains('white-move') ? 'b' : 'w';
}

function getPlayerColor() {
  const board = document.querySelector('wc-chess-board');
  if (!board) return 'white';

  const coordinates = board.querySelectorAll('.coordinates text');
  if (coordinates.length > 0) {
    const firstLabel = coordinates[0]?.textContent?.trim();
    // Changed from 'black' : 'white' to 'white' : 'black'
    return firstLabel === '8' ? 'white' : 'black'; 
  }

  return 'white';
}

function updatePosition() {
  const pieceMap = getPieceMap();
  if (!pieceMap) return;
  
  const pieceFen = pieceMapToFen(pieceMap);
  const activeColor = getActiveColor();
  const fen = `${pieceFen} ${activeColor} KQkq - 0 1`;
  
  const playerColor = getPlayerColor();
  const myTurn = (activeColor === 'w' && playerColor === 'white') || 
                 (activeColor === 'b' && playerColor === 'black');
  
  chrome.storage.local.set({ currentFen: fen, myTurn, playerColor });
}

const observer = new MutationObserver(() => {
  updatePosition();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class']
});

setInterval(updatePosition, 1000);
updatePosition();