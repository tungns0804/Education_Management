import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { I } from '../../components/icons';
import { Avatar, BtnSpinner, Drawer, FormField, Modal, fieldCls, useForm, useToast, validate } from '../../components/ui';
import { Page, SectionHead } from '../../components/shell';
import { FilterSelect } from '../../components/table';
import { useApp } from '../../context/AppContext';
import { WEEKDAYS } from '../../constants/schedule.constants';
import { formatSchedule } from '../../utils/schedule';
import {
  requestTeachers, requestSubjects,
  requestSubjectClasses, requestCreateSubjectClass, requestUpdateSubjectClass, requestDeleteSubjectClass,
} from '../../config/userRequest';

/* EduManage — Admin: Quản lý lớp học phần */

// ── Section Drawer (add / edit lớp học phần) ──────────────────────────────────
const SECTION_STATUSES = ['active', 'completed', 'canceled'];

function SectionDrawer({ open, row, subjects, teachers, onClose, onSave }) {
  const { t, lang } = useApp();
  const isEdit = !!row;
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const validators = useMemo(() => ({
    code:        validate.required(t),
    subjectId:   validate.required(t),
    teacherId:   validate.required(t),
    semester:    validate.required(t),
    maxStudents: (v) => v && (isNaN(+v) || +v < 1 || +v > 500) ? (lang === 'vi' ? 'Sĩ số 1–500' : 'Max 1–500') : null,
    scheduleDays: (v) => (!v || v.length === 0) ? (lang === 'vi' ? 'Chọn ít nhất 1 ngày học' : 'Pick at least 1 day') : null,
    startTime:   (v, f) => !v ? (lang === 'vi' ? 'Chọn giờ bắt đầu' : 'Start time required')
      : (f.endTime && v >= f.endTime) ? (lang === 'vi' ? 'Giờ bắt đầu phải trước giờ kết thúc' : 'Start must be before end') : null,
    endTime:     (v, f) => !v ? (lang === 'vi' ? 'Chọn giờ kết thúc' : 'End time required')
      : (f.startTime && f.startTime >= v) ? (lang === 'vi' ? 'Giờ kết thúc phải sau giờ bắt đầu' : 'End must be after start') : null,
  }), [t, lang]);

  const EMPTY_FORM = { code: '', subjectId: '', teacherId: '', semester: '', maxStudents: '50', status: 'active', scheduleDays: [], startTime: '', endTime: '' };

  const { form, set, touch, showError, submit, reset, setForm } = useForm(EMPTY_FORM, validators);

  useEffect(() => {
    if (!open) return;
    setSaving(false);
    if (row) {
      setForm({
        code:         row.code || '',
        subjectId:    row.subjectId || row.subject?.id || '',
        teacherId:    row.teacherId || row.teacher?.id || '',
        semester:     row.semester || '',
        maxStudents:  String(row.maxStudents ?? 50),
        status:       row.status || 'active',
        scheduleDays: row.scheduleDays || [],
        startTime:    row.startTime || '',
        endTime:      row.endTime || '',
      });
    } else {
      reset(EMPTY_FORM);
    }
  }, [open, row]);

  const toggleDay = (d) => {
    const cur = form.scheduleDays || [];
    set('scheduleDays', cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d].sort((a, b) => a - b));
  };

  const statusLabel = { active: lang === 'vi' ? 'Đang mở' : 'Active', completed: lang === 'vi' ? 'Đã kết thúc' : 'Completed', canceled: lang === 'vi' ? 'Đã hủy' : 'Canceled' };

  return (
    <Drawer open={open} onClose={onClose} width={460}
      title={isEdit ? (lang === 'vi' ? 'Sửa lớp học phần' : 'Edit section') : (lang === 'vi' ? 'Tạo lớp học phần' : 'New section')}
      subtitle={isEdit ? row?.code : ''}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose} disabled={saving}>{t('cancel')}</button>
        <button className="btn btn-primary" disabled={saving} onClick={() => {
          const ok = submit(async (data) => {
            setSaving(true);
            try { await onSave(data); } finally { setSaving(false); }
          });
          if (!ok) toast(t('errFixForm'), 'danger');
        }}>
          {saving
            ? <><BtnSpinner/>{lang === 'vi' ? 'Đang lưu…' : 'Saving…'}</>
            : (isEdit ? t('save') : (lang === 'vi' ? 'Tạo lớp HP' : 'Create section'))}
        </button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={lang === 'vi' ? 'Mã lớp HP' : 'Section code'} error={showError('code')}>
          <input className={fieldCls(showError('code'))} value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} onBlur={() => touch('code')} placeholder="CS101.01" disabled={isEdit} style={isEdit ? { opacity: .6 } : {}}/>
        </FormField>

        <FormField label={lang === 'vi' ? 'Môn học' : 'Subject'} error={showError('subjectId')}>
          <select className={fieldCls(showError('subjectId'))} value={form.subjectId} onChange={e => set('subjectId', e.target.value)} onBlur={() => touch('subjectId')} disabled={isEdit} style={isEdit ? { opacity: .6 } : {}}>
            <option value="">— {lang === 'vi' ? 'Chọn môn học' : 'Select subject'}</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </FormField>

        <FormField label={lang === 'vi' ? 'Giảng viên phụ trách' : 'Teacher'} error={showError('teacherId')}>
          <select className={fieldCls(showError('teacherId'))} value={form.teacherId} onChange={e => set('teacherId', e.target.value)} onBlur={() => touch('teacherId')}>
            <option value="">— {lang === 'vi' ? 'Chọn giảng viên' : 'Select teacher'}</option>
            {teachers.map(tc => <option key={tc.id} value={tc.id}>{tc.fullName} ({tc.idTeacher})</option>)}
          </select>
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={lang === 'vi' ? 'Học kỳ' : 'Semester'} error={showError('semester')}>
            <input className={fieldCls(showError('semester'))} value={form.semester} onChange={e => set('semester', e.target.value)} onBlur={() => touch('semester')} placeholder={lang === 'vi' ? 'HK1 2024-2025' : '2024-Fall'}/>
          </FormField>
          <FormField label={lang === 'vi' ? 'Sĩ số tối đa' : 'Max students'} error={showError('maxStudents')} optional optionalLabel={t('optional') || 'tùy chọn'}>
            <input className={fieldCls(showError('maxStudents'))} value={form.maxStudents} onChange={e => set('maxStudents', e.target.value.replace(/\D/g, ''))} onBlur={() => touch('maxStudents')} placeholder="50" inputMode="numeric"/>
          </FormField>
        </div>

        <FormField label={lang === 'vi' ? 'Ngày học trong tuần' : 'Days of week'} error={showError('scheduleDays')}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} onBlur={() => touch('scheduleDays')}>
            {WEEKDAYS.map(d => {
              const on = (form.scheduleDays || []).includes(d.value);
              return (
                <button key={d.value} type="button" onClick={() => { toggleDay(d.value); touch('scheduleDays'); }}
                  className={on ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                  style={{ minWidth: 46, padding: '0 10px', boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--border)' }}>
                  {lang === 'vi' ? d.short_vi : d.short_en}
                </button>
              );
            })}
          </div>
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={lang === 'vi' ? 'Giờ bắt đầu' : 'Start time'} error={showError('startTime')}>
            <input type="time" className={fieldCls(showError('startTime'))} value={form.startTime}
              onChange={e => set('startTime', e.target.value)} onBlur={() => touch('startTime')}/>
          </FormField>
          <FormField label={lang === 'vi' ? 'Giờ kết thúc' : 'End time'} error={showError('endTime')}>
            <input type="time" className={fieldCls(showError('endTime'))} value={form.endTime}
              onChange={e => set('endTime', e.target.value)} onBlur={() => touch('endTime')}/>
          </FormField>
        </div>

        {isEdit && (
          <FormField label={lang === 'vi' ? 'Trạng thái' : 'Status'}>
            <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
              {SECTION_STATUSES.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
            </select>
          </FormField>
        )}
      </div>
    </Drawer>
  );
}

// ── Sections screen ────────────────────────────────────────────────────────────
const ROWS_PER_PAGE = 2;

export default function SectionsScreen() {
  const { t, lang } = useApp();
  const toast = useToast();
  const [sections,     setSections]     = useState([]);
  const [subjects,     setSubjects]     = useState([]);
  const [teachers,     setTeachers]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [q,            setQ]            = useState('');
  const [semFilter,    setSemFilter]    = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page,         setPage]         = useState(1);
  const [drawer,       setDrawer]       = useState(null);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const gridRef = useRef(null);
  const [cols, setCols] = useState(1);

  // grid-cards uses `repeat(auto-fill, minmax(252px, 1fr))`, so the number of
  // columns changes with viewport width. Measure it so pagination always breaks
  // on a full row instead of leaving a half-filled row on the current page.
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const n = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;
      setCols(n || 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const CARDS_PER_PAGE = cols * ROWS_PER_PAGE;

  const loadData = () => {
    setLoading(true);
    Promise.all([requestSubjectClasses(), requestSubjects(), requestTeachers()])
      .then(([secRes, subRes, tcRes]) => {
        setSections(secRes.metadata ?? []);
        setSubjects(subRes.metadata ?? []);
        setTeachers(tcRes.metadata ?? []);
      })
      .catch(() => toast(lang === 'vi' ? 'Lỗi tải lớp học phần' : 'Failed to load sections', 'danger'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const semesters = useMemo(() => [...new Set(sections.map(s => s.semester).filter(Boolean))].sort(), [sections]);

  const filtered = sections.filter(s => {
    if (q) {
      const name = s.subject?.name || '';
      if (!s.code.toLowerCase().includes(q.toLowerCase()) && !name.toLowerCase().includes(q.toLowerCase())) return false;
    }
    if (semFilter    && s.semester !== semFilter)    return false;
    if (statusFilter && s.status   !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * CARDS_PER_PAGE, safePage * CARDS_PER_PAGE);

  const statusTone  = { active: 'success', completed: 'muted', canceled: 'danger' };
  const statusLabel = { active: lang === 'vi' ? 'Đang mở' : 'Active', completed: lang === 'vi' ? 'Kết thúc' : 'Completed', canceled: lang === 'vi' ? 'Đã hủy' : 'Canceled' };

  return (
    <Page>
      <SectionHead title={t('sections')}
        desc={lang === 'vi' ? `${sections.length} lớp học phần` : `${sections.length} sections`}
        right={<button className="btn btn-primary btn-sm" style={{ height: 40 }}
          onClick={() => setDrawer({ mode: 'add', row: null })}>
          <I.plus size={16}/>{lang === 'vi' ? 'Tạo lớp HP' : 'New section'}
        </button>}/>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="input-group" style={{ maxWidth: 280 }}>
          <I.search size={16}/>
          <input className="input" style={{ height: 42 }} value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder={t('search')}/>
        </div>
        <FilterSelect value={semFilter} onChange={v => { setSemFilter(v); setPage(1); }}
          allLabel={lang === 'vi' ? 'Mọi học kỳ' : 'All semesters'}
          options={semesters.map(s => ({ value: s, label: s }))}/>
        <FilterSelect value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }}
          allLabel={lang === 'vi' ? 'Mọi trạng thái' : 'All status'}
          options={[
            { value: 'active',    label: lang === 'vi' ? 'Đang mở' : 'Active' },
            { value: 'completed', label: lang === 'vi' ? 'Kết thúc' : 'Completed' },
            { value: 'canceled', label: lang === 'vi' ? 'Đã hủy' : 'Canceled' },
          ]}/>
      </div>

      <div className="grid-cards" ref={gridRef}>
        {pageItems.map(s => {
          const enrolled = s._count?.enrollments ?? 0;
          const max      = s.maxStudents ?? 50;
          const pct      = max > 0 ? Math.round(enrolled / max * 100) : 0;
          const full     = pct >= 95;
          return (
            <div key={s.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>{s.subject?.name ?? '—'}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>{s.code}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                  <span className="badge badge-muted">{s.subject?.credits ?? 0} {t('credits')}</span>
                  {s.status !== 'active' && <span className={`badge badge-${statusTone[s.status] || 'muted'}`}>{statusLabel[s.status] || s.status}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Avatar name={s.teacher?.fullName ?? '?'} hue={160} size={28}/>
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{s.teacher?.fullName ?? '—'}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                {lang === 'vi' ? 'HK:' : 'Semester:'} {s.semester}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <I.clock size={13}/>{formatSchedule(s, lang)}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                  <span style={{ color: 'var(--muted)' }}>{lang === 'vi' ? 'Sĩ số' : 'Enrolled'}</span>
                  <span style={{ fontWeight: 700 }}>{enrolled}/{max}</span>
                </div>
                <div style={{ height: 7, borderRadius: 5, background: 'var(--surface-3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pct + '%', borderRadius: 5, background: full ? 'var(--danger)' : pct > 80 ? 'var(--warn)' : 'var(--success)', transition: 'width .6s' }}/>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                <button className="btn btn-icon btn-sm btn-ghost" onClick={() => setDrawer({ mode: 'edit', row: s })}><I.edit size={15}/></button>
                <button className="btn btn-icon btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDel(s)}><I.trash size={15}/></button>
              </div>
            </div>
          );
        })}
        {pageItems.length === 0 && !loading && (
          <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
            {lang === 'vi' ? 'Không có lớp học phần nào.' : 'No sections found.'}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, paddingTop: 8 }}>
          <button className="btn btn-sm btn-ghost" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>‹ {lang === 'vi' ? 'Trước' : 'Prev'}</button>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{safePage} / {totalPages}</span>
          <button className="btn btn-sm btn-ghost" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>{lang === 'vi' ? 'Sau' : 'Next'} ›</button>
        </div>
      )}

      <SectionDrawer
        open={!!drawer}
        row={drawer?.row ?? null}
        subjects={subjects}
        teachers={teachers}
        onClose={() => setDrawer(null)}
        onSave={async (data) => {
          try {
            if (drawer.mode === 'edit') {
              await requestUpdateSubjectClass(drawer.row.id, {
                semester:     data.semester,
                maxStudents:  data.maxStudents ? +data.maxStudents : undefined,
                status:       data.status,
                teacherId:    data.teacherId,
                scheduleDays: data.scheduleDays,
                startTime:    data.startTime,
                endTime:      data.endTime,
              });
              toast(lang === 'vi' ? 'Đã cập nhật lớp HP' : 'Section updated');
            } else {
              await requestCreateSubjectClass({
                code:         data.code,
                semester:     data.semester,
                maxStudents:  data.maxStudents ? +data.maxStudents : 50,
                subjectId:    data.subjectId,
                teacherId:    data.teacherId,
                scheduleDays: data.scheduleDays,
                startTime:    data.startTime,
                endTime:      data.endTime,
              });
              toast(lang === 'vi' ? 'Đã tạo lớp học phần' : 'Section created');
            }
            loadData();
          } catch (err) {
            toast(err?.response?.data?.message || (lang === 'vi' ? 'Lỗi lưu dữ liệu' : 'Save failed'), 'danger');
          }
          setDrawer(null);
        }}/>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} tone="danger" icon={<I.trash size={22}/>}
        title={lang === 'vi' ? 'Xóa lớp học phần?' : 'Delete section?'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)} disabled={deleting}>{t('cancel')}</button>
          <button className="btn btn-danger" disabled={deleting} onClick={async () => {
            setDeleting(true);
            try {
              await requestDeleteSubjectClass(confirmDel.id);
              setSections(xs => xs.filter(x => x.id !== confirmDel.id));
              toast(lang === 'vi' ? 'Đã xóa lớp học phần' : 'Section deleted', 'danger');
            } catch (err) {
              toast(err?.response?.data?.message || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed'), 'danger');
            }
            setDeleting(false);
            setConfirmDel(null);
          }}>{deleting ? <><BtnSpinner/>{lang === 'vi' ? 'Đang xóa…' : 'Deleting…'}</> : t('del')}</button>
        </>}>
        {lang === 'vi'
          ? <>Xóa lớp học phần <b>{confirmDel?.code}</b> ({confirmDel?.subject?.name})?</>
          : <>Delete section <b>{confirmDel?.code}</b> ({confirmDel?.subject?.name})?</>}
      </Modal>
    </Page>
  );
}
