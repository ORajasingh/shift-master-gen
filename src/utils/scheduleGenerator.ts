import { Worker, ScheduleEntry, ShiftType } from '@/types/schedule';

export class ScheduleGenerator {
  private workers: Worker[];
  
  constructor(workers: Worker[]) {
    this.workers = workers;
  }

  generateMonthlySchedule(startDate: Date): ScheduleEntry[] {
    const schedule: ScheduleEntry[] = [];
    const workerLastShifts = new Map<string, { date: Date; shift: ShiftType }>();
    
    // Generate for 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      const daySchedule = this.generateDaySchedule(date, dayName, workerLastShifts);
      schedule.push(...daySchedule);
    }
    
    return schedule;
  }

  private generateDaySchedule(
    date: Date, 
    dayName: string, 
    workerLastShifts: Map<string, { date: Date; shift: ShiftType }>
  ): ScheduleEntry[] {
    const entries: ScheduleEntry[] = [];
    const isSunday = dayName === 'Sunday';
    
    // Get available workers (not on leave)
    const availableWorkers = this.workers.filter(worker => {
      const lastShift = workerLastShifts.get(worker.id);
      if (!lastShift) return true;
      
      const daysSinceLastShift = Math.floor(
        (date.getTime() - lastShift.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Check leave rules
      if (lastShift.shift === 'night') {
        if (isSunday && daysSinceLastShift === 1) return false; // Sunday after night shift
        if (!isSunday && daysSinceLastShift === 1) return false; // Next day after night shift
      }
      
      return true;
    });

    if (availableWorkers.length === 0) {
      return entries;
    }

    // Special handling for Sunday - only one worker in morning shift
    if (isSunday) {
      const shuffledWorkers = [...availableWorkers].sort(() => Math.random() - 0.5);
      
      // Only one worker gets morning shift on Sunday
      const morningWorker = shuffledWorkers[0];
      entries.push({
        workerId: morningWorker.id,
        workerName: morningWorker.name,
        date,
        day: dayName,
        shift: 'morning'
      });
      workerLastShifts.set(morningWorker.id, { date: new Date(date), shift: 'morning' });

      // If there are more workers available, assign evening and night shifts
      if (shuffledWorkers.length > 1) {
        const eveningWorker = shuffledWorkers[1];
        entries.push({
          workerId: eveningWorker.id,
          workerName: eveningWorker.name,
          date,
          day: dayName,
          shift: 'evening'
        });
        workerLastShifts.set(eveningWorker.id, { date: new Date(date), shift: 'evening' });
      }

      if (shuffledWorkers.length > 2) {
        const nightWorker = shuffledWorkers[2];
        entries.push({
          workerId: nightWorker.id,
          workerName: nightWorker.name,
          date,
          day: dayName,
          shift: 'night'
        });
        workerLastShifts.set(nightWorker.id, { date: new Date(date), shift: 'night' });
      }
    } else {
      // Regular weekday logic
      if (availableWorkers.length < 2) {
        // Not enough workers, assign morning shifts to all available
        availableWorkers.forEach(worker => {
          entries.push({
            workerId: worker.id,
            workerName: worker.name,
            date,
            day: dayName,
            shift: 'morning'
          });
          workerLastShifts.set(worker.id, { date: new Date(date), shift: 'morning' });
        });
        return entries;
      }

      // Assign shifts for regular days
      const shuffledWorkers = [...availableWorkers].sort(() => Math.random() - 0.5);
      
      // One worker for evening shift
      const eveningWorker = shuffledWorkers[0];
      entries.push({
        workerId: eveningWorker.id,
        workerName: eveningWorker.name,
        date,
        day: dayName,
        shift: 'evening'
      });
      workerLastShifts.set(eveningWorker.id, { date: new Date(date), shift: 'evening' });

      // One worker for night shift
      const nightWorker = shuffledWorkers[1];
      entries.push({
        workerId: nightWorker.id,
        workerName: nightWorker.name,
        date,
        day: dayName,
        shift: 'night'
      });
      workerLastShifts.set(nightWorker.id, { date: new Date(date), shift: 'night' });

      // Rest get morning shifts
      for (let i = 2; i < shuffledWorkers.length; i++) {
        const worker = shuffledWorkers[i];
        entries.push({
          workerId: worker.id,
          workerName: worker.name,
          date,
          day: dayName,
          shift: 'morning'
        });
        workerLastShifts.set(worker.id, { date: new Date(date), shift: 'morning' });
      }
    }

    // Apply leave rules for previous shifts
    this.applyLeaveRules(entries, workerLastShifts, date, dayName);

    return entries;
  }

  private applyLeaveRules(
    entries: ScheduleEntry[],
    workerLastShifts: Map<string, { date: Date; shift: ShiftType }>,
    currentDate: Date,
    dayName: string
  ) {
    const isSunday = dayName === 'Sunday';
    const isSaturday = dayName === 'Saturday';
    
    // Apply leave for workers who worked night shift
    entries.forEach(entry => {
      if (entry.shift === 'night') {
        // Saturday night shift: Sunday + Monday are leave
        if (isSaturday) {
          for (let i = 1; i <= 2; i++) {
            const leaveDate = new Date(currentDate);
            leaveDate.setDate(currentDate.getDate() + i);
            const leaveDayName = leaveDate.toLocaleDateString('en-US', { weekday: 'long' });
            
            entries.push({
              workerId: entry.workerId,
              workerName: entry.workerName,
              date: leaveDate,
              day: leaveDayName,
              shift: 'leave'
            });
          }
        }
        // Sunday night shift: Monday + Tuesday are leave
        else if (isSunday) {
          for (let i = 1; i <= 2; i++) {
            const leaveDate = new Date(currentDate);
            leaveDate.setDate(currentDate.getDate() + i);
            const leaveDayName = leaveDate.toLocaleDateString('en-US', { weekday: 'long' });
            
            entries.push({
              workerId: entry.workerId,
              workerName: entry.workerName,
              date: leaveDate,
              day: leaveDayName,
              shift: 'leave'
            });
          }
        } 
        // Regular night shift: next day is leave
        else {
          const nextDay = new Date(currentDate);
          nextDay.setDate(currentDate.getDate() + 1);
          const nextDayName = nextDay.toLocaleDateString('en-US', { weekday: 'long' });
          
          entries.push({
            workerId: entry.workerId,
            workerName: entry.workerName,
            date: nextDay,
            day: nextDayName,
            shift: 'leave'
          });
        }
      }
    });

    // Apply leave for Sunday morning/evening shifts (previous day)
    if (isSunday) {
      entries.forEach(entry => {
        if (entry.shift === 'morning' || entry.shift === 'evening') {
          const previousDay = new Date(currentDate);
          previousDay.setDate(currentDate.getDate() - 1);
          const prevDayName = previousDay.toLocaleDateString('en-US', { weekday: 'long' });
          
          entries.push({
            workerId: entry.workerId,
            workerName: entry.workerName,
            date: previousDay,
            day: prevDayName,
            shift: 'leave'
          });
        }
      });
    }
  }
}