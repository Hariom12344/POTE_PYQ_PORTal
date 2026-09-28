import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'pyq_hub.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Statement Cache to prevent GC destruction issues in Node v24
const stmtCache = new Map();

export function getStmt(sql) {
  let stmt = stmtCache.get(sql);
  if (!stmt) {
    stmt = db.prepare(sql);
    stmtCache.set(sql, stmt);
  }
  return stmt;
}

export function queryOne(sql, ...params) {
  return getStmt(sql).get(...params);
}

export function queryAll(sql, ...params) {
  return getStmt(sql).all(...params);
}

export function execute(sql, ...params) {
  return getStmt(sql).run(...params);
}

export function initDb() {
  console.log('Initializing SQLite Database schema at:', dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT,
      college TEXT,
      branch TEXT,
      academicYear TEXT,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('STUDENT', 'TEACHER')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS practice_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      questions_count INTEGER DEFAULT 10,
      duration_minutes INTEGER DEFAULT 30,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS test_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      test_title TEXT NOT NULL,
      subject TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_marks INTEGER NOT NULL,
      percentage REAL NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS question_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      subject_code TEXT,
      semester TEXT,
      academic_year TEXT,
      exam_type TEXT,
      paper_year TEXT,
      pdf_url TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_id INTEGER NOT NULL,
      section TEXT NOT NULL,
      section_instruction TEXT,
      question_number TEXT NOT NULL,
      question_text TEXT NOT NULL,
      marks TEXT,
      topic TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paper_id) REFERENCES question_papers (id) ON DELETE CASCADE
    );
  `);

  // Seed default practice tests if empty
  const practiceCount = queryOne('SELECT COUNT(*) as count FROM practice_tests').count;
  if (practiceCount === 0) {
    const insertSql = `
      INSERT INTO practice_tests (title, subject, questions_count, duration_minutes)
      VALUES (?, ?, ?, ?)
    `;
    execute(insertSql, 'C Programming Basics Quiz', 'Programming in C', 10, 20);
    execute(insertSql, 'Pointers & Memory Assessment', 'Programming in C', 5, 15);
    execute(insertSql, 'Data Structures Fundamentals', 'Data Structures & Algorithms', 10, 30);
    execute(insertSql, 'Digital Electronics Logic Quiz', 'Digital Electronics', 10, 20);
    execute(insertSql, 'Applied Math II Graph Theory & Stats', 'Applied Mathematics-II', 10, 25);
    execute(insertSql, 'Java OOP Fundamentals Quiz', 'Object Oriented Programming', 10, 20);
    execute(insertSql, 'Applied Physics Lasers & Quantum Quiz', 'Applied Physics', 10, 20);
  }

  // Seed default dataset if database is empty
  const { count } = queryOne('SELECT COUNT(*) as count FROM question_papers');

  if (count === 0) {
    console.log('Seeding initial question papers and exact questions...');

    const insertPaperSql = `
      INSERT INTO question_papers (subject, subject_code, semester, academic_year, exam_type, paper_year, pdf_url, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const paper1 = execute(
      insertPaperSql,
      'Programming in C',
      '',
      'Semester III',
      '2023-2024',
      'End Semester Examination',
      '2023',
      '/uploads/c_programming_pyq.pdf',
      '/uploads/c_programming_pyq_page1.png'
    );

    const paper1Id = paper1.lastInsertRowid;

    const insertQSql = `
      INSERT INTO questions (paper_id, section, section_instruction, question_number, question_text, marks, topic, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    execute(insertQSql, paper1Id, 'SECTION 3B', 'Solve any two questions', '1', 'Write a C program to find the largest element in an array of 5 integers.', '7', 'Arrays', 'Easy');
    execute(insertQSql, paper1Id, 'SECTION 3B', 'Solve any two questions', '2', 'Write a C program to count the number of vowels in a given string.', '7', 'Strings', 'Medium');
    execute(insertQSql, paper1Id, 'SECTION 3B', 'Solve any two questions', '3', 'Write a C program to copy one string to another without using strcpy() function.', '7', 'Strings', 'Medium');

    execute(insertQSql, paper1Id, 'SECTION 4A', null, '1', 'What is the syntax of writing user-defined function?', '4', 'Functions', 'Easy');
    execute(insertQSql, paper1Id, 'SECTION 4A', null, '2', 'Enlist any three math.h functions.', '3', 'Math Functions', 'Easy');

    execute(insertQSql, paper1Id, 'SECTION 4B', 'Solve any two questions', '1', 'Write a C program to find the sum of two numbers using a user-defined function.', '7', 'Functions', 'Easy');
    execute(insertQSql, paper1Id, 'SECTION 4B', 'Solve any two questions', '2', 'Explain the concept of local and global variables with a suitable example.', '7', 'Variables', 'Medium');
    execute(insertQSql, paper1Id, 'SECTION 4B', 'Solve any two questions', '3', 'Write a C function to check whether a given number is prime or not.', '7', 'Functions', 'Medium');

    execute(insertQSql, paper1Id, 'SECTION 5A', null, '1', 'How do you declare a pointer variable? Give the syntax with example.', '4', 'Pointers', 'Easy');
    execute(insertQSql, paper1Id, 'SECTION 5A', null, '2', `What is the output of the following code?\n\nint a=10;\n*p=&a;\nprintf("%d", *p);`, '3', 'Pointers', 'Medium');

    execute(insertQSql, paper1Id, 'SECTION 5B', 'Solve any two questions', '1', 'Write a C program to swap two numbers using pointers.', '7', 'Pointers', 'Medium');
    execute(insertQSql, paper1Id, 'SECTION 5B', 'Solve any two questions', '2', 'Explain call by value and call by reference with examples.', '7', 'Pointers', 'Medium');
    execute(insertQSql, paper1Id, 'SECTION 5B', 'Solve any two questions', '3', 'Write a C program to demonstrate pointer to pointer.', '7', 'Pointers', 'Medium');

    execute(insertQSql, paper1Id, 'SECTION 6A', null, '1', 'Write the syntax to declare a structure.', '4', 'Structures', 'Easy');
    execute(insertQSql, paper1Id, 'SECTION 6A', null, '2', 'Write any two advantages of structures in C.', '3', 'Structures', 'Easy');

    execute(insertQSql, paper1Id, 'SECTION 6B', 'Solve any two questions', '1', `Write a C program to define a structure 'Student' with members:\nname, roll_no, and marks.\nRead and display the information of one student.`, '7', 'Structures', 'Medium');
    execute(insertQSql, paper1Id, 'SECTION 6B', 'Solve any two questions', '2', 'Write a C program to demonstrate array of structures.', '7', 'Structures', 'Hard');
    execute(insertQSql, paper1Id, 'SECTION 6B', 'Solve any two questions', '3', 'Write a C program to write your name and roll number to a file and then read and display it.', '7', 'File Handling', 'Hard');

    const paper2 = execute(
      insertPaperSql,
      'Programming in C',
      '3KS02',
      'Semester III',
      '2022-2023',
      'Winter Examination',
      '2022',
      '/uploads/c_programming_2022.pdf',
      '/uploads/c_programming_2022_page1.png'
    );
    const paper2Id = paper2.lastInsertRowid;

    execute(insertQSql, paper2Id, 'SECTION 1B', 'Solve any two', '1', 'Write a C function to check whether a given number is prime or not.', '7', 'Functions', 'Medium');
    execute(insertQSql, paper2Id, 'SECTION 2A', null, '1', 'Explain call by value and call by reference with examples.', '7', 'Pointers', 'Medium');
    execute(insertQSql, paper2Id, 'SECTION 3B', 'Solve any two', '1', 'Write a C program to count the number of vowels in a given string.', '7', 'Strings', 'Medium');
    execute(insertQSql, paper2Id, 'SECTION 4A', null, '1', 'Write a C program to swap two numbers using pointers.', '7', 'Pointers', 'Medium');

    const paper3 = execute(
      insertPaperSql,
      'Data Structures & Algorithms',
      '3KS03',
      'Semester III',
      '2023-2024',
      'End Semester Examination',
      '2023',
      '/uploads/dsa_2023.pdf',
      '/uploads/dsa_2023_page1.png'
    );
    const paper3Id = paper3.lastInsertRowid;

    execute(insertQSql, paper3Id, 'SECTION 1A', null, '1', 'Define Stack. Explain push and pop operations with neat diagram.', '7', 'Stacks & Queues', 'Medium');
    execute(insertQSql, paper3Id, 'SECTION 1B', null, '2', 'Write an algorithm to evaluate postfix expression using Stack.', '7', 'Stacks & Queues', 'Hard');
    execute(insertQSql, paper3Id, 'SECTION 2A', null, '1', 'Explain Singly Linked List insertion at beginning and end.', '7', 'Linked Lists', 'Medium');
    execute(insertQSql, paper3Id, 'SECTION 3A', null, '1', 'Write a C program for Binary Search tree traversal (Inorder, Preorder, Postorder).', '8', 'Trees', 'Hard');

    console.log('Database seeded successfully!');
  }

  // Ensure Summer-2026 & Winter-2025 Mid Semester and End Semester Examination papers are seeded
  seedSummer2026Papers();
  seedWinter2025Papers();
  seedSummer2026MidSem2Papers();
  seedWinter2025EndSemPapers();
  seedSummer2026EndSemPapers();
}

function seedSummer2026Papers() {
  console.log('Checking Mid Semester Examination-I (Summer-2026) question papers...');

  const insertPaperSql = `
    INSERT INTO question_papers (subject, subject_code, semester, academic_year, exam_type, paper_year, pdf_url, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertQSql = `
    INSERT INTO questions (paper_id, section, section_instruction, question_number, question_text, marks, topic, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // 1. Digital Electronics
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Digital Electronics', 'Mid Semester Examination-I (Summer-2026)')) {
    const dePaper = execute(
      insertPaperSql,
      'Digital Electronics',
      'CS/AI/ML204ESC06',
      'Semester II',
      '2025-2026',
      'Mid Semester Examination-I (Summer-2026)',
      '2026',
      '/uploads/digital_electronics_summer2026.pdf',
      '/uploads/digital_electronics_summer2026_page1.png'
    );
    const deId = dePaper.lastInsertRowid;

    execute(insertQSql, deId, '1 A', null, 'i', 'What is the range of 8-bit signed binary numbers.', '1', 'Number Systems', 'Easy');
    execute(insertQSql, deId, '1 A', null, 'ii', 'Obtain 2\'s complement of (101101)2.', '1', 'Complements', 'Easy');
    execute(insertQSql, deId, '1 A', null, 'iii', 'Perform binary subtraction: 1011 - 0010', '1', 'Binary Arithmetic', 'Easy');
    execute(insertQSql, deId, '1 B', 'Solve any two questions of the following', 'i', 'Perform binary operation using 1\'s complement and 2\'s complement: (45 - 67)', '6', 'Binary Arithmetic', 'Medium');
    execute(insertQSql, deId, '1 B', 'Solve any two questions of the following', 'ii', 'Find signed binary representation of the following using 1\'s complement: a) (+56)10 b) (-49)10', '6', 'Signed Binary', 'Medium');
    execute(insertQSql, deId, '1 B', 'Solve any two questions of the following', 'iii', 'What are Logic gates? Explain the different types of gates in detail.', '6', 'Logic Gates', 'Medium');
    execute(insertQSql, deId, '2 A', null, 'i', 'Simplify using Boolean law only: AB+AB\'', '1', 'Boolean Algebra', 'Easy');
    execute(insertQSql, deId, '2 A', null, 'ii', 'Simplify using K-map: f(p, q) = Σm(1,2)', '1', 'K-Map', 'Easy');
    execute(insertQSql, deId, '2 A', null, 'iii', 'Simplify the following: Y = (A+B)(A\'+B\')\'', '1', 'Boolean Simplification', 'Medium');
    execute(insertQSql, deId, '2 B', 'Solve any two questions of the following', 'i', 'Prove the following using Boolean laws only: a) A + BC = (A+B)(A+C) b) (A+B)(A+B\') = A', '6', 'Boolean Laws', 'Medium');
    execute(insertQSql, deId, '2 B', 'Solve any two questions of the following', 'ii', 'Obtain the minimized expression by using K-Map and implement it using basic gates only.\na) f(a,b,c,d) = Σm (2,3,5,13,14) + d(8,9,10,11)\nb) (P,Q,R,S) = πM (1,3,8,10,12,13).d(14,15)', '6', 'K-Map Minimization', 'Hard');
    execute(insertQSql, deId, '2 B', 'Solve any two questions of the following', 'iii', 'Simplify using tabulation method: (A, B, C, D, E, F, G) = Σm(25,27,40,42)', '6', 'Tabulation Method', 'Hard');
  }

  // 2. Applied Mathematics-II
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Applied Mathematics-II', 'Mid Semester Examination-I (Summer-2026)')) {
    const mathPaper = execute(
      insertPaperSql,
      'Applied Mathematics-II',
      'CS/AI/ML201BSC03',
      'Semester II',
      '2025-2026',
      'Mid Semester Examination-I (Summer-2026)',
      '2026',
      '/uploads/applied_mathematics_summer2026.pdf',
      '/uploads/applied_mathematics_summer2026_page1.png'
    );
    const mathId = mathPaper.lastInsertRowid;

    execute(insertQSql, mathId, '1 A', null, 'i', 'Define connected graph?', '1', 'Graph Theory', 'Easy');
    execute(insertQSql, mathId, '1 A', null, 'ii', 'What is generating function?', '1', 'Generating Functions', 'Easy');
    execute(insertQSql, mathId, '1 A', null, 'iii', 'What is a recurrence relation?', '1', 'Recurrence Relations', 'Easy');
    execute(insertQSql, mathId, '1 B', 'Solve any two questions of the following', 'i', 'Define vertex coloring and chromatic number. Find the chromatic number of following graph.', '6', 'Graph Coloring', 'Medium');
    execute(insertQSql, mathId, '1 B', 'Solve any two questions of the following', 'ii', 'Solve the recurrence relation a_{n+1} = 5a_n for n ≥ 0, given that a_0 = 2', '6', 'Recurrence Relations', 'Medium');
    execute(insertQSql, mathId, '1 B', 'Solve any two questions of the following', 'iii', 'Find the generating function of the following sequence: a) {1, 1, 1, 1 ...}, b) {1, 2, 3, 4.....}.', '6', 'Generating Functions', 'Medium');
    execute(insertQSql, mathId, '2 A', null, 'i', 'What is measures of central tendency', '1', 'Statistics', 'Easy');
    execute(insertQSql, mathId, '2 A', null, 'ii', 'Find the mode of 2, 4, 5, 7, 4, 5, 4, 2, 4', '1', 'Statistics', 'Easy');
    execute(insertQSql, mathId, '2 A', null, 'iii', 'If variance = 16, find the standard deviation.', '1', 'Statistics', 'Easy');
    execute(insertQSql, mathId, '2 B', 'Solve any two questions of the following', 'i', 'Calculate median for the following data:\nClass interval(x): 20-40, 40-60, 60-80, 80-100, 100-120\nFrequency(f): 4, 6, 10, 12, 8', '6', 'Statistics', 'Medium');
    execute(insertQSql, mathId, '2 B', 'Solve any two questions of the following', 'ii', 'Describe Arithmetic mean. Hence calculate mean for following data:\nx: 2, 4, 6, 8, 10, 12, 14\nf: 4, 6, 10, 12, 8, 7, 3', '6', 'Statistics', 'Medium');
    execute(insertQSql, mathId, '2 B', 'Solve any two questions of the following', 'iii', 'Find correlation coefficient for data:\nx: 10, 14, 18, 22, 26, 30\ny: 18, 12, 24, 6, 30, 36', '6', 'Correlation & Regression', 'Hard');
  }

  // 3. Introduction to Data Analysis
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Introduction to Data Analysis', 'Mid Semester Examination-I (Summer-2026)')) {
    const daPaper = execute(
      insertPaperSql,
      'Introduction to Data Analysis',
      'CS/AI/ML205PCC01',
      'Semester II',
      '2025-2026',
      'Mid Semester Examination-I (Summer-2026)',
      '2026',
      '/uploads/data_analysis_summer2026.pdf',
      '/uploads/data_analysis_summer2026_page1.png'
    );
    const daId = daPaper.lastInsertRowid;

    execute(insertQSql, daId, '1 A', null, 'i', 'What is a chart in Excel?', '1', 'Excel Charts', 'Easy');
    execute(insertQSql, daId, '1 A', null, 'ii', 'What does the Text to Column feature do?', '1', 'Data Transformation', 'Easy');
    execute(insertQSql, daId, '1 A', null, 'iii', 'List out various chart objects (elements).', '1', 'Excel Elements', 'Easy');
    execute(insertQSql, daId, '1 B', 'Solve any two questions of the following', 'i', 'Draw and explain following types of charts in Excel with suitable example:\n1) Line Chart\n2) Column Chart\n3) Pie Chart', '6', 'Excel Visualization', 'Medium');
    execute(insertQSql, daId, '1 B', 'Solve any two questions of the following', 'ii', 'What is Data Validation in Excel? Explain with example?', '6', 'Data Validation', 'Medium');
    execute(insertQSql, daId, '1 B', 'Solve any two questions of the following', 'iii', 'Perform the following tasks on the given dataset:\n1. Sort the data in ascending order of Marks.\n2. Filter the dataset to show only students from your department.\nDataset: [Roll No: 101 Aditi CSE 78, 102 Rahul AIDS 85, 103 Sneha CSE(AIML) 67, 104 Amit CSE 92, 105 Priya AIDS 74, 106 Karan CSE(AIML) 88, 107 Neha CSE 69]', '6', 'Data Manipulation', 'Medium');
  }

  // 4. Indian Knowledge System
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Indian Knowledge System', 'Mid Semester Examination-I (Summer-2026)')) {
    const iksPaper = execute(
      insertPaperSql,
      'Indian Knowledge System',
      'CS/AI/ML206IKS01',
      'Semester II',
      '2025-2026',
      'Mid Semester Examination-I (Summer-2026)',
      '2026',
      '/uploads/iks_summer2026.pdf',
      '/uploads/iks_summer2026_page1.png'
    );
    const iksId = iksPaper.lastInsertRowid;

    execute(insertQSql, iksId, '1 A', null, 'i', 'State the language was preferred for effective teaching learning process During Vedic era?', '1', 'Vedic Education', 'Easy');
    execute(insertQSql, iksId, '1 A', null, 'ii', 'State mainly three process of Educational instructions in ancient India.', '1', 'Ancient Pedagogy', 'Easy');
    execute(insertQSql, iksId, '1 A', null, 'iii', 'State the oldest university in ancient India.', '1', 'Ancient Universities', 'Easy');
    execute(insertQSql, iksId, '1 B', 'Solve any two questions of the following', 'i', 'Explain the salient features of the Gurukul Ashram System.', '6', 'Gurukul System', 'Medium');
    execute(insertQSql, iksId, '1 B', 'Solve any two questions of the following', 'ii', 'Explain the importance and educational contributions of Sharada Peeth University.', '6', 'Ancient Universities', 'Medium');
    execute(insertQSql, iksId, '1 B', 'Solve any two questions of the following', 'iii', 'Explain the key features of Vikramashila University.', '6', 'Ancient Universities', 'Medium');
  }

  // 5. Object Oriented Programming
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Object Oriented Programming', 'Mid Semester Examination-I (Summer-2026)')) {
    const oopPaper = execute(
      insertPaperSql,
      'Object Oriented Programming',
      'CS/AI/ML203ESC05',
      'Semester II',
      '2025-2026',
      'Mid Semester Examination-I (Summer-2026)',
      '2026',
      '/uploads/oop_java_summer2026.pdf',
      '/uploads/oop_java_summer2026_page1.png'
    );
    const oopId = oopPaper.lastInsertRowid;

    execute(insertQSql, oopId, '1 A', null, 'i', 'List any two primitive data types in Java.', '1', 'Java Data Types', 'Easy');
    execute(insertQSql, oopId, '1 A', null, 'ii', 'What is associativity of operators in Java?', '1', 'Java Operators', 'Easy');
    execute(insertQSql, oopId, '1 A', null, 'iii', 'Difference between break and continue statement.', '1', 'Control Statements', 'Easy');
    execute(insertQSql, oopId, '1 B', 'Solve any two questions of the following', 'i', 'Demonstrate type conversion in java. Explain it with suitable example.', '6', 'Type Conversion', 'Medium');
    execute(insertQSql, oopId, '1 B', 'Solve any two questions of the following', 'ii', 'Write a Java program that uses conditional statements and loops to print the multiplication table of a number entered by the user.', '6', 'Loops & Conditions', 'Medium');
    execute(insertQSql, oopId, '1 B', 'Solve any two questions of the following', 'iii', 'Develop a Java program using a switch statement to create a simple calculator that performs addition, subtraction, multiplication, and division based on the operator entered by the user.', '6', 'Control Statements', 'Medium');
    execute(insertQSql, oopId, '2 A', null, 'i', 'Define encapsulation in Java.', '1', 'OOP Concepts', 'Easy');
    execute(insertQSql, oopId, '2 A', null, 'ii', 'What is enum in Java?', '1', 'Java Features', 'Easy');
    execute(insertQSql, oopId, '2 A', null, 'iii', 'What is the purpose of this keyword in Java?', '1', 'Java Keywords', 'Easy');
    execute(insertQSql, oopId, '2 B', 'Solve any two questions of the following', 'i', 'Write a Java program to create a Student class having data members name and roll no. Include constructor and methods to read and print the student object. Test this class by writing a Main class.', '6', 'Classes & Objects', 'Medium');
    execute(insertQSql, oopId, '2 B', 'Solve any two questions of the following', 'ii', 'Illustrate the use of Scanner class.', '6', 'Java I/O', 'Medium');
    execute(insertQSql, oopId, '2 B', 'Solve any two questions of the following', 'iii', 'Write a program in Java to create a class with constructors and demonstrate the use of this keyword to initialize instance variables. Create objects and display the values.', '6', 'Constructors & Keywords', 'Medium');
  }

  // 6. Applied Physics
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Applied Physics', 'Mid Semester Examination-I (Summer-2026)')) {
    const apPaper = execute(
      insertPaperSql,
      'Applied Physics',
      'CS/AI/ML202BSC04',
      'Semester II',
      '2025-2026',
      'Mid Semester Examination-I (Summer-2026)',
      '2026',
      '/uploads/applied_physics_summer2026.pdf',
      '/uploads/applied_physics_summer2026_page1.png'
    );
    const apId = apPaper.lastInsertRowid;

    execute(insertQSql, apId, '1 A', null, 'i', 'What is RUBY?', '1', 'Lasers', 'Easy');
    execute(insertQSql, apId, '1 A', null, 'ii', 'Define optical Pumping?', '1', 'Lasers', 'Easy');
    execute(insertQSql, apId, '1 A', null, 'iii', 'State Principle on which LASER works.', '1', 'Lasers', 'Easy');
    execute(insertQSql, apId, '1 B', 'Solve any two questions of the following', 'i', 'With the help of Energy Level diagram explain the working of Three Level LASER systems?', '6', 'Lasers', 'Medium');
    execute(insertQSql, apId, '1 B', 'Solve any two questions of the following', 'ii', 'With the help of Two Energy Levels, Elaborate the Absorption, Spontaneous Emission, Stimulated Emission processes involved in LASER formation', '6', 'Lasers', 'Medium');
    execute(insertQSql, apId, '1 B', 'Solve any two questions of the following', 'iii', 'State any four properties of LASER source and using divergence property find the divergence angle for laser beam with a 2.5 m diameter hits the Moon from Earth (distance of moon from earth = 3.8x10^10 m).', '6', 'Lasers & Optics', 'Hard');
    execute(insertQSql, apId, '2 A', null, 'i', 'What is Compton shift?', '1', 'Quantum Mechanics', 'Easy');
    execute(insertQSql, apId, '2 A', null, 'ii', 'State Heisenberg\'s time energy Uncertainty Relation.', '1', 'Quantum Mechanics', 'Easy');
    execute(insertQSql, apId, '2 A', null, 'iii', 'Compton effect is observed in which elements?', '1', 'Quantum Mechanics', 'Easy');
    execute(insertQSql, apId, '2 B', 'Solve any two questions of the following', 'i', 'State De Broglie\'s Concept of matter wave and explains any four properties of matter wave.', '6', 'Quantum Mechanics', 'Medium');
    execute(insertQSql, apId, '2 B', 'Solve any two questions of the following', 'ii', 'Elaborate Heisenberg\'s Uncertainty Principal and prove that electrons cannot exist inside the nucleus.', '6', 'Quantum Mechanics', 'Hard');
    execute(insertQSql, apId, '2 B', 'Solve any two questions of the following', 'iii', 'A Car is moving with the speed of 100 km/hour and force of 1000N exerts on it in downward direction. Find the wavelength of matter wave associated with car in Angstrom unit. (g = 9.8 m/s²)', '6', 'Quantum Mechanics', 'Hard');
  }

  console.log('Summer-2026 question papers check complete.');
}

function seedWinter2025Papers() {
  console.log('Checking Mid Semester Examination-I (Winter-2025) question papers...');

  const insertPaperSql = `
    INSERT INTO question_papers (subject, subject_code, semester, academic_year, exam_type, paper_year, pdf_url, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertQSql = `
    INSERT INTO questions (paper_id, section, section_instruction, question_number, question_text, marks, topic, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // 1. Computer Programming
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Computer Programming', 'Mid Semester Examination-I (Winter-2025)')) {
    const cpPaper = execute(
      insertPaperSql,
      'Computer Programming',
      'CS/AI/ML103ESC01',
      'Semester I',
      '2025-2026',
      'Mid Semester Examination-I (Winter-2025)',
      '2025',
      '/uploads/computer_programming_winter2025.pdf',
      '/uploads/computer_programming_winter2025_page1.png'
    );
    const cpId = cpPaper.lastInsertRowid;

    execute(insertQSql, cpId, '1 A', null, 'i', 'Define variable.', '1', 'Variables', 'Easy');
    execute(insertQSql, cpId, '1 A', null, 'ii', 'State the syntax used to define a constant in C.', '1', 'Constants', 'Easy');
    execute(insertQSql, cpId, '1 B', 'Solve any two questions of the following', 'i', 'Construct a C program utilizing all arithmetic operators.', '4', 'Operators', 'Medium');
    execute(insertQSql, cpId, '1 B', 'Solve any two questions of the following', 'ii', 'Differentiate between implicit and explicit type casting in C by providing a code example for each.', '4', 'Type Casting', 'Medium');
    execute(insertQSql, cpId, '1 B', 'Solve any two questions of the following', 'iii', 'Illustrate the functionality of the printf() and scanf() functions in C with examples.', '4', 'I/O Functions', 'Medium');
    execute(insertQSql, cpId, '2 A', null, 'i', 'Write the syntax of do while loop.', '1', 'Loops', 'Easy');
    execute(insertQSql, cpId, '2 A', null, 'ii', 'State the specific C operator with syntax that is a shorthand for an if-else statement.', '1', 'Operators', 'Easy');
    execute(insertQSql, cpId, '2 B', 'Solve any two questions of the following', 'i', 'Implement a C program that calculates and prints the sum and average of the n natural numbers. Take the input from user.', '4', 'Loops & Logic', 'Medium');
    execute(insertQSql, cpId, '2 B', 'Solve any two questions of the following', 'ii', 'Construct a C program that determines if a user-provided integer is a prime number or not.', '4', 'Algorithms', 'Medium');
    execute(insertQSql, cpId, '2 B', 'Solve any two questions of the following', 'iii', `Develop a Grade Determination System in C. The program must accept a student's numerical score (marks) as input and output the corresponding letter grade according to the following specific grading schema:\n90-100: A+\n80-89: A\n70-79: B+\n60-69: B\nBelow 60: C`, '4', 'Conditionals', 'Hard');
    execute(insertQSql, cpId, '3 A', null, 'i', 'Define Arrays.', '1', 'Arrays', 'Easy');
    execute(insertQSql, cpId, '3 A', null, 'ii', 'State the syntax of 2D Array for declaration & initialization.', '1', '2D Arrays', 'Easy');
    execute(insertQSql, cpId, '3 B', 'Solve any two questions of the following', 'i', 'Develop a C Program to search an element in array. Take the input from the user.', '4', 'Array Searching', 'Medium');
    execute(insertQSql, cpId, '3 B', 'Solve any two questions of the following', 'ii', 'Implement Strings & apply read, write functions on it.', '4', 'Strings', 'Medium');
    execute(insertQSql, cpId, '3 B', 'Solve any two questions of the following', 'iii', 'Design & implement a C program capable of dynamically handling and displaying two-dimensional array data based on user-defined dimensions and elements.', '4', '2D Arrays', 'Hard');
  }

  // 2. Problem Solving Techniques
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Problem Solving Techniques', 'Mid Semester Examination-I (Winter-2025)')) {
    const pstPaper = execute(
      insertPaperSql,
      'Problem Solving Techniques',
      'CS/AI/ML103ESC01',
      'Semester I',
      '2025-2026',
      'Mid Semester Examination-I (Winter-2025)',
      '2025',
      '/uploads/problem_solving_techniques_winter2025.pdf',
      '/uploads/problem_solving_techniques_winter2025_page1.png'
    );
    const pstId = pstPaper.lastInsertRowid;

    execute(insertQSql, pstId, '1 A', null, 'i', 'What is a Computer Program?', '1', 'Programming Basics', 'Easy');
    execute(insertQSql, pstId, '1 A', null, 'ii', 'Define an algorithm.', '1', 'Algorithms', 'Easy');
    execute(insertQSql, pstId, '1 B', 'Solve any two questions of the following', 'i', 'Describe the loop construction process with an example.', '4', 'Looping', 'Medium');
    execute(insertQSql, pstId, '1 B', 'Solve any two questions of the following', 'ii', 'Explain how the Top-Down approach helps in simplifying a complex problem into manageable sub-problem.', '4', 'Top-Down Design', 'Medium');
    execute(insertQSql, pstId, '1 B', 'Solve any two questions of the following', 'iii', 'List Problem Solving Techniques with examples.', '4', 'Problem Solving', 'Medium');
    execute(insertQSql, pstId, '2 A', null, 'i', 'How is a new term in the Fibonacci sequence generated after the first two?', '1', 'Sequences', 'Easy');
    execute(insertQSql, pstId, '2 A', null, 'ii', 'Give basic logic for counting numbers in a set?', '1', 'Set Logic', 'Easy');
    execute(insertQSql, pstId, '2 B', 'Solve any two questions of the following', 'i', 'If we exchange the values of two variables, p and q, using only the assignments p := q and q := p what is the problem? Explain using example.', '4', 'Variable Swapping', 'Medium');
    execute(insertQSql, pstId, '2 B', 'Solve any two questions of the following', 'ii', 'Write an algorithm to reverse the digits of a positive integer.', '4', 'Number Manipulation', 'Medium');
    execute(insertQSql, pstId, '2 B', 'Solve any two questions of the following', 'iii', 'List the basic steps for performing multiplication using repeated addition.', '4', 'Arithmetic Algorithms', 'Medium');
    execute(insertQSql, pstId, '3 A', null, 'i', 'What does gcd stand for?', '1', 'Mathematics', 'Easy');
    execute(insertQSql, pstId, '3 A', null, 'ii', 'State the stopping condition in the smallest divisor algorithm.', '1', 'Algorithms', 'Easy');
    execute(insertQSql, pstId, '3 B', 'Solve any two questions of the following', 'i', 'Develop an algorithm to prints prime numbers between 1 and N.', '4', 'Prime Generation', 'Medium');
    execute(insertQSql, pstId, '3 B', 'Solve any two questions of the following', 'ii', 'Write the steps of square root algorithm.', '4', 'Math Algorithms', 'Medium');
    execute(insertQSql, pstId, '3 B', 'Solve any two questions of the following', 'iii', 'Write an algorithm to compute the GCD of two integers.', '4', 'Euclidean Algorithm', 'Medium');
  }

  // 3. Computer Fundamentals
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Computer Fundamentals', 'Mid Semester Examination-I (Winter-2025)')) {
    const cfPaper = execute(
      insertPaperSql,
      'Computer Fundamentals',
      'CS/AI/ML105VSE01',
      'Semester I',
      '2025-2026',
      'Mid Semester Examination-I (Winter-2025)',
      '2025',
      '/uploads/computer_fundamentals_winter2025.pdf',
      '/uploads/computer_fundamentals_winter2025_page1.png'
    );
    const cfId = cfPaper.lastInsertRowid;

    execute(insertQSql, cfId, '1 A', null, 'i', 'List the characteristics of computer.', '1', 'Computer Basics', 'Easy');
    execute(insertQSql, cfId, '1 A', null, 'ii', 'State different types of computers by their size.', '1', 'Computer Hardware', 'Easy');
    execute(insertQSql, cfId, '1 B', 'Solve any two questions of the following', 'i', 'Explain the evolution of computers from first to fifth generation.', '4', 'Computer Generations', 'Medium');
    execute(insertQSql, cfId, '1 B', 'Solve any two questions of the following', 'ii', 'Describe functions of Operating System and differentiate between single user & multi user OS.', '4', 'Operating Systems', 'Medium');
    execute(insertQSql, cfId, '1 B', 'Solve any two questions of the following', 'iii', 'Explain various applications of Computer.', '4', 'Computer Basics', 'Medium');
    execute(insertQSql, cfId, '2 A', null, 'i', 'Define a Number system.', '1', 'Number Systems', 'Easy');
    execute(insertQSql, cfId, '2 A', null, 'ii', 'State the base (radix) of binary, octal, decimal, and hexadecimal systems.', '1', 'Number Systems', 'Easy');
    execute(insertQSql, cfId, '2 B', 'Solve any two questions of the following', 'i', 'Convert the decimal number 125 to its binary, octal, and hexadecimal equivalents.', '4', 'Number Conversions', 'Medium');
    execute(insertQSql, cfId, '2 B', 'Solve any two questions of the following', 'ii', `a) Perform the binary Addition (1010)₂ + (0101)₂\nb) Perform the binary subtraction (1010)₂ - (0011)₂`, '4', 'Binary Arithmetic', 'Medium');
    execute(insertQSql, cfId, '2 B', 'Solve any two questions of the following', 'iii', 'Explain the difference between ASCII and Unicode encoding with an example for each.', '4', 'Data Representation', 'Medium');
  }

  // 4. Environmental Studies
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Environmental Studies', 'Mid Semester Examination-I (Winter-2025)')) {
    const evsPaper = execute(
      insertPaperSql,
      'Environmental Studies',
      'CS/AI/ML102BSC02',
      'Semester I',
      '2025-2026',
      'Mid Semester Examination-I (Winter-2025)',
      '2025',
      '/uploads/environmental_studies_winter2025.pdf',
      '/uploads/environmental_studies_winter2025_page1.png'
    );
    const evsId = evsPaper.lastInsertRowid;

    execute(insertQSql, evsId, '1 A', null, 'i', 'The materials obtained from nature that satisfy human needs are called ________.', '1', 'Natural Resources', 'Easy');
    execute(insertQSql, evsId, '1 A', null, 'ii', 'Give one example of a water conflict in India.', '1', 'Resource Management', 'Easy');
    execute(insertQSql, evsId, '1 B', 'Solve any two questions of the following', 'i', 'Highlight the causes and consequences of deforestation. Support your answer with relevant case studies.', '4', 'Deforestation', 'Medium');
    execute(insertQSql, evsId, '1 B', 'Solve any two questions of the following', 'ii', 'Describe the causes and effects of floods and droughts.', '4', 'Natural Disasters', 'Medium');
    execute(insertQSql, evsId, '1 B', 'Solve any two questions of the following', 'iii', 'Discuss the environmental impacts of extraction and utilization of minerals. Support your answer with suitable case study.', '4', 'Mining & Environment', 'Medium');
    execute(insertQSql, evsId, '2 A', null, 'i', 'The energy flow in the ecosystem is ______________', '1', 'Ecosystems', 'Easy');
    execute(insertQSql, evsId, '2 A', null, 'ii', 'Define the term Ecological Pyramid.', '1', 'Ecology', 'Easy');
    execute(insertQSql, evsId, '2 B', 'Solve any two questions of the following', 'i', 'Describe in detail the structure of an ecosystem. How are biotic and abiotic components interrelated?', '4', 'Ecosystem Structure', 'Medium');
    execute(insertQSql, evsId, '2 B', 'Solve any two questions of the following', 'ii', 'Explain Ecological succession with an example.', '4', 'Ecological Succession', 'Medium');
    execute(insertQSql, evsId, '2 B', 'Solve any two questions of the following', 'iii', 'Discuss food chains and food webs in an ecosystem with suitable diagrams.', '4', 'Food Chains', 'Medium');
    execute(insertQSql, evsId, '3 A', null, 'i', 'Name any two major biodiversity hotspots in the world.', '1', 'Biodiversity', 'Easy');
    execute(insertQSql, evsId, '3 A', null, 'ii', 'Define the term biodiversity.', '1', 'Biodiversity', 'Easy');
    execute(insertQSql, evsId, '3 B', 'Solve any two questions of the following', 'i', 'Explain the three levels of biodiversity.', '4', 'Biodiversity Levels', 'Medium');
    execute(insertQSql, evsId, '3 B', 'Solve any two questions of the following', 'ii', 'Describe ex-situ methods of biodiversity conservation.', '4', 'Conservation', 'Medium');
    execute(insertQSql, evsId, '3 B', 'Solve any two questions of the following', 'iii', 'Discuss the different values of biodiversity.', '4', 'Biodiversity Values', 'Medium');
  }

  // 5. Applied Mathematics-I
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Applied Mathematics-I', 'Mid Semester Examination-I (Winter-2025)')) {
    const amPaper = execute(
      insertPaperSql,
      'Applied Mathematics-I',
      'CS/AI/ML101BSC01',
      'Semester I',
      '2025-2026',
      'Mid Semester Examination-I (Winter-2025)',
      '2025',
      '/uploads/applied_mathematics_winter2025.pdf',
      '/uploads/applied_mathematics_winter2025_page1.png'
    );
    const amId = amPaper.lastInsertRowid;

    execute(insertQSql, amId, '1 A', null, 'i', 'Determinant of Idempotent matrix is ____.', '1', 'Linear Algebra', 'Easy');
    execute(insertQSql, amId, '1 A', null, 'ii', 'Define Projection Matrix.', '1', 'Linear Algebra', 'Easy');
    execute(insertQSql, amId, '1 B', 'Solve any two questions of the following', 'i', 'Fit a straight line ŷ = β₀ + β₁x using projection matrix for the data: x=[1, 2, 3], y=[4, 2, 0]', '4', 'Projection Matrices', 'Medium');
    execute(insertQSql, amId, '1 B', 'Solve any two questions of the following', 'ii', 'Prove that Identity Matrix I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]] is an orthogonal matrix.', '4', 'Matrices', 'Medium');
    execute(insertQSql, amId, '1 B', 'Solve any two questions of the following', 'iii', 'Give an example of 2*2 Idempotent matrix.', '4', 'Matrices', 'Medium');
    execute(insertQSql, amId, '2 A', null, 'i', 'Matrix method is used to find ________.', '1', 'Linear Systems', 'Easy');
    execute(insertQSql, amId, '2 A', null, 'ii', 'If rank of 3*3 matrix is 2 then nullity of matrix is __.', '1', 'Rank & Nullity', 'Easy');
    execute(insertQSql, amId, '2 B', 'Solve any two questions of the following', 'i', 'Find the rank and nullity of the matrix A = [[1, 2, 3], [1, 4, 2], [2, 6, 5]].', '4', 'Rank & Nullity', 'Medium');
    execute(insertQSql, amId, '2 B', 'Solve any two questions of the following', 'ii', 'Write the Quadratic form for the matrix A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]].', '4', 'Quadratic Forms', 'Medium');
    execute(insertQSql, amId, '2 B', 'Solve any two questions of the following', 'iii', 'Determine the values of λ and μ such that the system of equations x+y+z=6, x+2y+3z=10, x+2y+λz=μ have i) No solution ii) Unique solution iii) Infinite no. of solution.', '4', 'Linear Systems', 'Hard');
    execute(insertQSql, amId, '3 A', null, 'i', 'Find the root of the equation λ³ - 18λ² + 45λ = 0.', '1', 'Algebraic Equations', 'Easy');
    execute(insertQSql, amId, '3 A', null, 'ii', 'In the Singular Value Decomposition (SVD) of a matrix A, Σ is called as--.', '1', 'SVD', 'Easy');
    execute(insertQSql, amId, '3 B', 'Solve any one question of the following', 'i', 'Determine the Eigen values and Eigen vectors of the matrix [[1, -6, -4], [0, 4, 2], [0, -6, -3]].', '8', 'Eigen Values', 'Hard');
    execute(insertQSql, amId, '3 B', 'Solve any one question of the following', 'ii', 'Solve the 2x + y + 4z = 12, 8x - 3y + 2z = 20, 4x + 11y - z = 33 by Crout\'s method.', '8', 'Numerical Methods', 'Hard');
  }

  // 6. Computer Programming (Mid Sem II - Winter 2025)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Computer Programming', 'Mid Semester Examination-II (Winter-2025)')) {
    const cpPaper = execute(
      insertPaperSql,
      'Computer Programming',
      'CS/AI/ML103ESC01',
      'Semester I',
      '2025-2026',
      'Mid Semester Examination-II (Winter-2025)',
      '2025',
      '/uploads/computer_programming_mid2_winter2025.pdf',
      '/uploads/computer_programming_mid2_winter2025_page1.png'
    );
    const cpId = cpPaper.lastInsertRowid;

    execute(insertQSql, cpId, '1 A', null, 'i', 'State any two standard library functions commonly used for string manipulation.', '1', 'String Library Functions', 'Easy');
    execute(insertQSql, cpId, '1 A', null, 'ii', 'What are the different types of user-defined functions?', '1', 'Functions', 'Easy');
    execute(insertQSql, cpId, '1 B', 'Solve any two questions of the following', 'i', 'Define library functions, and describe any four standard math functions with example.', '4', 'Math Library Functions', 'Medium');
    execute(insertQSql, cpId, '1 B', 'Solve any two questions of the following', 'ii', 'Describe the concepts of local and global variables in C programming, including their scope, lifetime and accessibility, with a suitable illustrative example.', '4', 'Variable Scope', 'Medium');
    execute(insertQSql, cpId, '1 B', 'Solve any two questions of the following', 'iii', 'Write a C program implementing user-defined functions (of any type) to compute and display the results of addition, subtraction, multiplication and division for two user-provided numbers.', '4', 'Functions', 'Medium');
    execute(insertQSql, cpId, '2 A', null, 'i', 'Define a pointer in C programming and provide the syntax for its declaration, including an illustrative example.', '1', 'Pointers', 'Easy');
    execute(insertQSql, cpId, '2 A', null, 'ii', 'Write the value of incrementing a pointer by 1 in C programming, assuming its initial value is 1000.', '1', 'Pointer Arithmetic', 'Easy');
    execute(insertQSql, cpId, '2 B', 'Solve any two questions of the following', 'i', 'Explain the call by value parameter passing mechanism in C programming.', '4', 'Parameter Passing', 'Medium');
    execute(insertQSql, cpId, '2 B', 'Solve any two questions of the following', 'ii', 'What is pointer to pointer? Explain with syntax and example.', '4', 'Pointers', 'Medium');
    execute(insertQSql, cpId, '2 B', 'Solve any two questions of the following', 'iii', 'Explain the call by reference passing mechanism in C programming.', '4', 'Parameter Passing', 'Medium');
    execute(insertQSql, cpId, '3 A', null, 'i', 'Write the Syntax to define or create a structure.', '1', 'Structures', 'Easy');
    execute(insertQSql, cpId, '3 A', null, 'ii', 'Name any two file operations in C.', '1', 'File Operations', 'Easy');
    execute(insertQSql, cpId, '3 B', 'Solve any two questions of the following', 'i', 'Explain structures in C. Write syntax for definition, initialization, and accessing structure members with examples.', '4', 'Structures', 'Medium');
    execute(insertQSql, cpId, '3 B', 'Solve any two questions of the following', 'ii', 'Design a program using an array of structures to store and manage data of three students and display the students details along with their total and average marks.', '4', 'Array of Structures', 'Hard');
    execute(insertQSql, cpId, '3 B', 'Solve any two questions of the following', 'iii', 'Describe file handling mechanism with example.', '4', 'File Handling', 'Medium');
  }

  // 7. Professional Communication Skill (Mid Sem II - Winter 2025)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Professional Communication Skill', 'Mid Semester Examination-II (Winter-2025)')) {
    const pcsPaper = execute(
      insertPaperSql,
      'Professional Communication Skill',
      'CS/AI/ML106AEC01',
      'Semester I',
      '2025-2026',
      'Mid Semester Examination-II (Winter-2025)',
      '2025',
      '/uploads/professional_communication_mid2_winter2025.pdf',
      '/uploads/professional_communication_mid2_winter2025_page1.png'
    );
    const pcsId = pcsPaper.lastInsertRowid;

    execute(insertQSql, pcsId, '1 A', null, '1', 'Read the passage on Supreme Court judgment regarding Section 309 IPC (Attempted Suicide) and answer 5 comprehension questions.', '5', 'Reading Comprehension', 'Easy');
    execute(insertQSql, pcsId, '1 B', 'Identify the error and write in its correct form (Any five)', '1', 'Identify & correct grammatical errors in 7 sentences (Conditionals, Tenses, Subject-Verb Agreement, Prepositions, Articles).', '5', 'Grammar Correction', 'Medium');
    execute(insertQSql, pcsId, '2 A', 'Solve any two questions of the following', 'i', 'Develop a paragraph on any One of the following in 75 words: a) Role of Youth in Society b) Artificial Intelligence.', '5', 'Paragraph Writing', 'Medium');
    execute(insertQSql, pcsId, '2 A', 'Solve any two questions of the following', 'ii', 'Write a complaint letter to "Shinivas computers and Tech" for supplying 8 faulty and damaged computers, asking replacement of the same.', '5', 'Letter Writing', 'Medium');
    execute(insertQSql, pcsId, '2 A', 'Solve any two questions of the following', 'iii', 'Draft an email to HR inquiring about available vacancies.', '5', 'Email Writing', 'Medium');
  }

  // 8. Computer Fundamentals (Mid Sem II - Winter 2025)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Computer Fundamentals', 'Mid Semester Examination-II (Winter-2025)')) {
    const cfPaper = execute(
      insertPaperSql,
      'Computer Fundamentals',
      'AI/CS/ML/105VSE01',
      'Semester I',
      '2025-2026',
      'Mid Semester Examination-II (Winter-2025)',
      '2025',
      '/uploads/computer_fundamentals_mid2_winter2025.pdf',
      '/uploads/computer_fundamentals_mid2_winter2025_page1.png'
    );
    const cfId = cfPaper.lastInsertRowid;

    execute(insertQSql, cfId, '1 A', null, 'i', 'Define a flowchart.', '1', 'Flowcharts', 'Easy');
    execute(insertQSql, cfId, '1 A', null, 'ii', 'What is meant by algorithm notation?', '1', 'Algorithms', 'Easy');
    execute(insertQSql, cfId, '1 B', 'Solve any two questions of the following', 'i', 'Define an algorithm. Explain the different characteristics of an algorithm.', '4', 'Algorithms', 'Medium');
    execute(insertQSql, cfId, '1 B', 'Solve any two questions of the following', 'ii', 'Write a pseudocode to find the largest of three numbers.', '4', 'Pseudocode', 'Medium');
    execute(insertQSql, cfId, '1 B', 'Solve any two questions of the following', 'iii', 'Write an algorithm & Draw a flowchart to check whether a number is even or odd.', '4', 'Flowcharts & Algorithms', 'Medium');
  }

  // 9. Problem Solving Techniques (Mid Sem II - Winter 2025)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Problem Solving Techniques', 'Mid Semester Examination-II (Winter-2025)')) {
    const pstPaper = execute(
      insertPaperSql,
      'Problem Solving Techniques',
      'AI/CS/ML24104ESC02',
      'Semester I',
      '2025-2026',
      'Mid Semester Examination-II (Winter-2025)',
      '2025',
      '/uploads/pst_mid2_winter2025.pdf',
      '/uploads/pst_mid2_winter2025_page1.png'
    );
    const pstId = pstPaper.lastInsertRowid;

    execute(insertQSql, pstId, '1 A', null, 'i', 'Define array index and array size', '1', 'Arrays', 'Easy');
    execute(insertQSql, pstId, '1 A', null, 'ii', 'What does "nth smallest element" mean?', '1', 'Arrays', 'Easy');
    execute(insertQSql, pstId, '1 B', 'Solve any two questions of the following', 'i', 'Explain the algorithm to find the maximum and minimum element in an array.', '4', 'Arrays', 'Medium');
    execute(insertQSql, pstId, '1 B', 'Solve any two questions of the following', 'ii', 'Given the array (2, 4, 4, 2, 7, 8), Remove duplicates and write the final array.', '4', 'Arrays', 'Medium');
    execute(insertQSql, pstId, '1 B', 'Solve any two questions of the following', 'iii', 'Apply an algorithm to count total positive and negative numbers in an array.', '4', 'Arrays', 'Medium');
    execute(insertQSql, pstId, '2 A', null, 'i', 'Write any two examples of line editing operations', '1', 'Text Editing', 'Easy');
    execute(insertQSql, pstId, '2 A', null, 'ii', 'Define left justification.', '1', 'Text Justification', 'Easy');
    execute(insertQSql, pstId, '2 B', 'Solve any two questions of the following', 'i', 'Differentiate between left justification and right justification with examples', '4', 'Text Justification', 'Medium');
    execute(insertQSql, pstId, '2 B', 'Solve any two questions of the following', 'ii', 'Describe the steps involved in keyword searching in a text document.', '4', 'Keyword Searching', 'Medium');
    execute(insertQSql, pstId, '2 B', 'Solve any two questions of the following', 'iii', 'Apply sublinear pattern search on the text "ababcab" to find the pattern "abc".', '4', 'Pattern Search', 'Medium');
    execute(insertQSql, pstId, '3 A', null, 'i', 'Define debugging.', '1', 'Debugging', 'Easy');
    execute(insertQSql, pstId, '3 A', null, 'ii', 'State any two characteristics of an efficient system.', '1', 'Efficient Systems', 'Easy');
    execute(insertQSql, pstId, '3 B', 'Solve any two questions of the following', 'i', 'Apply problem-solving steps to design a system that tracks student attendance automatically', '4', 'System Design', 'Medium');
    execute(insertQSql, pstId, '3 B', 'Solve any two questions of the following', 'ii', 'Explain the steps involved in solving a real-world problem using code.', '4', 'Problem Solving', 'Medium');
    execute(insertQSql, pstId, '3 B', 'Solve any two questions of the following', 'iii', 'Why is it important to optimize algorithms in real-world applications?', '4', 'Algorithm Optimization', 'Medium');
  }

  // 10. Applied Mathematics-I (Mid Sem II - Winter 2025)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Applied Mathematics-I', 'Mid Semester Examination-II (Winter-2025)')) {
    const amPaper = execute(
      insertPaperSql,
      'Applied Mathematics-I',
      'CS/AI/ML101BSC01',
      'Semester I',
      '2025-2026',
      'Mid Semester Examination-II (Winter-2025)',
      '2025',
      '/uploads/applied_maths1_mid2_winter2025.pdf',
      '/uploads/applied_maths1_mid2_winter2025_page1.png'
    );
    const amId = amPaper.lastInsertRowid;

    execute(insertQSql, amId, '1 A', null, 'i', 'When limit is of 0/0 form, then ______ is used.', '1', 'Limits', 'Easy');
    execute(insertQSql, amId, '1 A', null, 'ii', 'lim_{x->0} (tan x / x) = ______', '1', 'Limits', 'Easy');
    execute(insertQSql, amId, '1 B', 'Solve any two questions of the following', 'i', 'Evaluate lim_{x -> π/2} [log(sin x) / (π - 2x)²]', '4', 'Limits', 'Medium');
    execute(insertQSql, amId, '1 B', 'Solve any two questions of the following', 'ii', 'Arrange 8 + 7(x+1) + 6(x+1)² - (x+1)³ in powers of x.', '4', 'Polynomial Expansion', 'Medium');
    execute(insertQSql, amId, '1 B', 'Solve any two questions of the following', 'iii', 'If f(x) = { 3+x for x >= 0; 3-x for x < 0 }, then prove that f(x) at x=0 is continuous but not differentiable.', '4', 'Continuity & Differentiability', 'Medium');
    execute(insertQSql, amId, '2 A', null, 'i', 'Find degree of function u = (x² y² z²) / (x² + y² + z²).', '1', 'Homogeneous Functions', 'Easy');
    execute(insertQSql, amId, '2 A', null, 'ii', 'Evaluate ∫₂³ [√x / (√x + √(5-x))] dx', '1', 'Definite Integrals', 'Easy');
    execute(insertQSql, amId, '2 B', 'Solve any two questions of the following', 'i', 'Verify Lagrange\'s Mean Value Theorem for f(x) = log x in [1, e].', '4', 'Mean Value Theorem', 'Medium');
    execute(insertQSql, amId, '2 B', 'Solve any two questions of the following', 'ii', 'Examine f(x, y) = x² + y² + xy + 1 for extreme values.', '4', 'Extreme Values', 'Medium');
    execute(insertQSql, amId, '2 B', 'Solve any two questions of the following', 'iii', 'If u = csc⁻¹ √[(x^1/2 + y^1/2)/(x^1/3 + y^1/3)], show that x² ∂²u/∂x² + 2xy ∂²u/∂x∂y + y² ∂²u/∂y² = (tan u / 12) * [13/12 + (tan² u / 12)].', '4', 'Euler\'s Theorem', 'Hard');
    execute(insertQSql, amId, '3 A', null, 'i', 'Find the number of permutations of letters of the word FATHER.', '1', 'Permutations', 'Easy');
    execute(insertQSql, amId, '3 A', null, 'ii', 'Define sample space.', '1', 'Probability', 'Easy');
    execute(insertQSql, amId, '3 B', 'Solve any two questions of the following', 'i', 'Rakesh and Meena appear in an interview for the two in the same post. The probability of Rakesh\'s selection is 1/7 and that of Meena\'s selection is 1/5. What is probability that i) both of them will be selected ii) only one of them will be selected.', '4', 'Probability', 'Medium');
    execute(insertQSql, amId, '3 B', 'Solve any two questions of the following', 'ii', 'A bag contain 10 red and 10 blue balls, find the probability of drawing two balls of the same colour.', '4', 'Probability', 'Medium');
    execute(insertQSql, amId, '3 B', 'Solve any two questions of the following', 'iii', 'In a bolt factory, three machines—A, B, and C manufacture 25%, 35%, and 40% of the total bolts, respectively. The defect rates of these machines differ: machine A produces 5% defective bolts, machine B produces 4% defective bolts, and machine C produces 2% defective bolts. A bolt is randomly selected from the overall production, and it is found to be defective. What is the probability/likelihood that this defective bolt was produced by machine B?', '4', 'Bayes\' Theorem', 'Hard');
  }

  // 11. Environmental Studies (Mid Sem II - Winter 2025)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Environmental Studies', 'Mid Semester Examination-II (Winter-2025)')) {
    const evsPaper = execute(
      insertPaperSql,
      'Environmental Studies',
      'CS/AI/ML102BSC02',
      'Semester I',
      '2025-2026',
      'Mid Semester Examination-II (Winter-2025)',
      '2025',
      '/uploads/environmental_studies_mid2_winter2025.pdf',
      '/uploads/environmental_studies_mid2_winter2025_page1.png'
    );
    const evsId = evsPaper.lastInsertRowid;

    execute(insertQSql, evsId, '1 A', null, 'i', 'Define Pollutant with any one example.', '1', 'Environmental Pollution', 'Easy');
    execute(insertQSql, evsId, '1 A', null, 'ii', 'Accidents like Chernobyl and Fukushima are nuclear disasters. True/False', '1', 'Nuclear Disasters', 'Easy');
    execute(insertQSql, evsId, '1 B', 'Solve any two questions of the following', 'i', 'Discuss adverse effects and control of water pollution.', '4', 'Water Pollution', 'Medium');
    execute(insertQSql, evsId, '1 B', 'Solve any two questions of the following', 'ii', 'Highlight the major sources of air pollution. Explain their effect on human health.', '4', 'Air Pollution', 'Medium');
    execute(insertQSql, evsId, '1 B', 'Solve any two questions of the following', 'iii', 'Explain the causes and effects of ozone layer depletion.', '4', 'Ozone Depletion', 'Medium');
    execute(insertQSql, evsId, '2 A', null, 'i', 'Define Green Chemistry.', '1', 'Green Chemistry', 'Easy');
    execute(insertQSql, evsId, '2 A', null, 'ii', 'A major constraint in e-waste recovery is the presence of mixed materials. True/False', '1', 'E-Waste', 'Easy');
    execute(insertQSql, evsId, '2 B', 'Solve any two questions of the following', 'i', 'Describe the conventional and green methods of Adipic acid synthesis.', '4', 'Green Chemistry', 'Medium');
    execute(insertQSql, evsId, '2 B', 'Solve any two questions of the following', 'ii', 'Explain the environmental constraints in extracting metals from e-waste.', '4', 'E-Waste Recycling', 'Medium');
    execute(insertQSql, evsId, '2 B', 'Solve any two questions of the following', 'iii', 'Explain the four principles of green chemistry.', '4', 'Green Chemistry Principles', 'Medium');
    execute(insertQSql, evsId, '3 A', null, 'i', 'The 3R approach of resource use stands for Reduce, Reuse and .........', '1', 'Resource Management', 'Easy');
    execute(insertQSql, evsId, '3 A', null, 'ii', 'Name one method of conserving water.', '1', 'Water Conservation', 'Easy');
    execute(insertQSql, evsId, '3 B', 'Solve any two questions of the following', 'i', 'Define Watershed. Discuss the objectives and maintenance of watershed management.', '4', 'Watershed Management', 'Medium');
    execute(insertQSql, evsId, '3 B', 'Solve any two questions of the following', 'ii', 'Describe the silent features of wildlife protection act 1972.', '4', 'Environmental Legislation', 'Medium');
    execute(insertQSql, evsId, '3 B', 'Solve any two questions of the following', 'iii', 'Define Water conservation. Explain the strategies for water conservation.', '4', 'Water Conservation', 'Medium');
  }

  console.log('Winter-2025 question papers check complete.');
}


