export interface Worker {
  id: string;
  name: string;
}

export type ShiftType = 'morning' | 'evening' | 'night' | 'leave';

export interface ScheduleEntry {
  workerId: string;
  workerName: string;
  date: Date;
  day: string;
  shift: ShiftType;
}

export interface WeekSchedule {
  startDate: Date;
  endDate: Date;
  entries: ScheduleEntry[];
}