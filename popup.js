function analyze() {
  document.getElementById('status').textContent = 'Analyzing...';
  document.getElementById('best-move').textContent = '...';

  chrome.storage.local.get(['currentFen', 'myTurn', 'playerColor'], (result) => {
    const fen = result.currentFen;
    const myTurn = result.myTurn;
    const playerColor = result.playerColor;

    if (!fen) {
      document.getElementById('status').textContent = 'No position found. Make sure you are in a game on Chess.com.';
      document.getElementById('best-move').textContent = '—';
      return;
    }

    if (!myTurn) {
      document.getElementById('status').textContent = `You are playing as ${playerColor}. Waiting for your turn...`;
      document.getElementById('best-move').textContent = '⏳';
      return;
    }

    document.getElementById('status').textContent = `Your turn as ${playerColor}! Calculating...`;
    getBestMove(fen);
  });
}

function getBestMove(fen) {
  const worker = new Worker(chrome.runtime.getURL('stockfish.js'));

  worker.onmessage = (e) => {
    const msg = e.data;
    if (typeof msg === 'string' && msg.startsWith('bestmove')) {
      const move = msg.split(' ')[1];
      if (move && move !== '(none)') {
        document.getElementById('best-move').textContent = move;
        document.getElementById('status').textContent = '✅ Best move found!';
      } else {
        document.getElementById('best-move').textContent = '—';
        document.getElementById('status').textContent = 'Game might be over.';
      }
      worker.terminate();
    }
  };

  worker.postMessage('uci');
  worker.postMessage('isready');
  worker.postMessage(`position fen ${fen}`);
  worker.postMessage('go movetime 2000');
}