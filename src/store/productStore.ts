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
    const product = get().getProductById(form.batchId);
    if (!product) {
      throw new Error('批次不存在');
    }

    if (form.items.length === 0) {
      throw new Error('出库项不能为空');
    }

    if (form.items.length > product.remainingBags) {
      throw new Error(`出库袋数(${form.items.length})超过剩余袋数(${product.remainingBags})`);
    }

    const totalOutVolume = form.items.reduce((sum, item) => sum + item.volume, 0);
    if (totalOutVolume <= 0) {
      throw new Error('出库总体积必须大于0');
    }
    if (totalOutVolume > product.remainingVolume) {
      throw new Error(`出库总体积(${totalOutVolume}ml)超过剩余体积(${product.remainingVolume}ml)`);
    }

    for (const item of form.items) {
      if (!item.bagNumber || !item.bagNumber.trim()) {
        throw new Error('袋编号不能为空');
      }
      if (!item.volume || item.volume <= 0) {
        throw new Error(`袋(${item.bagNumber})体积必须大于0`);
      }
      if (item.volume > product.remainingVolume) {
        throw new Error(`袋(${item.bagNumber})体积(${item.volume}ml)超过批次剩余体积`);
      }
      if (!item.department || !item.department.trim()) {
        throw new Error(`袋(${item.bagNumber})科室不能为空`);
      }
      if (!item.recipient || !item.recipient.trim()) {
        throw new Error(`袋(${item.bagNumber})受血者不能为空`);
      }
    }

    set(state => {
      const products = state.products.map(p => {
        if (p.id === form.batchId) {
          const now = new Date().toISOString().split('T')[0];
          const outboundRecords: OutboundRecord[] = form.items.map((item, idx) => {
            const finalRemark = [
              form.outboundRemark,
              item.remark
            ].filter(Boolean).join(' | ');

            return {
              id: `out-${Date.now()}-${idx}`,
              batchId: form.batchId,
              bagNumber: item.bagNumber,
              volume: item.volume,
              outboundDate: now,
              department: item.department,
              recipient: item.recipient,
              operator: form.operator || '系统',
              remark: finalRemark
            };
          });

          const newRemainingVolume = p.remainingVolume - totalOutVolume;
          const newRemainingBags = p.remainingBags - form.items.length;

          if (newRemainingVolume < 0 || newRemainingBags < 0) {
            console.error('[ProductStore] 库存计算异常，拒绝出库', {
              newRemainingVolume,
              newRemainingBags
            });
            return p;
          }

          let newStatus: ProductStatus = p.status;
          if (newRemainingBags <= 0) {
            newStatus = '已出库';
          } else if (newRemainingBags < p.totalBags) {
            newStatus = '部分出库';
          }

          console.log('[ProductStore] 批次出库处理完成', {
            batchNumber: p.batchNumber,
            outboundBags: form.items.length,
            outboundVolume: totalOutVolume,
            remainingBags: newRemainingBags,
            remainingVolume: newRemainingVolume,
            operator: form.operator,
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
