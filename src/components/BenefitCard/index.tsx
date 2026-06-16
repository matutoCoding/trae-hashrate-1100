import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { HonorLevel } from '@/types/benefit';

interface BenefitCardProps {
  level: HonorLevel;
  selected?: boolean;
  onClick?: () => void;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ level, selected, onClick }) => {
  return (
    <View
      className={classnames(styles.card, selected && styles.selected)}
      style={{ borderColor: selected ? level.color : 'transparent' }}
      onClick={onClick}
    >
      <View className={styles.header} style={{ backgroundColor: `${level.color}15` }}>
        <View className={styles.levelBadge} style={{ backgroundColor: level.color }}>
          <Text className={styles.rankText}>Lv.{level.rank}</Text>
        </View>
        <Text className={styles.levelName} style={{ color: level.color }}>{level.name}</Text>
      </View>
      <View className={styles.volumeRange}>
        <Text className={styles.volumeText}>
          {level.minVolume}ml - {level.maxVolume >= 999999 ? '∞' : `${level.maxVolume}ml`}
        </Text>
      </View>
      <View className={styles.benefitList}>
        <View className={styles.benefitItem}>
          <Text className={styles.benefitLabel}>免费体检</Text>
          <Text className={styles.benefitValue}>{level.quota.physicalExam}次/年</Text>
        </View>
        <View className={styles.benefitItem}>
          <Text className={styles.benefitLabel}>优先用血</Text>
          <Text className={styles.benefitValue}>{level.quota.priorityBlood}次/年</Text>
        </View>
        <View className={styles.benefitItem}>
          <Text className={styles.benefitLabel}>医疗补贴</Text>
          <Text className={styles.benefitValue}>¥{level.quota.medicalSubsidy}/年</Text>
        </View>
      </View>
      <Text className={styles.description}>{level.description}</Text>
    </View>
  );
};

export default BenefitCard;
