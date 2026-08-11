require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const path = require('path');
const express = require('express');
const orderRouter = require('./routes/order');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve the static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// Booking form -> Telegram bot bridge
app.use('/api/order', orderRouter);

// Fallback error handler so malformed JSON etc. never leaks a stack trace to the client
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ success: false, error: 'Invalid request.' });
});

app.listen(PORT, () => {
  console.log(`Ipak Yo'li server running at http://localhost:${PORT}`);
});
