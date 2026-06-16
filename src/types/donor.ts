export type BloodType = 'A' | 'B' | 'AB' | 'O';

export type Gender = 'male' | 'female';

export interface DonationRecord {
  id: string;
  donorId: string;
  date: string;
  volume: number;
  location: string;
  type: string;
  operator: string;
}

export interface Donor {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  idCard: string;
  phone: string;
  bloodType: BloodType;
  totalDonations: number;
  totalVolume: number;
  lastDonationDate: string;
  levelId: string;
  levelName: string;
  registerDate: string;
  address: string;
  healthStatus: string;
  donationRecords: DonationRecord[];
}

export interface DonorForm {
  name: string;
  gender: Gender;
  age: number;
  idCard: string;
  phone: string;
  bloodType: BloodType;
  address: string;
}
