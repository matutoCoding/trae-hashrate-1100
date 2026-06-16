import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusTagProps {
  text: string;
  type?: StatusType;
}

const StatusTag: React.FC<StatusTagProps> = ({ text, type = 'default' }) => {
  return (
    <View className={classnames(styles.tag, styles[type])}>
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default StatusTag;
