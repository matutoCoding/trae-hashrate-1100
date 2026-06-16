import { HonorLevel, LevelChangeRecord, DonorBenefit, CarryOverDetail } from '@/types/benefit';

export const honorLevels: HonorLevel[] = [
  {
    id: 'level-1',
    name: '普通献血者',
    minVolume: 0,
    maxVolume: 999,
    rank: 1,
    color: '#9E9E9E',
    quota: {
      physicalExam: 0,
      priorityBlood: 0,
      medicalSubsidy: 0,
      otherBenefits: 0
    },
    description: '初次献血者，累计献血量不足1000ml'
  },
  {
    id: 'level-2',
    name: '铜级奉献者',
    minVolume: 1000,
    maxVolume: 1999,
    rank: 2,
    color: '#CD7F32',
    quota: {
      physicalExam: 1,
      priorityBlood: 1,
      medicalSubsidy: 200,
      otherBenefits: 1
    },
    description: '累计献血量1000-1999ml，享受基础权益'
  },
  {
    id: 'level-3',
    name: '银级奉献者',
    minVolume: 2000,
    maxVolume: 3999,
    rank: 3,
    color: '#A8A8A8',
    quota: {
      physicalExam: 2,
      priorityBlood: 2,
      medicalSubsidy: 500,
      otherBenefits: 2
    },
    description: '累计献血量2000-3999ml，享受进阶权益'
  },
  {
    id: 'level-4',
    name: '金级奉献者',
    minVolume: 4000,
    maxVolume: 5999,
    rank: 4,
    color: '#FFB300',
    quota: {
      physicalExam: 3,
      priorityBlood: 3,
      medicalSubsidy: 1000,
      otherBenefits: 3
    },
    description: '累计献血量4000-5999ml，享受优质权益'
  },
  {
    id: 'level-5',
    name: '铂金奉献者',
    minVolume: 6000,
    maxVolume: 7999,
    rank: 5,
    color: '#64B5F6',
    quota: {
      physicalExam: 4,
      priorityBlood: 5,
      medicalSubsidy: 1500,
      otherBenefits: 4
    },
    description: '累计献血量6000-7999ml，享受高级权益'
  },
  {
    id: 'level-6',
    name: '钻石奉献者',
    minVolume: 8000,
    maxVolume: 999999,
    rank: 6,
    color: '#AB47BC',
    quota: {
      physicalExam: 6,
      priorityBlood: 8,
      medicalSubsidy: 3000,
      otherBenefits: 6
    },
    description: '累计献血量8000ml以上，享受最高级别权益'
  }
];

export const levelChangeRecords: LevelChangeRecord[] = [
  {
    id: 'change-1',
    donorId: 'donor-1',
    donorName: '张伟',
    fromLevelId: 'level-2',
    fromLevelName: '铜级奉献者',
    toLevelId: 'level-3',
    toLevelName: '银级奉献者',
    changeType: 'upgrade',
    changeDate: '2026-05-15',
    operator: '李护士',
    reason: '累计献血量达到2000ml，自动升级',
    oldQuota: { physicalExam: 1, priorityBlood: 1, medicalSubsidy: 200, otherBenefits: 1 },
    newQuota: { physicalExam: 2, priorityBlood: 2, medicalSubsidy: 500, otherBenefits: 2 },
    carryOverDetail: {
      physicalExam: { remaining: 1, diff: 0 },
      priorityBlood: { remaining: 1, diff: 0 },
      medicalSubsidy: { remaining: 200, diff: 0 },
      otherBenefits: { remaining: 1, diff: 0 }
    }
  },
  {
    id: 'change-2',
    donorId: 'donor-3',
    donorName: '王芳',
    fromLevelId: 'level-3',
    fromLevelName: '银级奉献者',
    toLevelId: 'level-4',
    toLevelName: '金级奉献者',
    changeType: 'upgrade',
    changeDate: '2026-06-01',
    operator: '王医生',
    reason: '累计献血量达到4000ml，自动升级',
    oldQuota: { physicalExam: 2, priorityBlood: 2, medicalSubsidy: 500, otherBenefits: 2 },
    newQuota: { physicalExam: 3, priorityBlood: 3, medicalSubsidy: 1000, otherBenefits: 3 },
    carryOverDetail: {
      physicalExam: { remaining: 1, diff: -1 },
      priorityBlood: { remaining: 0, diff: -2 },
      medicalSubsidy: { remaining: 300, diff: -200 },
      otherBenefits: { remaining: 1, diff: -1 }
    }
  },
  {
    id: 'change-3',
    donorId: 'donor-5',
    donorName: '刘强',
    fromLevelId: 'level-4',
    fromLevelName: '金级奉献者',
    toLevelId: 'level-3',
    toLevelName: '银级奉献者',
    changeType: 'downgrade',
    changeDate: '2026-04-20',
    operator: '张主任',
    reason: '年度复审，权益额度调整降级',
    oldQuota: { physicalExam: 3, priorityBlood: 3, medicalSubsidy: 1000, otherBenefits: 3 },
    newQuota: { physicalExam: 2, priorityBlood: 2, medicalSubsidy: 500, otherBenefits: 2 },
    carryOverDetail: {
      physicalExam: { remaining: 2, diff: -1 },
      priorityBlood: { remaining: 2, diff: -1 },
      medicalSubsidy: { remaining: 500, diff: -500 },
      otherBenefits: { remaining: 2, diff: -1 }
    }
  }
];

export const donorBenefits: DonorBenefit[] = [
  {
    donorId: 'donor-1',
    donorName: '张伟',
    levelId: 'level-3',
    levelName: '银级奉献者',
    totalVolume: 2400,
    currentQuota: { physicalExam: 2, priorityBlood: 2, medicalSubsidy: 500, otherBenefits: 2 },
    usedQuota: { physicalExam: 1, priorityBlood: 0, medicalSubsidy: 200, otherBenefits: 1 },
    remainingQuota: { physicalExam: 1, priorityBlood: 2, medicalSubsidy: 300, otherBenefits: 1 },
    lastRenewalDate: '2026-01-01',
    effectiveDate: '2026-01-01',
    expiryDate: '2026-12-31'
  },
  {
    donorId: 'donor-2',
    donorName: '李娜',
    levelId: 'level-4',
    levelName: '金级奉献者',
    totalVolume: 4800,
    currentQuota: { physicalExam: 3, priorityBlood: 3, medicalSubsidy: 1000, otherBenefits: 3 },
    usedQuota: { physicalExam: 0, priorityBlood: 1, medicalSubsidy: 0, otherBenefits: 0 },
    remainingQuota: { physicalExam: 3, priorityBlood: 2, medicalSubsidy: 1000, otherBenefits: 3 },
    lastRenewalDate: '2026-01-01',
    effectiveDate: '2026-01-01',
    expiryDate: '2026-12-31'
  },
  {
    donorId: 'donor-3',
    donorName: '王芳',
    levelId: 'level-4',
    levelName: '金级奉献者',
    totalVolume: 4200,
    currentQuota: { physicalExam: 3, priorityBlood: 3, medicalSubsidy: 1000, otherBenefits: 3 },
    usedQuota: { physicalExam: 2, priorityBlood: 2, medicalSubsidy: 600, otherBenefits: 2 },
    remainingQuota: { physicalExam: 1, priorityBlood: 1, medicalSubsidy: 400, otherBenefits: 1 },
    lastRenewalDate: '2026-06-01',
    effectiveDate: '2026-06-01',
    expiryDate: '2027-05-31'
  }
];
