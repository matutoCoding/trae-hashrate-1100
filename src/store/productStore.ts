import { create } from 'zustand';
import { BloodProduct, OutboundRecord, BatchSplitForm, ProductStatus } from '@/types/product';
import { bloodProducts as mockProducts } from '@/data/products';

interface ProductStore {
  products: BloodProduct[];
  searchKeyword: string;
  statusFilter: ProductStatus | 'all';
  setSearchKeyword: (keyword: string) => void;
  setStatusFilter: (status: ProductStatus | 'all') => void;
  getProductById: (id: string) => BloodProduct | undefined;
  getFilteredProducts: () => BloodProduct[];
  processBatchOutbound: (form: BatchSplitForm) => void;
  getDepartmentDistribution: (batchId: string) => { department: string; count: number; volume: number }[];
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: mockProducts,
  searchKeyword: '',
  statusFilter: 'all',

  setSearchKeyword: (keyword: string) => set({ searchKeyword: keyword }),

  setStatusFilter: (status) => set({ statusFilter: status }),

  getProductById: (id: string) => {
    return get().products.find(p => p.id === id);
  },

  getFilteredProducts: () => {
    const { products, searchKeyword, statusFilter } = get();
    let result = products;
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(
        p => p.batchNumber.toLowerCase().includes(kw) ||
             p.productType.includes(searchKeyword) ||
             p.bloodType.includes(searchKeyword)
      );
    }
    return result;
  },

  processBatchOutbound: (form: BatchSplitForm) => {
    set(state => {
      const products = state.products.map(p => {
        if (p.id === form.batchId) {
          const outboundRecords: OutboundRecord[] = form.items.map((item, idx) => ({
            id: `out-${Date.now()}-${idx}`,
            batchId: form.batchId,
            bagNumber: item.bagNumber,
            volume: item.volume,
            outboundDate: new Date().toISOString().split('T')[0],
            department: item.department,
            recipient: item.recipient,
            operator: '当前操作员',
            remark: item.remark
          }));

          const totalOutVolume = form.items.reduce((sum, item) => sum + item.volume, 0);
          const totalOutBags = form.items.length;
          const newRemainingVolume = p.remainingVolume - totalOutVolume;
          const newRemainingBags = p.remainingBags - totalOutBags;

          let newStatus: ProductStatus = p.status;
          if (newRemainingBags <= 0) {
            newStatus = '已出库';
          } else if (newRemainingBags < p.totalBags) {
            newStatus = '部分出库';
          }

          console.log('[ProductStore] 批次出库处理完成', {
            batchNumber: p.batchNumber,
            outboundBags: totalOutBags,
            outboundVolume: totalOutVolume,
            remainingBags: newRemainingBags,
            newStatus
          });

          return {
            ...p,
            remainingVolume: newRemainingVolume,
            remainingBags: newRemainingBags,
            status: newStatus,
            outboundRecords: [...p.outboundRecords, ...outboundRecords]
          };
        }
        return p;
      });
      return { products };
    });
  },

  getDepartmentDistribution: (batchId: string) => {
    const product = get().getProductById(batchId);
    if (!product) return [];
    
    const distribution: Record<string, { count: number; volume: number }> = {};
    product.outboundRecords.forEach(record => {
      if (!distribution[record.department]) {
        distribution[record.department] = { count: 0, volume: 0 };
      }
      distribution[record.department].count += 1;
      distribution[record.department].volume += record.volume;
    });
    
    return Object.entries(distribution).map(([department, data]) => ({
      department,
      count: data.count,
      volume: data.volume
    }));
  }
}));
