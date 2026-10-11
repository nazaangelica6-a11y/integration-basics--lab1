const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const PORT = 3000;
const PYTHON_URL = 'http://localhost:5001';
const CSV_FILE = 'calculation_history.csv';

if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(
        CSV_FILE,
        'num1,num2,operation,result\n'
    );
}

app.get('/hello', (req, res) => {
    res.json({ message: 'Hello from Node.js Gateway!' });
});

app.post('/api/calculate', async (req, res) => {
    console.log('Node.js received:', req.body);

    try {
        const pythonResponse = await axios.post(
            `${PYTHON_URL}/calculate`,
            req.body
        );

        const result = pythonResponse.data.result;

fs.appendFileSync(
    CSV_FILE,
    `${req.body.num1},${req.body.num2},${req.body.operation},${result}\n`
);

res.json({
    gateway_message: 'Node.js successfully aggregated the data!',
    python_result: pythonResponse.data
});

    } catch (error) {
        console.error('Error:', error.message);

        res.status(500).json({
            error: 'Failed to reach Python service. Is it running on port 5001?'
        });
    }
});

app.get('/api/status', async (req, res) => {
    try {
        const ping = await axios.get(`${PYTHON_URL}/ping`);

        res.json({
            gateway: 'Node.js is running',
            python: ping.data
        });

    } catch (error) {
        res.status(500).json({
            gateway: 'Node.js is running',
            python: 'Python is NOT reachable'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Node.js Gateway: http://localhost:${PORT}`);
    console.log(`Python URL: ${PYTHON_URL}`);
});