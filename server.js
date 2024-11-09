const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

// Express alkalmazás
const app = express();
const port = 3000;

// MySQL kapcsolat beállítása
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  port: 3306,        // A MySQL felhasználóneved
  password: '',        // A MySQL jelszavad
  database: 'pizza'
});

db.connect(err => {
  if (err) {
    console.error('Hiba a kapcsolódásnál: ' + err.stack);
    return;
  }
  console.log('Kapcsolódás sikeres a MySQL adatbázishoz.');
});

// Middleware
app.use(bodyParser.json());

// 1. Pizza lista lekérése
app.get('/pizzas', (req, res) => {
  db.query('SELECT * FROM pizza', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Hiba a pizza lista lekérésekor' });
    }
    res.json(results);
  });
});

// 2. Új pizza hozzáadása
app.post('/pizzas', (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Név és ár kötelező!' });
  }

  db.query('INSERT INTO pizza (name, description, price) VALUES (?, ?, ?)', [name, description, price], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Hiba a pizza hozzáadásakor' });
    }
    res.status(201).json({ id: result.insertId, name, description, price });
  });
});

// 3. Pizza módosítása
app.put('/pizzas/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Név és ár kötelező!' });
  }

  db.query('UPDATE pizza SET name = ?, description = ?, price = ? WHERE id = ?', [name, description, price, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Hiba a pizza módosításakor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pizza nem található' });
    }

    res.json({ id, name, description, price });
  });
});

// 4. Pizza törlése
app.delete('/pizzas/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM pizza WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Hiba a pizza törlésekor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pizza nem található' });
    }

    res.json({ message: 'Pizza sikeresen törölve' });
  });
});

// Alkalmazás indítása
app.listen(port, () => {
  console.log(`API elérhető a http://localhost:${port}`);
});
