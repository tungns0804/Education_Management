import React, { useState, useRef } from 'react';
import { I } from './icons';
import { useApp } from '../context/AppContext';
import { MenuRow } from './shell';

/* EduManage — Bộ điều khiển bảng dữ liệu dùng chung: TableToolbar, FilterSelect, RowAction */

function TableToolbar({ q, setQ, onAdd, addLabel, filters, right }) {
  const { t } = useApp();
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <div className="input-group" style={{ flex: '1 1 240px', maxWidth: 320 }}>
        <I.search size={16}/>
        <input className="input" style={{ height: 40 }} value={q} onChange={e => setQ(e.target.value)} placeholder={t('search')}/>
      </div>
      {filters}
      <div style={{ flex: 1 }}/>
      {right}
      {onAdd && <button className="btn btn-primary btn-sm" onClick={onAdd} style={{ height: 40 }}><I.plus size={16}/>{addLabel || t('add')}</button>}
    </div>
  );
}

function FilterSelect({ value, onChange, options, allLabel }) {
  return (
    <select className="select" style={{ height: 40, width: 'auto', minWidth: 130, paddingRight: 30 }} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{allLabel}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function RowAction({ onEdit, onToggle, active, onDelete }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen(o => !o);
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <button ref={btnRef} className="btn btn-icon btn-sm btn-ghost" onClick={handleOpen}><I.more size={17}/></button>
      {open && <>
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }}/>
        <div className="card" style={{ position: 'fixed', right: pos.right, top: pos.top, width: 156, padding: 6, zIndex: 31, boxShadow: 'var(--shadow-lg)', animation: 'scaleIn .14s ease' }}>
          <MenuRow icon={<I.edit size={15}/>} label={t('edit')} onClick={() => { setOpen(false); onEdit && onEdit(); }}/>
          {onToggle && <MenuRow icon={active ? <I.lock size={15}/> : <I.unlock size={15}/>} label={active ? t('lock') : t('unlock')} onClick={() => { setOpen(false); onToggle(); }}/>}
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }}/>
          <button onClick={() => { setOpen(false); onDelete && onDelete(); }} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 11px', borderRadius: 7, fontSize: 13.5, fontWeight: 600, color: 'var(--danger)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-soft)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <I.trash size={15}/>{t('del')}
          </button>
        </div>
      </>}
    </div>
  );
}

export { TableToolbar, FilterSelect, RowAction };
