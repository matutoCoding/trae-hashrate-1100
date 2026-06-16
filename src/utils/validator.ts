import dayjs from 'dayjs';

export const validateDonationInterval = (
  lastDonationDate: string,
  currentDate: string = dayjs().format('YYYY-MM-DD')
): { valid: boolean; daysSinceLast: number; requiredDays: number; message: string } => {
  const requiredDays = 180;
  const lastDate = dayjs(lastDonationDate);
  const now = dayjs(currentDate);
  const daysSinceLast = now.diff(lastDate, 'day');
  const valid = daysSinceLast >= requiredDays;
  const daysRemaining = requiredDays - daysSinceLast;

  return {
    valid,
    daysSinceLast,
    requiredDays,
    message: valid
      ? `距上次献血已过 ${daysSinceLast} 天，符合献血间隔要求`
      : `距上次献血仅 ${daysSinceLast} 天，还需等待 ${daysRemaining} 天方可再次献血`
  };
};

export const validateIdCard = (idCard: string): boolean => {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return reg.test(idCard);
};

export const validatePhone = (phone: string): boolean => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

export const validateVolume = (volume: number): boolean => {
  return volume === 200 || volume === 300 || volume === 400;
};
