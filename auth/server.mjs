import cors from 'cors';
import express from 'express';

const app = express();
const port = process.env['PORT'] || 80;

app.use(cors());
app.use(express.json());

app.get('/api/login', (_, res) => {
  res.status(204);
  res.end();
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@example.com' && password === 'P4ssw0rd!1') {
    return res.json({ token: Buffer.from(email).toString('base64') });
  }
  res.status(400);
  res.end();
});

app.listen(port, () => console.log(`Listening on port ${port}`));
