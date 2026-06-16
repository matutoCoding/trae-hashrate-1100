import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Donor } from '@/types/donor';
import LevelBadge from '@/components/LevelBadge';
import { formatVolume, formatDate, maskPhone } from '@/utils/formatter';

interface DonorCardProps {
  donor: Donor;
}

const DonorCard: React.FC<DonorCardProps> = ({ donor }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/donor-detail/index?id=${donor.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>{donor.name.charAt(0)}</Text>
        </View>
        <View className={styles.info}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{donor.name}</Text>
            <LevelBadge levelName={donor.levelName} size="small" />
          </View>
          <Text className={styles.subInfo}>
            {donor.gender === 'male' ? '男' : '女'} · {donor.age}岁 · {donor.bloodType}型血
          </Text>
        </View>
      </View>
      <View className={styles.stats}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{donor.totalDonations}</Text>
          <Text className={styles.statLabel}>献血次数</Text>
        </View>
        <View className={styles.divider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{formatVolume(donor.totalVolume)}</Text>
          <Text className={styles.statLabel}>累计献血</Text>
        </View>
        <View className={styles.divider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{formatDate(donor.lastDonationDate)}</Text>
          <Text className={styles.statLabel}>最近献血</Text>
        </View>
      </View>
      <View className={styles.footer}>
        <Text className={styles.phone}>联系电话: {maskPhone(donor.phone)}</Text>
      </View>
    </View>
  );
};

export default DonorCard;
