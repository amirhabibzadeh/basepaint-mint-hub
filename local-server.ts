import express from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import imageHandler from './api/art/image';

const app = express();
const port = 3001;

// Helper to adapt Express req/res to Vercel req/res
const adaptHandler = (handler: (req: VercelRequest, res: VercelResponse) => void | Promise<void>) => {
    return async (req: express.Request, res: express.Response) => {
        try {
            await handler(req as unknown as VercelRequest, res as unknown as VercelResponse);
        } catch (error) {
            console.error('API Error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    };
};

// Register API routes
app.get('/api/art/image', adaptHandler(imageHandler));

// Test route
app.get('/api/test', (req, res) => {
    res.json({ status: 'ok', message: 'Local API server working' });
});

app.listen(port, () => {
    console.log(`Local API server running at http://localhost:${port}`);
});
