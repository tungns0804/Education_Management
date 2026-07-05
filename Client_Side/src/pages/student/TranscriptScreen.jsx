import React, { useState, useEffect, useMemo } from 'react';
import { I } from '../../components/icons';
import { StatCard } from '../../components/ui';
import { HBars, LineChart } from '../../components/charts';
import { Page, SectionHead } from '../../components/shell';
import { Spinner, Empty } from '../../components/feedback';
import { useApp } from '../../context/AppContext';
import { requestTranscript, requestGpaTrend } from '../../config/userRequest';

/* EduManage — Student: Bảng điểm tích lũy */

function letterColor(l) {
  if (!l) return 'var(--muted)';
  if (l === 'F') return 'var(--danger)';
  if (l === 'A') return 'var(--success)';
  if (l === 'D') return 'var(--warn)';
  return 'var(--accent)';
}

export default function TranscriptScreen() {
  const { t, lang } = useApp();
  const [data,     setData]     = useState({ enrollments: [], gpa: 0, totalCredits: 0 });
  const [gpaTrend, setGpaTrend] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([requestTranscript(), requestGpaTrend()])
      .then(([tRes, gRes]) => {
        setData(tRes.metadata || { enrollments: [], gpa: 0, totalCredits: 0 });
        setGpaTrend(gRes.metadata || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rows = data.enrollments || [];
  const gpa  = typeof data.gpa === 'number' ? data.gpa.toFixed(2) : '—';
  const semesters = useMemo(() => [...new Set(rows.map(r => r.subjectClass?.semester))].filter(Boolean).sort(), [rows]);

  const standing = data.gpa >= 8.5 ? (lang==='vi'?'Xuất sắc':'Excellent')
    : data.gpa >= 7.0 ? (lang==='vi'?'Giỏi':'Good')
    : data.gpa >= 5.5 ? (lang==='vi'?'Khá':'Fair')
    : (lang==='vi'?'Trung bình':'Average');

  const letterCounts = useMemo(() => {
    const m = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    rows.forEach(r => { if (r.letterGrade && m[r.letterGrade] !== undefined) m[r.letterGrade]++; });
    return m;
  }, [rows]);

  return (
    <Page>
      <SectionHead
        title={t('transcript')}
        desc={lang==='vi'?'Bảng điểm tích lũy toàn khóa':'Cumulative academic record'}
        right={<button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={() => window.print()}><I.download size={16}/>{lang==='vi'?'Xuất PDF':'Export PDF'}</button>}/>

      {loading ? <Spinner/> : (
        <>
          <div className="grid-stats">
            <StatCard icon={<I.award size={22}/>} label={lang==='vi'?'GPA tích lũy':'Cumulative GPA'} value={gpa} accent="#1F8A5B"/>
            <StatCard icon={<I.layers size={22}/>} label={lang==='vi'?'Tín chỉ đạt':'Credits passed'} value={data.totalCredits ?? 0} accent="#2F6FED"/>
            <StatCard icon={<I.book size={22}/>} label={lang==='vi'?'Số môn':'Courses'} value={rows.length} accent="#8B5CF6"/>
            <StatCard icon={<I.trendUp size={22}/>} label={lang==='vi'?'Xếp loại':'Standing'} value={standing} accent="#C9821A"/>
          </div>

          <div className="grid-2-1" style={{ alignItems: 'start' }}>
            {/* Transcript table */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{lang==='vi'?'Chi tiết điểm':'Grade details'}</h3>
              </div>
              {rows.length === 0
                ? <Empty icon={I.book} text={lang==='vi'?'Chưa có môn học nào hoàn thành':'No completed courses yet'}/>
                : semesters.map(sem => (
                  <div key={sem}>
                    <div style={{ padding: '10px 20px', background: 'var(--surface-2)', fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '-0.01em', borderBottom: '1px solid var(--border)' }}>
                      {sem}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
                        <thead>
                          <tr>
                            {[t('subjects'), t('credits'), t('midterm'), t('final'), t('total'), t('letter')].map((h, i) => (
                              <th key={i} style={{ textAlign: i === 0 ? 'left' : 'center', padding: '9px 13px', fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.filter(r => r.subjectClass?.semester === sem).map((r, i) => {
                            const sub = r.subjectClass?.subject;
                            return (
                              <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '11px 13px', fontWeight: 600, fontSize: 13.5 }}>
                                  {sub?.name}
                                  <div style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--mono)', fontWeight: 400 }}>{sub?.code}</div>
                                </td>
                                <td style={{ padding: '11px 13px', textAlign: 'center', fontFamily: 'var(--mono)' }}>{sub?.credits}</td>
                                <td style={{ padding: '11px 13px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{r.midtermScore ?? '—'}</td>
                                <td style={{ padding: '11px 13px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{r.finalScore ?? '—'}</td>
                                <td style={{ padding: '11px 13px', textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 800 }}>{r.totalScore ?? '—'}</td>
                                <td style={{ padding: '11px 13px', textAlign: 'center' }}>
                                  <span className="badge" style={{ background: `color-mix(in srgb,${letterColor(r.letterGrade)} 13%, transparent)`, color: letterColor(r.letterGrade), fontFamily: 'var(--mono)', fontWeight: 700, minWidth: 38, justifyContent: 'center' }}>
                                    {r.letterGrade ?? '—'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* GPA trend + distribution */}
            <div className="card" style={{ padding: 22 }}>
              <SectionHead title={lang==='vi'?'Biểu đồ GPA':'GPA trend'}/>
              <div style={{ marginTop: 16 }}>
                {gpaTrend.length > 0
                  ? <LineChart data={gpaTrend.map(x => ({ term: x.term, value: x.gpa }))} height={200} yMax={10} fmt={v => v.toFixed(1)}/>
                  : <Empty icon={I.book} text={lang==='vi'?'Chưa có dữ liệu':'No data yet'}/>
                }
              </div>
              {Object.values(letterCounts).some(v => v > 0) && (
                <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{lang==='vi'?'Phân bố điểm chữ':'Grade distribution'}</div>
                  <HBars data={[
                    { label: 'A', value: letterCounts.A, color: '#1F8A5B' },
                    { label: 'B', value: letterCounts.B, color: '#2F6FED' },
                    { label: 'C', value: letterCounts.C, color: '#C9821A' },
                    { label: 'D', value: letterCounts.D, color: '#8B5CF6' },
                    { label: 'F', value: letterCounts.F, color: '#E5534B' },
                  ].filter(x => x.value > 0)}/>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Page>
  );
}
