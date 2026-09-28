import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db, { initDb, queryOne, queryAll, execute } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cse_pyq_hub_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Initialize database
initDb();

// Helper to sanitize user object (remove passwordHash)
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// Middleware: Verify JWT and attach user
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = queryOne('SELECT * FROM users WHERE id = ?', decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User account not found' });
    }
    req.user = sanitizeUser(user);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

// Middleware: Require STUDENT role
export function requireStudent(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Forbidden: Student access required' });
    }
    next();
  });
}

// Middleware: Require TEACHER role
export function requireTeacher(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Forbidden: Teacher access required' });
    }
    next();
  });
}

// ==========================================
// AUTHENTICATION APIs
// ==========================================

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  try {
    const { fullName, email, mobile, college, branch, academicYear, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'Full Name, Email, Password, and Role are required' });
    }

    const normalizedRole = role.toUpperCase().trim();
    if (normalizedRole !== 'STUDENT' && normalizedRole !== 'TEACHER') {
      return res.status(400).json({ error: 'Role must be either STUDENT or TEACHER' });
    }

    const existingUser = queryOne('SELECT id FROM users WHERE email = ?', email.toLowerCase().trim());
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const insertSql = `
      INSERT INTO users (fullName, email, mobile, college, branch, academicYear, passwordHash, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = execute(
      insertSql,
      fullName.trim(),
      email.toLowerCase().trim(),
      mobile || '',
      college || 'P. R. Pote Patil College of Engineering & Management, Amravati',
      branch || 'Computer Science Engineering',
      academicYear || '',
      passwordHash,
      normalizedRole
    );

    const newUser = queryOne('SELECT * FROM users WHERE id = ?', result.lastInsertRowid);
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.fullName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: sanitizeUser(newUser)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = queryOne('SELECT * FROM users WHERE email = ?', email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(req.user);
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = queryOne('SELECT id, email FROM users WHERE email = ?', email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    res.json({
      message: 'Password reset code generated. Use code 123456 to reset your password.',
      resetToken: '123456'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    const user = queryOne('SELECT id FROM users WHERE email = ?', email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    execute(`
      UPDATE users
      SET passwordHash = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE email = ?
    `, passwordHash, email.toLowerCase().trim());

    res.json({ message: 'Password updated successfully. Please login with your new password.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// STUDENT APIs
// ==========================================

// GET /api/student/pyqs
app.get('/api/student/pyqs', requireStudent, (req, res) => {
  try {
    const { subject, semester, academic_year, exam_type } = req.query;

    let query = `
      SELECT p.*, COUNT(q.id) as question_count
      FROM question_papers p
      LEFT JOIN questions q ON p.id = q.paper_id
      WHERE 1=1
    `;
    const params = [];

    if (subject) {
      query += ` AND p.subject LIKE ?`;
      params.push(`%${subject}%`);
    }
    if (semester) {
      query += ` AND p.semester = ?`;
      params.push(semester);
    }
    if (academic_year) {
      query += ` AND p.academic_year = ?`;
      params.push(academic_year);
    }
    if (exam_type) {
      query += ` AND p.exam_type = ?`;
      params.push(exam_type);
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const papers = queryAll(query, ...params);
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/practice
app.get('/api/student/practice', requireStudent, (req, res) => {
  try {
    const tests = queryAll('SELECT * FROM practice_tests ORDER BY id ASC');
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/student/practice/submit
app.post('/api/student/practice/submit', requireStudent, (req, res) => {
  try {
    const { test_title, subject, score, total_marks } = req.body;
    if (!test_title || score === undefined || !total_marks) {
      return res.status(400).json({ error: 'test_title, score, and total_marks are required' });
    }

    const percentage = Number(((score / total_marks) * 100).toFixed(1));

    const insertSql = `
      INSERT INTO test_results (user_id, test_title, subject, score, total_marks, percentage)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = execute(insertSql, req.user.id, test_title, subject || 'General', score, total_marks, percentage);
    const newResult = queryOne('SELECT * FROM test_results WHERE id = ?', result.lastInsertRowid);

    res.status(201).json(newResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/results
app.get('/api/student/results', requireStudent, (req, res) => {
  try {
    const results = queryAll('SELECT * FROM test_results WHERE user_id = ? ORDER BY completed_at DESC', req.user.id);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/profile
app.get('/api/student/profile', requireStudent, (req, res) => {
  res.json(req.user);
});

// PUT /api/student/profile
app.put('/api/student/profile', requireStudent, (req, res) => {
  try {
    const { fullName, mobile, college, branch, academicYear } = req.body;

    const updateSql = `
      UPDATE users
      SET fullName = ?, mobile = ?, college = ?, branch = ?, academicYear = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    execute(
      updateSql,
      fullName || req.user.fullName,
      mobile !== undefined ? mobile : req.user.mobile,
      college || req.user.college,
      branch || req.user.branch,
      academicYear || req.user.academicYear,
      req.user.id
    );

    const updatedUser = queryOne('SELECT * FROM users WHERE id = ?', req.user.id);
    res.json(sanitizeUser(updatedUser));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// TEACHER APIs
// ==========================================

// GET /api/teacher/pyqs
app.get('/api/teacher/pyqs', requireTeacher, (req, res) => {
  try {
    const papers = queryAll(`
      SELECT p.*, COUNT(q.id) as question_count
      FROM question_papers p
      LEFT JOIN questions q ON p.id = q.paper_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teacher/pyqs
app.post('/api/teacher/pyqs', requireTeacher, (req, res) => {
  try {
    const { subject, subject_code, semester, academic_year, exam_type, paper_year, pdf_url, image_url } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const insertSql = `
      INSERT INTO question_papers (subject, subject_code, semester, academic_year, exam_type, paper_year, pdf_url, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = execute(
      insertSql,
      subject,
      subject_code || '',
      semester || '',
      academic_year || '',
      exam_type || '',
      paper_year || '',
      pdf_url || '',
      image_url || ''
    );

    const newPaper = queryOne('SELECT * FROM question_papers WHERE id = ?', result.lastInsertRowid);
    res.status(201).json(newPaper);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/teacher/pyqs/:id
app.put('/api/teacher/pyqs/:id', requireTeacher, (req, res) => {
  try {
    const { subject, subject_code, semester, academic_year, exam_type, paper_year, pdf_url, image_url } = req.body;

    const updateSql = `
      UPDATE question_papers
      SET subject = ?, subject_code = ?, semester = ?, academic_year = ?, exam_type = ?, paper_year = ?, pdf_url = ?, image_url = ?
      WHERE id = ?
    `;

    const result = execute(
      updateSql,
      subject,
      subject_code || '',
      semester || '',
      academic_year || '',
      exam_type || '',
      paper_year || '',
      pdf_url || '',
      image_url || '',
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const updatedPaper = queryOne('SELECT * FROM question_papers WHERE id = ?', req.params.id);
    res.json(updatedPaper);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/teacher/pyqs/:id
app.delete('/api/teacher/pyqs/:id', requireTeacher, (req, res) => {
  try {
    const result = execute('DELETE FROM question_papers WHERE id = ?', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teacher/questions
app.post('/api/teacher/questions', requireTeacher, (req, res) => {
  try {
    const { paper_id, section, section_instruction, question_number, question_text, marks, topic, difficulty } = req.body;

    if (!paper_id || !section || !question_number || !question_text || !topic) {
      return res.status(400).json({ error: 'paper_id, section, question_number, question_text, and topic are required' });
    }

    const insertSql = `
      INSERT INTO questions (paper_id, section, section_instruction, question_number, question_text, marks, topic, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = execute(
      insertSql,
      paper_id,
      section,
      section_instruction || null,
      question_number,
      question_text,
      marks || null,
      topic,
      difficulty || 'Medium'
    );

    const newQuestion = queryOne('SELECT * FROM questions WHERE id = ?', result.lastInsertRowid);
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/teacher/questions/:id
app.put('/api/teacher/questions/:id', requireTeacher, (req, res) => {
  try {
    const { paper_id, section, section_instruction, question_number, question_text, marks, topic, difficulty } = req.body;

    const updateSql = `
      UPDATE questions
      SET paper_id = ?, section = ?, section_instruction = ?, question_number = ?, question_text = ?, marks = ?, topic = ?, difficulty = ?
      WHERE id = ?
    `;

    const result = execute(
      updateSql,
      paper_id,
      section,
      section_instruction || null,
      question_number,
      question_text,
      marks || null,
      topic,
      difficulty || 'Medium',
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const updatedQuestion = queryOne('SELECT * FROM questions WHERE id = ?', req.params.id);
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/teacher/questions/:id
app.delete('/api/teacher/questions/:id', requireTeacher, (req, res) => {
  try {
    const result = execute('DELETE FROM questions WHERE id = ?', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teacher/students
app.get('/api/teacher/students', requireTeacher, (req, res) => {
  try {
    const students = queryAll(`
      SELECT u.id, u.fullName, u.email, u.mobile, u.college, u.branch, u.academicYear, u.createdAt,
             COUNT(r.id) as tests_completed,
             IFNULL(AVG(r.percentage), 0) as avg_score
      FROM users u
      LEFT JOIN test_results r ON u.id = r.user_id
      WHERE u.role = 'STUDENT'
      GROUP BY u.id
      ORDER BY u.createdAt DESC
    `);

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teacher/subjects
app.get('/api/teacher/subjects', requireTeacher, (req, res) => {
  try {
    const subjects = queryAll(`
      SELECT subject, subject_code, COUNT(id) as paper_count
      FROM question_papers
      GROUP BY subject
    `);
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teacher/profile
app.get('/api/teacher/profile', requireTeacher, (req, res) => {
  // Ensures a teacher can ONLY access their own profile data
  res.json(req.user);
});

// PUT /api/teacher/profile
app.put('/api/teacher/profile', requireTeacher, (req, res) => {
  try {
    const { fullName, mobile, college, branch, academicYear } = req.body;

    const updateSql = `
      UPDATE users
      SET fullName = ?, mobile = ?, college = ?, branch = ?, academicYear = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    execute(
      updateSql,
      fullName || req.user.fullName,
      mobile !== undefined ? mobile : req.user.mobile,
      college || req.user.college,
      branch || req.user.branch,
      academicYear || req.user.academicYear,
      req.user.id
    );

    const updatedUser = queryOne('SELECT * FROM users WHERE id = ?', req.user.id);
    res.json(sanitizeUser(updatedUser));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// GENERAL / PUBLIC APIs
// ==========================================

// College Metadata Endpoint
app.get('/api/college', (req, res) => {
  res.json({
    college: 'P. R. Pote Patil College of Engineering & Management, Amravati',
    department: 'Computer Science & Engineering',
    projectName: 'CSE PYQ HUB'
  });
});

// GET /api/stats - Dashboard Statistics
app.get('/api/stats', (req, res) => {
  try {
    const totalPapers = queryOne('SELECT COUNT(*) as count FROM question_papers').count;
    const totalSubjects = queryOne('SELECT COUNT(DISTINCT subject) as count FROM question_papers').count;
    const totalQuestions = queryOne('SELECT COUNT(*) as count FROM questions').count;
    const totalTopics = queryOne('SELECT COUNT(DISTINCT topic) as count FROM questions').count;

    res.json({
      totalPapers,
      totalSubjects,
      totalQuestions,
      totalTopics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/papers - List all question papers with question count
app.get('/api/papers', (req, res) => {
  try {
    const { subject, semester, academic_year, exam_type } = req.query;

    let query = `
      SELECT p.*, COUNT(q.id) as question_count
      FROM question_papers p
      LEFT JOIN questions q ON p.id = q.paper_id
      WHERE 1=1
    `;
    const params = [];

    if (subject) {
      query += ` AND p.subject LIKE ?`;
      params.push(`%${subject}%`);
    }
    if (semester) {
      query += ` AND p.semester = ?`;
      params.push(semester);
    }
    if (academic_year) {
      query += ` AND p.academic_year = ?`;
      params.push(academic_year);
    }
    if (exam_type) {
      query += ` AND p.exam_type = ?`;
      params.push(exam_type);
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const papers = queryAll(query, ...params);
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/papers/:id - Get paper by ID with structured questions
app.get('/api/papers/:id', (req, res) => {
  try {
    const paper = queryOne('SELECT * FROM question_papers WHERE id = ?', req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const questions = queryAll('SELECT * FROM questions WHERE paper_id = ? ORDER BY id ASC', req.params.id);

    const sections = {};
    questions.forEach((q) => {
      if (!sections[q.section]) {
        sections[q.section] = {
          sectionName: q.section,
          instruction: q.section_instruction || null,
          questions: []
        };
      }
      sections[q.section].questions.push(q);
    });

    res.json({
      ...paper,
      sections: Object.values(sections),
      allQuestions: questions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/papers (Teacher only)
app.post('/api/papers', requireTeacher, (req, res) => {
  try {
    const { subject, subject_code, semester, academic_year, exam_type, paper_year, pdf_url, image_url } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const insertSql = `
      INSERT INTO question_papers (subject, subject_code, semester, academic_year, exam_type, paper_year, pdf_url, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = execute(
      insertSql,
      subject,
      subject_code || '',
      semester || '',
      academic_year || '',
      exam_type || '',
      paper_year || '',
      pdf_url || '',
      image_url || ''
    );

    const newPaper = queryOne('SELECT * FROM question_papers WHERE id = ?', result.lastInsertRowid);
    res.status(201).json(newPaper);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/papers/:id (Teacher only)
app.put('/api/papers/:id', requireTeacher, (req, res) => {
  try {
    const { subject, subject_code, semester, academic_year, exam_type, paper_year, pdf_url, image_url } = req.body;

    const updateSql = `
      UPDATE question_papers
      SET subject = ?, subject_code = ?, semester = ?, academic_year = ?, exam_type = ?, paper_year = ?, pdf_url = ?, image_url = ?
      WHERE id = ?
    `;

    const result = execute(
      updateSql,
      subject,
      subject_code || '',
      semester || '',
      academic_year || '',
      exam_type || '',
      paper_year || '',
      pdf_url || '',
      image_url || '',
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const updatedPaper = queryOne('SELECT * FROM question_papers WHERE id = ?', req.params.id);
    res.json(updatedPaper);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/papers/:id (Teacher only)
app.delete('/api/papers/:id', requireTeacher, (req, res) => {
  try {
    const result = execute('DELETE FROM question_papers WHERE id = ?', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/questions - List questions
app.get('/api/questions', (req, res) => {
  try {
    const { topic, section, paper_id } = req.query;

    let query = `
      SELECT q.*, p.subject, p.subject_code, p.semester, p.academic_year, p.paper_year
      FROM questions q
      JOIN question_papers p ON q.paper_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (topic && topic !== 'All Topics') {
      query += ` AND q.topic = ?`;
      params.push(topic);
    }
    if (section) {
      query += ` AND q.section = ?`;
      params.push(section);
    }
    if (paper_id) {
      query += ` AND q.paper_id = ?`;
      params.push(paper_id);
    }

    query += ` ORDER BY q.id ASC`;

    const questions = queryAll(query, ...params);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/questions/:id - Get question by ID
app.get('/api/questions/:id', (req, res) => {
  try {
    const question = queryOne(`
      SELECT q.*, p.subject, p.subject_code, p.semester, p.academic_year, p.paper_year
      FROM questions q
      JOIN question_papers p ON q.paper_id = p.id
      WHERE q.id = ?
    `, req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/questions (Teacher only)
app.post('/api/questions', requireTeacher, (req, res) => {
  try {
    const { paper_id, section, section_instruction, question_number, question_text, marks, topic, difficulty } = req.body;

    if (!paper_id || !section || !question_number || !question_text || !topic) {
      return res.status(400).json({ error: 'paper_id, section, question_number, question_text, and topic are required' });
    }

    const insertSql = `
      INSERT INTO questions (paper_id, section, section_instruction, question_number, question_text, marks, topic, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = execute(
      insertSql,
      paper_id,
      section,
      section_instruction || null,
      question_number,
      question_text,
      marks || null,
      topic,
      difficulty || 'Medium'
    );

    const newQuestion = queryOne('SELECT * FROM questions WHERE id = ?', result.lastInsertRowid);
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/questions/:id (Teacher only)
app.put('/api/questions/:id', requireTeacher, (req, res) => {
  try {
    const { paper_id, section, section_instruction, question_number, question_text, marks, topic, difficulty } = req.body;

    const updateSql = `
      UPDATE questions
      SET paper_id = ?, section = ?, section_instruction = ?, question_number = ?, question_text = ?, marks = ?, topic = ?, difficulty = ?
      WHERE id = ?
    `;

    const result = execute(
      updateSql,
      paper_id,
      section,
      section_instruction || null,
      question_number,
      question_text,
      marks || null,
      topic,
      difficulty || 'Medium',
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const updatedQuestion = queryOne('SELECT * FROM questions WHERE id = ?', req.params.id);
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/questions/:id (Teacher only)
app.delete('/api/questions/:id', requireTeacher, (req, res) => {
  try {
    const result = execute('DELETE FROM questions WHERE id = ?', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/subjects
app.get('/api/subjects', (req, res) => {
  try {
    const subjects = queryAll(`
      SELECT subject, subject_code, COUNT(id) as paper_count
      FROM question_papers
      GROUP BY subject
    `);
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/topics
app.get('/api/topics', (req, res) => {
  try {
    const topics = queryAll(`
      SELECT topic, COUNT(id) as question_count
      FROM questions
      GROUP BY topic
      ORDER BY topic ASC
    `);
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/search?q=
app.get('/api/search', (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) {
      return res.json([]);
    }

    const searchTerm = `%${q.trim()}%`;

    const questions = queryAll(`
      SELECT q.*, p.subject, p.subject_code, p.semester, p.academic_year, p.paper_year
      FROM questions q
      JOIN question_papers p ON q.paper_id = p.id
      WHERE q.question_text LIKE ?
         OR q.topic LIKE ?
         OR q.section LIKE ?
         OR p.subject LIKE ?
         OR p.subject_code LIKE ?
         OR p.academic_year LIKE ?
      ORDER BY q.id ASC
    `, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/repeated-questions
app.get('/api/repeated-questions', (req, res) => {
  try {
    const allQuestions = queryAll(`
      SELECT q.*, p.subject, p.academic_year, p.paper_year
      FROM questions q
      JOIN question_papers p ON q.paper_id = p.id
    `);

    const groups = {};
    allQuestions.forEach((q) => {
      const key = q.question_text.trim().toLowerCase().replace(/\s+/g, ' ');
      if (!groups[key]) {
        groups[key] = {
          question_text: q.question_text,
          topic: q.topic,
          occurrences: []
        };
      }
      groups[key].occurrences.push({
        paper_id: q.paper_id,
        subject: q.subject,
        paper_year: q.paper_year || q.academic_year,
        section: q.section,
        question_number: q.question_number
      });
    });

    const repeated = Object.values(groups).filter((g) => g.occurrences.length > 1);

    res.json(repeated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
