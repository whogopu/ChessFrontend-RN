import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';

interface MoveEval {
    from: string;
    eval: number;
}

/**
 * Hook to get piece evaluations per square on player's turn.
 */
export function usePieceEvaluations(fen: string, evaluateFen: (fen: string) => Promise<number>) {
    const [pieceScores, setPieceScores] = useState<Record<string, number>>({});

    useEffect(() => {
        const chess = new Chess(fen);
        const legalMoves = chess.moves({ verbose: true });

        const grouped: Record<string, typeof legalMoves> = {};
        for (const move of legalMoves) {
            if (!grouped[move.from]) grouped[move.from] = [];
            grouped[move.from].push(move);
        }

        const scorePerPiece: Record<string, number> = {};

        const evaluateAll = async () => {
            for (const from in grouped) {
                const moves = grouped[from];
                let bestEval = -Infinity;

                for (const move of moves) {
                    const sim = new Chess(fen);
                    sim.move({ from: move.from, to: move.to, promotion: move.promotion });
                    const evalScore = await evaluateFen(sim.fen());
                    bestEval = Math.max(bestEval, evalScore);
                }

                scorePerPiece[from] = bestEval;
            }

            setPieceScores(scorePerPiece);
        };

        evaluateAll();
    }, [fen]);

    return pieceScores;
}
