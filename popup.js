function analyze() {
  document.getElementById('status').textContent = 'Analyzing...';
  document.getElementById('best-move').textContent = '...';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        // Get the FEN position from Chess.com
        const board = document.querySelector('chess-board') || document.querySelector('.board');
        if (!board) return null;
        const fen = board.getAttribute('fen') || board.fen;
        return fen;
      }
    }, (results) => {
      const fen = results?.[0]?.result;
      if (!fen) {
        document.getElementById('status').textContent = 'Could not read board. Make sure you are in a game.';
        document.getElementById('best-move').textContent = '—';
        return;
      }
      document.getElementById('status').textContent = `Position: ${fen.split(' ')[0]}`;
      getBestMove(fen);
    });
  });
}

function getBestMove(fen) {
  const worker = new Worker(chrome.runtime.getURL('stockfish.js'));
  
  worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.startsWith('bestmove')) {
      const move = msg.split(' ')[1];
      document.getElementById('best-move').textContent = move;
      document.getElementById('status').textContent = 'Best move found!';
      worker.terminate();
    }
  };

  worker.postMessage('uci');
  worker.postMessage('isready');
  worker.postMessage(`position fen ${fen}`);
  worker.postMessage('go movetime 2000');
}