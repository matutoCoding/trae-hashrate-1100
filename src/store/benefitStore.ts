import { create } from 'zustand';
import { HonorLevel, LevelChangeRecord, DonorBenefit, BenefitQuota, ChangeType, CarryOverDetail } from '@/types/benefit';
import { honorLevels as mockLevels, levelChangeRecords as mockRecords, donorBenefits as mockBenefits } from '@/data/benefits';
import { useDonorStore } from '@/store/donorStore';
import dayjs from 'dayjs';

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
    remainingQuota: BenefitQuota;
    carryOverDetail: CarryOverDetail;
  };
  addLevelChangeRecord: (record: Omit<LevelChangeRecord, 'id'>) => void;
  updateBenefitTotalVolume: (donorId: string, totalVolume: number) => void;
  upsertDonorBenefit: (donorId: string, donorName: string, level: HonorLevel, remainingQuota: BenefitQuota) => void;
  processLevelChange: (
    donorId: string,
    donorName: string,
    fromLevel: HonorLevel,
    toLevel: HonorLevel,
    changeType: ChangeType,
    operator: string,
    reason: string
  ) => void;
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
    let remainingQuota: BenefitQuota;

    if (changeType === 'upgrade') {
      const ratio = (fromLevel.quota.physicalExam > 0)
        ? currentRemaining.physicalExam / fromLevel.quota.physicalExam
        : 1;
      
      remainingQuota = {
        physicalExam: Math.max(currentRemaining.physicalExam, Math.floor(toLevel.quota.physicalExam * Math.min(ratio, 1))),
        priorityBlood: Math.max(currentRemaining.priorityBlood, Math.floor(toLevel.quota.priorityBlood * Math.min(ratio, 1))),
        medicalSubsidy: Math.max(currentRemaining.medicalSubsidy, Math.floor(toLevel.quota.medicalSubsidy * Math.min(ratio, 1))),
        otherBenefits: Math.max(currentRemaining.otherBenefits, Math.floor(toLevel.quota.otherBenefits * Math.min(ratio, 1)))
      };
    } else if (changeType === 'downgrade') {
      remainingQuota = {
        physicalExam: Math.max(0, Math.min(currentRemaining.physicalExam, toLevel.quota.physicalExam)),
        priorityBlood: Math.max(0, Math.min(currentRemaining.priorityBlood, toLevel.quota.priorityBlood)),
        medicalSubsidy: Math.max(0, Math.min(currentRemaining.medicalSubsidy, toLevel.quota.medicalSubsidy)),
        otherBenefits: Math.max(0, Math.min(currentRemaining.otherBenefits, toLevel.quota.otherBenefits))
      };
    } else {
      remainingQuota = toLevel.quota;
    }

    const carryOverDetail: CarryOverDetail = {
      physicalExam: {
        remaining: remainingQuota.physicalExam,
        diff: remainingQuota.physicalExam - currentRemaining.physicalExam
      },
      priorityBlood: {
        remaining: remainingQuota.priorityBlood,
        diff: remainingQuota.priorityBlood - currentRemaining.priorityBlood
      },
      medicalSubsidy: {
        remaining: remainingQuota.medicalSubsidy,
        diff: remainingQuota.medicalSubsidy - currentRemaining.medicalSubsidy
      },
      otherBenefits: {
        remaining: remainingQuota.otherBenefits,
        diff: remainingQuota.otherBenefits - currentRemaining.otherBenefits
      }
    };

    return {
      remainingQuota,
      carryOverDetail
    };
  },

  addLevelChangeRecord: (record) => {
    set(state => ({
      levelChangeRecords: [
        { ...record, id: `change-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
        ...state.levelChangeRecords
      ]
    }));
    console.log('[BenefitStore] 等级变更记录已添加', { donorName: record.donorName, changeType: record.changeType });
  },

  updateBenefitTotalVolume: (donorId, totalVolume) => {
    set(state => ({
      donorBenefits: state.donorBenefits.map(b =>
        b.donorId === donorId ? { ...b, totalVolume } : b
      )
    }));
  },

  upsertDonorBenefit: (donorId, donorName, level, remainingQuota) => {
    set(state => {
      const existing = state.donorBenefits.find(b => b.donorId === donorId);
      useDonorStore.getState().updateDonorLevel(donorId, level.id, level.name);

      const currentQuota = level.quota;
      const usedQuota: BenefitQuota = {
        physicalExam: Math.max(0, currentQuota.physicalExam - remainingQuota.physicalExam),
        priorityBlood: Math.max(0, currentQuota.priorityBlood - remainingQuota.priorityBlood),
        medicalSubsidy: Math.max(0, currentQuota.medicalSubsidy - remainingQuota.medicalSubsidy),
        otherBenefits: Math.max(0, currentQuota.otherBenefits - remainingQuota.otherBenefits)
      };

      const donorStore = useDonorStore.getState();
      const donor = donorStore.getDonorById(donorId);
      const totalVolume = donor?.totalVolume || 0;

      if (existing) {
        return {
          donorBenefits: state.donorBenefits.map(b =>
            b.donorId === donorId
              ? {
                  ...b,
                  levelId: level.id,
                  levelName: level.name,
                  totalVolume,
                  currentQuota,
                  usedQuota,
                  remainingQuota,
                  lastRenewalDate: dayjs().format('YYYY-MM-DD')
                }
              : b
          )
        };
      } else {
        const newBenefit: DonorBenefit = {
          donorId,
          donorName,
          levelId: level.id,
          levelName: level.name,
          totalVolume,
          currentQuota,
          usedQuota,
          remainingQuota,
          lastRenewalDate: dayjs().format('YYYY-MM-DD'),
          effectiveDate: dayjs().format('YYYY-MM-DD'),
          expiryDate: dayjs().add(1, 'year').format('YYYY-MM-DD')
        };
        return {
          donorBenefits: [...state.donorBenefits, newBenefit]
        };
      }
    });
  },

  processLevelChange: (donorId, donorName, fromLevel, toLevel, changeType, operator, reason) => {
    const existing = get().getBenefitByDonorId(donorId);
    const currentRemaining = existing?.remainingQuota || fromLevel.quota;
    
    const carryOverResult = get().calculateCarryOver(fromLevel, toLevel, currentRemaining, changeType);

    get().addLevelChangeRecord({
      donorId,
      donorName,
      fromLevelId: fromLevel.id,
      fromLevelName: fromLevel.name,
      toLevelId: toLevel.id,
      toLevelName: toLevel.name,
      changeType,
      changeDate: dayjs().format('YYYY-MM-DD'),
      operator,
      reason,
      oldQuota: fromLevel.quota,
      newQuota: toLevel.quota,
      carryOverDetail: carryOverResult.carryOverDetail
    });

    get().upsertDonorBenefit(donorId, donorName, toLevel, carryOverResult.remainingQuota);

    console.log('[BenefitStore] 等级变更处理完成', {
      donorName,
      from: fromLevel.name,
      to: toLevel.name,
      changeType,
      carryOverDetail: carryOverResult.carryOverDetail
    });
  }
}));
