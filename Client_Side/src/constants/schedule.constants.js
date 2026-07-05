// ================================================================
// Schedule constants — lịch học trong tuần của lớp học phần
// scheduleDays: 1 = Thứ 2 … 6 = Thứ 7, 7 = Chủ nhật
// Các hàm format / kiểm tra trùng lịch nằm ở src/utils/schedule.js
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
