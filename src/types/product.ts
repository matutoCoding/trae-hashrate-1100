export type ProductType = '全血' | '红细胞' | '血小板' | '血浆' | '冷沉淀';

export type ProductStatus = '在库' | '部分出库' | '已出库' | '已过期';

export interface OutboundRecord {
  id: string;
  batchId: string;
  bagNumber: string;
  volume: number;
  outboundDate: string;
  department: string;
  recipient: string;
  operator: string;
  remark: string;
}

export interface BloodProduct {
  id: string;
  batchNumber: string;
  productType: ProductType;
  bloodType: string;
  totalVolume: number;
  totalBags: number;
  remainingVolume: number;
  remainingBags: number;
  productionDate: string;
  expiryDate: string;
  status: ProductStatus;
  sourceStation: string;
  storageLocation: string;
  remark: string;
  outboundRecords: OutboundRecord[];
}

export interface BatchSplitForm {
  batchId: string;
  operator: string;
  outboundRemark: string;
  items: {
    bagNumber: string;
    volume: number;
    department: string;
    recipient: string;
    remark: string;
  }[];
}
