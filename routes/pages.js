const express = require('express');
const router = express.Router();
const File = require('../models/File');

// Helper to render pages with title, files, and CSS
const renderPage = (pageName, pageTitle, extraStyles = []) => {
  return async (req, res) => {
    try {
      const files = await File.find({ page: pageName }).sort({ uploadedAt: -1 });
      const customStyles = ['/css/main.css', ...extraStyles];
      res.render(`pages/${pageName}`, { title: pageTitle, files, customStyles });
    } catch (err) {
      console.error(`Error rendering ${pageName}:`, err);
      res.status(500).send('Server error');
    }
  };
};

// Root → redirect to /home
router.get('/', (req, res) => res.redirect('/home'));

// Standard pages
router.get('/home', renderPage('home', 'Home', ['/css/home.css']));
router.get('/about', renderPage('about', 'About Us', ['/css/about.css']));

// Investors page with grouped files
router.get('/investors', async (req, res) => {
  try {
    const excludedPages = ['home', 'about'];
    const files = await File.find({ page: { $nin: excludedPages } }).sort({ uploadedAt: -1 });

    const grouped = {};
    files.forEach(file => {
      if (!grouped[file.page]) grouped[file.page] = [];
      grouped[file.page].push(file);
    });

    const customStyles = ['/css/main.css', '/css/investors.css', '/css/financial.css'];
    res.render('pages/investors', { title: 'Investors', grouped, customStyles });
  } catch (err) {
    console.error('Error fetching investors:', err);
    res.status(500).send('Server error');
  }
});

// Dynamic pages
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

module.exports = router;
