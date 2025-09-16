import { Client } from '@temporalio/client';

export async function createTemporalClient() {
    return new Client();
}