function seedSummer2026MidSem2Papers() {
  console.log('Checking Mid Semester Examination-II (Summer-2026) question papers...');

  const insertPaperSql = `
    INSERT INTO question_papers (subject, subject_code, semester, academic_year, exam_type, paper_year, pdf_url, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertQSql = `
    INSERT INTO questions (paper_id, section, section_instruction, question_number, question_text, marks, topic, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // 1. Digital Electronics (Mid Sem II)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Digital Electronics', 'Mid Semester Examination-II (Summer-2026)')) {
    const dePaper = execute(
      insertPaperSql,
      'Digital Electronics',
      'CS/AI/ML204ESC06',
      'Semester II',
      '2025-2026',
      'Mid Semester Examination-II (Summer-2026)',
      '2026',
      '/uploads/digital_electronics_mid2_summer2026.pdf',
      '/uploads/digital_electronics_mid2_summer2026_page1.png'
    );
    const deId = dePaper.lastInsertRowid;

    execute(insertQSql, deId, '1 A', null, 'i', 'Name the basic types of flip-flops.', '1', 'Flip-Flops', 'Easy');
    execute(insertQSql, deId, '1 A', null, 'ii', 'Write the table of SR-FF.', '1', 'Flip-Flops', 'Easy');
    execute(insertQSql, deId, '1 A', null, 'iii', 'Define edge triggering in flip-flops.', '1', 'Flip-Flops', 'Easy');
    execute(insertQSql, deId, '1 B', 'Solve any two questions of the following', 'i', 'Analyze the race around condition in a J-K flip-flop and explain how it can be eliminated.', '6', 'Flip-Flops', 'Medium');
    execute(insertQSql, deId, '1 B', 'Solve any two questions of the following', 'ii', 'Explain T-FF in detail with neat and labelled diagrams.', '6', 'Flip-Flops', 'Medium');
    execute(insertQSql, deId, '1 B', 'Solve any two questions of the following', 'iii', 'Compare different types of flip-flops (S-R, J-K, D, T) based on their characteristics and applications.', '6', 'Flip-Flops', 'Medium');
    execute(insertQSql, deId, '2 A', null, 'i', 'What do you mean by State assignment?', '1', 'Sequential Circuits', 'Easy');
    execute(insertQSql, deId, '2 A', null, 'ii', 'Draw the state diagram from the state table given in paper (Present state vs Next state vs Output).', '1', 'State Machines', 'Medium');
    execute(insertQSql, deId, '2 B', 'Solve any two questions of the following', 'i', 'Convert an SR flip-flop into a D flip-flop.', '6', 'Flip-Flop Conversions', 'Medium');
    execute(insertQSql, deId, '2 B', 'Solve any two questions of the following', 'ii', 'Derive the excitation table of JK flip-flop / Design SR flip-flop using JK Flip Flop.', '6', 'Flip-Flop Conversions', 'Medium');
    execute(insertQSql, deId, '2 B', 'Solve any two questions of the following', 'iii', 'Design ASM Chart from the state diagram given in paper (States M0, M1, M2, M3).', '6', 'ASM Charts', 'Hard');
  }

  // 2. Applied Physics (Mid Sem II)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Applied Physics', 'Mid Semester Examination-II (Summer-2026)')) {
    const apPaper = execute(
      insertPaperSql,
      'Applied Physics',
      'CS/AI/ML202BSC04',
      'Semester II',
      '2025-2026',
      'Mid Semester Examination-II (Summer-2026)',
      '2026',
      '/uploads/applied_physics_mid2_summer2026.pdf',
      '/uploads/applied_physics_mid2_summer2026_page1.png'
    );
    const apId = apPaper.lastInsertRowid;

    execute(insertQSql, apId, '1 A', null, 'i', 'Define diffraction?', '1', 'Optics & Wave Physics', 'Easy');
    execute(insertQSql, apId, '1 A', null, 'ii', 'Write any two conditions for Stable Interference Pattern?', '1', 'Interference', 'Easy');
    execute(insertQSql, apId, '1 A', null, 'iii', 'State the Relation between number of lines present on grating and grating element?', '1', 'Diffraction', 'Easy');
    execute(insertQSql, apId, '1 B', 'Solve any two questions of the following', 'i', "Elaborate that the radius of dark and Bright ring in case of Newton's ring experiment is directly proportional to Radius of Plano Convex Lens and wavelength of Light used.", '6', 'Newton Rings', 'Medium');
    execute(insertQSql, apId, '1 B', 'Solve any two questions of the following', 'ii', 'Derive the equation for condition of constructive and destructive interference in case of thin film interference of constant thickness.', '6', 'Thin Film Interference', 'Medium');
    execute(insertQSql, apId, '1 B', 'Solve any two questions of the following', 'iii', "Newton's Rings are observed in reflection light of wavelength 6x10^-5 cm. The diameter of 9th dark ring is found to be 0.5cm Find the Radius of curvature of lens and thickness of thin film.", '6', 'Newton Rings', 'Hard');
    execute(insertQSql, apId, '2 A', null, 'i', 'What is the fundamental principle of operation for an optical fibre?', '1', 'Fibre Optics', 'Easy');
    execute(insertQSql, apId, '2 A', null, 'ii', 'Define Critical angle in case of Fibre optics cable?', '1', 'Fibre Optics', 'Easy');
    execute(insertQSql, apId, '2 A', null, 'iii', 'State the working of Sheath in Fibre optics cable.', '1', 'Fibre Optics', 'Easy');
    execute(insertQSql, apId, '2 B', 'Solve any two questions of the following', 'i', 'Derive the equation for acceptance angle and state its relation with Numerical aperture. Draw necessary ray diagram in support of derivation.', '6', 'Fibre Optics', 'Medium');
    execute(insertQSql, apId, '2 B', 'Solve any two questions of the following', 'ii', "With well labelled diagram explain the construction of Optical fibre and state it's any four applications.", '6', 'Fibre Optics', 'Medium');
    execute(insertQSql, apId, '2 B', 'Solve any two questions of the following', 'iii', 'Define Attenuation. The Attenuation of Light in Optical fibre is 4.2 db/km What fraction of initial intensity will remain after covering distance of 10km and 15 km.', '6', 'Fibre Optics', 'Hard');
  }

  // 3. Object Oriented Programming (Mid Sem II)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Object Oriented Programming', 'Mid Semester Examination-II (Summer-2026)')) {
    const oopPaper = execute(
      insertPaperSql,
      'Object Oriented Programming',
      'CS/AI/ML203ESC05',
      'Semester II',
      '2025-2026',
      'Mid Semester Examination-II (Summer-2026)',
      '2026',
      '/uploads/oop_java_mid2_summer2026.pdf',
      '/uploads/oop_java_mid2_summer2026_page1.png'
    );
    const oopId = oopPaper.lastInsertRowid;

    execute(insertQSql, oopId, '1 A', null, 'i', 'Give examples of Checked exceptions.', '1', 'Java Exception Handling', 'Easy');
    execute(insertQSql, oopId, '1 A', null, 'ii', 'Specify the use of finally block.', '1', 'Java Exception Handling', 'Easy');
    execute(insertQSql, oopId, '1 A', null, 'iii', 'Define unchecked exception.', '1', 'Java Exception Handling', 'Easy');
    execute(insertQSql, oopId, '1 B', 'Solve any two questions of the following', 'i', 'Write a java program to handle checked exception.', '6', 'Java Exception Handling', 'Medium');
    execute(insertQSql, oopId, '1 B', 'Solve any two questions of the following', 'ii', 'Write a java program to illustrate the throw keyword.', '6', 'Java Exception Handling', 'Medium');
    execute(insertQSql, oopId, '1 B', 'Solve any two questions of the following', 'iii', 'Explain the keywords for handling exception in java.', '6', 'Java Exception Handling', 'Medium');
    execute(insertQSql, oopId, '2 A', null, 'i', 'Define File.', '1', 'Java File I/O', 'Easy');
    execute(insertQSql, oopId, '2 A', null, 'ii', 'Write syntax for creating BufferedReader class object.', '1', 'Java File I/O', 'Easy');
    execute(insertQSql, oopId, '2 A', null, 'iii', 'Write the names of classes from java.io package.', '1', 'Java File I/O', 'Easy');
    execute(insertQSql, oopId, '2 B', 'Solve any two questions of the following', 'i', 'Write a java program to create file.', '6', 'Java File I/O', 'Medium');
    execute(insertQSql, oopId, '2 B', 'Solve any two questions of the following', 'ii', 'Write a java program to delete a file.', '6', 'Java File I/O', 'Medium');
    execute(insertQSql, oopId, '2 B', 'Solve any two questions of the following', 'iii', 'Classify the classes from java.io package.', '6', 'Java File I/O', 'Medium');
  }

  // 4. Indian Knowledge System (Mid Sem II)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Indian Knowledge System', 'Mid Semester Examination-II (Summer-2026)')) {
    const iksPaper = execute(
      insertPaperSql,
      'Indian Knowledge System',
      'CS/AI/ML206IKS01',
      'Semester II',
      '2025-2026',
      'Mid Semester Examination-II (Summer-2026)',
      '2026',
      '/uploads/iks_mid2_summer2026.pdf',
      '/uploads/iks_mid2_summer2026_page1.png'
    );
    const iksId = iksPaper.lastInsertRowid;

    execute(insertQSql, iksId, '1 A', null, 'i', 'Which ancient Indian text deals with surgery and medical practices?', '1', 'Ancient Science & Medicine', 'Easy');
    execute(insertQSql, iksId, '1 A', null, 'ii', 'Which ancient Indian scholar wrote about planetary motion?', '1', 'Ancient Astronomy', 'Easy');
    execute(insertQSql, iksId, '1 A', null, 'iii', 'How did Aryabhata contribute to science?', '1', 'Ancient Indian Scholars', 'Easy');
    execute(insertQSql, iksId, '1 B', 'Solve any two questions of the following', 'i', "Explain the India's contribution of ancient India in the field of Surgery.", '6', 'Ancient Medicine', 'Medium');
    execute(insertQSql, iksId, '1 B', 'Solve any two questions of the following', 'ii', 'Explain the contribution of Mathematician: a) Brahmgupta b) Aaryabhatta', '6', 'Ancient Mathematics', 'Medium');
    execute(insertQSql, iksId, '1 B', 'Solve any two questions of the following', 'iii', "Explain the India's contribution of ancient India in the field of Metallurgy.", '6', 'Ancient Metallurgy', 'Medium');
  }

  // 5. Applied Mathematics-II (Mid Sem II)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Applied Mathematics-II', 'Mid Semester Examination-II (Summer-2026)')) {
    const mathPaper = execute(
      insertPaperSql,
      'Applied Mathematics-II',
      'CS/AI/ML201BSC03',
      'Semester II',
      '2025-2026',
      'Mid Semester Examination-II (Summer-2026)',
      '2026',
      '/uploads/applied_mathematics2_mid2_summer2026.pdf',
      '/uploads/applied_mathematics2_mid2_summer2026_page1.png'
    );
    const mathId = mathPaper.lastInsertRowid;

    execute(insertQSql, mathId, '1 A', null, 'i', 'What is mean of Exponential distribution?', '1', 'Probability Distributions', 'Easy');
    execute(insertQSql, mathId, '1 A', null, 'ii', 'What is standard value (z) of x=60, if mean is 72 and Standard deviation σ is 15.', '1', 'Statistics & Normal Distribution', 'Easy');
    execute(insertQSql, mathId, '1 A', null, 'iii', 'Define Uniform distribution.', '1', 'Probability Distributions', 'Easy');
    execute(insertQSql, mathId, '1 B', 'Solve any two questions of the following', 'i', 'An underground mine has 5 pumps installed for pumping out storm water. The probability of any one of the pump failing during the storm is 1/8. Apply Binomial distribution to calculate the probability that: a) At least 2 pumps will be working b) All the pumps will be working.', '6', 'Binomial Distribution', 'Medium');
    execute(insertQSql, mathId, '1 B', 'Solve any two questions of the following', 'ii', 'Fit the Poisson distribution to the set of observations: x=[0, 1, 2, 3, 4], f=[122, 60, 15, 2, 1]', '6', 'Poisson Distribution', 'Medium');
    execute(insertQSql, mathId, '1 B', 'Solve any two questions of the following', 'iii', 'In sample of 1000 cases, the mean of certain test is 14 and standard deviation is 2.5. Assuming the normal distribution find how many student score 1) between 12 and 15 2) above 18 (Area: z=0 to z=0.8, A=0.2881; z=0 to z=0.4, A=0.1554; z=0 to z=1.6, A=0.4452)', '6', 'Normal Distribution', 'Hard');
    execute(insertQSql, mathId, '2 A', null, 'i', 'Define Standard Normal Distribution.', '1', 'Statistics', 'Easy');
    execute(insertQSql, mathId, '2 A', null, 'ii', 'State Central Limit Theorem.', '1', 'Probability Theorems', 'Easy');
    execute(insertQSql, mathId, '2 A', null, 'iii', 'Define Cumulative Distribution Function.', '1', 'Probability Distributions', 'Easy');
    execute(insertQSql, mathId, '2 B', 'Solve any two questions of the following', 'i', 'A discrete random variable X has Probability Mass Function (PMF): x=[1,2,3,4,5,6,7], f(x)=[k, 2k, 2k, 3k, k², 2k², 7k²+k]. Calculate the value of the constant k and use it to determine the probability P(x < 3).', '6', 'Discrete Random Variables', 'Medium');
    execute(insertQSql, mathId, '2 B', 'Solve any two questions of the following', 'ii', 'A continuous random variable x has following Probability Density Function (PDF): p(x) = kx² for -3 <= x <= 3, 0 otherwise. Calculate (a) value of k (b) P(1 <= x <= 2).', '6', 'Continuous Random Variables', 'Medium');
    execute(insertQSql, mathId, '2 B', 'Solve any two questions of the following', 'iii', 'Define and illustrate the Bernoulli Distribution. Using this framework, determine the probability mass function for a single toss of a fair coin where "heads" is defined as a success.', '6', 'Bernoulli Distribution', 'Medium');
  }

  // 6. Introduction to Data Analysis (Mid Sem II)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Introduction to Data Analysis', 'Mid Semester Examination-II (Summer-2026)')) {
    const daPaper = execute(
      insertPaperSql,
      'Introduction to Data Analysis',
      'CS/AI/ML205PCC01',
      'Semester II',
      '2025-2026',
      'Mid Semester Examination-II (Summer-2026)',
      '2026',
      '/uploads/data_analysis_mid2_summer2026.pdf',
      '/uploads/data_analysis_mid2_summer2026_page1.png'
    );
    const daId = daPaper.lastInsertRowid;

    execute(insertQSql, daId, '1 A', null, 'i', 'Define Pivot Chart.', '1', 'Excel Charts', 'Easy');
    execute(insertQSql, daId, '1 A', null, 'ii', 'Identify the option used to update data in a Pivot Table.', '1', 'Excel Pivot Tables', 'Easy');
    execute(insertQSql, daId, '1 A', null, 'iii', 'State template in Excel.', '1', 'Excel Templates', 'Easy');
    execute(insertQSql, daId, '1 B', 'Solve any two questions of the following', 'i', 'Apply your knowledge of Excel to explain a Dashboard and outline the steps to create a dashboard.', '6', 'Excel Dashboards', 'Medium');
    execute(insertQSql, daId, '1 B', 'Solve any two questions of the following', 'ii', 'Analyze 3-D References in Excel and illustrate their use across multiple worksheets with a suitable example.', '6', 'Excel Formulas', 'Medium');
    execute(insertQSql, daId, '1 B', 'Solve any two questions of the following', 'iii', 'Explain Pivot Table in detail and create a Pivot Table in Microsoft Excel using the given dataset: Department [HR, IT, HR, IT], Employee [A, B, C, D], Salary [20000, 30000, 25000, 30000]. Tasks: 1) Create Pivot Table showing total salary by department 2) Change calculation from Sum to Average.', '6', 'Excel Pivot Tables', 'Hard');
  }

  console.log('Summer-2026 Mid Sem II question papers check complete.');
}

