import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { BloodProduct } from '@/types/product';
import StatusTag from '@/components/StatusTag';
import { formatVolume, formatDate, getDaysRemaining } from '@/utils/formatter';

interface ProductCardProps {
  product: BloodProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const getStatusType = () => {
    switch (product.status) {
      case '在库': return 'success';
      case '部分出库': return 'warning';
      case '已出库': return 'default';
      case '已过期': return 'error';
      default: return 'default';
    }
  };

  const daysRemaining = getDaysRemaining(product.expiryDate);
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
  const progressPercent = Math.round((product.remainingVolume / product.totalVolume) * 100);

  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/trace/index?id=${product.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.batchInfo}>
          <Text className={styles.batchNumber}>{product.batchNumber}</Text>
          <StatusTag text={product.status} type={getStatusType()} />
        </View>
        <View className={styles.typeRow}>
          <Text className={styles.typeTag}>{product.productType}</Text>
          <Text className={styles.bloodType}>{product.bloodType}型</Text>
        </View>
      </View>

      <View className={styles.progressSection}>
        <View className={styles.progressHeader}>
          <Text className={styles.progressLabel}>库存进度</Text>
          <Text className={styles.progressText}>
            剩余 {product.remainingBags}/{product.totalBags}袋 ({formatVolume(product.remainingVolume)})
          </Text>
        </View>
        <View className={styles.progressBar}>
          <View
            className={classnames(styles.progressFill, isExpiringSoon && styles.expiring)}
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>

      <View className={styles.infoGrid}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>生产日期</Text>
          <Text className={styles.infoValue}>{formatDate(product.productionDate)}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>有效期至</Text>
          <Text className={classnames(styles.infoValue, isExpiringSoon && styles.warning)}>
            {formatDate(product.expiryDate)}
            {isExpiringSoon && ` (剩${daysRemaining}天)`}
          </Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>存放位置</Text>
          <Text className={styles.infoValue}>{product.storageLocation}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>来源血站</Text>
          <Text className={styles.infoValue}>{product.sourceStation}</Text>
        </View>
      </View>
    </View>
  );
};

export default ProductCard;
