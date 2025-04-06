import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Chess } from 'chess.js';
import Chessboard from 'react-native-chessboard';
import MoveFeedback from './components/MoveFeedback';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { evaluatePosition } from '../utils/evaluateMove';
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

const App = () => {
    const [game] = useState(chess);
    const [feedback, setFeedback] = useState(null);

    const onMove = async (moveEvent: any) => {
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
    };



    return (
        <GestureHandlerRootView style={styles.container}>
            <Text style={styles.title}>Chess Trainer</Text>
            <Chessboard
                fen={game.fen()}
                onMove={onMove}
                boardSize={350}
            />
            <MoveFeedback feedback={feedback} />
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
});

export default App;
