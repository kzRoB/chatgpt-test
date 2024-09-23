const board = ChessBoard('board', {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
});

const game = new Chess();
let timer;
let whiteTime = 300; // 5 minutes
let blackTime = 300; // 5 minutes
let isWhiteTurn = true;

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (isWhiteTurn) {
            whiteTime--;
            $('#whiteTime').text(whiteTime);
        } else {
            blackTime--;
            $('#blackTime').text(blackTime);
        }
        if (whiteTime <= 0 || blackTime <= 0) {
            clearInterval(timer);
            alert('Time is up!');
            game.game_over = true;
            updateStatus();
        }
    }, 1000);
}

function onDragStart (source, piece, position, orientation) {
    if (game.in_checkmate() || game.in_draw() || piece.search(isWhiteTurn ? /^b/ : /^w/) !== -1) {
        return false;
    }
}

function onDrop (source, target) {
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    removeGreySquares();
    if (move === null) return 'snapback';

    updateStatus();
    isWhiteTurn = !isWhiteTurn;

    if (!isWhiteTurn) {
        setTimeout(() => playAI(), 500);
    } else {
        startTimer();
    }
}

function playAI() {
    const stockfish = new Worker('stockfish.js');
    stockfish.postMessage('uci');

    stockfish.onmessage = function(event) {
        if (event.data.startsWith('uciok')) {
            stockfish.postMessage('position fen ' + game.fen());
            stockfish.postMessage('go movetime 1000');
        }
        if (event.data.startsWith('bestmove')) {
            const move = event.data.split(' ')[1];
            game.move(move);
            board.position(game.fen());
            updateStatus();
            isWhiteTurn = true;
            startTimer();
        }
    };
}

function removeGreySquares () {
    $('#board .square-55d63').css('background', '');
}

function updateStatus () {
    let status = '';

    if (game.game_over()) {
        status = 'Game over';
        clearInterval(timer);
    } else {
        status = 'Turn: ' + (isWhiteTurn ? 'White' : 'Black');
    }

    $('#status').html(status);
    $('#fen').html(game.fen());
}

$('#startBtn').on('click', () => {
    board.start();
    resetTimer();
});
$('#clearBtn').on('click', board.clear);
$('#aiBtn').on('click', () => {
    board.start();
    resetTimer();
    isWhiteTurn = true; // Start with white
    startTimer();
});

function resetTimer() {
    whiteTime = 300;
    blackTime = 300;
    $('#whiteTime').text(whiteTime);
    $('#blackTime').text(blackTime);
    clearInterval(timer);
}

updateStatus();
