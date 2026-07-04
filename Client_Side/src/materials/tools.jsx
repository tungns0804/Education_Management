import React, { useState, useEffect, useRef } from 'react';
import { I } from './icons';
import { Drawer, useApp, useToast } from './ui';

// Helper: read a File and resolve with its text content (CSV or Excel)
async function readFileAsText(file) {
  const ext = (file.name || '').split('.').pop().toLowerCase();
  if (ext === 'xlsx' || ext === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const { read, utils } = await import('xlsx');
          const wb = read(new Uint8Array(e.target.result), { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          resolve(utils.sheet_to_csv(ws));
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8');
  });
}

/* EduManage — CSV export, bulk import */

// ============== CSV export ==============
function downloadCSV(filename, headers, rows) {
  const esc = (v) => {
    const s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.map(esc).join(',')].concat(rows.map(r => r.map(esc).join(',')));
  const csv = '\uFEFF' + lines.join('\r\n'); // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ============== Student Excel template ==============
async function generateStudentExcelTemplate(lang) {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const vi = lang === 'vi';

  const NAVY   = '#1E3A5F';
  const BLUE   = '#2F6FED';
  const COL_H  = '#003478';
  const WHITE  = '#FFFFFF';
  const ROW_A  = '#EBF2FF';
  const NOTE_B = '#FFFBEB';
  const NOTE_T = '#92400E';
  const INFO_T = '#1D4ED8';
  const MUTED  = '#64748B';
  const BORD   = '#B0C4DE';
  const FONT   = 'Times New Roman';

  const hdr = (v, extra = {}) => ({
    value: v, fontFamily: FONT, fontSize: 11, fontWeight: 'bold',
    color: WHITE, backgroundColor: COL_H, align: 'center', alignVertical: 'middle',
    height: 28, borderStyle: 'thin', borderColor: COL_H, ...extra,
  });
  const dat = (v, ri, center = false) => ({
    value: v,
    type: typeof v === 'number' ? Number : String,
    fontFamily: FONT, fontSize: 11,
    backgroundColor: ri % 2 === 0 ? ROW_A : WHITE,
    align: center ? 'center' : 'left', alignVertical: 'middle',
    height: 20, borderStyle: 'thin', borderColor: BORD,
  });
  const span6 = (v, extra = {}) => ({ value: v, span: 6, fontFamily: FONT, ...extra });

  const hdrs = vi
    ? ['STT', 'Họ và tên (*)', 'Giới tính (*)', 'Ngày sinh', 'Mã lớp (*)', 'Email cá nhân (*)']
    : ['No.', 'Full name (*)', 'Gender (*)', 'Date of birth', 'Class code (*)', 'Personal email (*)'];

  const samples = vi ? [
    [1, 'Nguyễn Văn Khôi',   'Nam', '12/03/2004', 'KTPM2021A', 'khoi.nv@gmail.com'],
    [2, 'Trần Thị Bình An',  'Nữ',  '28/07/2004', 'KTPM2021A', 'binhan.tt@gmail.com'],
    [3, 'Lê Hoàng Phúc',     'Nam', '05/11/2004', 'KHMT2022A', 'phuc.lh@gmail.com'],
    [4, 'Phạm Gia Hân',      'Nữ',  '19/01/2005', 'HTTT2022A', 'han.pg@gmail.com'],
  ] : [
    [1, 'Nguyen Van Khoi',   'Male',   '12/03/2004', 'CS2021A', 'khoi.nv@gmail.com'],
    [2, 'Tran Thi Binh An',  'Female', '28/07/2004', 'CS2021A', 'binhan.tt@gmail.com'],
    [3, 'Le Hoang Phuc',     'Male',   '05/11/2004', 'IT2022A', 'phuc.lh@gmail.com'],
    [4, 'Pham Gia Han',      'Female', '19/01/2005', 'IS2022A', 'han.pg@gmail.com'],
  ];

  const data = [
    // Row 1 — university name
    [span6(vi ? 'TRƯỜNG ĐẠI HỌC KHOA HỌC VÀ CÔNG NGHỆ VIỆT NAM' : 'VIETNAM UNIVERSITY OF SCIENCE AND TECHNOLOGY', {
      fontSize: 15, fontWeight: 'bold', color: WHITE, backgroundColor: NAVY,
      align: 'center', alignVertical: 'middle', height: 44,
    })],
    // Row 2 — department
    [span6(vi ? 'PHÒNG ĐÀO TẠO  ·  PHÒNG CÔNG TÁC SINH VIÊN' : 'ACADEMIC AFFAIRS OFFICE  ·  STUDENT SERVICES OFFICE', {
      fontSize: 11, fontStyle: 'italic', color: WHITE, backgroundColor: BLUE,
      align: 'center', alignVertical: 'middle', height: 24,
    })],
    // Row 3 — spacer
    [span6(null, { height: 12 })],
    // Row 4 — document title
    [span6(vi ? 'DANH SÁCH SINH VIÊN NHẬP HỌC' : 'STUDENT ENROLLMENT LIST', {
      fontSize: 14, fontWeight: 'bold', textDecoration: 'underline', color: NAVY,
      align: 'center', alignVertical: 'middle', height: 38,
    })],
    // Row 5 — year / semester fill-in line
    [span6(vi
      ? 'Năm học: ____________________      Học kỳ: _____________      Khoa/Bộ môn: __________________'
      : 'Academic Year: __________________      Semester: _____________      Faculty: __________________', {
      fontSize: 11, fontStyle: 'italic', color: MUTED,
      align: 'center', alignVertical: 'middle', height: 22,
    })],
    // Row 6 — spacer
    [span6(null, { height: 10 })],
    // Row 7 — column headers
    hdrs.map(h => hdr(h)),
    // Rows 8-11 — sample data
    ...samples.map((row, ri) => [
      dat(row[0], ri, true),
      dat(row[1], ri),
      dat(row[2], ri, true),
      dat(row[3], ri, true),
      dat(row[4], ri, true),
      dat(row[5], ri),
    ]),
    // Row 12 — spacer
    [span6(null, { height: 10 })],
    // Row 13 — required-field note
    [span6(vi
      ? '(*) Cột bắt buộc điền. Mã lớp phải khớp chính xác với mã trong hệ thống. Xóa các dòng mẫu trước khi nhập dữ liệu thực tế.'
      : '(*) Required fields. Class code must exactly match system codes (case-sensitive). Remove sample rows before importing real data.', {
      fontSize: 10, fontStyle: 'italic', color: NOTE_T, backgroundColor: NOTE_B,
      align: 'left', alignVertical: 'middle', wrap: true, height: 34,
    })],
    // Row 14 — auto-generation note
    [span6(vi
      ? 'ℹ  Mã sinh viên và email trường (.edu.vn) sẽ được hệ thống tự động sinh. Thông tin đăng nhập gửi về email cá nhân sau khi nhập thành công.'
      : 'ℹ  Student code and school email (.edu.vn) are auto-generated. Login credentials will be sent to personal email after successful import.', {
      fontSize: 10, fontStyle: 'italic', color: INFO_T,
      align: 'left', alignVertical: 'middle', wrap: true, height: 34,
    })],
  ];

  const columns = [
    { width: 6 }, { width: 30 }, { width: 14 }, { width: 14 }, { width: 16 }, { width: 28 },
  ];

  const fileName = vi ? 'mau-danh-sach-sinh-vien.xlsx' : 'student-import-template.xlsx';
  await writeXlsxFile(data, { columns, sheet: vi ? 'DS Sinh Viên' : 'Student List' }).toFile(fileName);
}

// ============== Bulk Import drawer ==============
// Cột Mã SV đã bỏ — mã được sinh tự động phía server
const SAMPLE_CSV = `Họ tên,Giới tính,Ngày sinh,Lớp,Email cá nhân
Nguyễn Văn Khôi,Nam,12/03/2004,KTPM2021A,khoi.nv@gmail.com
Trần Thị Bình An,Nữ,28/07/2004,KTPM2021A,binhan.tt@gmail.com
Lê Hoàng Phúc,Nam,05/11/2004,KHMT2022A,phuc.lh@gmail.com
Phạm Gia Hân,Nữ,19/01/2005,HTTT2022A,han.pg@gmail.com`;

// Cột: Họ tên, Giới tính, Ngày sinh, Lớp, Email cá nhân (Mã SV tự sinh server)
function parseCSV(text, classes = []) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return { rows: [] };
  const splitLine = (l) => {
    const out = []; let cur = '', inQ = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (c === '"') inQ = !inQ;
      else if (c === ',' && !inQ) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return out.map(s => s.trim());
  };
  const header = splitLine(lines[0]);
  const looksHeader = /họ tên|full name|name/i.test(header[0]);
  const dataLines = looksHeader ? lines.slice(1) : lines;
  // Validate class codes against real classes from API (case-insensitive)
  const validClassCodes = new Set(classes.map(c => (c.code || '').toUpperCase()));
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const rows = dataLines.map((l, i) => {
    const [name, gender, dob, cls, pmail] = splitLine(l);
    const errors = [];
    if (!name || !name.trim()) errors.push('name');
    if (!pmail || !emailRe.test(pmail.trim())) errors.push('personalEmail');
    const clsCode = (cls || '').trim();
    if (validClassCodes.size > 0 && clsCode && !validClassCodes.has(clsCode.toUpperCase())) errors.push('class');
    const g = /nữ|female|f/i.test(gender || '') ? 'F' : 'M';
    return {
      i, name: (name || '').trim(), gender: g, dob: (dob || '').trim(),
      classCode: clsCode,
      personalEmail: (pmail || '').trim(), errors,
    };
  });
  return { rows };
}

function genTempPw() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ', nums = '23456789', spec = '!@#$%';
  const low = 'abcdefghijkmnpqrstuvwxyz';
  const pick = (s) => s[Math.floor(Math.random() * s.length)];
  let p = pick(chars) + pick(low) + pick(low) + pick(nums) + pick(nums) + pick(spec) + pick(low) + pick(nums);
  return p.split('').sort(() => Math.random() - 0.5).join('');
}

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

export { downloadCSV, BulkImportDrawer, parseCSV, genTempPw };
