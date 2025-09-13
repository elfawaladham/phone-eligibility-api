import express, { type Request, type Response } from 'express';
import pool from './database.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Phone eligibility API is running!' });
});

app.get('/check-eligibility/:phoneNumber', async (req: Request, res: Response) => {
    const phoneNumber = req.params.phoneNumber;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required.' });
    }

    try {
        // Check if phone number exists in database
        const result = await pool.query(
            'SELECT * FROM phone_eligibility WHERE phone_number = $1',
            [phoneNumber]
        );

        if (result.rows.length > 0) {
            // Phone number found in database
            const record = result.rows[0];
            res.json({
                phoneNumber: record.phone_number,
                eligible: record.eligible,
                reason: record.reason,
                source: 'database'
            });
        } else {
            // Phone number not in database, use fallback logic
            const lastDigit = parseInt(phoneNumber.slice(-1), 10);
            const isEligible = lastDigit % 2 === 0;
            
            res.json({
                phoneNumber: phoneNumber,
                eligible: isEligible,
                reason: isEligible ? 'Even ending digit (fallback logic)' : 'Odd ending digit (fallback logic)',
                source: 'fallback'
            });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});