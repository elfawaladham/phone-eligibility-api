import { Worker } from '@temporalio/worker';
import * as activities from './activities.js';

async function run() {
    const worker = await Worker.create({
        workflowsPath: new URL('./workflows.ts', import.meta.url).pathname,
        activities,
        taskQueue: 'phone-verification',
    });
    await worker.run();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});