import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendUp,
  color = 'primary'
}) => {
  return (
    <View className={classnames(styles.card, styles[color])}>
      <Text className={styles.title}>{title}</Text>
      <View className={styles.valueRow}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      {trend && (
        <Text className={classnames(styles.trend, trendUp ? styles.up : styles.down)}>
          {trendUp ? '↑' : '↓'} {trend}
        </Text>
      )}
    </View>
  );
};

export default StatCard;
