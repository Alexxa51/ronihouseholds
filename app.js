const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const app = express();

// ================= MongoDB Connection =================
// Use MONGO_URI from environment variables (Render or local .env)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fileUploadApp';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ DB connection error:', err));

// ================= Middleware =================
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: process.env.SESSION_SECRET || 'secret', resave: false, saveUninitialized: false }));

// ================= View Engine =================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ================= Routes =================
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/pages'));

// Logging for debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

// ================= Start Server =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
