import { useState } from 'react';

export default function AppraisalForm({ selectedEmployee, onBack }) {
  if (!selectedEmployee) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Select an employee from the Dashboard.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={onBack}>← Back</button>
      
      <h2>NEW FORM LOADED ✓</h2>
      
      <p><strong>Employee:</strong> {selectedEmployee.first_name} {selectedEmployee.last_name}</p>
      <p><strong>ID:</strong> {selectedEmployee.employee_id}</p>
      <p><strong>Role:</strong> {selectedEmployee.role}</p>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
        <p style={{ color: '#2e7d32' }}>
          ✓ If you see this green box, the NEW AppraisalForm.jsx is loading correctly.
        </p>
      </div>
    </div>
  );
}
