import cors from 'cors';
import express from 'express';
import { v4 as uuid } from 'uuid';
import { readFileSync, writeFileSync } from 'fs';

const app = express();
const port = process.env['PORT'] || 80;
const url = new URL('./data/state.json', import.meta.url);

app.locals.data = {};
try {
  const state = JSON.parse(readFileSync(url));
  for (let [key, value] of Object.entries(state)) {
    app.locals.data[key] = value;
  }
} catch (e) {
  console.error(e);
}

const writeState = () => {
  writeFileSync(url, JSON.stringify(app.locals.data));
};

app.use(cors({
  origin: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use((req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(401);
    res.setHeader('WWW-Authenticate', 'Bearer');
    return res.end();
  }
  res.locals.userId = req.headers.authorization.substring('Bearer '.length);
  next();
});

app.get('/api/items', (_, res) => {
  const items = app.locals.data[res.locals.userId] || [];
  res.json({ items });
});

app.post('/api/items', (req, res) => {
  app.locals.data[res.locals.userId] = app.locals.data[res.locals.userId] || [];
  const items = app.locals.data[res.locals.userId];
  items.push({ id: uuid(), text: req.body.text });
  res.json({ items });
  process.nextTick(writeState);
});

app.delete('/api/items/:id', (req, res) => {
  const items = app.locals.data[res.locals.userId] || [];
  const index = items.findIndex(item => item.id === req.params.id);
  if (index >= 0) {
    items.splice(index, 1);
  }
  res.json({ items });
  process.nextTick(writeState);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
