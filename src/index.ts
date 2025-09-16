import express, { type Request, type Response } from 'express';
import pool from './database.js';
import { createTemporalClient } from './temporal/client.js';
import { phoneVerificationWorkflow } from './temporal/workflows.js';


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

app.post('/verify-phone/:phoneNumber', async (req: Request, res: Response) => {
    const phoneNumber = req.params.phoneNumber;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required.' });
    }

    try {
        const client = await createTemporalClient();
        const handle = await client.workflow.start(phoneVerificationWorkflow, {
            args: [phoneNumber],
            taskQueue: 'phone-verification',
            workflowId: `phone-verification-${phoneNumber}-${Date.now()}`
        });

        res.json({ 
            workflowId: handle.workflowId,
            status: 'processing',
            message: 'Phone verification is in progress.'
        });

    } catch (error) {
        console.error('Workflow start error:', error);
        res.status(500).json({ error: 'Failed to start verification' });
    }
});

// Check verifcation status endpoint
app.get('/verification-status/:verificationId', async (req: Request, res: Response) => {
    
    if (!req.params.verificationId) {
        return res.status(400).json({ error: 'Verification ID is required.' });
    }

    const verificationId = req.params.verificationId;

    try {
        const client = await createTemporalClient();
        const handle = client.workflow.getHandle(verificationId);
        const result = await handle.result();

        res.json({
            verificationId: verificationId,
            status: 'completed',
            result: result
        });
    } catch (error) {
        // If the workflow is still running, we catch the timeout error
        res.json({
            verificationId: verificationId,
            status: 'processing',
            message: 'Verification is still in progress.'
        });
    }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});