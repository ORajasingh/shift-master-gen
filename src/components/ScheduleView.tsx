import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Coffee, Moon, Sun, Plane } from 'lucide-react';
import { ScheduleEntry, ShiftType } from '@/types/schedule';

interface ScheduleViewProps {
  schedule: ScheduleEntry[];
  startDate: Date;
  endDate: Date;
}

const shiftIcons = {
  morning: Sun,
  evening: Coffee,
  night: Moon,
  leave: Plane,
};

const shiftColors = {
  morning: 'bg-morning-shift text-black',
  evening: 'bg-evening-shift text-white',
  night: 'bg-night-shift text-white',
  leave: 'bg-leave-day text-black',
};

export function ScheduleView({ schedule, startDate, endDate }: ScheduleViewProps) {
  // Group schedule by date
  const scheduleByDate = new Map<string, ScheduleEntry[]>();
  schedule.forEach(entry => {
    const dateKey = entry.date.toDateString();
    if (!scheduleByDate.has(dateKey)) {
      scheduleByDate.set(dateKey, []);
    }
    scheduleByDate.get(dateKey)!.push(entry);
  });

  // Create array of dates for the week
  const dates: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  if (schedule.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No schedule generated yet</p>
            <p>Add workers and generate a schedule to see the preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Monthly Schedule
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {startDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} - {endDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dates.map(date => {
            const dateKey = date.toDateString();
            const dayEntries = scheduleByDate.get(dateKey) || [];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const formattedDate = date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });

            // Group entries by shift type
            const shiftGroups = {
              morning: dayEntries.filter(e => e.shift === 'morning'),
              evening: dayEntries.filter(e => e.shift === 'evening'),
              night: dayEntries.filter(e => e.shift === 'night'),
              leave: dayEntries.filter(e => e.shift === 'leave'),
            };

            return (
              <div key={dateKey} className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{dayName}</span>
                  </div>
                  <Badge variant="outline">{formattedDate}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {(Object.keys(shiftGroups) as ShiftType[]).map(shiftType => {
                    const workers = shiftGroups[shiftType];
                    const Icon = shiftIcons[shiftType];
                    
                    return (
                      <div key={shiftType} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium capitalize">
                            {shiftType} {shiftType !== 'leave' ? 'Shift' : ''}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {workers.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No assignments</span>
                          ) : (
                            workers.map(worker => (
                              <Badge
                                key={`${worker.workerId}-${shiftType}`}
                                className={`${shiftColors[shiftType]} text-xs`}
                              >
                                {worker.workerName}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}