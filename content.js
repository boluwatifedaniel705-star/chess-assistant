let currentFen = null;
let playerColor = null;

function getPlayerColor() {
  // Chess.com flips the board when you play as black
  const board = document.querySelector('chess-board');
  if (!board) return 'white';
  const flipped = board.getAttribute('flipped');
  return flipped === 'true' || flipped === '' ? 'black' : 'white';
}

function isMyTurn(fen) {
  if (!fen) return false;
  // FEN format: position active_color castling ...
  // active_color is 'w' for white, 'b' for black
  const parts = fen.split(' ');
  const activeColor = parts[1];
  const color = getPlayerColor();
  return (activeColor === 'w' && color === 'white') || 
         (activeColor === 'b' && color === 'black');
}

function getBoardFen() {
  const board = document.querySelector('chess-board');
  if (!board) return null;
  const fen = board.game?.getFEN?.() || 
               board.getAttribute('fen') ||
               window.game?.getFEN?.();
  return fen;
}

function updateFen() {
  const fen = getBoardFen();
  if (fen && fen !== currentFen) {
    currentFen = fen;
    const myTurn = isMyTurn(fen);
    chrome.storage.local.set({ 
      currentFen: fen,
      myTurn: myTurn,
      playerColor: getPlayerColor()
    });
  }
}

const observer = new MutationObserver(() => {
  updateFen();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['fen']
});

setInterval(updateFen, 1000);
updateFen();