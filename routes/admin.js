const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const File = require('../models/File');
const Product = require('../models/Product'); // Make sure this exists
const isAdmin = require('../middlewares/auth');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Helper function to render pages with files, title, and styles
const renderPage = (pageName, pageTitle, extraStyles = []) => {
  return async (req, res) => {
    try {
      const files = await File.find({ page: pageName }).sort({ uploadedAt: -1 });
      const customStyles = ['/css/main.css', ...extraStyles];
      res.render(`pages/${pageName}`, { title: pageTitle, files, customStyles });
    } catch (err) {
      console.error(`Error rendering page ${pageName}:`, err);
      res.status(500).send('Server error');
    }
  };
};

// -------------------- Public Routes --------------------

// Root → redirect to /home
router.get('/', (req, res) => res.redirect('/home'));

// Home
router.get('/home', renderPage('home', 'Home', ['/css/home.css']));

// About
router.get('/about', renderPage('about', 'About Us', ['/css/about.css']));

// Products
router.get('/products', renderPage('products', 'Products', ['/css/products.css']));

router.post('/products/upload', async (req, res) => {
  try {
    const { name, image } = req.body;
    await Product.create({ name, image });
    res.redirect('/products');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving product');
  }
});

// Investors (special: grouped files)
router.get('/investors', async (req, res) => {
  try {
    const excludedPages = ['home', 'about', 'products'];
    const files = await File.find({ page: { $nin: excludedPages } }).sort({ uploadedAt: -1 });

    const grouped = {};
    files.forEach(file => {
      if (!grouped[file.page]) grouped[file.page] = [];
      grouped[file.page].push(file);
    });

    const customStyles = ['/css/main.css', '/css/investors.css', '/css/financial.css'];
    res.render('pages/investors', { title: 'Investors', grouped, customStyles });
  } catch (err) {
    console.error('Error fetching investor files:', err);
    res.status(500).send('Server error');
  }
});

// Dynamically render other pages using helper
const dynamicPages = [
  'public-issue', 'annual-reports', 'annual-return',
  'annual-general-meeting-agm', 'shareholding-pattern-2', 'committees-of-board-2',
  'policies', 'financial-results', 'extra-ordinary-general-meeting',
  'financial-statements-of-subsidiary', 'board-meeting', 'newspaper-advertisement',
  'disclosure-under-regulation-30', 'others', 'moa-aoa',
  'company-secretary-rta-details', 'grievance-redressal-2', 'statement-of-deviation-2'
];

dynamicPages.forEach(page => {
  const title = page.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  router.get(`/${page}`, renderPage(page, title, ['/css/financial.css']));
});

// -------------------- Admin Routes --------------------

// Login
router.get('/admin/login', (req, res) => res.render('admin/login'));

router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Missing credentials');

  if (username === 'admin' && password === 'admin') {
    req.session.adminId = 'admin';
    return res.redirect('/admin/dashboard');
  }

  res.render('admin/login', { error: 'Invalid credentials' });
});

// Dashboard
router.get('/admin/dashboard', isAdmin, (req, res) => res.render('admin/dashboard'));

// Upload files
router.get('/admin/upload', isAdmin, (req, res) => res.render('admin/upload'));

router.post('/admin/upload', isAdmin, upload.single('file'), async (req, res) => {
  try {
    const { page, title } = req.body;
    await File.create({ filename: req.file.filename, page, title, customStyles: ['/css/admin-style'] });
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading file');
  }
});

// View documents
router.get('/admin/documents', isAdmin, (req, res) => {
  const pages = dynamicPages.concat(['investors']);
  res.render('admin/documents', { pages });
});

router.get('/admin/documents/view', isAdmin, async (req, res) => {
  try {
    const { page } = req.query;
    const files = await File.find({ page }).sort({ uploadedAt: -1 });

    const checkedFiles = files.map(file => ({
      ...file._doc,
      exists: fs.existsSync(path.join(__dirname, '../public/uploads', file.filename))
    }));

    res.render('admin/documents-view', { page, files: checkedFiles });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching documents');
  }
});

// Delete file
router.post('/admin/delete/:id', isAdmin, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send('File not found');

    const filePath = path.join(__dirname, '../public/uploads', file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await File.findByIdAndDelete(req.params.id);
    res.redirect(`/admin/documents/view?page=${file.page}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting file');
  }
});

module.exports = router;
