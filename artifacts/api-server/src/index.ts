import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحميل ملف .env من المجلد الصحيح
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from "./app.js";
import { logger } from "./lib/logger.js";

const rawPort = process.env.PORT;
if (!rawPort) {
    logger.error("PORT environment variable is required but was not found");
    process.exit(1);
}

const port = Number(rawPort);
if (Number.isNaN(port)) {
    logger.error("Invalid PORT value: " + rawPort);
    process.exit(1);
}

async function start() {
    try {
        logger.info(`Server starting on port ${port}`);
        app.listen(port, () => {
            logger.info(`✅ Server is running on http://localhost:${port}`);
            logger.info(`📡 API endpoint: http://localhost:${port}/api`);
            logger.info(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
        });
    } catch (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    logger.info("Shutting down...");
    process.exit(0);
});

start();
