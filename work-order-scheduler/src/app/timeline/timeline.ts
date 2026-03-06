import { Component, computed, ElementRef, OnInit, signal, ViewChild} from '@angular/core';
import { TimelineHeader, Timescale } from '../timeline-header/timeline-header';
import { WorkOrderPanel, WorkOrderPanelSubmit } from '../work-order-panel/work-order-panel';
import { TimelineStore } from './timeline.store';
import { STATUS_OPTIONS, WorkOrderDocument, WorkOrderStatus } from '../models/work-order.interface';
import { addDays, fromIso, startOfDay, toIso, pad2, startOfWeek, startOfMonth } from '../timeline.utils';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

type LaneOrder = WorkOrderDocument & { lane: number };

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [TimelineHeader, WorkOrderPanel, CommonModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
})
export class Timeline implements OnInit {
  editingOrder = signal<WorkOrderDocument | null>(null);
  prefillStartIso = signal<string>('');
  prefillEndIso = signal<string>('');
  @ViewChild('gridScroll', { static: true }) gridScroll!: ElementRef<HTMLDivElement>;
  @ViewChild('gridHeaderScroll', { static: true }) gridHeaderScroll!: ElementRef<HTMLDivElement>;
  today = startOfDay(new Date());
  timescale = signal<Timescale>('month');
  store = new TimelineStore();
  colWidth = computed(() => {
    switch (this.timescale()) {
      case 'day': return 72;
      case 'week': return 112;
      case 'month': return 128;
    }
  });

  rangeStart = computed(() => {
    const t = this.today;
    switch (this.timescale()) {
      case 'day':   return addDays(t, -14);
      case 'week':  return addDays(startOfWeek(t), -7 * 8);
      case 'month': return new Date(t.getFullYear(), t.getMonth() - 6, 1);
    }
  });

  rangeEnd = computed(() => {
    const t = this.today;
    switch (this.timescale()) {
      case 'day':   return addDays(t, 14);
      case 'week':  return addDays(startOfWeek(t), 7 * 8);
      case 'month': return new Date(t.getFullYear(), t.getMonth() + 6, 1);
    }
  });

  columns = computed(() => {
    const start = this.rangeStart();
    const end = this.rangeEnd();
    const ts = this.timescale();

    const cols: { key: string; label: string; start: Date; end: Date }[] = [];

    if (ts === 'day') {
      for (let d = startOfDay(start); d <= end; d = addDays(d, 1)) {
        cols.push({
          key: toIso(d),
          label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          start: d,
          end: d,
        });
      }
    }

    if (ts === 'week') {
      for (let d = startOfWeek(start); d <= end; d = addDays(d, 7)) {
        const wkEnd = addDays(d, 6);
        cols.push({
          key: `${toIso(d)}_wk`,
          label: `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
          start: d,
          end: wkEnd,
        });
      }
    }

    if (ts === 'month') {
      for (let d = startOfMonth(start); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
        cols.push({
          key: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}_mo`,
          label: d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
          start: d,
          end: new Date(d.getFullYear(), d.getMonth() + 1, 0),
        });
      }
    }

    return cols;
  });

  gridWidthPx = computed(() => this.columns().length * this.colWidth());

  todayX = computed(() => this.dateToX(this.today));

  panelOpen = signal(false);
  mode = signal<'create' | 'edit'>('create');
  activeWorkCenterId = signal<string>('');
  editingId = signal<string | null>(null);
  overlapError = signal<string>('');
  openMenuId = signal<string | null>(null);

  statusOptions = STATUS_OPTIONS;


  ngOnInit(): void {

  }

   onBodyScroll() {
    const left = this.gridScroll.nativeElement.scrollLeft;
    this.gridHeaderScroll.nativeElement.scrollLeft = left;
  }
  onHeaderScroll() {
    const left = this.gridHeaderScroll.nativeElement.scrollLeft;
    this.gridScroll.nativeElement.scrollLeft = left;
  }

  setTimescale(ts: Timescale) {
    this.timescale.set(ts);
    queueMicrotask(() => this.centerOnToday());
  }

  centerOnToday() {
    const container = this.gridScroll.nativeElement;
    const x = this.dateToX(this.today);
    const target = Math.max(0, x - container.clientWidth / 2);
    container.scrollLeft = target;
    this.gridHeaderScroll.nativeElement.scrollLeft = target;
  }


  dateToX(date: Date) {
    const ts = this.timescale();
    const start = this.rangeStart();
    const w = this.colWidth();

    if (ts === 'day') {
      const days = Math.floor((startOfDay(date).getTime() - startOfDay(start).getTime()) / 86400000);
      return days * w;
    }
    if (ts === 'week') {
      const a = startOfWeek(start).getTime();
      const b = startOfWeek(date).getTime();
      const weeks = Math.floor((b - a) / (86400000 * 7));
      return weeks * w;
    }

    const s = startOfMonth(start);
    const m = (date.getFullYear() - s.getFullYear()) * 12 + (date.getMonth() - s.getMonth());
    return m * w;
  }

