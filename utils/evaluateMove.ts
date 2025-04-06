// utils/evaluateMove.ts
import axios from 'axios';

// const SERVER_URL = 'http://localhost:3001'; // replace with LAN IP if testing on physical device
const SERVER_URL = 'http://10.0.2.2:3001'

export async function evaluatePosition(fen: string) {
    try {
        console.log('callapi:' + fen);

        const res = await axios.post(`${SERVER_URL}/evaluate`, { fen });
        console.log('res2' + res.data);

        return res.data; // { cp, bestMove }
    } catch (err) {
        console.error('Error evaluating position:', err);
        return null;
    }
}
