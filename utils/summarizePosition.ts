import { Chess } from 'chess.js';

export function describeMoveUCI(uciMove: string, fen: string): string | null {
    if (!uciMove || uciMove.length < 4) return null;

    const from = uciMove.slice(0, 2);
    const to = uciMove.slice(2, 4);
    const promotion = uciMove.length === 5 ? uciMove[4] : undefined;

    const sim = new Chess(fen);
    const move = sim.move({ from, to, promotion });

    if (!move) return null;

    const pieceNames: { [key: string]: string } = {
        p: 'pawn',
        n: 'knight',
        b: 'bishop',
        r: 'rook',
        q: 'queen',
        k: 'king',
    };

    const color = move.color === 'w' ? 'White' : 'Black';
    const piece = pieceNames[move.piece];
    const action = move.captured
        ? `captures ${pieceNames[move.captured]}`
        : `moves`;

    const promo = move.promotion ? ` and promotes to ${pieceNames[move.promotion]}` : '';

    return `${color} ${piece} ${action} from ${from} to ${to}${promo}.`;
}

function chessMovesEqualUCI(played: any, suggested: string): boolean {
    if (!played || !suggested) return false;
    return played === suggested;
}

function pieceName(code: string) {
    switch (code) {
        case 'p': return 'pawn';
        case 'n': return 'knight';
        case 'b': return 'bishop';
        case 'r': return 'rook';
        case 'q': return 'queen';
        case 'k': return 'king';
        default: return '';
    }
}

// 👇 Updated version
export function getNaturalSummary2(
    lastSuggestedMove: string,
    nextMoveEval: string,
    nextBestMove: string,
    chess: Chess,
): string | null {
    const lastMove = chess.history({ verbose: true }).slice(-1)[0];
    console.log('lastmove1', lastMove, lastMove.lan, lastMove.san);
    console.log('lastmove2', lastMove.lan, lastMove.san);

    if (!lastMove) return "Game just started.";

    const piece = pieceName(lastMove.piece);
    const from = lastMove.from;
    const to = lastMove.to;
    const captured = lastMove.captured;
    const playedSan = lastMove.san;
    const playedLan = lastMove.lan;
    const whoPlayed = lastMove.color


    // 🔁 Get previous FEN by undoing the last move
    const chessBefore = new Chess();
    chessBefore.load(chess.fen());
    chessBefore.undo(); // go to position before last move
    const fenBefore = lastMove.before;
    const fenAfter = lastMove.after;
    const previousBestMoveUCI = lastSuggestedMove
    console.log('desc1');
    const lastMoveDesc = describeMoveUCI(playedLan, fenBefore)

    let summary = `${whoPlayed == 'b' ? 'black' : 'white'}` + "'s move: " + playedLan;
    if (lastMoveDesc) summary += ` (${lastMoveDesc})`

    console.log('summ2: ', summary);
    console.log('summ31: ', previousBestMoveUCI, fenBefore);

    if (whoPlayed == 'w') {
        console.log(`judge1 : played=${playedLan} | shouldHave=${lastSuggestedMove} `);
        console.log('desc2', previousBestMoveUCI, fenBefore);
        const lastSuggestedBestMoveText = describeMoveUCI(previousBestMoveUCI, fenBefore);

        console.log('summ32: ', lastSuggestedBestMoveText);
        // ✅ Compare user's move with previous best move
        if (previousBestMoveUCI && !chessMovesEqualUCI(playedLan, lastSuggestedMove)) {
            summary += `\n wasn't optimal. Suggested was: ${lastSuggestedBestMoveText}\n`;

        }
    }



    // ✅ Add qualitative move description
    let whatHappened = ''
    if (captured) {
        whatHappened += `You captured a ${pieceName(captured)} with your ${piece}.\n`;
    } else if (['d4', 'e4', 'd5', 'e5'].includes(to)) {
        whatHappened += `You're controlling the center with your ${piece}.\n`;
    } else if (lastMove.flags.includes('k') || lastMove.flags.includes('q')) {
        whatHappened += `You castled your king — good for safety!\n`;
    } else if (piece === 'knight' && ['f3', 'c3', 'f6', 'c6'].includes(to)) {
        whatHappened += `You developed your knight — nice opening move.\n`;
    } else if (piece === 'bishop' && ['c4', 'f4', 'g5', 'b5'].includes(to)) {
        whatHappened += `You developed your bishop — controlling long diagonals.\n`;
    }

    if (whatHappened) {
        summary += `\nWhat happened: ${whatHappened}`
    }

    // ✅ Describe next best move from current FEN
    if (nextBestMove) {
        console.log('desc3');

        const nextBestDesc = describeMoveUCI(nextBestMove, fenAfter);
        if (nextBestDesc) summary += `\n\nSuggestion for ${whoPlayed == 'b' ? 'white' : 'black'} is: ${nextBestMove}: (${nextBestDesc})`;
    }

    return summary.trim() || null;
}

export function getNaturalSummary(
    fen: string,
    pv: string[],               // pv[0] = next best move (UCI)
    chess: any,
    previousBestMoveUCI?: string // optional: previous best move in UCI
): string | null {
    return null
    // const lastMove = chess.history({ verbose: true }).slice(-1)[0];
    // if (!lastMove) return "Game just started.";

    // const piece = pieceName(lastMove.piece);
    // const from = lastMove.from;
    // const to = lastMove.to;
    // const captured = lastMove.captured;
    // const playedSan = lastMove.san;

    // // 🔁 Get previous FEN by undoing the last move
    // const chessBefore = new Chess();
    // chessBefore.load(chess.fen());
    // chessBefore.undo(); // go to position before last move
    // const fenBefore = chessBefore.fen();

    // let summary = "";

    // // ✅ Compare user's move with previous best move
    // if (previousBestMoveUCI && !chessMovesEqualUCI(lastMove, previousBestMoveUCI)) {
    //     const bestMoveText = describeMoveUCI(previousBestMoveUCI, fenBefore);
    //     summary += `Your move (${playedSan}) wasn't optimal. ${bestMoveText}\n`;
    // }

    // // ✅ Add qualitative move description
    // if (captured) {
    //     summary += `You captured a ${pieceName(captured)} with your ${piece}.\n`;
    // } else if (['d4', 'e4', 'd5', 'e5'].includes(to)) {
    //     summary += `You're controlling the center with your ${piece}.\n`;
    // } else if (lastMove.flags.includes('k') || lastMove.flags.includes('q')) {
    //     summary += `You castled your king — good for safety!\n`;
    // } else if (piece === 'knight' && ['f3', 'c3', 'f6', 'c6'].includes(to)) {
    //     summary += `You developed your knight — nice opening move.\n`;
    // } else if (piece === 'bishop' && ['c4', 'f4', 'g5', 'b5'].includes(to)) {
    //     summary += `You developed your bishop — controlling long diagonals.\n`;
    // }

    // // ✅ Describe next best move from current FEN
    // const nextBestMove = pv?.[0];
    // if (nextBestMove) {
    //     const nextBestDesc = describeMoveUCI(nextBestMove, fen);
    //     if (nextBestDesc) summary += `Best response is: ${nextBestDesc}`;
    // }

    // return summary.trim() || null;
}
