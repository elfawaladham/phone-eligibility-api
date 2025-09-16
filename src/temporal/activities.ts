import pool from '../database.js';

export interface PhoneVerificationResult {
    phoneNumber: string;
    eligible: boolean;
    reason: string;
    verifiedByCarrier: boolean;
}

export async function verifyPhoneNumber(phoneNumber: string, workflowId: string): Promise<PhoneVerificationResult> {
    try {
        // Step 1: Insert initial record
        await pool.query(
            'INSERT INTO verification_requests (workflow_id, phone_number, status) VALUES ($1, $2, $3)',
            [workflowId, phoneNumber, 'processing']
        );

        // Step 2: Basic eligibility check
        const lastDigit = parseInt(phoneNumber.slice(-1), 10);
        const basicEligible = lastDigit % 2 === 0;

        // Step 3: Simulate carrier verification (10 second delay)
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Step 4: Create final result
        const result: PhoneVerificationResult = {
            phoneNumber,
            eligible: basicEligible,
            reason: basicEligible ? 'Even ending digit, carrier verified' : 'Odd ending digit, carrier verified',
            verifiedByCarrier: true
        };

        // Step 5: Update database with result
        await pool.query(
            'UPDATE verification_requests SET status = $1, result = $2, completed_at = CURRENT_TIMESTAMP WHERE workflow_id = $3',
            ['completed', JSON.stringify(result), workflowId]
        );

        return result;
    } catch (error) {
        // Update database with error
        await pool.query(
            'UPDATE verification_requests SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE workflow_id = $2',
            ['failed', workflowId]
        );
        throw error;
    }
}
