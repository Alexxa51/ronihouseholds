const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const isAdmin = require('../middlewares/auth');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Admin login
router.get('/login', (req, res) => res.render('admin/login'));

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Missing credentials');

  if (username === 'admin' && password === 'admin') {
    req.session.adminId = 'admin';
    return res.redirect('/admin/dashboard');
  }

  res.render('admin/login', { error: 'Invalid credentials' });
});

// Dashboard
router.get('/dashboard', isAdmin, (req, res) => res.render('admin/dashboard'));

// Upload files
router.get('/upload', isAdmin, (req, res) => res.render('admin/upload'));

router.post('/upload', isAdmin, upload.single('file'), async (req, res) => {
  try {
    const { page, title } = req.body;
    await File.create({ filename: req.file.filename, page, title, customStyles: ['/css/admin-style'] });
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading file');
  }
});

// Documents list
router.get('/documents', isAdmin, (req, res) => {
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

// View documents
router.get('/documents/view', isAdmin, async (req, res) => {
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

// Delete files
router.post('/delete/:id', isAdmin, async (req, res) => {
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
