const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Where we'll store the data
const DATA_FILE = path.join(__dirname, 'students.json');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Utility: load students from JSON file
function loadStudents() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist or is invalid, return empty array
    return [];
  }
}

// Utility: save students to JSON file
function saveStudents(students) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2), 'utf8');
}

// Home page: show form + table of students
app.get('/', (req, res) => {
  const students = loadStudents();

  const rows = students
    .map(
      (s, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${s.name}</td>
          <td>${s.roll}</td>
          <td>${s.department}</td>
        </tr>
      `
    )
    .join('');

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Student Data Entry</title>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            background: #f9fafb;
          }
          h1 {
            margin-bottom: 10px;
          }
          form {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            max-width: 400px;
            background: #ffffff;
          }
          label {
            display: block;
            margin-top: 10px;
            font-size: 14px;
          }
          input {
            width: 100%;
            padding: 6px;
            margin-top: 4px;
            box-sizing: border-box;
            border-radius: 4px;
            border: 1px solid #d1d5db;
          }
          button {
            margin-top: 15px;
            padding: 8px 14px;
            cursor: pointer;
            border-radius: 4px;
            border: none;
            background: #2563eb;
            color: white;
            font-weight: 600;
          }
          button:hover {
            opacity: 0.9;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            max-width: 600px;
            background: #ffffff;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
            font-size: 14px;
          }
          th {
            background-color: #f3f4f6;
          }
          .no-data {
            color: #6b7280;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Student Data Entry</h1>

        <form method="POST" action="/students">
          <label>
            Name:
            <input type="text" name="name" required />
          </label>
          <label>
            Roll Number:
            <input type="text" name="roll" required />
          </label>
          <label>
            Department:
            <input type="text" name="department" required />
          </label>
          <button type="submit">Add Student</button>
        </form>

        <h2>Student List</h2>

        ${
          students.length === 0
            ? '<p class="no-data">No students added yet.</p>'
            : `
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Roll No.</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            `
        }

      </body>
    </html>
  `);
});

// Handle form submission
app.post('/students', (req, res) => {
  const { name, roll, department } = req.body;

  // Basic validation
  if (!name || !roll || !department) {
    return res.status(400).send('All fields are required.');
  }

  const students = loadStudents();

  students.push({
    id: Date.now(), // simple unique id
    name,
    roll,
    department,
  });

  saveStudents(students);

  // Redirect back to home to show updated list
  res.redirect('/');
});

// Optional: endpoint to get data as JSON (for debugging / API use)
app.get('/api/students', (req, res) => {
  const students = loadStudents();
  res.json(students);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
