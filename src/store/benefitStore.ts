import { create } from 'zustand';
import { HonorLevel, LevelChangeRecord, DonorBenefit, BenefitQuota, ChangeType } from '@/types/benefit';
import { honorLevels as mockLevels, levelChangeRecords as mockRecords, donorBenefits as mockBenefits } from '@/data/benefits';
import { useDonorStore } from '@/store/donorStore';

interface BenefitStore {
  honorLevels: HonorLevel[];
  levelChangeRecords: LevelChangeRecord[];
  donorBenefits: DonorBenefit[];

  getLevelById: (id: string) => HonorLevel | undefined;
  getBenefitByDonorId: (donorId: string) => DonorBenefit | undefined;
  calculateCarryOver: (
    fromLevel: HonorLevel,
    toLevel: HonorLevel,
    currentRemaining: BenefitQuota,
    changeType: ChangeType
  ) => {
    newQuota: BenefitQuota;
    clearedAmount: number;
    supplementedAmount: number;
    carryOverDetail: {
      physicalExam: number;
      priorityBlood: number;
      medicalSubsidy: number;
    };
  };
  addLevelChangeRecord: (record: Omit<LevelChangeRecord, 'id'>) => void;
  updateDonorBenefit: (donorId: string, level: HonorLevel, newQuota: BenefitQuota) => void;
  getAllDonorBenefits: () => (DonorBenefit & { totalDonations: number })[];
  donorBenefits: DonorBenefit[];
}

export const useBenefitStore = create<BenefitStore>((set, get) => ({
  honorLevels: mockLevels,
  levelChangeRecords: mockRecords,
  donorBenefits: mockBenefits,

  getLevelById: (id: string) => {
    return get().honorLevels.find(l => l.id === id);
  },

  getBenefitByDonorId: (donorId: string) => {
    return get().donorBenefits.find(b => b.donorId === donorId);
  },

  calculateCarryOver: (fromLevel, toLevel, currentRemaining, changeType) => {
    let newQuota: BenefitQuota;
    let clearedAmount = 0;
    let supplementedAmount = 0;

    if (changeType === 'upgrade') {
      const ratio = (toLevel.quota.physicalExam > 0) ? 
        currentRemaining.physicalExam / fromLevel.quota.physicalExam : 0;
      
      newQuota = {
        physicalExam: Math.max(currentRemaining.physicalExam, Math.floor(toLevel.quota.physicalExam * (ratio || 1))),
        priorityBlood: Math.max(currentRemaining.priorityBlood, Math.floor(toLevel.quota.priorityBlood * (ratio || 1))),
        medicalSubsidy: Math.max(currentRemaining.medicalSubsidy, Math.floor(toLevel.quota.medicalSubsidy * (ratio || 1))),
        otherBenefits: Math.max(currentRemaining.otherBenefits, Math.floor(toLevel.quota.otherBenefits * (ratio || 1)))
      };
      
      supplementedAmount = 
        (newQuota.physicalExam - currentRemaining.physicalExam) * 200 +
        (newQuota.priorityBlood - currentRemaining.priorityBlood) * 300 +
        (newQuota.medicalSubsidy - currentRemaining.medicalSubsidy) +
        (newQuota.otherBenefits - currentRemaining.otherBenefits) * 100;
    } else if (changeType === 'downgrade') {
      newQuota = {
        physicalExam: Math.min(currentRemaining.physicalExam, toLevel.quota.physicalExam),
        priorityBlood: Math.min(currentRemaining.priorityBlood, toLevel.quota.priorityBlood),
        medicalSubsidy: Math.min(currentRemaining.medicalSubsidy, toLevel.quota.medicalSubsidy),
        otherBenefits: Math.min(currentRemaining.otherBenefits, toLevel.quota.otherBenefits)
      };
      
      clearedAmount = 
        (currentRemaining.physicalExam - newQuota.physicalExam) * 200 +
        (currentRemaining.priorityBlood - newQuota.priorityBlood) * 300 +
        (currentRemaining.medicalSubsidy - newQuota.medicalSubsidy) +
        (currentRemaining.otherBenefits - newQuota.otherBenefits) * 100;
    } else {
      newQuota = toLevel.quota;
    }

    return {
      newQuota,
      clearedAmount,
      supplementedAmount,
      carryOverDetail: {
        physicalExam: newQuota.physicalExam,
        priorityBlood: newQuota.priorityBlood,
        medicalSubsidy: newQuota.medicalSubsidy
      }
    };
  },

  addLevelChangeRecord: (record) => {
    set(state => ({
      levelChangeRecords: [
        { ...record, id: `change-${Date.now()}` },
        ...state.levelChangeRecords
      ]
    }));
    console.log('[BenefitStore] 等级变更记录已添加', { donorName: record.donorName, changeType: record.changeType });
  },

  updateDonorBenefit: (donorId, level, newQuota) => {
    set(state => {
      const existing = state.donorBenefits.find(b => b.donorId === donorId);
      if (existing) {
        useDonorStore.getState().updateDonorLevel(donorId, level.id, level.name);
        return {
          donorBenefits: state.donorBenefits.map(b =>
            b.donorId === donorId
              ? {
                  ...b,
                  levelId: level.id,
                  levelName: level.name,
                  currentQuota: newQuota,
                  remainingQuota: newQuota,
                  lastRenewalDate: new Date().toISOString().split('T')[0]
                }
              : b
          )
        };
      }
      return state;
    });
  },

  getAllDonorBenefits: () => {
    const { donorBenefits } = get();
    const donorStore = useDonorStore.getState();
    return donorBenefits.map(benefit => {
      const donor = donorStore.getDonorById(benefit.donorId);
      return {
        ...benefit,
        totalVolume: donor?.totalVolume || benefit.totalVolume,
        totalDonations: donor?.totalDonations || 0
      };
    });
  }
}));
