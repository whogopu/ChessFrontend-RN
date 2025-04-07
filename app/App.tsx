import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Chess } from 'chess.js';
import Chessboard from 'react-native-chessboard';
import MoveFeedback from './components/MoveFeedback';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { evaluatePosition, getTopMoves } from '../utils/evaluateMove';
import { getNaturalSummary, getNaturalSummary2 } from '../utils/summarizePosition';

function getEvaluationText(cp: number | null, moveNumber: number): string {
    if (cp === null) return 'Evaluation unavailable';

    if (moveNumber < 3) {
        return 'Game just started';
    }

    if (cp > 100) return 'You are clearly ahead!';
    if (cp > 20) return 'Slight advantage';
    if (cp > -20) return 'It’s even';
    if (cp > -100) return 'You are slightly behind';
    return 'You are in trouble';
}

let chess = new Chess()
let previousBestMove: string = ''; // outside App component if needed

type Evaluation = {
    from: string;
    to: string;
    cp: number;
};

type TopMove = {
    square: string;
    score: number;
};

const App = () => {
    const [game] = useState(chess);
    const [topMoves, setTopMoves] = useState<TopMove[]>([]);
    const [feedback, setFeedback] = useState(null)

    const onMove = async (moveEvent: any) => {
        console.log('state21', moveEvent?.state?.fen);


        const { from, to } = moveEvent.move;
        console.log('current h1:', from, to);

        let move;
        try {
            move = game.move({ from, to, promotion: 'q' });
        } catch (err) {
            console.log('current h6:', err);
        }

        if (!move) {
            setFeedback({ type: 'invalid', message: 'Invalid move!' });
            return;
        }

        const fen = game.fen();
        console.log('state22', fen);
        getTopMoves(fen).then((res) => {
            console.log('topmoves31', res);

            if (!res?.evaluations) setTopMoves([])

            const scoresPerPiece: Record<string, number[]> = {};
            (res?.evaluations as Evaluation[]).forEach(({ from, cp }) => {
                if (!scoresPerPiece[from]) scoresPerPiece[from] = [];
                scoresPerPiece[from].push(cp);
            });

            // You could show best score per piece
            const displayScores = Object.entries(scoresPerPiece).map(([square, cps]) => ({
                square,
                score: Math.max(...(cps as number[])) // or average, or first
            }));

            setTopMoves(displayScores)
        })


        const fenBeforeMove = move.before
        const fenAfterMove = move.after
        const currentMoveLan = move.lan
        const lastSuggestedMove = previousBestMove
        const whoPlayed = move.color

        console.log('suggg2', lastSuggestedMove, previousBestMove);

        console.log('current h2:', move, move.after, fen);
        const result = await evaluatePosition(fen); // hitting your local Stockfish server

        if (result) {
            console.log('evaluated h8: ', result)

            const { eval: cp, bestMove, pv } = result;

            try {
                // const naturalSummary = getNaturalSummary(fen, pv, game, previousBestMove);
                const naturalSummary2 = getNaturalSummary2(
                    lastSuggestedMove,
                    cp,
                    bestMove,
                    game);
                console.log('evaluated sum: h9: ', naturalSummary2)

                // const message = [
                //     `\nMove number: ${game.moveNumber()}`,
                //     naturalSummary ? naturalSummary : "Game just started.",
                //     `now it's ${game.turn() == 'b' ? 'black' : 'white'}'s turn\n`,
                //     pv?.[0] ? `Best response is ${pv[0]}.` : null,
                // ].filter(Boolean).join(' ');

                setFeedback({ type: 'eval', message: naturalSummary2, pv });
                console.log('suggg0: game played by', whoPlayed, 'suggested for opponent', bestMove);
                if (whoPlayed == 'b') {
                    console.log('suggg1: updating bestmove', bestMove);

                    previousBestMove = bestMove; // 👈 store best move for next turn
                }
            } catch (error) {
                console.error('someerror', error);

            }
        } else {
            setFeedback({ type: 'error', message: 'Unable to evaluate move' });
        }

        const allMoves = game.moves({ verbose: true });

        // Filter only White's moves (should already be White if it's their turn)
        const currentPlayerMoves = allMoves.filter(move => move.color === game.turn());

        console.log('topmoves32', 'check valid moves for', game.turn(), fen, currentPlayerMoves);

    };

    // const pieceScores = [
    //     { square: 'f2', score: -0.57 },
    //     { square: 'g2', score: -1.17 },
    //     { square: 'd6', score: 2.63 }
    // ];

    // Map square -> { top, left } positions
    const squareToPosition = (square, boardSize = 320) => {
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = 8 - parseInt(square[1], 10);

        const squareSize = boardSize / 8;
        return {
            top: rank * squareSize,
            left: file * squareSize
        };
    };

    const boardSize = 350
    const squareSize = boardSize / 8;

    return (
        <GestureHandlerRootView style={styles.container}>
            <Text style={styles.title}>Chess Trainer</Text>
            <View style={{ position: 'relative' }}>


                <Chessboard
                    fen={game.fen()}
                    onMove={onMove}
                    boardSize={boardSize}
                />
                {topMoves.map(({ square, score }) => {
                    const { top, left } = squareToPosition(square, boardSize);
                    return (
                        <Text
                            key={square}
                            style={[
                                styles.scoreText,
                                {
                                    top: top + squareSize / 2,
                                    left: left + squareSize / 2,
                                    transform: [{ translateX: -squareSize / 2.8 }, { translateY: -squareSize / 2.8 }],
                                    width: squareSize * 0.7, // Optional: controls how wide the label is
                                    height: squareSize * 0.4,
                                    fontSize: squareSize * 0.2,
                                    lineHeight: squareSize * 0.4,
                                    paddingHorizontal: 4,
                                    paddingVertical: 1,
                                    shadowColor: '#000',
                                    shadowOpacity: 0.2,
                                    shadowRadius: 2,
                                    elevation: 4,
                                    backgroundColor: score >= 0 ? 'rgba(0, 128, 0, 0.85)' : 'rgba(255, 0, 0, 0.85)',
                                }
                            ]}
                        >
                            {score.toFixed(2)}
                        </Text>
                    );
                })}
                <MoveFeedback feedback={feedback} />
            </View>

        </GestureHandlerRootView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 10,
    },
    scoreText: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 0, 0, 0.85)',
        color: 'white',
        textAlign: 'center',
        borderRadius: 6,
        zIndex: 999,
        elevation: 10,
        overflow: 'hidden',
        fontWeight: 'bold',
    },
    scoreText2: {
        position: 'absolute',
        zIndex: 999, // 👈 highest priority
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: 4,
        fontSize: 10,
        borderRadius: 4,
        overflow: 'hidden',
        elevation: 10 // 👈 also helps on Android
    }
});


export default App;
