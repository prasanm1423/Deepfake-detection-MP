import { createServer } from '../server/index.js';
import serverless from 'serverless-http';

const app = createServer();

// Export the serverless handler
export default serverless(app);

// Also export for direct usage
export { app };

// Vercel Function config (works alongside legacy `builds`)
export const config = {
  maxDuration: 60,
  memory: 1024,
};