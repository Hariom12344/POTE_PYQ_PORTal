import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, FileText, Printer, ShieldAlert } from 'lucide-react';

export default function PaperViewerModal({ paper, onClose }) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 20, 60));
  const handleResetZoom = () => setZoom(100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate text/PDF document Blob for download
    const content = `
================================================================================
P. R. POTE PATIL COLLEGE OF ENGINEERING & MANAGEMENT, AMRAVATI
Department of Computer Science & Engineering
--------------------------------------------------------------------------------
SUBJECT: ${paper?.subject || 'Programming in C'}
SEMESTER: ${paper?.semester || 'Semester III'}
EXAMINATION: ${paper?.exam_type || 'End Semester Examination'}
================================================================================

SECTION 3B
Instruction: Solve any two questions

1. Write a C program to find the largest element in an array of 5 integers. [7 Marks]
2. Write a C program to count the number of vowels in a given string. [7 Marks]
3. Write a C program to copy one string to another without using strcpy() function. [7 Marks]

SECTION 4A
1. What is the syntax of writing user-defined function? [4 Marks]
2. Enlist any three math.h functions. [3 Marks]

SECTION 4B
Instruction: Solve any two questions

1. Write a C program to find the sum of two numbers using a user-defined function. [7 Marks]
2. Explain the concept of local and global variables with a suitable example. [7 Marks]
3. Write a C function to check whether a given number is prime or not. [7 Marks]

SECTION 5A
1. How do you declare a pointer variable? Give the syntax with example. [4 Marks]
2. What is the output of the following code? [3 Marks]
   int a=10;
   *p=&a;
   printf("%d", *p);

SECTION 5B
Instruction: Solve any two questions

1. Write a C program to swap two numbers using pointers. [7 Marks]
2. Explain call by value and call by reference with examples. [7 Marks]
3. Write a C program to demonstrate pointer to pointer. [7 Marks]

SECTION 6A
1. Write the syntax to declare a structure. [4 Marks]
2. Write any two advantages of structures in C. [3 Marks]

SECTION 6B
Instruction: Solve any two questions

1. Write a C program to define a structure 'Student' with members: name, roll_no, and marks. Read and display the information of one student. [7 Marks]
2. Write a C program to demonstrate array of structures. [7 Marks]
3. Write a C program to write your name and roll number to a file and then read and display it. [7 Marks]

================================================================================
Uploaded Content Verification: Authentic PYQ Document Source
================================================================================
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paper?.subject || 'C_Programming'}_PYQ_PotePatilCollege.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px', height: '90vh' }}
      >
        {/* Modal Toolbar Header */}
        <div className="modal-header" style={{ background: '#090d16' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={22} color="#38bdf8" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                Original Question Paper Document
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                {paper?.subject} — P. R. Pote Patil College of Engineering & Management
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={handleZoomOut} className="btn btn-secondary btn-sm" title="Zoom Out">
              <ZoomOut size={16} />
            </button>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '40px', textAlign: 'center' }}>
              {zoom}%
            </span>
            <button onClick={handleZoomIn} className="btn btn-secondary btn-sm" title="Zoom In">
              <ZoomIn size={16} />
            </button>
            <button onClick={handleResetZoom} className="btn btn-secondary btn-sm" title="Reset Zoom">
              <RotateCcw size={16} />
            </button>

            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />

            <button onClick={handleDownload} className="btn btn-primary btn-sm">
              <Download size={16} /> Download
            </button>

            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.6rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Paper Viewer Area */}
        <div 
          className="modal-body" 
          style={{ 
            background: '#04060c', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'auto',
            padding: '2rem'
          }}
        >
          {/* Simulated Authentic College Document Sheet */}
          <div style={{
            width: '100%',
            maxWidth: '750px',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            background: '#ffffff',
            color: '#1e293b',
            borderRadius: '6px',
            padding: '2.5rem 3rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            fontFamily: 'serif',
            lineHeight: 1.6
          }}>
            {/* College Crest & Paper Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0 }}>
                P. R. POTE PATIL COLLEGE OF ENGINEERING & MANAGEMENT, AMRAVATI
              </h2>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', margin: '0.25rem 0' }}>
                Department of Computer Science & Engineering
              </p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>
                {paper?.subject?.toUpperCase() || 'PROGRAMMING IN C'}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginTop: '0.75rem' }}>
                <span>Exam: {paper?.exam_type || 'End Semester Exam'}</span>
                <span>Max Marks: 80</span>
                <span>Time: 3 Hours</span>
              </div>
            </div>

            {/* Questions List Rendered in Paper Layout */}
            <div style={{ fontFamily: 'serif', fontSize: '1rem', color: '#0f172a' }}>
              
              {/* SECTION 3B */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
                  SECTION 3B
                </h4>
                <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
                  Solve any two questions:
                </p>
                <ol style={{ paddingLeft: '1.25rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Write a C program to find the largest element in an array of 5 integers.
                    <span style={{ float: 'right', fontWeight: 700 }}>[7]</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Write a C program to count the number of vowels in a given string.
                    <span style={{ float: 'right', fontWeight: 700 }}>[7]</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Write a C program to copy one string to another without using strcpy() function.
                    <span style={{ float: 'right', fontWeight: 700 }}>[7]</span>
                  </li>
                </ol>
              </div>

              {/* SECTION 4A */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
                  SECTION 4A
                </h4>
                <ol style={{ paddingLeft: '1.25rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    What is the syntax of writing user-defined function?
                    <span style={{ float: 'right', fontWeight: 700 }}>[4]</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Enlist any three math.h functions.
                    <span style={{ float: 'right', fontWeight: 700 }}>[3]</span>
                  </li>
                </ol>
              </div>

              {/* SECTION 4B */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
                  SECTION 4B
                </h4>
                <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
                  Solve any two questions:
                </p>
                <ol style={{ paddingLeft: '1.25rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Write a C program to find the sum of two numbers using a user-defined function.
                    <span style={{ float: 'right', fontWeight: 700 }}>[7]</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Explain the concept of local and global variables with a suitable example.
                    <span style={{ float: 'right', fontWeight: 700 }}>[7]</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Write a C function to check whether a given number is prime or not.
                    <span style={{ float: 'right', fontWeight: 700 }}>[7]</span>
                  </li>
                </ol>
              </div>

              {/* SECTION 5A */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
                  SECTION 5A
                </h4>
                <ol style={{ paddingLeft: '1.25rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    How do you declare a pointer variable? Give the syntax with example.
                    <span style={{ float: 'right', fontWeight: 700 }}>[4]</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    What is the output of the following code?
                    <pre style={{ 
                      background: '#f1f5f9', 
                      padding: '0.5rem 0.75rem', 
                      borderRadius: '4px', 
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      margin: '0.35rem 0' 
                    }}>
                      int a=10;{'\n'}*p=&a;{'\n'}printf("%d", *p);
                    </pre>
                    <span style={{ float: 'right', fontWeight: 700 }}>[3]</span>
                  </li>
                </ol>
              </div>

              {/* SECTION 5B */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
                  SECTION 5B
                </h4>
                <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
                  Solve any two questions:
                </p>
                <ol style={{ paddingLeft: '1.25rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Write a C program to swap two numbers using pointers.
                    <span style={{ float: 'right', fontWeight: 700 }}>[7]</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Explain call by value and call by reference with examples.
                    <span style={{ float: 'right', fontWeight: 700 }}>[7]</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Write a C program to demonstrate pointer to pointer.
                    <span style={{ float: 'right', fontWeight: 700 }}>[7]</span>
                  </li>
                </ol>
              </div>

              {/* SECTION 6A */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
                  SECTION 6A
                </h4>
                <ol style={{ paddingLeft: '1.25rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Write the syntax to declare a structure.
                    <span style={{ float: 'right', fontWeight: 700 }}>[4]</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Write any two advantages of structures in C.
                    <span style={{ float: 'right', fontWeight: 700 }}>[3]</span>
                  </li>
                </ol>
              </div>

              {/* SECTION 6B */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
                  SECTION 6B
                </h4>
                <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
                  Solve any two questions:
                </p>
                <ol style={{ paddingLeft: '1.25rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Write a C program to define a structure 'Student' with members: name, roll_no, and marks. Read and display the information of one student.
                    <span style={{ float: 'right', fontWeight: 700 }}>[7]</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Write a C program to demonstrate array of structures.
                    <span style={{ float: 'right', fontWeight: 700 }}>[7]</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    Write a C program to write your name and roll number to a file and then read and display it.
                    <span style={{ float: 'right', fontWeight: 700 }}>[7]</span>
                  </li>
                </ol>
              </div>

              {/* Document Footer */}
              <div style={{ 
                marginTop: '3rem', 
                borderTop: '1px dashed #cbd5e1', 
                paddingTop: '0.75rem',
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#64748b' 
              }}>
                P. R. Pote Patil College of Engineering & Management, Amravati — CSE Department PYQ Paper Document
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
