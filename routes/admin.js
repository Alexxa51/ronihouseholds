const express = require('express');
const router = express.Router();
const multer = require('multer');
const File = require('../models/File');
const isAdmin = require('../middlewares/auth');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/login', (req, res) => res.render('admin/login'));

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).send('Missing login credentials');
  }

  if (username === 'admin' && password === 'admin') {
    req.session.adminId = 'admin';
    return res.redirect('/admin/dashboard');
  }
  
  res.render('admin/login', { error: 'Invalid credentials' });
});

router.get('/dashboard', isAdmin, (req, res) => {
  res.render('admin/dashboard');
});

router.get('/upload', isAdmin, (req, res) => {
  res.render('admin/upload');
});

router.post('/upload', isAdmin, upload.single('file'), async (req, res) => {
  const { page, title } = req.body;
  const filename = req.file.filename;

  await File.create({ filename, page, title, customStyles: ['/css/admin-style'] });
  res.redirect('/admin/dashboard');
});

router.get('/documents', isAdmin, async (req, res) => {
  const pages = [
    'investors', 'public-issue', 'annual-reports', 'annual-return',
    'annual-general-meeting-agm', 'shareholding-pattern-2', 'committees-of-board-2',
    'policies', 'financial-results', 'extra-ordinary-general-meeting',
    'financial-statements-of-subsidiary', 'board-meeting', 'newspaper-advertisement',
    'disclosure-under-regulation-30', 'others', 'moa-aoa',
    'company-secretary-rta-details', 'grievance-redressal-2', 'statement-of-deviation-2'
  ];
  res.render('admin/documents', { pages });
});

router.get('/documents/view', isAdmin, async (req, res) => {
  const { page } = req.query;
  const files = await File.find({ page }).sort({ uploadedAt: -1 });

  const checkedFiles = files.map(file => {
    const filePath = path.join(__dirname, '../public/uploads', file.filename);
    return {
      ...file._doc,
      exists: fs.existsSync(filePath)
    };
  });

  res.render('admin/documents-view', { page, files: checkedFiles });
});

router.post('/delete/:id', isAdmin, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send('File not found in database');

    const filePath = path.join(__dirname, '../public/uploads', file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await File.findByIdAndDelete(req.params.id);
    res.redirect(`/admin/documents/view?page=${file.page}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting file');
  }
});

router.get('/investors', async (req, res) => {
  try {
    const excludedPages = ['home', 'about', 'products'];
    const files = await File.find({ page: { $nin: excludedPages } }).sort({ uploadedAt: -1 });

    const grouped = {};
    files.forEach(file => {
      if (!grouped[file.page]) grouped[file.page] = [];
      grouped[file.page].push(file);
    });

    res.render('pages/investors', { title: 'Investors', grouped, customStyles: ['/css/main.css', '/css/investors.css', '/css/financial.css'] });
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).send('Server error');
  }
});

router.get('/home', (req, res) => {
  res.render('pages/home', { title: 'Home', customStyles: ['/css/main.css', '/css/home.css'] });
});

router.get('/', (req, res) => {
  res.render('pages/home', { title: 'Home', customStyles: ['/css/main.css', '/css/home.css']});
});

router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'About Us', customStyles: ['/css/main.css', '/css/about.css']});
});
router.get('/products', (req, res) => {
  res.render('pages/products', { title: 'Products', customStyles: ['/css/main.css', '/css/products.css']});
});

router.post('/products/upload', (req, res) => {
  const { name, image } = req.body;
  // Save to MongoDB
  Product.create({ name, image })
    .then(() => res.redirect('/products'))
    .catch(err => res.status(500).send(err.message));
});

// Helper function
const renderPage = (pageName, pageTitle) => {
  return async (req, res) => {
    try {
      const files = await File.find({ page: pageName }).sort({ uploadedAt: -1 });
      res.render(`pages/${pageName}`, {
        title: pageTitle,
        files,
        customStyles: ['/css/main.css', '/css/financial.css']
      });
    } catch (err) {
      console.error('Error: ', err);
      res.status(500).send('Server error');
    }
  };
};

// Routes using the helper
router.get('/grievance-redressal-2', renderPage('grievance-redressal-2', 'Grievance Redressal'));
router.get('/statement-of-deviation-2', renderPage('statement-of-deviation-2', 'Statement of Deviation'));
router.get('/financial-results', renderPage('financial-results', 'Financial Results'));
router.get('/extra-ordinary-general-meeting', renderPage('extra-ordinary-general-meeting', 'Extra Ordinary General Meeting'));
router.get('/financial-statements-of-subsidiary', renderPage('financial-statements-of-subsidiary', 'Financial Statements of Subsidiary'));
router.get('/board-meeting', renderPage('board-meeting', 'Board Meeting'));
router.get('/newspaper-advertisement', renderPage('newspaper-advertisement', 'Newspaper Advertisement'));
router.get('/disclosure-under-regulation-30', renderPage('disclosure-under-regulation-30', 'Disclosure Under Regulation 30'));
router.get('/others', renderPage('others', 'Others'));
router.get('/public-issue', renderPage('public-issue', 'Public Issue'));
router.get('/annual-reports', renderPage('annual-reports', 'Annual Reports'));
router.get('/annual-return', renderPage('annual-return', 'Annual Return'));
router.get('/annual-general-meeting-agm', renderPage('annual-general-meeting-agm', 'Annual General Meeting (AGM)'));
router.get('/shareholding-pattern-2', renderPage('shareholding-pattern-2', 'Shareholding Pattern'));
router.get('/committees-of-board-2', renderPage('committees-of-board-2', 'Committees of Board'));
router.get('/policies', renderPage('policies', 'Policies'));
router.get('/company-secretary-rta-details', renderPage('company-secretary-rta-details', 'Company Secretary RTA Details'));
router.get('/moa-aoa', renderPage('moa-aoa', 'MOA / AOA'));

module.exports = router;
