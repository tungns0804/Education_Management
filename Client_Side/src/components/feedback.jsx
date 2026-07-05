import React from 'react';
import { I } from './icons';

/* EduManage — Trạng thái phản hồi dùng chung: Spinner, Empty, SimplePagination */

// Vòng xoay tải dữ liệu — size/padding tùy biến theo từng màn hình
function Spinner({ size = 32, padding = 48 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding }}>
      <div style={{ width: size, height: size, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
    </div>
  );
}

// Trạng thái trống — icon tùy màn hình (I.layers, I.book…), có thể bỏ trống
function Empty({ icon: Icon, text, padding = 48 }) {
  return (
    <div style={{ textAlign: 'center', padding, color: 'var(--muted)', fontSize: 14 }}>
      {Icon && <Icon size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }}/>}
      {text}
    </div>
  );
}

// Phân trang dạng dãy nút số — dùng ở các màn danh sách card / bảng điểm
function SimplePagination({ page, total, size, onChange }) {
  const pages = Math.ceil(total / size);
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 20 }}>
      <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => onChange(page - 1)}>
        <I.chevL size={15}/>
      </button>
      {Array.from({ length: pages }).map((_, i) => (
        <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onChange(i + 1)}>{i + 1}</button>
      ))}
      <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => onChange(page + 1)}>
        <I.chevR size={15}/>
      </button>
    </div>
  );
}

export { Spinner, Empty, SimplePagination };
