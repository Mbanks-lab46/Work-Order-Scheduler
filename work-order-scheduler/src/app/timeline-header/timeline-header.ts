import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type Timescale = 'day' | 'week' | 'month';

@Component({
  selector: 'app-timeline-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-header.html',
  styleUrl: './timeline-header.scss',
})
export class TimelineHeader {
  timescale = input<Timescale>('month');
  timescaleChange = output<Timescale>();

  onChangeTimescale(event: Event) {
    const value = (event.target as HTMLSelectElement).value as Timescale;
    this.timescaleChange.emit(value);
  }
}
