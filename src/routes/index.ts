import express from 'express';
import { helloRouter } from '../router';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (_req, res) => {
  res.send('Welcome to the Hello World App!');
});

app.use('/api', helloRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
