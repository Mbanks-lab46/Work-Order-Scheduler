import { Injectable, signal, computed } from '@angular/core';
import { WORK_CENTERS, WORK_ORDERS } from '../sample-data';
import { WorkCenterDocument, WorkOrderDocument } from '../models/work-order.interface';

const LS_KEY = 'timeline_work_orders_v1';

function toDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function startOfDay(dt: Date) {
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

@Injectable({ providedIn: 'root' })
export class TimelineStore {
  workCenters = signal<WorkCenterDocument[]>(WORK_CENTERS);

  private _orders = signal<WorkOrderDocument[]>(this.loadOrders());
  workOrders = computed(() => this._orders());

  setOrders(next: WorkOrderDocument[]) {
    this._orders.set(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }

  create(order: WorkOrderDocument) {
    this.setOrders([...this._orders(), order]);
  }

  update(order: WorkOrderDocument) {
    this.setOrders(this._orders().map(o => (o.docId === order.docId ? order : o)));
  }

  delete(docId: string) {
    this.setOrders(this._orders().filter(o => o.docId !== docId));
  }

  overlaps(workCenterId: string, startIso: string, endIso: string, excludeId?: string): boolean {
    const start = startOfDay(toDate(startIso)).getTime();
    const end = startOfDay(toDate(endIso)).getTime();

    return this._orders().some(o => {
      if (o.data.workCenterId !== workCenterId) return false;
      if (excludeId && o.docId === excludeId) return false;

      const a = startOfDay(toDate(o.data.startDate)).getTime();
      const b = startOfDay(toDate(o.data.endDate)).getTime();

      return start <= b && end >= a;
    });
  }

  private loadOrders(): WorkOrderDocument[] {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return WORK_ORDERS;
    try { return JSON.parse(raw) as WorkOrderDocument[]; }
    catch { return WORK_ORDERS; }
  }
}