RoniHouseholds

RoniHouseholds is a Node.js application designed to manage household data. It utilizes Express.js for the server framework and MongoDB for data storage. The application follows the Model-View-Controller (MVC) architecture and employs EJS as the templating engine for rendering views.

Features

User Authentication: Secure login and registration system.

CRUD Operations: Create, Read, Update, and Delete household records.

Session Management: Maintains user sessions using MongoDB.

Admin Panel: Administrative interface for managing users and data.

Technologies Used

Node.js: JavaScript runtime for building the server.

Express.js: Web framework for Node.js.

MongoDB: NoSQL database for storing data.

EJS: Templating engine for rendering views.

Connect-Mongo: MongoDB session store for Express.

Installation

Clone the repository:

git clone https://github.com/Alexxa51/ronihouseholds.git
cd ronihouseholds


Install dependencies:

npm install


Set up environment variables:

Create a .env file in the root directory and add the following:

DB_URI=mongodb://localhost:27017/ronihouseholds
SESSION_SECRET=your_session_secret


Start the application:

node app.js


The application will be running on http://localhost:3000
.

Folder Structure
ronihouseholds/
├── app.js             # Main application file
├── db.js              # Database connection
├── seed.js            # Database seeding script
├── seedAdmin.js       # Admin seeding script
├── .gitignore         # Git ignore file
├── package.json       # Project metadata and dependencies
├── package-lock.json  # Dependency lock file
├── middlewares/       # Custom middleware
├── models/            # Mongoose models
├── routes/            # Express route handlers
├── views/             # EJS templates
└── public/            # Static assets (CSS, JavaScript, images)

Contributing

Contributions are welcome! Please fork the repository, create a new branch, make your changes, and submit a pull request.

License

This project is licensed under the MIT License.