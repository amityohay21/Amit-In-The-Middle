import React from 'react';

export default function OptimizationToggle({ value, onChange }) {
  return (
    <div className="optimization-toggle" style={{ border: 'none', boxShadow: 'none', padding: '0', marginTop: '1.5rem', background: 'transparent' }}>
      <h3 style={{ fontSize: '1.1rem', margin: '0 0 12px 0', color: 'var(--ink)' }}>
        מה יותר חשוב לכם?
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* כרטיסיית Minimax */}
        <label 
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            borderRadius: '16px',
            border: `2px solid ${value === 'minimax' ? 'var(--accent)' : 'var(--line)'}`,
            background: value === 'minimax' ? 'var(--accent-light)' : 'var(--surface)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            {/* כפתור רדיו מעוצב אישית */}
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', 
              border: `2px solid ${value === 'minimax' ? 'var(--accent)' : '#ccc'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              background: '#fff', flexShrink: 0
            }}>
              {value === 'minimax' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent)' }} />}
            </div>
            
            <input 
              type="radio" 
              name="optMode" 
              value="minimax" 
              checked={value === 'minimax'} 
              onChange={(e) => onChange(e.target.value)} 
              style={{ display: 'none' }} 
            />
            <strong style={{ fontSize: '1.15rem', color: value === 'minimax' ? 'var(--accent-dark)' : 'var(--ink)' }}>
              Minimax
            </strong>
          </div>
          <span style={{ color: 'var(--muted)', fontSize: '0.95rem', paddingRight: '34px', lineHeight: '1.4' }}>
            שוויון בנטל — דואג שאף אחד לא "יאכל אותה" יותר מהשאר
          </span>
        </label>

        {/* כרטיסיית MinAverage (לשעבר Sum of Times) */}
        <label 
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            borderRadius: '16px',
            border: `2px solid ${value === 'sum' ? 'var(--accent)' : 'var(--line)'}`,
            background: value === 'sum' ? 'var(--accent-light)' : 'var(--surface)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            {/* כפתור רדיו מעוצב אישית */}
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', 
              border: `2px solid ${value === 'sum' ? 'var(--accent)' : '#ccc'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              background: '#fff', flexShrink: 0
            }}>
              {value === 'sum' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent)' }} />}
            </div>

            {/* שים לב: אנחנו משאירים את ה-value כ-'sum' כדי לא לשבור את השרת, אבל מציגים MinAverage */}
            <input 
              type="radio" 
              name="optMode" 
              value="sum" 
              checked={value === 'sum'} 
              onChange={(e) => onChange(e.target.value)} 
              style={{ display: 'none' }} 
            />
            <strong style={{ fontSize: '1.15rem', color: value === 'sum' ? 'var(--accent-dark)' : 'var(--ink)' }}>
              MinAverage
            </strong>
          </div>
          <span style={{ color: 'var(--muted)', fontSize: '0.95rem', paddingRight: '34px', lineHeight: '1.4' }}>
            קורבן למען הקבוצה — חוסך זמן נסיעה כללי, אבל מישהו ינהג יותר
          </span>
        </label>

      </div>
    </div>
  );
}