  xToDate(x: number) {
    const ts = this.timescale();
    const start = this.rangeStart();
    const w = this.colWidth();
    if (ts === 'day') return addDays(startOfDay(start), Math.floor(x / w));
    if (ts === 'week') return addDays(startOfWeek(start), Math.floor(x / w) * 7);
    const s = startOfMonth(start);
    return new Date(s.getFullYear(), s.getMonth() + Math.floor(x / w), 1);
  }

  dateIsoToX(iso: string): number {
    return this.dateToX(fromIso(iso));
  }

  toggleMenu(orderId: string) {
    this.openMenuId.set(this.openMenuId() === orderId ? null : orderId);
  }

  onTimelineClick(ev: MouseEvent, workCenterId: string) {
    const target = ev.target as HTMLElement;
    if (target.closest('.wo-bar') || target.closest('.wo-menu')) return;

    const grid = this.gridScroll.nativeElement.getBoundingClientRect();
    const x = ev.clientX - grid.left + this.gridScroll.nativeElement.scrollLeft;

    const clickedDate = this.xToDate(x);
    const startIso = toIso(clickedDate);
    const endIso = toIso(addDays(clickedDate, 7));

    this.mode.set('create');
    this.activeWorkCenterId.set(workCenterId);
    this.editingOrder.set(null);
    this.prefillStartIso.set(startIso);
    this.prefillEndIso.set(endIso);
    this.overlapError.set('');
    this.panelOpen.set(true);
  }

  editOrder(order: WorkOrderDocument) {
    this.mode.set('edit');
    this.activeWorkCenterId.set(order.data.workCenterId);
    this.editingOrder.set(order);
    this.overlapError.set('');
    this.panelOpen.set(true);
    this.openMenuId.set(null);
  }

  deleteOrder(orderId: string) {
    this.store.delete(orderId);
    this.openMenuId.set(null);
  }

   widthForOrder(startIso: string, endIso: string) {
    const a = fromIso(startIso);
    const b = fromIso(endIso);
    const x1 = this.dateToX(a);
    const x2 = this.dateToX(b);
    const w = this.colWidth();
    return Math.max(w, (x2 - x1) + w);
  }


  handlePanelSubmit(payload: WorkOrderPanelSubmit) {
    this.overlapError.set('');

    if (fromIso(payload.endDate).getTime() < fromIso(payload.startDate).getTime()) {
      this.overlapError.set('End date must be after start date.');
      return;
    }

    const excludeId = payload.docId ?? undefined;

    if (this.store.overlaps(payload.workCenterId, payload.startDate, payload.endDate, excludeId)) {
      this.overlapError.set('This work order overlaps an existing order in the same work center.');
      return;
    }

    if (payload.docId) {
      this.store.update({
        docId: payload.docId,
        docType: 'workOrder',
        data: {
          name: payload.name,
          status: payload.status,
          workCenterId: payload.workCenterId,
          startDate: payload.startDate,
          endDate: payload.endDate,
        },
      });
    } else {
      this.store.create({
        docId: `wo-${crypto.randomUUID()}`,
        docType: 'workOrder',
        data: {
          name: payload.name,
          status: payload.status,
          workCenterId: payload.workCenterId,
          startDate: payload.startDate,
          endDate: payload.endDate,
        },
      });
    }

    this.closePanel();
  }

  closePanel() {
    this.panelOpen.set(false);
    this.editingOrder.set(null);
    this.overlapError.set('');
  }

  toNgb(d: Date): NgbDateStruct { return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }; }
  fromNgb(s: NgbDateStruct): string { return `${s.year}-${pad2(s.month)}-${pad2(s.day)}`; }

  ordersForCenter(workCenterId: string) {
    return this.store.workOrders().filter(o => o.data.workCenterId === workCenterId);
  }

  statusClass(s: WorkOrderStatus) {
    return `status-${s}`;
  }

  ordersWithLanes(workCenterId: string): LaneOrder[] {
    const orders = this.ordersForCenter(workCenterId)
    .slice()
    .sort((a, b) => fromIso(a.data.startDate).getTime() - fromIso(b.data.startDate).getTime());

    const lanes: LaneOrder[][] = [];
    const placed: LaneOrder[] = [];

    const collides = (x: LaneOrder, y: LaneOrder) => {
      const x1 = this.dateIsoToX(x.data.startDate);
      const x2 = x1 + this.widthForOrder(x.data.startDate, x.data.endDate);
      const y1 = this.dateIsoToX(y.data.startDate);
      const y2 = y1 + this.widthForOrder(y.data.startDate, y.data.endDate);

      return x1 <= y2 && x2 >= y1;
    };

    for (const o of orders) {
      let laneIndex = 0;

      while (true) {
        const candidate:LaneOrder = { ...o, lane: laneIndex };
        const lane = lanes[laneIndex] ?? [];

        const hit = lane.some(existing => collides(existing, candidate));

        if (!hit) {
          lanes[laneIndex] = [...lane, candidate];
          placed.push(candidate);
          break;
        }

        laneIndex++;
      }
    }

    return placed;
  }


  laneCount(workCenterId: string): number {
    const items = this.ordersWithLanes(workCenterId);
    return items.length ? Math.max(...items.map(x => x.lane)) + 1 : 1;
  }

}
