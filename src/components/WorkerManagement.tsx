import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users } from 'lucide-react';
import { Worker } from '@/types/schedule';
import { useToast } from '@/hooks/use-toast';

interface WorkerManagementProps {
  workers: Worker[];
  onAddWorker: (worker: Worker) => void;
  onRemoveWorker: (workerId: string) => void;
}

export function WorkerManagement({ workers, onAddWorker, onRemoveWorker }: WorkerManagementProps) {
  const [newWorkerName, setNewWorkerName] = useState('');
  const { toast } = useToast();

  const handleAddWorker = () => {
    if (!newWorkerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a worker name",
        variant: "destructive",
      });
      return;
    }

    if (workers.some(worker => worker.name.toLowerCase() === newWorkerName.toLowerCase())) {
      toast({
        title: "Error",
        description: "Worker with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const newWorker: Worker = {
      id: Date.now().toString(),
      name: newWorkerName.trim(),
    };

    onAddWorker(newWorker);
    setNewWorkerName('');
    
    toast({
      title: "Success",
      description: `${newWorker.name} has been added to the team`,
    });
  };

  const handleRemoveWorker = (workerId: string, workerName: string) => {
    onRemoveWorker(workerId);
    toast({
      title: "Success",
      description: `${workerName} has been removed from the team`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Worker Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter worker name"
            value={newWorkerName}
            onChange={(e) => setNewWorkerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddWorker()}
            className="flex-1"
          />
          <Button onClick={handleAddWorker} className="px-3">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Team Members ({workers.length})
            </span>
          </div>
          
          {workers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No workers added yet</p>
              <p className="text-sm">Add workers to start creating schedules</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-background">
                      {worker.name}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleRemoveWorker(worker.id, worker.name)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}