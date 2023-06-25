const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3001;

// Middleware to parse JSON body
app.use(express.json());
app.use(cors());

// GET endpoint to fetch JSON data
app.get('/api/data', (req, res) => {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    }
  });
});

// POST endpoint to update JSON data
app.post('/api/data', (req, res) => {
  const newData = req.body;
  
  fs.writeFile('data.json', JSON.stringify(newData), 'utf8', (err) => {
    if (err) {
      console.error('Error writing data file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Data updated successfully' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
