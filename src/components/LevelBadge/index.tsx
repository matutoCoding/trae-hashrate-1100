import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { getLevelColor } from '@/utils/formatter';

interface LevelBadgeProps {
  levelName: string;
  size?: 'small' | 'medium' | 'large';
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ levelName, size = 'medium' }) => {
  const color = getLevelColor(levelName);
  
  return (
    <View
      className={classnames(styles.badge, styles[size])}
      style={{ backgroundColor: `${color}15`, borderColor: color, color }}
    >
      <Text className={styles.text}>{levelName}</Text>
    </View>
  );
};

export default LevelBadge;
