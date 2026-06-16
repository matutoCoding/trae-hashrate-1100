import dayjs from 'dayjs';

export const formatDate = (date: string, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const formatVolume = (volume: number): string => {
  return `${volume} ml`;
};

export const formatMoney = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const maskIdCard = (idCard: string): string => {
  if (idCard.length <= 8) return idCard;
  return idCard.slice(0, 4) + '********' + idCard.slice(-4);
};

export const maskPhone = (phone: string): string => {
  if (phone.length <= 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
};

export const getDaysRemaining = (targetDate: string): number => {
  return dayjs(targetDate).diff(dayjs(), 'day');
};

export const getLevelColor = (levelName: string): string => {
  const colorMap: Record<string, string> = {
    '普通献血者': '#9E9E9E',
    '铜级奉献者': '#CD7F32',
    '银级奉献者': '#A8A8A8',
    '金级奉献者': '#FFB300',
    '铂金奉献者': '#64B5F6',
    '钻石奉献者': '#AB47BC'
  };
  return colorMap[levelName] || '#9E9E9E';
};
