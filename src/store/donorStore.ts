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
            const existingBenefit = benefitStore.getBenefitByDonorId(donorId);

            if (fromLevel && toLevel) {
              const carryOverResult = benefitStore.calculateCarryOver(
                fromLevel,
                toLevel,
                existingBenefit?.remainingQuota || fromLevel.quota,
                'upgrade'
              );

              benefitStore.addLevelChangeRecord({
                donorId: d.id,
                donorName: d.name,
                fromLevelId: oldLevelId,
                fromLevelName: oldLevelName,
                toLevelId: newLevel.id,
                toLevelName: newLevel.name,
                changeType: 'upgrade',
                changeDate: dayjs().format('YYYY-MM-DD'),
                operator: record.operator || '系统',
                reason: `累计献血量达到 ${newTotalVolume}ml，自动升级到 ${newLevel.name}`,
                oldQuota: fromLevel.quota,
                newQuota: toLevel.quota,
                carryOverDetail: {
                  ...carryOverResult.carryOverDetail,
                  clearedAmount: carryOverResult.clearedAmount,
                  supplementedAmount: carryOverResult.supplementedAmount
                }
              });

              if (existingBenefit) {
                benefitStore.updateDonorBenefit(donorId, toLevel, carryOverResult.newQuota);
              } else {
                benefitStore.donorBenefits.push({
                  donorId: d.id,
                  donorName: d.name,
                  levelId: toLevel.id,
                  levelName: toLevel.name,
                  totalVolume: newTotalVolume,
                  currentQuota: carryOverResult.newQuota,
                  usedQuota: { physicalExam: 0, priorityBlood: 0, medicalSubsidy: 0, otherBenefits: 0 },
                  remainingQuota: carryOverResult.newQuota,
                  lastRenewalDate: dayjs().format('YYYY-MM-DD'),
                  effectiveDate: dayjs().format('YYYY-MM-DD'),
                  expiryDate: dayjs().add(1, 'year').format('YYYY-MM-DD')
                });
              }

              console.log('[DonorStore] 献血登记触发自动升级', {
                donorName: d.name,
                from: oldLevelName,
                to: newLevel.name,
                supplementedAmount: carryOverResult.supplementedAmount
              });
            }
          }

          const benefitStore = useBenefitStore.getState();
          const benefit = benefitStore.getBenefitByDonorId(donorId);
          if (benefit) {
            benefitStore.donorBenefits = benefitStore.donorBenefits.map(b =>
              b.donorId === donorId ? { ...b, totalVolume: newTotalVolume } : b
            );
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
