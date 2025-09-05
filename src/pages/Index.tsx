import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Download, RefreshCw, Settings, Users2 } from 'lucide-react';
import { WorkerManagement } from '@/components/WorkerManagement';
import { ScheduleView } from '@/components/ScheduleView';
import { Worker, ScheduleEntry } from '@/types/schedule';
import { ScheduleGenerator } from '@/utils/scheduleGenerator';
import { generateSchedulePDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    // Set to first day of current month
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 29); // 30 days total

  const handleAddWorker = (worker: Worker) => {
    setWorkers(prev => [...prev, worker]);
  };

  const handleRemoveWorker = (workerId: string) => {
    setWorkers(prev => prev.filter(w => w.id !== workerId));
    // Remove worker from existing schedule
    setSchedule(prev => prev.filter(entry => entry.workerId !== workerId));
  };

  const generateSchedule = async () => {
    if (workers.length < 2) {
      toast({
        title: "Insufficient Workers",
        description: "You need at least 2 workers to generate a schedule",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const generator = new ScheduleGenerator(workers);
      const newSchedule = generator.generateMonthlySchedule(startDate);
      setSchedule(newSchedule);
      
      toast({
        title: "Schedule Generated",
        description: "Monthly schedule has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (schedule.length === 0) {
      toast({
        title: "No Schedule",
        description: "Please generate a schedule first",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdf = generateSchedulePDF(schedule, startDate, endDate);
      const fileName = `shift-schedule-${startDate.toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "PDF Downloaded",
        description: "Schedule has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setStartDate(newDate);
    // Clear existing schedule when date changes
    setSchedule([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Shift Scheduler Pro
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Intelligent workforce scheduling with automated shift assignments and leave management
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Date Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarIcon className="h-4 w-4 text-primary" />
                Month Starting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Schedule will be generated for 30 days starting from this date
              </p>
            </CardContent>
          </Card>

          {/* Schedule Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4 text-primary" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={generateSchedule} 
                disabled={isGenerating || workers.length < 2}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Schedule
                  </>
                )}
              </Button>
              <Button 
                onClick={downloadPDF}
                variant="outline"
                disabled={schedule.length === 0}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users2 className="h-4 w-4 text-primary" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Workers</span>
                <Badge variant="outline">{workers.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Schedule Entries</span>
                <Badge variant="outline">{schedule.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Month Period</span>
                <Badge variant="outline">30 Days</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Worker Management */}
          <div className="xl:col-span-1">
            <WorkerManagement
              workers={workers}
              onAddWorker={handleAddWorker}
              onRemoveWorker={handleRemoveWorker}
            />
          </div>

          {/* Schedule View */}
          <div className="xl:col-span-2">
            <ScheduleView
              schedule={schedule}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>

        {/* Rules Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Scheduling Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Shift Distribution</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• One worker per evening shift (except Sunday)</li>
                  <li>• One worker per night shift (except Sunday)</li>
                  <li>• Sunday: Only one worker in morning shift</li>
                  <li>• Regular days: All others work morning shift</li>
                  <li>• Workers work 5 days per week</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Leave Rules</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Night shift workers get next day off</li>
                  <li>• Saturday night workers get Sunday + Monday off</li>
                  <li>• Sunday night workers get Monday + Tuesday off</li>
                  <li>• Sunday morning/evening workers get Saturday off</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