function seedWinter2025EndSemPapers() {
  console.log('Checking End Semester Examination (Winter-2025) question papers...');

  const insertPaperSql = `
    INSERT INTO question_papers (subject, subject_code, semester, academic_year, exam_type, paper_year, pdf_url, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertQSql = `
    INSERT INTO questions (paper_id, section, section_instruction, question_number, question_text, marks, topic, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // 1. Applied Mathematics-I (End Sem)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Applied Mathematics-I', 'End Semester Examination (Winter-2025)')) {
    const amPaper = execute(
      insertPaperSql,
      'Applied Mathematics-I',
      'CS/AI/ML101BSC01',
      'Semester I',
      '2025-2026',
      'End Semester Examination (Winter-2025)',
      '2025',
      '/uploads/applied_mathematics_endsem_winter2025.pdf',
      '/uploads/applied_mathematics_endsem_winter2025_page1.png'
    );
    const amId = amPaper.lastInsertRowid;

    execute(insertQSql, amId, '1 A', null, 'i', 'For matrix A = [[2, 1, 3], [4, 0, 5], [6, 7, 8]], find determinant of Mat A.', '1', 'Linear Algebra', 'Easy');
    execute(insertQSql, amId, '1 A', null, 'ii', 'Define the projection matrix.', '1', 'Linear Algebra', 'Easy');
    execute(insertQSql, amId, '1 B', 'Solve any two questions of the following', 'i', 'Show that A = [[2, -2, -4], [-1, 3, 4], [1, -2, -3]] is Idempotent Matrix.', '4', 'Matrices', 'Medium');
    execute(insertQSql, amId, '1 B', 'Solve any two questions of the following', 'ii', 'Show that the matrix A = 1/7 * [[3, 2, 6], [-6, 3, 2], [2, 6, 3]] is orthogonal and find its inverse.', '4', 'Matrices', 'Medium');
    execute(insertQSql, amId, '1 B', 'Solve any two questions of the following', 'iii', 'Given data points: (x:0, y:1; x:2, y:2; x:4, y:3). Fit a straight line ŷ = β₀ + β₁x using projection matrix approach.', '4', 'Projection Matrices', 'Medium');
    execute(insertQSql, amId, '2 A', null, 'i', 'What is quadratic form?', '1', 'Quadratic Forms', 'Easy');
    execute(insertQSql, amId, '2 A', null, 'ii', 'Define the Nullity of matrix.', '1', 'Rank & Nullity', 'Easy');
    execute(insertQSql, amId, '2 B', 'Solve any two questions of the following', 'i', 'Find the Rank and Nullity of matrix [[6, 1, 3, 8], [4, 2, 6, -1], [10, 3, 9, 7], [16, 4, 12, 15]].', '4', 'Rank & Nullity', 'Medium');
    execute(insertQSql, amId, '2 B', 'Solve any two questions of the following', 'ii', 'Discuss the consistency, if possible, find the solution of the system x+y+z=3, x+2y+3z=4, 2x+3y+4z=7.', '4', 'Linear Systems', 'Medium');
    execute(insertQSql, amId, '2 B', 'Solve any two questions of the following', 'iii', 'Solve the system using Gaussian elimination: x+y+z=6, 2x+3y+5z=24, 4x+0y+5z=20.', '4', 'Gaussian Elimination', 'Medium');
    execute(insertQSql, amId, '3 A', null, 'i', 'If A is an m*n matrix, what are the dimensions of U, Σ and V in SVD A=UΣVᵀ?', '1', 'SVD', 'Easy');
    execute(insertQSql, amId, '3 A', null, 'ii', 'Identify the roots for λ³ - 4λ² - λ + 4 = 0: a) 2, -4, 6 b) -1, 4, 1 c) 2, 4, 6 d) 5, 4, 6', '1', 'Algebraic Equations', 'Easy');
    execute(insertQSql, amId, '3 B', 'Solve any one question of the following', 'i', 'Determine the Eigen values and Eigen vectors of the matrix [[4, 6, 6], [1, 3, 2], [-1, -4, -3]].', '8', 'Eigen Values', 'Hard');
    execute(insertQSql, amId, '3 B', 'Solve any one question of the following', 'ii', 'Solve 4x+y-z=13, 3x+5y+2z=21, 2x+y+6z=14 using LU decomposition method.', '8', 'LU Decomposition', 'Hard');
    execute(insertQSql, amId, '4 A', null, 'i', 'If a function is differentiable at a point x=a, then it must be:', '1', 'Calculus', 'Easy');
    execute(insertQSql, amId, '4 A', null, 'ii', 'The domain of the function f(x)=√(x-3) is:', '1', 'Calculus', 'Easy');
    execute(insertQSql, amId, '4 B', 'Solve any two questions of the following', 'i', 'Show that log sin(x+h) = log sin x + h cot x - (h²/2) cosec²x + (h³/3) cosec²x cot x ...', '4', 'Taylor Series', 'Medium');
    execute(insertQSql, amId, '4 B', 'Solve any two questions of the following', 'ii', 'Evaluate lim_{x -> 0} (tan x * x^(1/2)) / (e^x - 1)^(3/2).', '4', 'Limits', 'Medium');
    execute(insertQSql, amId, '4 B', 'Solve any two questions of the following', 'iii', 'If f(x) = {2+x for x >= 0; 2-x for x < 0}, then prove that f(x) at x=0 is continuous but not differentiable.', '4', 'Continuity & Differentiability', 'Medium');
    execute(insertQSql, amId, '5 A', null, 'i', 'If u = x³ + y² + 6x, find ∂u/∂x and ∂u/∂y.', '1', 'Partial Derivatives', 'Easy');
    execute(insertQSql, amId, '5 A', null, 'ii', 'If f\'(x) = 0 and f\'\'(x) < 0 then the function has:', '1', 'Maxima & Minima', 'Easy');
    execute(insertQSql, amId, '5 B', 'Solve any two questions of the following', 'i', 'Verify Lagrange\'s mean value theorem for f(x) = e^x in [0,1].', '4', 'Mean Value Theorems', 'Medium');
    execute(insertQSql, amId, '5 B', 'Solve any two questions of the following', 'ii', 'Examine f(x,y) = x² + y² - 6x + 12 for extreme values.', '4', 'Multivariable Calculus', 'Medium');
    execute(insertQSql, amId, '5 B', 'Solve any two questions of the following', 'iii', 'If u = sin⁻¹((x+y)/(√x+√y)), prove that x²(∂²u/∂x²) + 2xy(∂²u/∂x∂y) + y²(∂²u/∂y²) = -(sin u cos 2u)/(4 cos³u).', '4', 'Euler\'s Theorem', 'Hard');
    execute(insertQSql, amId, '6 A', null, 'i', 'What is trial and event?', '1', 'Probability', 'Easy');
    execute(insertQSql, amId, '6 A', null, 'ii', 'Find a probability of throwing an even number with six faced die?', '1', 'Probability', 'Easy');
    execute(insertQSql, amId, '6 B', 'Solve any two questions of the following', 'i', 'An urn contains 10 black and 10 white balls, find the probability of drawing two balls of the same colour.', '4', 'Probability', 'Medium');
    execute(insertQSql, amId, '6 B', 'Solve any two questions of the following', 'ii', 'A husband and wife appear in an interview for two vacancies in the same post. The probability of husband\'s selection is 1/7 and wife\'s selection is 1/5. What is the probability that i) both selected ii) only one selected.', '4', 'Probability', 'Medium');
    execute(insertQSql, amId, '6 B', 'Solve any two questions of the following', 'iii', 'An urn I contains 3 white and 4 red balls and an urn II contains 5 white and 6 red balls. One ball is drawn at random from one of the urns and is found to be white. Find the probability that it was drawn from urn I.', '4', 'Bayes Theorem', 'Hard');
  }

  // 2. Computer Programming (End Sem)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Computer Programming', 'End Semester Examination (Winter-2025)')) {
    const cpPaper = execute(
      insertPaperSql,
      'Computer Programming',
      'CS/AI/ML/ET103ESC01',
      'Semester I',
      '2025-2026',
      'End Semester Examination (Winter-2025)',
      '2025',
      '/uploads/computer_programming_endsem_winter2025.pdf',
      '/uploads/computer_programming_endsem_winter2025_page1.png'
    );
    const cpId = cpPaper.lastInsertRowid;

    execute(insertQSql, cpId, '1 A', null, 'i', "Define the term 'Keywords' in C programming. Give any two examples.", '1', 'C Basics', 'Easy');
    execute(insertQSql, cpId, '1 A', null, 'ii', 'What is the difference between %d and %f format specifiers?', '1', 'Format Specifiers', 'Easy');
    execute(insertQSql, cpId, '1 B', 'Solve any two questions of the following', 'i', 'Write a C program to read two integers and display their sum and product.', '4', 'Basic C Programs', 'Medium');
    execute(insertQSql, cpId, '1 B', 'Solve any two questions of the following', 'ii', 'Explain the different data types available in C with examples and their size.', '4', 'Data Types', 'Medium');
    execute(insertQSql, cpId, '1 B', 'Solve any two questions of the following', 'iii', 'Write a C program to convert temperature from Celsius to Fahrenheit using the formula: F = (C * 9/5) + 32', '4', 'Basic Formulas', 'Medium');
    execute(insertQSql, cpId, '2 A', null, 'i', `What is the output of the following code snippet?\nint a=5;\nif(a>3)\nprintf("Hello");`, '1', 'Output Tracing', 'Easy');
    execute(insertQSql, cpId, '2 A', null, 'ii', 'State the syntax of while loop and do-while loop.', '1', 'Control Statements', 'Easy');
    execute(insertQSql, cpId, '2 B', 'Solve any two questions of the following', 'i', 'Write a C program to check whether a given number is even or odd.', '4', 'Conditionals', 'Medium');
    execute(insertQSql, cpId, '2 B', 'Solve any two questions of the following', 'ii', 'Write a C program to find the factorial of a given number using any loop.', '4', 'Loops', 'Medium');
    execute(insertQSql, cpId, '2 B', 'Solve any two questions of the following', 'iii', 'Write a C program to print the multiplication table of any number entered by the user.', '4', 'Loops', 'Medium');
    execute(insertQSql, cpId, '3 A', null, 'i', 'Define String.', '1', 'Strings', 'Easy');
    execute(insertQSql, cpId, '3 A', null, 'ii', 'Declare & Initialize a Two-Dimensional Array of size 2 x 3.', '1', '2D Arrays', 'Easy');
    execute(insertQSql, cpId, '3 B', 'Solve any two questions of the following', 'i', 'Write a C program to find the largest element in an array of 5 integers.', '4', 'Arrays', 'Medium');
    execute(insertQSql, cpId, '3 B', 'Solve any two questions of the following', 'ii', 'Write a C program to count the number of vowels in a given string.', '4', 'Strings', 'Medium');
    execute(insertQSql, cpId, '3 B', 'Solve any two questions of the following', 'iii', 'Write a C program to copy one string to another without using strcpy() function.', '4', 'Strings', 'Medium');
    execute(insertQSql, cpId, '4 A', null, 'i', 'What is the syntax of writing user-defined function?', '1', 'Functions', 'Easy');
    execute(insertQSql, cpId, '4 A', null, 'ii', 'Enlist any three math.h functions.', '1', 'Library Functions', 'Easy');
    execute(insertQSql, cpId, '4 B', 'Solve any two questions of the following', 'i', 'Write a C program to find the sum of two numbers using a user-defined function.', '4', 'Functions', 'Medium');
    execute(insertQSql, cpId, '4 B', 'Solve any two questions of the following', 'ii', 'Explain the concept of local and global variables with a suitable example.', '4', 'Variable Scope', 'Medium');
    execute(insertQSql, cpId, '4 B', 'Solve any two questions of the following', 'iii', 'Write a C function to check whether a given number is prime or not.', '4', 'Functions', 'Medium');
    execute(insertQSql, cpId, '5 A', null, 'i', 'How do you declare a pointer variable? Give the syntax with example.', '1', 'Pointers', 'Easy');
    execute(insertQSql, cpId, '5 A', null, 'ii', `What is the output of the following code?\nint a=10,\n*p=&a;\nprintf("%d", *p);`, '1', 'Pointers', 'Easy');
    execute(insertQSql, cpId, '5 B', 'Solve any two questions of the following', 'i', 'Write a C program to swap two numbers using pointers.', '4', 'Pointers', 'Medium');
    execute(insertQSql, cpId, '5 B', 'Solve any two questions of the following', 'ii', 'Explain call by value and call by reference with examples.', '4', 'Pointers', 'Medium');
    execute(insertQSql, cpId, '5 B', 'Solve any two questions of the following', 'iii', 'Write a C program to demonstrate pointer to pointer.', '4', 'Pointers', 'Medium');
    execute(insertQSql, cpId, '6 A', null, 'i', 'Write the syntax to declare a structure?', '1', 'Structures', 'Easy');
    execute(insertQSql, cpId, '6 A', null, 'ii', 'Write any two advantages of structures in C.', '1', 'Structures', 'Easy');
    execute(insertQSql, cpId, '6 B', 'Solve any two questions of the following', 'i', 'Write a C program to define a structure \'Student\' with members: name, roll_no, and marks. Read and display the information of one student.', '4', 'Structures', 'Medium');
    execute(insertQSql, cpId, '6 B', 'Solve any two questions of the following', 'ii', 'Write a C program to demonstrate array of structures.', '4', 'Structures', 'Medium');
    execute(insertQSql, cpId, '6 B', 'Solve any two questions of the following', 'iii', 'Write a C program to write your name and roll number to a file and then read and display it.', '4', 'File Handling', 'Medium');
  }

  // 3. Environmental Studies (End Sem)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Environmental Studies', 'End Semester Examination (Winter-2025)')) {
    const evsPaper = execute(
      insertPaperSql,
      'Environmental Studies',
      'CS/AI/ML102BSC02',
      'Semester I',
      '2025-2026',
      'End Semester Examination (Winter-2025)',
      '2025',
      '/uploads/environmental_studies_endsem_winter2025.pdf',
      '/uploads/environmental_studies_endsem_winter2025_page1.png'
    );
    const evsId = evsPaper.lastInsertRowid;

    execute(insertQSql, evsId, '1 A', null, 'i', 'Which of the following is a problem associated with large dams? a) Flood control b) Hydropower generation c) Displacement of people d) Irrigation facility', '1', 'Environmental Problems', 'Easy');
    execute(insertQSql, evsId, '1 A', null, 'ii', 'Which of the following is a renewable resource? a) Coal b) Petroleum c) Solar energy d) Natural gas', '1', 'Energy Resources', 'Easy');
    execute(insertQSql, evsId, '1 B', 'Solve any two questions of the following', 'i', 'Discuss the need for public awareness in environmental protection. Give suitable examples.', '4', 'Environmental Awareness', 'Medium');
    execute(insertQSql, evsId, '1 B', 'Solve any two questions of the following', 'ii', 'Distinguish between renewable and non-renewable sources of energy. Write advantages of using alternate energy sources with examples.', '4', 'Energy Resources', 'Medium');
    execute(insertQSql, evsId, '1 B', 'Solve any two questions of the following', 'iii', 'Write a short note on the problems caused by over-exploitation of water resources with examples.', '4', 'Water Resources', 'Medium');
    execute(insertQSql, evsId, '2 A', null, 'i', 'In a food chain, decomposers are mainly responsible for: a) Producing energy b) Breaking down dead organisms c) Consuming plants directly d) Transferring solar energy', '1', 'Ecosystems', 'Easy');
    execute(insertQSql, evsId, '2 A', null, 'ii', 'Which one of the following is an example of a terrestrial ecosystem? a) Forest b) Ocean c) Pond d) Lake', '1', 'Ecosystems', 'Easy');
    execute(insertQSql, evsId, '2 B', 'Solve any two questions of the following', 'i', 'Explain the roles of producers, consumers, and decomposers in maintaining the balance of an ecosystem.', '4', 'Ecosystem Roles', 'Medium');
    execute(insertQSql, evsId, '2 B', 'Solve any two questions of the following', 'ii', 'Describe food chains, food webs, and ecological pyramids with suitable examples.', '4', 'Food Chains', 'Medium');
    execute(insertQSql, evsId, '2 B', 'Solve any two questions of the following', 'iii', 'Write the characteristic features, structure, and functions of: a) Forest ecosystem (terrestrial) b) Ocean ecosystem (aquatic)', '4', 'Ecosystem Types', 'Medium');
    execute(insertQSql, evsId, '3 A', null, 'i', 'Which of the following is NOT a type of biodiversity? a) Genetic diversity b) Species diversity c) Ecosystem diversity d) Population density', '1', 'Biodiversity', 'Easy');
    execute(insertQSql, evsId, '3 A', null, 'ii', 'The Kaziranga National Park is famous for conserving which species? a) Asiatic Lion b) One-horned Rhinoceros c) Bengal Tiger d) Elephant', '1', 'Conservation', 'Easy');
    execute(insertQSql, evsId, '3 B', 'Solve any two questions of the following', 'i', 'Define biodiversity. Explain its three types: genetic, species, and ecosystem diversity with examples.', '4', 'Biodiversity Types', 'Medium');
    execute(insertQSql, evsId, '3 B', 'Solve any two questions of the following', 'ii', 'Differentiate between in-situ and ex-situ conservation of biodiversity with suitable examples.', '4', 'Conservation', 'Medium');
    execute(insertQSql, evsId, '3 B', 'Solve any two questions of the following', 'iii', 'Explain the major threats to biodiversity such as habitat loss, poaching, and man-wildlife conflicts.', '4', 'Biodiversity Threats', 'Medium');
    execute(insertQSql, evsId, '4 A', null, 'i', 'Which of the following is a natural disaster? a) Deforestation b) Earthquake c) Industrial accident d) Air pollution', '1', 'Natural Disasters', 'Easy');
    execute(insertQSql, evsId, '4 A', null, 'ii', 'The greenhouse gas responsible for global warming is: a) Oxygen b) Nitrogen c) Carbon dioxide d) Argon', '1', 'Global Warming', 'Easy');
    execute(insertQSql, evsId, '4 B', 'Solve any two questions of the following', 'i', 'Define air pollution. Explain its causes and mention any two control measures.', '4', 'Air Pollution', 'Medium');
    execute(insertQSql, evsId, '4 B', 'Solve any two questions of the following', 'ii', 'Explain soil degradation. Write any three control measures to prevent soil pollution.', '4', 'Soil Pollution', 'Medium');
    execute(insertQSql, evsId, '4 B', 'Solve any two questions of the following', 'iii', 'What is the ozone layer? Describe causes and harmful effects of its depletion.', '4', 'Ozone Depletion', 'Medium');
    execute(insertQSql, evsId, '5 A', null, 'i', 'The toxic heavy metal commonly released from broken CFL bulbs is: a) Lead (Pb) b) Zinc (Zn) c) Mercury (Hg) d) Iron (Fe)', '1', 'Environmental Toxins', 'Easy');
    execute(insertQSql, evsId, '5 A', null, 'ii', 'Which of the following is an example of e-waste? a) Plastic bottles b) Old mobile phones & computers c) Agricultural waste d) Domestic sewage', '1', 'E-Waste', 'Easy');
    execute(insertQSql, evsId, '5 B', 'Solve any two questions of the following', 'i', 'Define Green Chemistry. Write any Five principles of Green Chemistry with examples.', '4', 'Green Chemistry', 'Medium');
    execute(insertQSql, evsId, '5 B', 'Solve any two questions of the following', 'ii', 'Write a short note on metal extraction from e-waste. Mention the constraints and opportunities involved.', '4', 'E-Waste Recycling', 'Medium');
    execute(insertQSql, evsId, '5 B', 'Solve any two questions of the following', 'iii', 'Explain the role of Green Computing in environmental protection and research.', '4', 'Green Computing', 'Medium');
    execute(insertQSql, evsId, '6 A', null, 'i', 'The main aim of rainwater harvesting is: a) Flooding cities b) Increasing groundwater recharge c) Polluting rivers d) Deforestation', '1', 'Water Conservation', 'Easy');
    execute(insertQSql, evsId, '6 A', null, 'ii', 'The Wildlife Protection Act in India was enacted in the year: a) 1947 b) 1972 c) 1986 d) 2002', '1', 'Environmental Acts', 'Easy');
    execute(insertQSql, evsId, '6 B', 'Solve any two questions of the following', 'i', 'Explain the importance of rainwater harvesting and watershed management in water conservation.', '4', 'Water Harvesting', 'Medium');
    execute(insertQSql, evsId, '6 B', 'Solve any two questions of the following', 'ii', 'Write short notes on the Environment Protection Act (1986) and Forest Conservation Act (1980).', '4', 'Environmental Acts', 'Medium');
    execute(insertQSql, evsId, '6 B', 'Solve any two questions of the following', 'iii', 'Differentiate between unsustainable and sustainable development with suitable examples.', '4', 'Sustainable Development', 'Medium');
  }

  // 4. Computer Fundamentals (End Sem)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Computer Fundamentals', 'End Semester Examination (Winter-2025)')) {
    const cfPaper = execute(
      insertPaperSql,
      'Computer Fundamentals',
      'CS/AI/ML105VSE01',
      'Semester I',
      '2025-2026',
      'End Semester Examination (Winter-2025)',
      '2025',
      '/uploads/computer_fundamentals_endsem_winter2025.pdf',
      '/uploads/computer_fundamentals_endsem_winter2025_page1.png'
    );
    const cfId = cfPaper.lastInsertRowid;

    execute(insertQSql, cfId, '1 A', null, 'i', 'Which generation of computers used Integrated Circuits (ICs)?', '1', 'Computer Generations', 'Easy');
    execute(insertQSql, cfId, '1 A', null, 'ii', 'What is a system software?', '1', 'Software Types', 'Easy');
    execute(insertQSql, cfId, '1 B', 'Solve any two questions of the following', 'i', 'Define a computer. Explain any three characteristics of a computer.', '4', 'Computer Basics', 'Medium');
    execute(insertQSql, cfId, '1 B', 'Solve any two questions of the following', 'ii', 'Explain the functions of an operating system.', '4', 'Operating Systems', 'Medium');
    execute(insertQSql, cfId, '1 B', 'Solve any two questions of the following', 'iii', 'List and explain four real-life applications of computers in daily life.', '4', 'Computer Applications', 'Medium');
    execute(insertQSql, cfId, '2 A', null, 'i', 'What is the decimal equivalent of binary number 1011?', '1', 'Number Conversions', 'Easy');
    execute(insertQSql, cfId, '2 A', null, 'ii', 'ASCII encoding uses how many bits for each character in standard form?', '1', 'Data Encodings', 'Easy');
    execute(insertQSql, cfId, '2 B', 'Solve any two questions of the following', 'i', 'Convert the following with step-by-step procedure: (a) (101101)₂ to Decimal (b) (57)₁₀ to Binary', '4', 'Number Conversions', 'Medium');
    execute(insertQSql, cfId, '2 B', 'Solve any two questions of the following', 'ii', 'Perform binary addition: (1010)₂ + (110)₂ and binary subtraction: (1101)₂ - (1010)₂ show all steps.', '4', 'Binary Arithmetic', 'Medium');
    execute(insertQSql, cfId, '2 B', 'Solve any two questions of the following', 'iii', 'Explain BCD (Binary Coded Decimal) with an example.', '4', 'Binary Encodings', 'Medium');
    execute(insertQSql, cfId, '3 A', null, 'i', 'What are the Pseudo-code used for?', '1', 'Algorithms & Pseudocode', 'Easy');
    execute(insertQSql, cfId, '3 A', null, 'ii', 'Write the correct sequence of program development.', '1', 'Program Life Cycle', 'Easy');
    execute(insertQSql, cfId, '3 B', 'Solve any two questions of the following', 'i', 'Develop an algorithm and draw a flowchart to find the largest of three numbers.', '4', 'Flowcharts & Algorithms', 'Medium');
    execute(insertQSql, cfId, '3 B', 'Solve any two questions of the following', 'ii', 'Draw common flowchart symbols and write their purposes.', '4', 'Flowcharts', 'Medium');
    execute(insertQSql, cfId, '3 B', 'Solve any two questions of the following', 'iii', 'Differentiate between algorithm and pseudo-code with suitable examples.', '4', 'Algorithms', 'Medium');
    execute(insertQSql, cfId, '4 A', null, 'i', 'What analogy is commonly used to describe an array?', '1', 'Data Structures', 'Easy');
    execute(insertQSql, cfId, '4 A', null, 'ii', 'What specific part of an array reference determines the location of a single element?', '1', 'Arrays', 'Easy');
    execute(insertQSql, cfId, '4 B', 'Solve any two questions of the following', 'i', 'Explain the key features of an array and why it\'s a valuable tool for programmers.', '4', 'Arrays', 'Medium');
    execute(insertQSql, cfId, '4 B', 'Solve any two questions of the following', 'ii', 'You have a 7-element array, a[1..7], and need to reverse the order of the first four elements. What specific exchanges of elements would be required to accomplish this?', '4', 'Array Operations', 'Medium');
    execute(insertQSql, cfId, '4 B', 'Solve any two questions of the following', 'iii', 'Describe two basic ways to change the data stored within an array\'s elements.', '4', 'Arrays', 'Medium');
    execute(insertQSql, cfId, '5 A', null, 'i', 'When working with text, what is the basic unit of information?', '1', 'Text Processing', 'Easy');
    execute(insertQSql, cfId, '5 A', null, 'ii', 'What is considered the most crucial part of text processing?', '1', 'Text Processing', 'Easy');
    execute(insertQSql, cfId, '5 B', 'Solve any two questions of the following', 'i', 'Explain the main goal of a "Text Line Length Adjustment" algorithm and its primary rules.', '4', 'Text Algorithms', 'Medium');
    execute(insertQSql, cfId, '5 B', 'Solve any two questions of the following', 'ii', 'An algorithm for text line adjustment can be either word-oriented or character-oriented. Why is the word-oriented approach generally considering a better strategy?', '4', 'Text Processing', 'Medium');
    execute(insertQSql, cfId, '5 B', 'Solve any two questions of the following', 'iii', 'In a character-by-character text processing algorithm, what problem can occur when you encounter an end-of-line character in the input?', '4', 'Text Processing', 'Medium');
    execute(insertQSql, cfId, '6 A', null, 'i', 'What is one application of problem-solving mentioned in the text for code?', '1', 'Problem Solving', 'Easy');
    execute(insertQSql, cfId, '6 A', null, 'ii', 'What can problem-solving be used for when designing systems?', '1', 'System Design', 'Easy');
    execute(insertQSql, cfId, '6 B', 'Solve any two questions of the following', 'i', 'You have two programs that sort a list of numbers. Program A takes a long time, while Program B is very fast. Analyze why Program B is a better, more "optimized" solution.', '4', 'Algorithm Optimization', 'Medium');
    execute(insertQSql, cfId, '6 B', 'Solve any two questions of the following', 'ii', 'A website works fine with 10 users but crashes with 100 users. Analyze this problem based on the idea of designing efficient systems. What is the core issue, and how would you redesign it to fix this?', '4', 'Scalability & System Design', 'Hard');
    execute(insertQSql, cfId, '6 B', 'Solve any two questions of the following', 'iii', 'A program is designed to find the average of a series of numbers. When the numbers 1, 2, 3, and 4 are entered, the program outputs 8.25 instead of 2.5. Analyze the potential error in the program\'s logic and suggest a fix.', '4', 'Debugging & Logic Fix', 'Hard');
  }

  console.log('Winter-2025 End Semester question papers check complete.');
}

