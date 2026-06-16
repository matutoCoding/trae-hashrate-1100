import { create } from 'zustand';
import { Donor, DonationRecord } from '@/types/donor';
import { donors as mockDonors } from '@/data/donors';
import { honorLevels } from '@/data/benefits';
import { useBenefitStore } from '@/store/benefitStore';
import dayjs from 'dayjs';

interface DonorStore {
  donors: Donor[];
  currentDonor: Donor | null;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  getDonorById: (id: string) => Donor | undefined;
  getFilteredDonors: () => Donor[];
  addDonationRecord: (donorId: string, record: Omit<DonationRecord, 'id' | 'donorId'>) => void;
  getLevelByVolume: (volume: number) => typeof honorLevels[0];
  updateDonorLevel: (donorId: string, levelId: string, levelName: string) => void;
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
          const oldLevelId = d.levelId;
          const oldLevelName = d.levelName;
          const newTotalVolume = d.totalVolume + record.volume;
          const newLevel = get().getLevelByVolume(newTotalVolume);

          if (newLevel.id !== oldLevelId && newLevel.rank > (honorLevels.find(l => l.id === oldLevelId)?.rank || 0)) {
            const benefitStore = useBenefitStore.getState();
            const fromLevel = honorLevels.find(l => l.id === oldLevelId);
            const toLevel = newLevel;

            if (fromLevel && toLevel) {
              benefitStore.processLevelChange(
                d.id,
                d.name,
                fromLevel,
                toLevel,
                'upgrade',
                record.operator || '系统',
                `累计献血量达到 ${newTotalVolume}ml，自动升级到 ${newLevel.name}`
              );
            }
          } else {
            const benefitStore = useBenefitStore.getState();
            const benefit = benefitStore.getBenefitByDonorId(donorId);
            if (benefit) {
              benefitStore.updateBenefitTotalVolume(donorId, newTotalVolume);
            }
          }

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

  updateDonorLevel: (donorId: string, levelId: string, levelName: string) => {
    set(state => ({
      donors: state.donors.map(d =>
        d.id === donorId ? { ...d, levelId, levelName } : d
      )
    }));
    console.log('[DonorStore] 献血者等级已更新', { donorId, levelName });
  },

  getLevelByVolume: (volume: number) => {
    return honorLevels.find(
      level => volume >= level.minVolume && volume <= level.maxVolume
    ) || honorLevels[0];
  }
}));
