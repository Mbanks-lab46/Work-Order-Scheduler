import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class DateFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (!value) return null;

    const parts = value.split('.');
    if (parts.length !== 3) return null;

    return {
      month: +parts[0],
      day: +parts[1],
      year: +parts[2],
    };
  }

  format(date: NgbDateStruct | null): string {
    if (!date) return '';

    const m = String(date.month).padStart(2, '0');
    const d = String(date.day).padStart(2, '0');

    return `${m}.${d}.${date.year}`;
  }
}
