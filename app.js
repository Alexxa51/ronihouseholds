const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');

require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
}

run();

const app = express();
const adminRouter = require('./routes/admin');
app.use('/', adminRouter); // or app.use('/admin', adminRouter);


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fileUploadApp');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/pages'));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});


app.listen(3000, "0.0.0.0", () => {
  console.log("Server running at http://0.0.0.0:3000");
});
