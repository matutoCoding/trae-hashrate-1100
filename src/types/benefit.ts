export type ChangeType = 'upgrade' | 'downgrade' | 'adjust';

export interface BenefitQuota {
  physicalExam: number;
  priorityBlood: number;
  medicalSubsidy: number;
  otherBenefits: number;
}

export interface HonorLevel {
  id: string;
  name: string;
  minVolume: number;
  maxVolume: number;
  rank: number;
  color: string;
  quota: BenefitQuota;
  description: string;
}

export interface LevelChangeRecord {
  id: string;
  donorId: string;
  donorName: string;
  fromLevelId: string;
  fromLevelName: string;
  toLevelId: string;
  toLevelName: string;
  changeType: ChangeType;
  changeDate: string;
  operator: string;
  reason: string;
  oldQuota: BenefitQuota;
  newQuota: BenefitQuota;
  carryOverDetail: {
    physicalExam: number;
    priorityBlood: number;
    medicalSubsidy: number;
    otherBenefits: number;
    clearedAmount: number;
    supplementedAmount: number;
  };
}

export interface DonorBenefit {
  donorId: string;
  donorName: string;
  levelId: string;
  levelName: string;
  totalVolume: number;
  currentQuota: BenefitQuota;
  usedQuota: BenefitQuota;
  remainingQuota: BenefitQuota;
  lastRenewalDate: string;
  effectiveDate: string;
  expiryDate: string;
}
