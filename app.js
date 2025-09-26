const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

require('dotenv').config();

const app = express();

// ======= MongoDB Connection =======
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ DB connection error:', err);
  process.exit(1); // exit if DB connection fails
});

// ======= Session Setup =======
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// ======= Middleware =======
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ======= View Engine =======
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ======= Routes =======
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/pages'));

// ======= Logger =======
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ======= Start Server =======
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false 
}));
