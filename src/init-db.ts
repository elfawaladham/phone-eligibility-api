import pool from './database.js';

const createTable = async () => {
    try {
        console.log('Connecting to database...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS phone_eligibility (
                id SERIAL PRIMARY KEY,
                phone_number VARCHAR(20) UNIQUE NOT NULL,
                eligible BOOLEAN NOT NULL,
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table created successfully');

        // Insert some sample data
        await pool.query(`
            INSERT INTO phone_eligibility (phone_number, eligible, reason) 
            VALUES 
                ('1234567890', true, 'Even ending digit'),
                ('1234567891', false, 'Odd ending digit')
            ON CONFLICT (phone_number) DO NOTHING
        `);
        console.log('Sample data inserted successfully');
    } catch (err) {
        console.error('Error creating table or inserting data', err);
    } finally {
        await pool.end();
    }
};

createTable();
