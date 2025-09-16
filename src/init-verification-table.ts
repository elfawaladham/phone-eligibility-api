import pool from './database.js';

const createVerificationTable = async () => {
    try {
        console.log('Creating verification_requests table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS verification_requests (
                id SERIAL PRIMARY KEY,
                workflow_id VARCHAR(255) UNIQUE NOT NULL,
                phone_number VARCHAR(20) NOT NULL,
                status VARCHAR(50) DEFAULT 'processing',
                result JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            )
        `);

        console.log('Verification requests table created successfully');
    } catch (err) {
        console.error('Error creating verification table', err);
    } finally {
        await pool.end();
    }
};

createVerificationTable();
