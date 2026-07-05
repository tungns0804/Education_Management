import React, { useState, useEffect, useRef } from 'react';
import { I } from './icons';
import { Drawer, useToast } from './ui';
import { useApp } from '../context/AppContext';
import { parseCSV, SAMPLE_CSV } from '../utils/csv';
import { readFileAsText, generateStudentExcelTemplate } from '../utils/excel';

/* EduManage — Drawer nhập danh sách sinh viên hàng loạt (CSV / Excel) */

function BulkImportDrawer({ open, onClose, onProvision, classes = [] }) {
  const { t, lang } = useApp();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { if (open) { setText(''); setParsed(null); } }, [open]);
  useEffect(() => { setParsed(text.trim() ? parseCSV(text, classes) : null); }, [text, classes]);

  const readFile = async (file) => {
    if (!file) return;
    try {
      const content = await readFileAsText(file);
      setText(content);
    } catch {
      setText('');
    }
  };

  const downloadTemplate = async (e) => {
    e.stopPropagation();
    await generateStudentExcelTemplate(lang);
  };

  const validRows = parsed ? parsed.rows.filter(r => r.errors.length === 0) : [];
  const errorRows = parsed ? parsed.rows.filter(r => r.errors.length > 0) : [];
  // Chỉ cho phép import khi TẤT CẢ dòng đều hợp lệ
  const canProvision = parsed && parsed.rows.length > 0 && errorRows.length === 0;

  const provision = () => {
    onProvision(validRows);
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} width={620}
      title={t('importStudents')} subtitle={t('bulkProvision')}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" disabled={!canProvision} onClick={provision}>
          <I.shield size={16}/>{t('provisionNow')} ({validRows.length})
        </button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Drop / upload zone */}
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); readFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          style={{ border: '2px dashed ' + (dragOver ? 'var(--accent)' : 'var(--border-strong)'), borderRadius: 14, padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'color-mix(in srgb, var(--accent) 7%, transparent)' : 'var(--surface-2)', transition: 'all .15s' }}>
          <input ref={fileRef} type="file" accept=".csv,text/csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => readFile(e.target.files[0])}/>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--info-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><I.upload size={22}/></div>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>{lang === 'vi' ? 'Kéo & thả file CSV hoặc Excel (.xlsx) vào đây' : 'Drag & drop CSV or Excel (.xlsx) file here'}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
            {lang === 'vi' ? 'Cột: Họ tên · Giới tính · Ngày sinh · Lớp · Email cá nhân (Mã SV tự động sinh)' : 'Columns: Name · Gender · DOB · Class · Personal email (Student code auto-generated)'}
          </div>
          <div style={{ height: 1, background: 'var(--border)', margin: '14px auto 0', width: 48 }}/>
          <button
            onClick={downloadTemplate}
            style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 18%, transparent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 10%, transparent)'}>
            <I.download size={14}/>{lang === 'vi' ? 'Tải file mẫu (.xlsx)' : 'Download template (.xlsx)'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t('orPaste')}</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
        </div>

        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ margin: 0 }}>{t('pasteCsv')}</label>
            <button className="btn btn-sm btn-ghost" style={{ height: 28, fontSize: 12 }} onClick={() => setText(SAMPLE_CSV)}><I.fileText size={14}/>{lang==='vi'?'Dùng mẫu':'Use sample'}</button>
          </div>
          <textarea className="input" rows={5} style={{ fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.6 }} value={text} onChange={e => setText(e.target.value)}
            placeholder={lang === 'vi' ? "Họ tên,Giới tính,Ngày sinh,Lớp,Email cá nhân\n(Mã sinh viên sẽ tự động sinh khi import)" : "Name,Gender,DOB,Class,Personal email\n(Student code is auto-generated on import)"}/>
        </div>

        {parsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span className="badge badge-success"><I.check size={13}/>{validRows.length} {t('validRows')}</span>
              {errorRows.length > 0 && <span className="badge badge-danger"><I.alert size={13}/>{errorRows.length} {t('errorRows')}</span>}
            </div>

            {errorRows.length > 0 && (
              <div style={{ display: 'flex', gap: 10, padding: '10px 13px', background: 'var(--danger-soft)', borderRadius: 10, fontSize: 12.5, color: 'var(--danger)' }}>
                <I.alert size={16} style={{ flexShrink: 0, marginTop: 1 }}/>
                <span>
                  {lang === 'vi'
                    ? 'File phải hợp lệ 100% để import. Vui lòng sửa các dòng lỗi trước khi tiếp tục.'
                    : 'All rows must be valid before importing. Fix the errors highlighted in red.'}
                </span>
              </div>
            )}

            <div className="card" style={{ overflow: 'hidden', boxShadow: 'none', border: '1px solid var(--border)' }}>
              <div style={{ overflowX: 'auto', maxHeight: 280, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                  <thead><tr style={{ background: 'var(--surface-2)', position: 'sticky', top: 0, zIndex: 1 }}>
                    {[t('name'), t('class'), lang === 'vi' ? 'Email cá nhân' : 'Personal email'].map((h, i) => (
                      <th key={i} style={{ textAlign: 'left', padding: '9px 12px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {parsed.rows.map((r, ri) => {
                      const bad = r.errors.length > 0;
                      const has = (f) => r.errors.includes(f);
                      return (
                        <tr key={ri} style={{ borderBottom: '1px solid var(--border)', background: bad ? 'color-mix(in srgb, var(--danger) 5%, transparent)' : 'transparent' }}>
                          <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: has('name') ? 'var(--danger)' : 'var(--text)' }}>
                            {r.name || (lang==='vi'?'(thiếu)':'(missing)')}
                            {bad && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--danger)' }}>← dòng {ri + 1}</span>}
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: 12.5, color: has('class') ? 'var(--danger)' : 'var(--text-2)' }}>{r.classCode || '—'}{has('class') ? ' ?' : ''}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12, color: has('personalEmail') ? 'var(--danger)' : 'var(--muted)' }}>{r.personalEmail || (lang === 'vi' ? '(thiếu)' : '(missing)')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 11, padding: 13, background: 'var(--info-soft)', borderRadius: 11, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
              <I.spark size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}/>
              {lang==='vi'
                ? 'Mã sinh viên, email trường và mật khẩu tạm sẽ được sinh tự động và gửi tới email cá nhân. Import chỉ thành công khi toàn bộ danh sách hợp lệ.'
                : 'Student codes, school emails and temporary passwords are auto-generated and emailed. Import succeeds only when all rows are valid.'}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export { BulkImportDrawer };
