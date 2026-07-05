// ================================================================
// Tiện ích lịch học — format & phát hiện trùng lịch của lớp học phần
// scheduleDays: 1 = Thứ 2 … 6 = Thứ 7, 7 = Chủ nhật
// startTime / endTime: chuỗi "HH:mm" (24h)
// ================================================================
import { WEEKDAYS } from '../constants/schedule.constants';

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