function seedSummer2026EndSemPapers() {
  console.log('Checking End Semester Examination (Summer-2026) question papers...');

  const insertPaperSql = `
    INSERT INTO question_papers (subject, subject_code, semester, academic_year, exam_type, paper_year, pdf_url, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertQSql = `
    INSERT INTO questions (paper_id, section, section_instruction, question_number, question_text, marks, topic, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // 1. Digital Electronics (End Sem - Summer 2026)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Digital Electronics', 'End Semester Examination (Summer-2026)')) {
    const dePaper = execute(
      insertPaperSql,
      'Digital Electronics',
      'CS/AI/ML204ESC06',
      'Semester II',
      '2025-2026',
      'End Semester Examination (Summer-2026)',
      '2026',
      '/uploads/digital_electronics_endsem_summer2026.pdf',
      '/uploads/digital_electronics_endsem_summer2026_page1.png'
    );
    const deId = dePaper.lastInsertRowid;

    execute(insertQSql, deId, '1 A', null, 'i', 'Convert (101110)₂ to octal.', '1', 'Number Conversions', 'Easy');
    execute(insertQSql, deId, '1 A', null, 'ii', 'Convert (110)₂ into Gray code.', '1', 'Gray Code', 'Easy');
    execute(insertQSql, deId, '1 B', 'Solve any two questions of the following', 'i', 'Perform the following conversions: (a) (456)₁₀ to hexadecimal (b) (7A)₁₆ to binary.', '4', 'Number Conversions', 'Medium');
    execute(insertQSql, deId, '1 B', 'Solve any two questions of the following', 'ii', 'Explain BCD code with an example. Convert (59)₁₀ into BCD.', '4', 'BCD Code', 'Medium');
    execute(insertQSql, deId, '1 B', 'Solve any two questions of the following', 'iii', '(a) Convert the following Excess-3 codes into decimal numbers: 0101 1000 and 1110 0117. (b) (10110100)₂ -> (?)', '4', 'Excess-3 Code', 'Medium');
    execute(insertQSql, deId, '2 A', null, 'i', 'Perform binary subtraction: 1101 - 0011.', '1', 'Binary Arithmetic', 'Easy');
    execute(insertQSql, deId, '2 A', null, 'ii', 'Represent -9 in signed binary form.', '1', 'Signed Binary', 'Easy');
    execute(insertQSql, deId, '2 B', 'Solve any two questions of the following', 'i', 'Perform subtraction using 2\'s complement method: (-33 - 33).', '4', 'Complements', 'Medium');
    execute(insertQSql, deId, '2 B', 'Solve any two questions of the following', 'ii', 'Why are NAND and NOR gates called Universal Gates? Construct an OR gate using NAND gates only.', '4', 'Universal Gates', 'Medium');
    execute(insertQSql, deId, '2 B', 'Solve any two questions of the following', 'iii', 'An 8-bit positive word in binary pattern (10110110)₂. Determine its decimal value, if it represents: a) An unsigned binary number. b) A signed magnitude number. c) A 1\'s complement signed number. d) A 2\'s complement signed number.', '4', 'Signed Binary', 'Hard');
    execute(insertQSql, deId, '3 A', null, 'i', 'What is a Prefix of Sum expression? Simplify: (A.B.C)̄', '1', 'Boolean Algebra', 'Easy');
    execute(insertQSql, deId, '3 A', null, 'ii', 'Simplify logic function A.B.C̄.', '1', 'Boolean Algebra', 'Easy');
    execute(insertQSql, deId, '3 B', 'Solve any two questions of the following', 'i', 'Simplify the following Boolean expression using De Morgan\'s Theorem and other Boolean laws: F = AB + ĀB + Ā + 1', '4', 'Boolean Simplification', 'Medium');
    execute(insertQSql, deId, '3 B', 'Solve any two questions of the following', 'ii', 'Minimize the following expressions using K-map: a) F(A,B,C,D) = Σm(0,1,4,5,6,10,13) + d(2,3) b) F(A,B,C,D) = ΠM(0,2,3,6,7) + d(5,10,11,15)', '4', 'K-Map Minimization', 'Medium');
    execute(insertQSql, deId, '3 B', 'Solve any two questions of the following', 'iii', 'Minimize the following Boolean function using the Quine-McCluskey (Tabular) method: F(A,B,C,D,E,F,G) = Σm(0,16,32,48,64)', '4', 'Quine-McCluskey Method', 'Hard');
    execute(insertQSql, deId, '4 A', null, 'i', 'How many outputs does a 4-bit magnitude comparator have?', '1', 'Comparators', 'Easy');
    execute(insertQSql, deId, '4 A', null, 'ii', 'What is a Parity Generator used for?', '1', 'Parity Generators', 'Easy');
    execute(insertQSql, deId, '4 B', 'Solve any two questions of the following', 'i', 'Design a 4-bit Even Parity Checker circuit.', '4', 'Parity Checkers', 'Medium');
    execute(insertQSql, deId, '4 B', 'Solve any two questions of the following', 'ii', 'Design a Full adder using Half adders.', '4', 'Adders', 'Medium');
    execute(insertQSql, deId, '4 B', 'Solve any two questions of the following', 'iii', 'Implement the following expression using 8:1 MUX only: Y(A,B,C,D) = Σm(2,3,5,6,9,10,13,14,15)', '4', 'Multiplexers', 'Medium');
    execute(insertQSql, deId, '5 A', null, 'i', 'Write output expression of D flip-flop.', '1', 'Flip-Flops', 'Easy');
    execute(insertQSql, deId, '5 A', null, 'ii', 'What is a latch?', '1', 'Latches', 'Easy');
    execute(insertQSql, deId, '5 B', 'Solve any two questions of the following', 'i', 'Explain how race-around condition is eliminated using Master-Slave JK flip-flop.', '4', 'Flip-Flops', 'Medium');
    execute(insertQSql, deId, '5 B', 'Solve any two questions of the following', 'ii', 'Draw and explain S-R flip-flop. Mention its limitations.', '4', 'Flip-Flops', 'Medium');
    execute(insertQSql, deId, '5 B', 'Solve any two questions of the following', 'iii', 'Compare SR, JK, D, and T flip-flops based on operation and applications.', '4', 'Flip-Flops', 'Medium');
    execute(insertQSql, deId, '6 A', null, 'i', 'What is the difference between combinational and sequential circuits?', '1', 'Sequential Circuits', 'Easy');
    execute(insertQSql, deId, '6 A', null, 'ii', 'What is a Mealy machine?', '1', 'State Machines', 'Easy');
    execute(insertQSql, deId, '6 B', 'Solve any two questions of the following', 'i', 'Convert a given state diagram into an ASM chart.', '4', 'ASM Charts', 'Medium');
    execute(insertQSql, deId, '6 B', 'Solve any two questions of the following', 'ii', 'Convert JK flip-flop into D flip-flop.', '4', 'Flip-Flop Conversions', 'Medium');
    execute(insertQSql, deId, '6 B', 'Solve any two questions of the following', 'iii', 'Derive the excitation table of JK flip-flop.', '4', 'Flip-Flops', 'Medium');
  }

  // 2. Introduction to Data Analysis (End Sem - Summer 2026)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Introduction to Data Analysis', 'End Semester Examination (Summer-2026)')) {
    const daPaper = execute(
      insertPaperSql,
      'Introduction to Data Analysis',
      'CS/AI/ML205PCC01',
      'Semester II',
      '2025-2026',
      'End Semester Examination (Summer-2026)',
      '2026',
      '/uploads/data_analysis_endsem_summer2026.pdf',
      '/uploads/data_analysis_endsem_summer2026_page1.png'
    );
    const daId = daPaper.lastInsertRowid;

    execute(insertQSql, daId, '1 A', null, 'i', 'Explain the basic difference between a Worksheet and a Workbook.', '1', 'Excel Basics', 'Easy');
    execute(insertQSql, daId, '1 A', null, 'ii', 'Explain the use of CONCATENATE function.', '1', 'Excel Functions', 'Easy');
    execute(insertQSql, daId, '1 B', 'Solve any two questions of the following', 'i', 'Apply basic formulas such as SUM, AVERAGE, MAX, and MIN in a spreadsheet with suitable syntax.', '4', 'Excel Formulas', 'Medium');
    execute(insertQSql, daId, '1 B', 'Solve any two questions of the following', 'ii', 'Describe the use of logical and text functions such as IF, UPPER, LOWER, and PROPER.', '4', 'Excel Functions', 'Medium');
    execute(insertQSql, daId, '1 B', 'Solve any two questions of the following', 'iii', 'Explain VLOOKUP and HLOOKUP in spreadsheet software.', '4', 'Excel Lookup Functions', 'Medium');
    execute(insertQSql, daId, '2 A', null, 'i', 'State the steps to format chart objects in a spreadsheet.', '1', 'Excel Charts', 'Easy');
    execute(insertQSql, daId, '2 A', null, 'ii', 'List the steps to create charts in a spreadsheet.', '1', 'Excel Charts', 'Easy');
    execute(insertQSql, daId, '2 B', 'Solve any two questions of the following', 'i', 'Explain different types of charts used in a spreadsheet.', '4', 'Excel Charts', 'Medium');
    execute(insertQSql, daId, '2 B', 'Solve any two questions of the following', 'ii', 'Illustrate the process of sorting and filtering data in a spreadsheet.', '4', 'Data Filtering', 'Medium');
    execute(insertQSql, daId, '2 B', 'Solve any two questions of the following', 'iii', 'Discuss the use of Data Validation with an example.', '4', 'Data Validation', 'Medium');
    execute(insertQSql, daId, '3 A', null, 'i', 'Discuss the use of a Pivot Chart.', '1', 'Pivot Charts', 'Easy');
    execute(insertQSql, daId, '3 A', null, 'ii', 'Identify template in a spreadsheet.', '1', 'Excel Templates', 'Easy');
    execute(insertQSql, daId, '3 B', 'Solve any two questions of the following', 'i', 'Discuss formulas with 3-D references and their applications.', '4', '3-D Formulas', 'Medium');
    execute(insertQSql, daId, '3 B', 'Solve any two questions of the following', 'ii', 'Explain the concept of a dashboard and the process of dashboard creation.', '4', 'Dashboards', 'Medium');
    execute(insertQSql, daId, '3 B', 'Solve any two questions of the following', 'iii', 'Describe Pivot Table and outline the steps to create it.', '4', 'Pivot Tables', 'Medium');
  }

  // 3. Applied Physics (End Sem - Summer 2026)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Applied Physics', 'End Semester Examination (Summer-2026)')) {
    const apPaper = execute(
      insertPaperSql,
      'Applied Physics',
      'CS/AI/ML202BSC04',
      'Semester II',
      '2025-2026',
      'End Semester Examination (Summer-2026)',
      '2026',
      '/uploads/applied_physics_endsem_summer2026.pdf',
      '/uploads/applied_physics_endsem_summer2026_page1.png'
    );
    const apId = apPaper.lastInsertRowid;

    execute(insertQSql, apId, '1 A', null, 'i', 'Write the conductivity equation for Intrinsic Semiconductor?', '1', 'Semiconductors', 'Easy');
    execute(insertQSql, apId, '1 A', null, 'ii', 'Name the diode which is used in 7 segment display and 16 segment display?', '1', 'Optoelectronic Diodes', 'Easy');
    execute(insertQSql, apId, '1 B', 'Solve any two questions of the following', 'i', 'Using Fermi Dirac function, Prove that the Fermi level in case of Intrinsic semiconductors lies Exactly at the Centre of Energy Band Gap?', '4', 'Fermi Level', 'Medium');
    execute(insertQSql, apId, '1 B', 'Solve any two questions of the following', 'ii', 'What is LED? Define Striking Potential and State the different material used for Construction of LED?', '4', 'LEDs', 'Medium');
    execute(insertQSql, apId, '1 B', 'Solve any two questions of the following', 'iii', 'The resistivity of an N-type semiconductor is 0.05 m.Ω Electron mobility = 0.25 m²/Vs. Find the electron concentration.', '4', 'Semiconductor Physics', 'Medium');
    execute(insertQSql, apId, '2 A', null, 'i', 'Define Population Inversion', '1', 'Lasers', 'Easy');
    execute(insertQSql, apId, '2 A', null, 'ii', 'Which excitation source is used in RUBY LASER?', '1', 'Lasers', 'Easy');
    execute(insertQSql, apId, '2 B', 'Solve any two questions of the following', 'i', 'Explain Construction of RUBY LASER with well Labelled diagram.', '4', 'Ruby Laser', 'Medium');
    execute(insertQSql, apId, '2 B', 'Solve any two questions of the following', 'ii', 'A LASER beam spreads such that its radius becomes 0.5 m at a distance of 600 m. Calculate the divergence angle in mill radians.', '4', 'Laser Divergence', 'Medium');
    execute(insertQSql, apId, '2 B', 'Solve any two questions of the following', 'iii', 'State and Explain the important Applications of LASER in Industrial and Medical Field.', '4', 'Laser Applications', 'Medium');
    execute(insertQSql, apId, '3 A', null, 'i', 'State Compton Effect?', '1', 'Quantum Physics', 'Easy');
    execute(insertQSql, apId, '3 A', null, 'ii', 'Which particle has larger de-Broglie wavelength: electron or proton if they are moving with same velocity?', '1', 'Matter Waves', 'Easy');
    execute(insertQSql, apId, '3 B', 'Solve any two questions of the following', 'i', 'Discuss Plancks Hypothesis and Outline important properties of Photon.', '4', 'Quantum Physics', 'Medium');
    execute(insertQSql, apId, '3 B', 'Solve any two questions of the following', 'ii', 'State Heisenberg\'s Uncertainty Principal and Using it obtain Time Energy Uncertainty Equation?', '4', 'Uncertainty Principle', 'Medium');
    execute(insertQSql, apId, '3 B', 'Solve any two questions of the following', 'iii', 'An electron and a proton move with the same velocity. Compare their De-Broglie wavelengths. Given mass of proton=1.67x10^-27kg', '4', 'Matter Waves', 'Medium');
    execute(insertQSql, apId, '4 A', null, 'i', 'The CRO screen is Coated with which material??', '1', 'CRO & Electronics', 'Easy');
    execute(insertQSql, apId, '4 A', null, 'ii', 'In hall effect if the Magnetic field is applied along "+Z axis", the direction of Force is along "-Y axis", then direction of Current is along which direction?', '1', 'Hall Effect', 'Easy');
    execute(insertQSql, apId, '4 B', 'Solve any two questions of the following', 'i', 'Derive the equation for electron density in Case of Hall Effect.', '4', 'Hall Effect', 'Medium');
    execute(insertQSql, apId, '4 B', 'Solve any two questions of the following', 'ii', 'Draw well labelled diagram of CRO and state the function of Horizontal Amplifier.', '4', 'CRO', 'Medium');
    execute(insertQSql, apId, '4 B', 'Solve any two questions of the following', 'iii', 'An electron moving with velocity 4 x 10⁶ m/s describes a circular path of radius 1 mm. Calculate the magnetic field required and Period of revolution.', '4', 'Lorentz Force', 'Hard');
    execute(insertQSql, apId, '5 A', null, 'i', 'Define Interference property of light?', '1', 'Optics', 'Easy');
    execute(insertQSql, apId, '5 A', null, 'ii', 'What is Grating?', '1', 'Diffraction', 'Easy');
    execute(insertQSql, apId, '5 B', 'Solve any two questions of the following', 'i', 'Differentiate Fresnel\'s and Fraunhofer class of diffraction.', '4', 'Diffraction', 'Medium');
    execute(insertQSql, apId, '5 B', 'Solve any two questions of the following', 'ii', 'In Newton\'s ring experiment prove that radius of Dark Ring is Directly Proportional to wavelength of source used.', '4', 'Newton Rings', 'Medium');
    execute(insertQSql, apId, '5 B', 'Solve any two questions of the following', 'iii', 'A parallel beam of monochromatic light of wavelength 5890Å is incident on thin glass plate of R.I. 1.2 such that angle of refraction into plate is 60° Calculate the smallest thickness of glass plate which will appear dark after Refraction.', '4', 'Thin Film Optics', 'Hard');
    execute(insertQSql, apId, '6 A', null, 'i', 'State the principal of working of Fibre optics cable?', '1', 'Fibre Optics', 'Easy');
    execute(insertQSql, apId, '6 A', null, 'ii', 'Define attenuation Factor in case of Fibre Optics cable?', '1', 'Fibre Optics', 'Easy');
    execute(insertQSql, apId, '6 B', 'Solve any two questions of the following', 'i', 'Explain with necessary diagrams the Step Index and Graded Index Fibre.', '4', 'Fibre Optics', 'Medium');
    execute(insertQSql, apId, '6 B', 'Solve any two questions of the following', 'ii', 'Derive the equation for Acceptance angle and Numerical Aperture in case of fibre optics cable with necessary ray diagram.', '4', 'Fibre Optics', 'Medium');
    execute(insertQSql, apId, '6 B', 'Solve any two questions of the following', 'iii', 'The refractive indices of the core and cladding of an optical fiber are 1.50 and 1.47 respectively. Calculate the numerical aperture and acceptance angle', '4', 'Fibre Optics', 'Medium');
  }

  // 4. Applied Mathematics-II (End Sem - Summer 2026)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Applied Mathematics-II', 'End Semester Examination (Summer-2026)')) {
    const mathPaper = execute(
      insertPaperSql,
      'Applied Mathematics-II',
      'CS/AI/ML201BSC03',
      'Semester II',
      '2025-2026',
      'End Semester Examination (Summer-2026)',
      '2026',
      '/uploads/applied_mathematics2_endsem_summer2026.pdf',
      '/uploads/applied_mathematics2_endsem_summer2026_page1.png'
    );
    const mathId = mathPaper.lastInsertRowid;

    execute(insertQSql, mathId, '1 A', null, 'i', 'Define a term Tautology in propositional logic.', '1', 'Logic', 'Easy');
    execute(insertQSql, mathId, '1 A', null, 'ii', 'Explain Monoid with Example.', '1', 'Algebraic Structures', 'Easy');
    execute(insertQSql, mathId, '1 B', 'Solve any two questions of the following', 'i', 'Illustrate the terms Predicates and quantifiers with Examples.', '4', 'Logic', 'Medium');
    execute(insertQSql, mathId, '1 B', 'Solve any two questions of the following', 'ii', 'Determine whether the following compound proposition is a Tautology, Contradiction, or Contingency Using Truth Table: [(P -> Q) ∧ (Q -> P)] -> (P -> R)', '4', 'Truth Tables', 'Medium');
    execute(insertQSql, mathId, '1 B', 'Solve any two questions of the following', 'iii', 'Prove That A ∧ (B ∨ C) = (A ∧ B) ∨ (B ∧ C) Using Venn Diagram.', '4', 'Set Theory', 'Medium');
    execute(insertQSql, mathId, '2 A', null, 'i', 'Define Complete Graph.', '1', 'Graph Theory', 'Easy');
    execute(insertQSql, mathId, '2 A', null, 'ii', 'What is vertex colouring?', '1', 'Graph Theory', 'Easy');
    execute(insertQSql, mathId, '2 B', 'Solve any two questions of the following', 'i', 'Find the Sequence generated by the following function (3 + x)³.', '4', 'Generating Functions', 'Medium');
    execute(insertQSql, mathId, '2 B', 'Solve any two questions of the following', 'ii', 'Solve the recurrence relation a_n = a_{n-1} + n² where a_0 = 7.', '4', 'Recurrence Relations', 'Medium');
    execute(insertQSql, mathId, '2 B', 'Solve any two questions of the following', 'iii', 'Illustrate the Cyclic and Acyclic Graph with example.', '4', 'Graph Theory', 'Medium');
    execute(insertQSql, mathId, '3 A', null, 'i', 'Define Continuous Series.', '1', 'Statistics', 'Easy');
    execute(insertQSql, mathId, '3 A', null, 'ii', 'What is Arithmetic Mean?', '1', 'Statistics', 'Easy');
    execute(insertQSql, mathId, '3 B', 'Solve any two questions of the following', 'i', 'Describe the Median and Find the Median of 20, 30, 35, 64, 23, 46, 78, 34, 20.', '4', 'Statistics', 'Medium');
    execute(insertQSql, mathId, '3 B', 'Solve any two questions of the following', 'ii', 'Find the Arithmetic Mean for the following data (Class Int: 0-10, 10-20, 20-30, 30-40, 40-50; Frequency: 7, 8, 20, 10, 5).', '4', 'Statistics', 'Medium');
    execute(insertQSql, mathId, '3 B', 'Solve any two questions of the following', 'iii', 'Find the standard deviation for data (Class Int: 20-40, 40-60, 60-80, 80-100, 100-120; Frequency: 4, 6, 10, 12, 8).', '4', 'Statistics', 'Medium');
    execute(insertQSql, mathId, '4 A', null, 'i', 'Chi-square distribution is a special case of which distribution?', '1', 'Hypothesis Testing', 'Easy');
    execute(insertQSql, mathId, '4 A', null, 'ii', 'When is z-test used?', '1', 'Hypothesis Testing', 'Easy');
    execute(insertQSql, mathId, '4 B', 'Solve any two questions of the following', 'i', 'Illustrate the t-distribution with its four application.', '4', 'Hypothesis Testing', 'Medium');
    execute(insertQSql, mathId, '4 B', 'Solve any two questions of the following', 'ii', 'A random sample of size 20 from a normal population has mean 42 and standard deviation of 5. Test the hypothesis that the population mean is 45. Use 5% level of significance (t_0.05 = 2.09).', '4', 't-Test', 'Hard');
    execute(insertQSql, mathId, '4 B', 'Solve any two questions of the following', 'iii', 'Illustrate z-TEST and with its 4 applications.', '4', 'z-Test', 'Medium');
    execute(insertQSql, mathId, '5 A', null, 'i', 'Define Uniform distribution with example.', '1', 'Probability Distributions', 'Easy');
    execute(insertQSql, mathId, '5 A', null, 'ii', 'What is Discrete Random variable?', '1', 'Random Variables', 'Easy');
    execute(insertQSql, mathId, '5 B', 'Solve any two questions of the following', 'i', 'Ten percent of Screws are produced in certain factory turn out to be defective. Find the probability that in sample of 10 bolts chosen at random, at most 2 Screws will be defective.', '4', 'Binomial Distribution', 'Medium');
    execute(insertQSql, mathId, '5 B', 'Solve any two questions of the following', 'ii', 'If the probability that an individual suffers a bad reaction from certain injection is 0.001, determine the probability using Poisson distribution that out of 2000 individuals exactly 3 will suffer a bad reaction.', '4', 'Poisson Distribution', 'Medium');
    execute(insertQSql, mathId, '5 B', 'Solve any two questions of the following', 'iii', 'A sample of 100 dry battery cells tested to find the length of life produced: x̄=12hrs, σ=3hrs. Assuming normal distribution what percentage of battery cell are expected to have life i) between 10 and 14 hrs, ii) less than 6 hrs (SNV: z=0 to z=0.67, A=0.2485; z=0 to z=2, A=0.4772).', '4', 'Normal Distribution', 'Hard');
    execute(insertQSql, mathId, '6 A', null, 'i', 'Define the Continuous Random Variable.', '1', 'Random Variables', 'Easy');
    execute(insertQSql, mathId, '6 A', null, 'ii', 'Write one condition for Probability Mass Function.', '1', 'PMF', 'Easy');
    execute(insertQSql, mathId, '6 B', 'Solve any two questions of the following', 'i', 'Illustrate the Bernoulli\'s distribution, Write down its Probability Mass Function, Mean and Variance.', '4', 'Bernoulli Distribution', 'Medium');
    execute(insertQSql, mathId, '6 B', 'Solve any two questions of the following', 'ii', 'The Probability Density Function of random variable X is f(x) = 1/10 e^(-x/10) for x>0, 0 otherwise. What is P(X <= 10)? (given e⁻¹ = 0.3679).', '4', 'Exponential Distribution', 'Medium');
    execute(insertQSql, mathId, '6 B', 'Solve any two questions of the following', 'iii', 'A distribution has a mean of 69 and standard deviation of 420. Find the mean and standard deviation if a sample of 80 is drawn from the distribution.', '4', 'Sampling Distributions', 'Medium');
  }

  // 5. Object Oriented Programming (End Sem - Summer 2026)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Object Oriented Programming', 'End Semester Examination (Summer-2026)')) {
    const oopPaper = execute(
      insertPaperSql,
      'Object Oriented Programming',
      'CS/AI/ML203ESC05',
      'Semester II',
      '2025-2026',
      'End Semester Examination (Summer-2026)',
      '2026',
      '/uploads/oop_java_endsem_summer2026.pdf',
      '/uploads/oop_java_endsem_summer2026_page1.png'
    );
    const oopId = oopPaper.lastInsertRowid;

    execute(insertQSql, oopId, '1 A', null, 'i', 'Recall JVM.', '1', 'Java Fundamentals', 'Easy');
    execute(insertQSql, oopId, '1 A', null, 'ii', 'Define class.', '1', 'Java Fundamentals', 'Easy');
    execute(insertQSql, oopId, '1 B', 'Solve any two questions of the following', 'i', 'Compare Procedure oriented Programming with Object Oriented Programming.', '4', 'OOP Paradigms', 'Medium');
    execute(insertQSql, oopId, '1 B', 'Solve any two questions of the following', 'ii', 'Explain Java Development Kit (JDK).', '4', 'Java Fundamentals', 'Medium');
    execute(insertQSql, oopId, '1 B', 'Solve any two questions of the following', 'iii', 'Describe the structure of java program with example.', '4', 'Java Structure', 'Medium');
    execute(insertQSql, oopId, '2 A', null, 'i', 'Evaluate the following expression: 8+10-15%2*11>2^3', '1', 'Java Expressions', 'Easy');
    execute(insertQSql, oopId, '2 A', null, 'ii', 'List the bitwise operators provided by java.', '1', 'Java Operators', 'Easy');
    execute(insertQSql, oopId, '2 B', 'Solve any two questions of the following', 'i', 'Experiment with data conversion and casting in java.', '4', 'Type Casting', 'Medium');
    execute(insertQSql, oopId, '2 B', 'Solve any two questions of the following', 'ii', 'Illustrate the difference between break and continue statement with examples.', '4', 'Control Statements', 'Medium');
    execute(insertQSql, oopId, '2 B', 'Solve any two questions of the following', 'iii', 'Write a Java program to find the sum of first N even numbers.', '4', 'Loops & Arithmetic', 'Medium');
    execute(insertQSql, oopId, '3 A', null, 'i', 'Write the need of command line arguments.', '1', 'Java I/O', 'Easy');
    execute(insertQSql, oopId, '3 A', null, 'ii', 'Define constructor.', '1', 'Constructors', 'Easy');
    execute(insertQSql, oopId, '3 B', 'Solve any two questions of the following', 'i', 'Identify the need of garbage collection and steps required for garbage collection.', '4', 'Garbage Collection', 'Medium');
    execute(insertQSql, oopId, '3 B', 'Solve any two questions of the following', 'ii', 'Construct a program for constructor overloading in java.', '4', 'Constructors', 'Medium');
    execute(insertQSql, oopId, '3 B', 'Solve any two questions of the following', 'iii', 'Write a Java program to model the real world entity Box with attributes length, width and height. Include methods to read and print the Box object. Test this class by writing a Main class.', '4', 'OOP Concepts', 'Medium');
    execute(insertQSql, oopId, '4 A', null, 'i', 'Recall final keyword.', '1', 'Java Keywords', 'Easy');
    execute(insertQSql, oopId, '4 A', null, 'ii', 'Define Package.', '1', 'Java Packages', 'Easy');
    execute(insertQSql, oopId, '4 B', 'Solve any two questions of the following', 'i', 'Develop a java program for multiple inheritance and analyse it.', '4', 'Interfaces', 'Medium');
    execute(insertQSql, oopId, '4 B', 'Solve any two questions of the following', 'ii', 'Analyse the effect of final keyword when applied to primitive, reference data type.', '4', 'Java Keywords', 'Medium');
    execute(insertQSql, oopId, '4 B', 'Solve any two questions of the following', 'iii', 'Write a java program to implement method overriding and analyse it.', '4', 'Inheritance & Polymorphism', 'Medium');
    execute(insertQSql, oopId, '5 A', null, 'i', 'Define Exception.', '1', 'Exception Handling', 'Easy');
    execute(insertQSql, oopId, '5 A', null, 'ii', 'Recall unchecked exception.', '1', 'Exception Handling', 'Easy');
    execute(insertQSql, oopId, '5 B', 'Solve any two questions of the following', 'i', 'Differentiate between syntax errors and exception.', '4', 'Exception Handling', 'Medium');
    execute(insertQSql, oopId, '5 B', 'Solve any two questions of the following', 'ii', 'Develop a java program for throw keyword along with finally.', '4', 'Exception Handling', 'Medium');
    execute(insertQSql, oopId, '5 B', 'Solve any two questions of the following', 'iii', 'Construct a java program for throws keyword along with finally.', '4', 'Exception Handling', 'Medium');
    execute(insertQSql, oopId, '6 A', null, 'i', 'Define File.', '1', 'File I/O', 'Easy');
    execute(insertQSql, oopId, '6 A', null, 'ii', 'List two classes of java.io package.', '1', 'File I/O', 'Easy');
    execute(insertQSql, oopId, '6 B', 'Solve any two questions of the following', 'i', 'Explain any three methods of File class with example.', '4', 'File I/O', 'Medium');
    execute(insertQSql, oopId, '6 B', 'Solve any two questions of the following', 'ii', 'Develop a java program to create a copy of a file.', '4', 'File I/O', 'Medium');
    execute(insertQSql, oopId, '6 B', 'Solve any two questions of the following', 'iii', 'Construct a java program to read contents of file and print it on the monitor.', '4', 'File I/O', 'Medium');
  }

  // 6. Indian Knowledge System (End Sem - Summer 2026)
  if (!queryOne('SELECT id FROM question_papers WHERE subject = ? AND exam_type = ?', 'Indian Knowledge System', 'End Semester Examination (Summer-2026)')) {
    const iksPaper = execute(
      insertPaperSql,
      'Indian Knowledge System',
      'CS/AI/ML206IKS01',
      'Semester II',
      '2025-2026',
      'End Semester Examination (Summer-2026)',
      '2026',
      '/uploads/iks_endsem_summer2026.pdf',
      '/uploads/iks_endsem_summer2026_page1.png'
    );
    const iksId = iksPaper.lastInsertRowid;

    execute(insertQSql, iksId, '1 A', null, 'i', 'Enlist Varna system as per Vedic era.', '1', 'Vedic Culture', 'Easy');
    execute(insertQSql, iksId, '1 A', null, 'ii', 'Define culture.', '1', 'Culture', 'Easy');
    execute(insertQSql, iksId, '1 B', 'Solve any two questions of the following', 'i', 'Explain the four Aashramas with their roles and responsibilities.', '4', 'Ashrama System', 'Medium');
    execute(insertQSql, iksId, '1 B', 'Solve any two questions of the following', 'ii', 'Explain the concept of Universal Brotherhoodness.', '4', 'Vedic Philosophy', 'Medium');
    execute(insertQSql, iksId, '1 B', 'Solve any two questions of the following', 'iii', 'Explain the foundational literature as per Vedic era.', '4', 'Vedic Literature', 'Medium');
    execute(insertQSql, iksId, '2 A', null, 'i', 'Enlist the various universities in ancient India.', '1', 'Ancient Education', 'Easy');
    execute(insertQSql, iksId, '2 A', null, 'ii', 'Define Gurukul.', '1', 'Ancient Education', 'Easy');
    execute(insertQSql, iksId, '2 B', 'Solve any two questions of the following', 'i', 'Explain the various methods of evaluation used in ancient Indian education.', '4', 'Ancient Education', 'Medium');
    execute(insertQSql, iksId, '2 B', 'Solve any two questions of the following', 'ii', 'Explain the Vikramshila as a centre of learning in ancient India.', '4', 'Ancient Universities', 'Medium');
    execute(insertQSql, iksId, '2 B', 'Solve any two questions of the following', 'iii', 'Describe the role of Taxshila universities and in making India a centre of global learning.', '4', 'Ancient Universities', 'Medium');
    execute(insertQSql, iksId, '3 A', null, 'i', 'List out the Indian astronomer contributed in field of astronomy in ancient India.', '1', 'Ancient Astronomy', 'Easy');
    execute(insertQSql, iksId, '3 A', null, 'ii', 'Define Ayurveda.', '1', 'Ancient Medicine', 'Easy');
    execute(insertQSql, iksId, '3 B', 'Solve any two questions of the following', 'i', 'Explain the origin and development of surgery in ancient India.', '4', 'Ancient Surgery', 'Medium');
    execute(insertQSql, iksId, '3 B', 'Solve any two questions of the following', 'ii', 'Explain the ancient India\'s Contribution in the water management.', '4', 'Water Management', 'Medium');
    execute(insertQSql, iksId, '3 B', 'Solve any two questions of the following', 'iii', 'Explain the contributions of Mathematics in ancient India.', '4', 'Ancient Mathematics', 'Medium');
  }

  console.log('Summer-2026 End Semester question papers check complete.');
}

export default db;






