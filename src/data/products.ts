import { BloodProduct } from '@/types/product';

export const bloodProducts: BloodProduct[] = [
  {
    id: 'prod-1',
    batchNumber: 'BATCH-2026-0601-001',
    productType: '红细胞',
    bloodType: 'A',
    totalVolume: 4000,
    totalBags: 10,
    remainingVolume: 2400,
    remainingBags: 6,
    productionDate: '2026-06-01',
    expiryDate: '2026-07-12',
    status: '部分出库',
    sourceStation: '市中心血站',
    storageLocation: '冷藏库A区-03',
    remark: '正常库存',
    outboundRecords: [
      { id: 'out-1-1', batchId: 'prod-1', bagNumber: 'A001', volume: 400, outboundDate: '2026-06-05', department: '心内科', recipient: '患者1', operator: '李护士', remark: '手术备用' },
      { id: 'out-1-2', batchId: 'prod-1', bagNumber: 'A002', volume: 400, outboundDate: '2026-06-05', department: '心内科', recipient: '患者1', operator: '李护士', remark: '手术备用' },
      { id: 'out-1-3', batchId: 'prod-1', bagNumber: 'A003', volume: 400, outboundDate: '2026-06-08', department: '急诊科', recipient: '患者2', operator: '王护士', remark: '急救输血' },
      { id: 'out-1-4', batchId: 'prod-1', bagNumber: 'A004', volume: 400, outboundDate: '2026-06-10', department: '普外科', recipient: '患者3', operator: '张护士', remark: '术中输血' }
    ]
  },
  {
    id: 'prod-2',
    batchNumber: 'BATCH-2026-0605-002',
    productType: '血小板',
    bloodType: 'O',
    totalVolume: 2000,
    totalBags: 10,
    remainingVolume: 2000,
    remainingBags: 10,
    productionDate: '2026-06-05',
    expiryDate: '2026-06-10',
    status: '在库',
    sourceStation: '市中心血站',
    storageLocation: '冷藏库B区-01',
    remark: '急需出库，即将过期',
    outboundRecords: []
  },
  {
    id: 'prod-3',
    batchNumber: 'BATCH-2026-0520-003',
    productType: '血浆',
    bloodType: 'B',
    totalVolume: 8000,
    totalBags: 20,
    remainingVolume: 0,
    remainingBags: 0,
    productionDate: '2026-05-20',
    expiryDate: '2027-05-20',
    status: '已出库',
    sourceStation: '市中心血站',
    storageLocation: '冷冻库A区-05',
    remark: '已全部发放完毕',
    outboundRecords: [
      { id: 'out-3-1', batchId: 'prod-3', bagNumber: 'P001', volume: 400, outboundDate: '2026-05-22', department: '血液科', recipient: '患者4', operator: '李护士', remark: '常规治疗' },
      { id: 'out-3-2', batchId: 'prod-3', bagNumber: 'P002', volume: 400, outboundDate: '2026-05-22', department: '血液科', recipient: '患者4', operator: '李护士', remark: '常规治疗' },
      { id: 'out-3-3', batchId: 'prod-3', bagNumber: 'P003', volume: 400, outboundDate: '2026-05-25', department: 'ICU', recipient: '患者5', operator: '王护士', remark: '重症救治' },
      { id: 'out-3-4', batchId: 'prod-3', bagNumber: 'P004', volume: 400, outboundDate: '2026-05-28', department: '外科', recipient: '患者6', operator: '张护士', remark: '术中使用' }
    ]
  },
  {
    id: 'prod-4',
    batchNumber: 'BATCH-2026-0610-004',
    productType: '全血',
    bloodType: 'AB',
    totalVolume: 3200,
    totalBags: 8,
    remainingVolume: 2800,
    remainingBags: 7,
    productionDate: '2026-06-10',
    expiryDate: '2026-06-31',
    status: '部分出库',
    sourceStation: '市中心血站',
    storageLocation: '冷藏库A区-01',
    remark: '稀有血型，需重点关注',
    outboundRecords: [
      { id: 'out-4-1', batchId: 'prod-4', bagNumber: 'W001', volume: 400, outboundDate: '2026-06-12', department: '急诊科', recipient: '患者7', operator: '李护士', remark: '稀有血型急救' }
    ]
  },
  {
    id: 'prod-5',
    batchNumber: 'BATCH-2026-0612-005',
    productType: '冷沉淀',
    bloodType: 'A',
    totalVolume: 1000,
    totalBags: 10,
    remainingVolume: 1000,
    remainingBags: 10,
    productionDate: '2026-06-12',
    expiryDate: '2027-06-12',
    status: '在库',
    sourceStation: '市中心血站',
    storageLocation: '冷冻库B区-02',
    remark: '正常库存',
    outboundRecords: []
  },
  {
    id: 'prod-6',
    batchNumber: 'BATCH-2026-0515-006',
    productType: '红细胞',
    bloodType: 'O',
    totalVolume: 5000,
    totalBags: 12,
    remainingVolume: 0,
    remainingBags: 0,
    productionDate: '2026-05-15',
    expiryDate: '2026-06-26',
    status: '已出库',
    sourceStation: '市中心血站',
    storageLocation: '冷藏库A区-02',
    remark: '已全部发放',
    outboundRecords: [
      { id: 'out-6-1', batchId: 'prod-6', bagNumber: 'R001', volume: 400, outboundDate: '2026-05-18', department: '骨科', recipient: '患者8', operator: '王护士', remark: '大手术备血' },
      { id: 'out-6-2', batchId: 'prod-6', bagNumber: 'R002', volume: 400, outboundDate: '2026-05-20', department: '产科', recipient: '患者9', operator: '张护士', remark: '产后出血' }
    ]
  }
];
