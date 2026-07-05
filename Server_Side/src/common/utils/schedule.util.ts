// ================================================================
// Schedule utilities — lịch học trong tuần của lớp học phần
// scheduleDays: 1 = Thứ 2 … 6 = Thứ 7, 7 = Chủ nhật
// startTime / endTime: chuỗi "HH:mm" (24h)
// ================================================================

import { BadRequestException } from '@nestjs/common';

export const DAY_LABELS_VI: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  7: 'Chủ nhật',
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface ScheduleInput {
  scheduleDays?: number[] | null;
  startTime?: string | null;
  endTime?: string | null;
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Lớp học phần có đủ thông tin lịch học hay không */
export function hasSchedule(s: ScheduleInput): boolean {
  return !!(s.scheduleDays && s.scheduleDays.length > 0 && s.startTime && s.endTime);
}

/**
 * Validate lịch học: ngày trong tuần hợp lệ (1–7, không trùng),
 * giờ đúng định dạng HH:mm và giờ bắt đầu phải trước giờ kết thúc.
 * Ném BadRequestException nếu không hợp lệ.
 */
export function validateSchedule(s: ScheduleInput): void {
  const { scheduleDays, startTime, endTime } = s;

  if (!scheduleDays || scheduleDays.length === 0)
    throw new BadRequestException('Vui lòng chọn ít nhất một ngày học trong tuần');

  if (!Array.isArray(scheduleDays) || scheduleDays.some((d) => !Number.isInteger(d) || d < 1 || d > 7))
    throw new BadRequestException('Ngày học trong tuần không hợp lệ (1 = Thứ 2 … 7 = Chủ nhật)');

  if (new Set(scheduleDays).size !== scheduleDays.length)
    throw new BadRequestException('Ngày học trong tuần bị lặp lại');

  if (!startTime || !TIME_RE.test(startTime))
    throw new BadRequestException('Giờ bắt đầu không hợp lệ (định dạng HH:mm)');

  if (!endTime || !TIME_RE.test(endTime))
    throw new BadRequestException('Giờ kết thúc không hợp lệ (định dạng HH:mm)');

  if (toMinutes(startTime) >= toMinutes(endTime))
    throw new BadRequestException('Giờ bắt đầu phải trước giờ kết thúc');
}

/**
 * Hai lịch học có xung đột không: trùng ít nhất một ngày trong tuần
 * và khoảng giờ giao nhau. Lịch thiếu thông tin coi như không xung đột.
 */
export function schedulesOverlap(a: ScheduleInput, b: ScheduleInput): boolean {
  if (!hasSchedule(a) || !hasSchedule(b)) return false;
  const sharesDay = a.scheduleDays!.some((d) => b.scheduleDays!.includes(d));
  if (!sharesDay) return false;
  return toMinutes(a.startTime!) < toMinutes(b.endTime!) && toMinutes(b.startTime!) < toMinutes(a.endTime!);
}

/** "Thứ 2, Thứ 4 · 07:00–09:30" — dùng trong thông báo lỗi */
export function formatSchedule(s: ScheduleInput): string {
  if (!hasSchedule(s)) return 'chưa có lịch';
  const days = [...s.scheduleDays!].sort((x, y) => x - y).map((d) => DAY_LABELS_VI[d]).join(', ');
  return `${days} · ${s.startTime}–${s.endTime}`;
}
