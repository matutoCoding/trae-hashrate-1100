import { create } from 'zustand';
import { Donor, DonationRecord } from '@/types/donor';
import { donors as mockDonors } from '@/data/donors';
import { honorLevels } from '@/data/benefits';

interface DonorStore {
  donors: Donor[];
  currentDonor: Donor | null;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  getDonorById: (id: string) => Donor | undefined;
  getFilteredDonors: () => Donor[];
  addDonationRecord: (donorId: string, record: Omit<DonationRecord, 'id' | 'donorId'>) => void;
  getLevelByVolume: (volume: number) => typeof honorLevels[0];
}

export const useDonorStore = create<DonorStore>((set, get) => ({
  donors: mockDonors,
  currentDonor: null,
  searchKeyword: '',

  setSearchKeyword: (keyword: string) => set({ searchKeyword: keyword }),

  getDonorById: (id: string) => {
    return get().donors.find(d => d.id === id);
  },

  getFilteredDonors: () => {
    const { donors, searchKeyword } = get();
    if (!searchKeyword) return donors;
    const kw = searchKeyword.toLowerCase();
    return donors.filter(
      d => d.name.toLowerCase().includes(kw) ||
           d.phone.includes(kw) ||
           d.idCard.includes(kw)
    );
  },

  addDonationRecord: (donorId: string, record: Omit<DonationRecord, 'id' | 'donorId'>) => {
    set(state => {
      const newRecord: DonationRecord = {
        ...record,
        id: `rec-${Date.now()}`,
        donorId
      };
      const donors = state.donors.map(d => {
        if (d.id === donorId) {
          const newTotalVolume = d.totalVolume + record.volume;
          const newLevel = get().getLevelByVolume(newTotalVolume);
          return {
            ...d,
            totalDonations: d.totalDonations + 1,
            totalVolume: newTotalVolume,
            lastDonationDate: record.date,
            levelId: newLevel.id,
            levelName: newLevel.name,
            donationRecords: [...d.donationRecords, newRecord]
          };
        }
        return d;
      });
      console.log('[DonorStore] 献血记录已添加', { donorId, volume: record.volume });
      return { donors };
    });
  },

  getLevelByVolume: (volume: number) => {
    return honorLevels.find(
      level => volume >= level.minVolume && volume <= level.maxVolume
    ) || honorLevels[0];
  }
}));
