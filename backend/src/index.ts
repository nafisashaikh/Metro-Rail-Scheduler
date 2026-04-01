import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`🚇 Metro Rail Scheduler API running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});
