// ================================================================
// Schedule constants — lịch học trong tuần của lớp học phần
// scheduleDays: 1 = Thứ 2 … 6 = Thứ 7, 7 = Chủ nhật
// startTime / endTime: chuỗi "HH:mm" (24h)
// ================================================================

export const WEEKDAYS = [
  { value: 1, label_vi: 'Thứ 2',    label_en: 'Mon', short_vi: 'T2', short_en: 'Mo' },
  { value: 2, label_vi: 'Thứ 3',    label_en: 'Tue', short_vi: 'T3', short_en: 'Tu' },
  { value: 3, label_vi: 'Thứ 4',    label_en: 'Wed', short_vi: 'T4', short_en: 'We' },
  { value: 4, label_vi: 'Thứ 5',    label_en: 'Thu', short_vi: 'T5', short_en: 'Th' },
  { value: 5, label_vi: 'Thứ 6',    label_en: 'Fri', short_vi: 'T6', short_en: 'Fr' },
  { value: 6, label_vi: 'Thứ 7',    label_en: 'Sat', short_vi: 'T7', short_en: 'Sa' },
  { value: 7, label_vi: 'Chủ nhật', label_en: 'Sun', short_vi: 'CN', short_en: 'Su' },
];

const dayLabel = (d, lang) => {
  const wd = WEEKDAYS.find(w => w.value === d);
  if (!wd) return '';
  return lang === 'vi' ? wd.label_vi : wd.label_en;
};

/** Lớp học phần có đủ thông tin lịch học hay không */
export const hasSchedule = (s) =>
  !!(s && Array.isArray(s.scheduleDays) && s.scheduleDays.length > 0 && s.startTime && s.endTime);

/** "Thứ 2, Thứ 4" / "Mon, Wed" */
export const formatScheduleDays = (days, lang = 'vi') =>
  [...(days || [])].sort((a, b) => a - b).map(d => dayLabel(d, lang)).filter(Boolean).join(', ');

/** "Thứ 2, Thứ 4 · 07:00–09:30" — hiển thị trên card/danh sách */
export const formatSchedule = (s, lang = 'vi') => {
  if (!hasSchedule(s)) return lang === 'vi' ? 'Chưa có lịch học' : 'No schedule';
  return `${formatScheduleDays(s.scheduleDays, lang)} · ${s.startTime}–${s.endTime}`;
};

const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Hai lớp học phần có trùng lịch không (cùng học kỳ, trùng ngày trong tuần
 * và giao nhau về khung giờ). Dùng để cảnh báo sớm phía client — server
 * vẫn là nơi kiểm tra cuối cùng.
 */
export const schedulesConflict = (a, b) => {
  if (!hasSchedule(a) || !hasSchedule(b)) return false;
  if (a.semester && b.semester && a.semester !== b.semester) return false;
  if (!a.scheduleDays.some(d => b.scheduleDays.includes(d))) return false;
  return toMinutes(a.startTime) < toMinutes(b.endTime) && toMinutes(b.startTime) < toMinutes(a.endTime);
};
