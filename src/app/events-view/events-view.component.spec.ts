import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventsViewComponent } from './events-view.component';

describe('EventsViewComponent', () => {
  let component: EventsViewComponent;
  let fixture: ComponentFixture<EventsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should add only logs with start & end', () => {
    const logData = '11:35:23,Job 001,START,37980';
    component.processLogFile(logData);

    expect(component.logs.length).toBe(0);
  });

  it('should correctly parse a START and END log entry', () => {
    const logData = '11:35:23,JOB 001,START,37980\n11:40:45,JOB 001,END,5000';
    component.processLogFile(logData);

    expect(component.logs[0].startTime).toBe('11:35:23');
    expect(component.logs[0].endTime).toBe('11:40:45');
    expect(component.logs[0].duration).toBe(5);
  });

  it('should ignore invalid log entries', () => {
    const logData = 'NULL';
    component.processLogFile(logData);

    expect(component.logs.length).toBe(0);
  });
});
