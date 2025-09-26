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
    const files = await File.find({ page });
    res.render(`pages/${page}`, { files });
  });
});

module.exports = router;
