const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE AUTH & PERMISSION TESTS ---');

  const timestamp = Date.now();
  const studentEmail = `student_${timestamp}@pote.edu.in`;
  const teacherEmail = `teacher_${timestamp}@pote.edu.in`;
  const password = 'TestPassword@123';

  // TEST 1: Student registration
  console.log('\n[TEST 1] Testing Student Registration...');
  const res1 = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Student',
      email: studentEmail,
      mobile: '9876543210',
      college: 'P. R. Pote Patil College of Engineering',
      branch: 'CSE',
      academicYear: '3rd Year',
      password,
      role: 'STUDENT'
    })
  });
  const data1 = await res1.json();
  console.log('Status:', res1.status);
  console.log('Student token returned:', Boolean(data1.token));
  console.log('Role stored in DB:', data1.user?.role);
  if (res1.status !== 201 || data1.user?.role !== 'STUDENT') throw new Error('Test 1 Failed');

  const studentToken = data1.token;

  // TEST 2: Teacher registration
  console.log('\n[TEST 2] Testing Teacher Registration...');
  const res2 = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Teacher',
      email: teacherEmail,
      mobile: '9123456789',
      college: 'P. R. Pote Patil College of Engineering',
      branch: 'CSE',
      academicYear: 'Professor',
      password,
      role: 'TEACHER'
    })
  });
  const data2 = await res2.json();
  console.log('Status:', res2.status);
  console.log('Teacher token returned:', Boolean(data2.token));
  console.log('Role stored in DB:', data2.user?.role);
  if (res2.status !== 201 || data2.user?.role !== 'TEACHER') throw new Error('Test 2 Failed');

  const teacherToken = data2.token;

  // TEST 3: Student login
  console.log('\n[TEST 3] Testing Student Login...');
  const res3 = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: studentEmail, password })
  });
  const data3 = await res3.json();
  console.log('Status:', res3.status);
  console.log('Logged in user role:', data3.user?.role);
  if (res3.status !== 200 || data3.user?.role !== 'STUDENT') throw new Error('Test 3 Failed');

  // TEST 4: Teacher login
  console.log('\n[TEST 4] Testing Teacher Login...');
  const res4 = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: teacherEmail, password })
  });
  const data4 = await res4.json();
  console.log('Status:', res4.status);
  console.log('Logged in user role:', data4.user?.role);
  if (res4.status !== 200 || data4.user?.role !== 'TEACHER') throw new Error('Test 4 Failed');

  // TEST 5: Student API access (/api/student/pyqs & /api/student/profile)
  console.log('\n[TEST 5] Testing Student APIs...');
  const res5 = await fetch(`${BASE_URL}/api/student/pyqs`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log('GET /api/student/pyqs Status:', res5.status);
  if (res5.status !== 200) throw new Error('Test 5 Failed');

  // TEST 6: Teacher API access (/api/teacher/pyqs & /api/teacher/students)
  console.log('\n[TEST 6] Testing Teacher APIs...');
  const res6 = await fetch(`${BASE_URL}/api/teacher/students`, {
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });
  console.log('GET /api/teacher/students Status:', res6.status);
  if (res6.status !== 200) throw new Error('Test 6 Failed');

  // TEST 7 & 9: Student attempting Teacher API (Must return 403 Forbidden)
  console.log('\n[TEST 7 & 9] Testing Student attempting Teacher API (POST /api/teacher/pyqs)...');
  const res7 = await fetch(`${BASE_URL}/api/teacher/pyqs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ subject: 'Unauthorized Subject' })
  });
  const data7 = await res7.json();
  console.log('Status:', res7.status, '(Expected: 403)');
  console.log('Error message:', data7.error);
  if (res7.status !== 403) throw new Error('Test 7/9 Failed: Student was not forbidden from Teacher API!');

  // TEST 8: Teacher accessing Teacher APIs (POST /api/teacher/pyqs)
  console.log('\n[TEST 8] Testing Teacher accessing Teacher APIs...');
  const res8 = await fetch(`${BASE_URL}/api/teacher/pyqs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      subject: 'Compiler Design',
      subject_code: '5KS01',
      semester: 'Semester V',
      academic_year: '2023-2024',
      exam_type: 'End Semester Examination',
      paper_year: '2023'
    })
  });
  const data8 = await res8.json();
  console.log('Status:', res8.status, '(Expected: 201)');
  console.log('Created paper ID:', data8.id);
  if (res8.status !== 201) throw new Error('Test 8 Failed');

  // TEST 10: Logout
  console.log('\n[TEST 10] Testing Logout...');
  const res10 = await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST' });
  console.log('Status:', res10.status);
  if (res10.status !== 200) throw new Error('Test 10 Failed');

  // TEST 11: Invalid login credentials
  console.log('\n[TEST 11] Testing Invalid Login...');
  const res11 = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: studentEmail, password: 'WrongPassword' })
  });
  const data11 = await res11.json();
  console.log('Status:', res11.status, '(Expected: 401)');
  console.log('Error message:', data11.error);
  if (res11.status !== 401) throw new Error('Test 11 Failed');

  // TEST 12: Expired / invalid JWT token
  console.log('\n[TEST 12] Testing Invalid/Expired JWT...');
  const res12 = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': 'Bearer invalid.token.value' }
  });
  const data12 = await res12.json();
  console.log('Status:', res12.status, '(Expected: 401)');
  console.log('Error message:', data12.error);
  if (res12.status !== 401) throw new Error('Test 12 Failed');

  // EXTRA TEST: Verify user role modification via Profile API is prevented!
  console.log('\n[EXTRA TEST] Testing Profile Role Tampering Prevention...');
  const resExtra = await fetch(`${BASE_URL}/api/student/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      fullName: 'Updated Student Name',
      role: 'TEACHER' // Attempt role escalation
    })
  });
  const dataExtra = await resExtra.json();
  console.log('Role after attempted escalation:', dataExtra.role);
  if (dataExtra.role !== 'STUDENT') throw new Error('Extra Test Failed: Role escalation was permitted!');

  console.log('\n==========================================');
  console.log('ALL 12 AUTHENTICATION & ROLE SECURITY TESTS PASSED PERFECTLY!');
  console.log('==========================================\n');
}

runTests().catch((err) => {
  console.error('TESTING FAILED:', err);
  process.exit(1);
});
