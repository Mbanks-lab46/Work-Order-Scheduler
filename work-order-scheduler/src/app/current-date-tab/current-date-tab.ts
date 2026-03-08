import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type Timescale = 'day' | 'week' | 'month';

export interface TimelineColumn {
  key: string;
  label: string;
  start: Date;
  end: Date;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7;
  return addDays(x, -day);
}


@Component({
  selector: 'app-current-date-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-date-tab.html',
  styleUrl: './current-date-tab.scss',
})
export class CurrentDateTab {
  timescale = input.required<Timescale>();
  columns = input.required<TimelineColumn[]>();
  colWidth = input.required<number>();
  gridWidthPx = input.required<number>();

  today = new Date();

  currentPeriodLabel = computed(() => {
    switch (this.timescale()) {
      case 'day':
        return 'Current day';
      case 'week':
        return 'Current week';
      case 'month':
        return 'Current month';
    }
  });

  currentColumnIndex = computed(() => {
    const today = this.today;
    const ts = this.timescale();
    const cols = this.columns();

    return cols.findIndex(col => {
      if (ts === 'day') {
        return this.isSameDay(today, col.start);
      }

      if (ts === 'week') {
        return startOfWeek(today).getTime() === startOfWeek(col.start).getTime();
      }

      return (
        today.getFullYear() === col.start.getFullYear() &&
        today.getMonth() === col.start.getMonth()
      );
    });
  });

  currentPeriodX = computed(() => {
    const index = this.currentColumnIndex();
    if (index < 0) return null;
    return index * this.colWidth() + this.colWidth() / 2;
  });

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
