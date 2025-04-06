import { Chess } from 'chess.js';

export function getOpponentIntent(fen: string, pv: string[]): string | null {
    if (!pv || pv.length < 2) return null;

    const chess = new Chess(fen);
    const future = new Chess(fen);

    const move = future.move(pv[0]);
    const nextMove = future.move(pv[1]); // Next move by opponent

    if (!move || !nextMove) return null;

    // Check if the opponent's move captures a piece
    if (nextMove.captured) {
        return `Opponent is planning to capture your ${nextMove.captured} with ${nextMove.piece}.`;
    }

    // Check if opponent's move puts you in check
    if (future.in_check()) {
        return `Opponent is aiming to check your king. Be cautious.`;
    }

    // Check if opponent is building center control
    if (['d4', 'e4', 'd5', 'e5'].includes(nextMove.to)) {
        return `Opponent is trying to control the center.`;
    }

    return null;
}
