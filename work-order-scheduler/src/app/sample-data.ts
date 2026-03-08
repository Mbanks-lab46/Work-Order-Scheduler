import { WorkCenterDocument, WorkOrderDocument } from './models/work-order.interface';

export const WORK_CENTERS: WorkCenterDocument[] = [
  { docId: 'wc-extrusion-a', docType: 'workCenter', data: { name: 'Extrusion Line A' } },
  { docId: 'wc-cnc-1', docType: 'workCenter', data: { name: 'CNC Machine 1' } },
  { docId: 'wc-assembly', docType: 'workCenter', data: { name: 'Assembly Station' } },
  { docId: 'wc-quality', docType: 'workCenter', data: { name: 'Quality Control' } },
  { docId: 'wc-packaging', docType: 'workCenter', data: { name: 'Packaging Line' } },
];

export const WORK_ORDERS: WorkOrderDocument[] = [

  {
    docId: 'wo-001',
    docType: 'workOrder',
    data: {
      name: 'Order 1001',
      workCenterId: 'wc-extrusion-a',
      status: 'open',
      startDate: '2026-02-22',
      endDate: '2026-06-01'
    }
  },
  {
    docId: 'wo-002',
    docType: 'workOrder',
    data: {
      name: 'Order 1002',
      workCenterId: 'wc-extrusion-a',
      status: 'in-progress',
      startDate: '2026-03-03',
      endDate: '2026-03-10'
    }
  },
  {
    docId: 'wo-009',
    docType: 'workOrder',
    data: {
      name: 'Aluminum Batch',
      workCenterId: 'wc-extrusion-a',
      status: 'complete',
      startDate: '2026-01-15',
      endDate: '2026-02-05'
    }
  },

  {
    docId: 'wo-003',
    docType: 'workOrder',
    data: {
      name: 'Order 2001',
      workCenterId: 'wc-cnc-1',
      status: 'complete',
      startDate: '2026-02-15',
      endDate: '2026-02-20'
    }
  },
  {
    docId: 'wo-010',
    docType: 'workOrder',
    data: {
      name: 'Maintenance',
      workCenterId: 'wc-cnc-1',
      status: 'blocked',
      startDate: '2026-03-11',
      endDate: '2026-03-14'
    }
  },
  {
    docId: 'wo-011',
    docType: 'workOrder',
    data: {
      name: 'Gear Housing',
      workCenterId: 'wc-cnc-1',
      status: 'in-progress',
      startDate: '2026-03-20',
      endDate: '2026-04-10'
    }
  },

  {
    docId: 'wo-004',
    docType: 'workOrder',
    data: {
      name: 'Order 3001',
      workCenterId: 'wc-assembly',
      status: 'in-progress',
      startDate: '2026-02-28',
      endDate: '2026-03-15'
    }
  },
  {
    docId: 'wo-007',
    docType: 'workOrder',
    data: {
      name: 'Order 3002',
      workCenterId: 'wc-assembly',
      status: 'open',
      startDate: '2026-03-17',
      endDate: '2026-03-22'
    }
  },
  {
    docId: 'wo-012',
    docType: 'workOrder',
    data: {
      name: 'Complex Systems',
      workCenterId: 'wc-assembly',
      status: 'in-progress',
      startDate: '2026-03-05',
      endDate: '2026-04-20'
    }
  },

  {
    docId: 'wo-005',
    docType: 'workOrder',
    data: {
      name: 'QC Batch 42',
      workCenterId: 'wc-quality',
      status: 'blocked',
      startDate: '2026-03-05',
      endDate: '2026-03-25'
    }
  },
  {
    docId: 'wo-013',
    docType: 'workOrder',
    data: {
      name: 'Inspection Lot 7',
      workCenterId: 'wc-quality',
      status: 'complete',
      startDate: '2026-02-10',
      endDate: '2026-02-18'
    }
  },

  {
    docId: 'wo-006',
    docType: 'workOrder',
    data: {
      name: 'Packaging Run A',
      workCenterId: 'wc-packaging',
      status: 'open',
      startDate: '2026-03-08',
      endDate: '2026-03-12'
    }
  },
  {
    docId: 'wo-014',
    docType: 'workOrder',
    data: {
      name: 'Damaged Packages',
      workCenterId: 'wc-packaging',
      status: 'open',
      startDate: '2026-03-10',
      endDate: '2026-03-28'
    }
  },
  {
    docId: 'wo-015',
    docType: 'workOrder',
    data: {
      name: 'Shipment Prep',
      workCenterId: 'wc-packaging',
      status: 'in-progress',
      startDate: '2026-03-22',
      endDate: '2026-04-02'
    }
  }

];