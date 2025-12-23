
// Native fetch check
async function debugRegister() {
    try {
        const response = await fetch('https://cats.mohamedfazazi74.workers.dev/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'debuguser_' + Date.now(),
                email: 'debug_' + Date.now() + '@example.com',
                password: 'password123'
            })
        });

        const status = response.status;
        const text = await response.text();

        console.log('Status:', status);
        console.log('Body:', text);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Check if native fetch exists (Node 18+), else try require
if (!globalThis.fetch) {
    try {
        globalThis.fetch = require('node-fetch');
    } catch (e) {
        console.error('No fetch available. Please run with Node 18+ or install node-fetch.');
    }
}

debugRegister();
