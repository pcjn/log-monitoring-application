import { Component } from '@angular/core';

@Component({
  selector: 'app-events-view',
  templateUrl: './events-view.component.html',
  styleUrls: ['./events-view.component.css']
})
export class EventsViewComponent {
  applicationTitle = 'Events Monitoring Application';
  noFileMessage = 'Please upload a .log file.';
  tableColumns: string[] = ['taskName', 'startTime', 'endTime', 'duration', 'status'];
  logs: Task[] = [];

  constructor() {}

  public onFileUpload(event: any): void {
    const file = event.target.files[0];

    if (file) {
      // check file extension
      const allowedExtensions = ['log'];
      const fileExtension = file?.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        alert('Invalid file type. Only .log files are allowed.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target as FileReader).result as string;
        this.processLogFile(text);
      };
      reader.readAsText(file);
      event.target.files = null;
    }
  }

  /**
   * Processes the stream data for the log file.
   * @param data - information from the uploaded file
   *
   */
  public processLogFile(data: string): void {
    const lines = data.split('\n');
    const tasks = new Map<string, { start: string; end?: string }>();

    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length < 4) {
        return;
      }

      const [time, id, event] = parts;
      const taskId = id.trim();
      // check the process  (start/end) and make the association by id
      if (event.trim() === 'START') {
        tasks.set(taskId, { start: time.trim() });
      } else if (event.trim() === 'END' && tasks.has(taskId)) {
        tasks.get(taskId).end = time.trim();
      }
    });

    this.logs = [];
    // calculate duration and assign status
    tasks.forEach(({ start, end }, taskName) => {
      if (end) {
        const duration = this.calculateDuration(start, end);
        let status = '';
        status = duration > 10 ? 'error' : duration > 5 ? 'warning' : '';
        this.logs.push({ taskName, startTime: start, endTime: end, duration, status });
      }
    });
  }

  private getWarningTasks(): Task[] {
    return this.logs.filter((task: Task) => task.status === 'warning' || task.status === 'error')
      .map((log: Task) => ({
        taskName: log.taskName,
        startTime: log.startTime,
        endTime: log.endTime,
        duration: log.duration,
        status: log.status
      }));
  }

  // Export warning tasks to CSV
  public exportAnomalyTasks(): void {
    const warningTasks = this.getWarningTasks();
    if (warningTasks.length === 0) {
      alert('No anomaly tasks found.');
      return;
    }

    let csvContent = 'Task Name,Start Time,End Time,Duration (min), Status\n';
    warningTasks.forEach(task => {
      csvContent += `${task.taskName},${task.startTime},${task.endTime},${task.duration},${task.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'anomaly_tasks.csv';
    a.click();
  }

  private calculateDuration(startTime: string, endTime: string): number {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    return end - start;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  public isLogs(): boolean {
    return this.logs.length > 0;
  }
}

interface Task {
  taskName: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
}
