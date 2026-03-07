import { Component, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDateParserFormatter, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { WorkOrderDocument, WorkOrderStatus } from '../models/work-order.interface';
import { DateFormatter } from '../date-formatter';

export interface WorkOrderPanelSubmit {
  docId?: string;
  workCenterId: string;
  name: string;
  status: WorkOrderStatus;
  startDate: string;
  endDate: string;
}

function pad2(n: number) { return String(n).padStart(2, '0'); }

function isoFromNgb(d: NgbDateStruct) { return `${d.year}-${pad2(d.month)}-${pad2(d.day)}`; }

function ngbFromIso(iso: string): NgbDateStruct {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m, day: d };
}


@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbDatepickerModule, NgSelectModule],
  templateUrl: './work-order-panel.html',
  styleUrl: './work-order-panel.scss',
  providers: [
    { provide: NgbDateParserFormatter, useClass: DateFormatter }
  ]
})
export class WorkOrderPanel {
  open = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  workCenterId = input<string>('');
  statusOptions = input<{ value: WorkOrderStatus; label: string }[]>([
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'complete', label: 'Complete' },
    { value: 'blocked', label: 'Blocked' }
  ]);
  editingOrder = input<WorkOrderDocument | null>(null);
  prefillStartIso = input<string>('');
  prefillEndIso = input<string>('');
  error = input<string>('');
  close = output<void>();
  submit = output<WorkOrderPanelSubmit>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      name: ['', Validators.required],
      status: ['open' as WorkOrderStatus, Validators.required],
      startDate: this.fb.nonNullable.control<NgbDateStruct>({ year: 2025, month: 1, day: 1 }, Validators.required),
      endDate: this.fb.nonNullable.control<NgbDateStruct>({ year: 2025, month: 1, day: 8 }, Validators.required),
    });

    effect(() => {
      if (!this.open()) return;

      if (this.mode() === 'edit' && this.editingOrder()) {
        const order = this.editingOrder()!;
        this.form.reset({
          name: order.data.name,
          status: order.data.status,
          startDate: ngbFromIso(order.data.startDate),
          endDate: ngbFromIso(order.data.endDate),
        });
        return;
      }

      if (this.prefillStartIso() && this.prefillEndIso()) {
        this.form.reset({
          name: '',
          status: 'open',
          startDate: ngbFromIso(this.prefillStartIso()),
          endDate: ngbFromIso(this.prefillEndIso()),
        });
      }
    });
  }

  ngOnInit(): void {
    
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, status, startDate, endDate } = this.form.getRawValue();

    this.submit.emit({
      docId: this.mode() === 'edit' ? this.editingOrder()?.docId : undefined,
      workCenterId: this.workCenterId(),
      name,
      status,
      startDate: isoFromNgb(startDate),
      endDate: isoFromNgb(endDate),
    });
  }

}
