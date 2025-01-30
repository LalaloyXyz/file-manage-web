const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'file_db',
});

const PORT = process.env.PORT || 5001;

db.connect((err) => {
  if (err) {
    console.log('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// API to create a room
app.post('/api/rooms', (req, res) => {
  const { room_code, room_name, create_by } = req.body;
  const query = `INSERT INTO rooms (room_code, room_name, create_by, create_at) VALUES (?, ?, ?, NOW())`;

  db.query(query, [room_code, room_name, create_by], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving room to database');
    } else {
      res.status(201).json({ room_id: result.insertId });
    }
  });
});

// API to get a room
app.get('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM rooms WHERE room_id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error fetching room');
    } else {
      res.status(200).json(results[0] || {});
    }
  });
});

// API to fetch all rooms
app.get('/api/rooms', (req, res) => {
  const query = 'SELECT * FROM rooms ORDER BY create_at DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error fetching rooms');
    } else {
      res.status(200).json(results);
    }
  });
});

// API to search for a room by email and room_code
app.get('/api/search-room', (req, res) => {
  const { email, room_code } = req.query;

  const query = 'SELECT * FROM user_rooms WHERE room_code = ? AND user = ?';
  db.query(query, [room_code, email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error searching for room');
    } else {
      res.status(200).json(results); // Send room data if found
    }
  });
});

// API to save user-room relation (user_rooms table)
app.post('/api/user-rooms', (req, res) => {
  const { email, room_code } = req.body;

  const query = 'INSERT INTO user_rooms (user, room_code) VALUES (?, ?)';
  db.query(query, [email, room_code], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving user-room relation');
    } else {
      res.status(201).send('User-room relation saved successfully');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
