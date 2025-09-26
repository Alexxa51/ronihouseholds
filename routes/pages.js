const express = require('express');
const router = express.Router();
const File = require('../models/File');

// List of all page routes
const pages = [
  'home',
  'about',
  'investors',
  'public-issue',
  'annual-reports',
  'annual-return',
  'annual-general-meeting-agm',
  'shareholding-pattern-2',
  'committees-of-board-2',
  'policies',
  'financial-results',
  'extra-ordinary-general-meeting',
  'financial-statements-of-subsidiary',
  'board-meeting',
  'newspaper-advertisement',
  'disclosure-under-regulation-30',
  'others',
  'moa-aoa',
  'company-secretary-rta-details',
  'grievance-redressal-2',
  'statement-of-deviation-2'
];

// Dynamically create routes for each page
pages.forEach(page => {
  router.get(`/${page}`, async (req, res) => {
    try {
      const files = await File.find({ page }).sort({ uploadedAt: -1 });

      // Generate a readable title (replace "-" with space, uppercase words)
      const pageTitle = page.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      // Base styles (main.css) + page-specific CSS if it exists
      const styles = ['/css/main.css'];
      styles.push(`/css/${page}.css`);

      res.render(`pages/${page}`, { 
        title: pageTitle,
        customStyles: styles,
        files
      });
    } catch (err) {
      console.error(`Error rendering page ${page}:`, err);
      res.status(500).send("Server error");
    }
  });
});

// Root route → redirect to /home
router.get('/', (req, res) => {
  res.redirect('/home');
});

module.exports = router;
