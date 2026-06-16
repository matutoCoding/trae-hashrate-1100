import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useProductStore } from '@/store/productStore';
import { formatVolume, formatDate, getDaysRemaining } from '@/utils/formatter';
import { ProductStatus } from '@/types/product';

const TracePage: React.FC = () => {
  const router = useRouter();
  const { getProductById, getDepartmentDistribution } = useProductStore();

  const productId = router.params.id;
  const product = useMemo(() => productId ? getProductById(productId) : undefined, [productId, getProductById]);
  const distribution = useMemo(() => productId ? getDepartmentDistribution(productId) : [], [productId, getDepartmentDistribution]);

  const getStatusType = (status: ProductStatus) => {
    switch (status) {
      case '在库': return 'success';
      case '部分出库': return 'warning';
      case '已出库': return 'default';
      case '已过期': return 'error';
      default: return 'default';
    }
  };

  const daysRemaining = product ? getDaysRemaining(product.expiryDate) : 0;
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
  const progressPercent = product ? Math.round((product.remainingVolume / product.totalVolume) * 100) : 0;

  const usedVolume = product ? product.totalVolume - product.remainingVolume : 0;
  const usedBags = product ? product.totalBags - product.remainingBags : 0;

  const totalOutVolume = distribution.reduce((sum, d) => sum + d.volume, 0);
  const maxDeptVolume = Math.max(...distribution.map(d => d.volume), 1);

  const handleOutbound = () => {
    if (product) {
      Taro.navigateTo({ url: `/pages/batch-outbound/index?id=${product.id}` });
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  if (!product) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🔍</Text>
          <Text className={styles.emptyTitle}>未找到批次信息</Text>
          <Text className={styles.emptyDesc}>请返回重新选择</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.heroCard}>
        <Text className={styles.heroBatchNumber}>{product.batchNumber}</Text>
        <View className={styles.heroMeta}>
          <Text className={styles.heroTag}>{product.productType}</Text>
          <Text className={styles.heroTag}>{product.bloodType}型</Text>
          <StatusTag text={product.status} type={getStatusType(product.status)} />
        </View>
        <View className={styles.heroStats}>
          <View className={styles.heroStat}>
            <Text className={styles.heroStatValue}>{product.totalBags}</Text>
            <Text className={styles.heroStatLabel}>总袋数</Text>
          </View>
          <View className={styles.heroStat}>
            <Text className={styles.heroStatValue}>{formatVolume(product.totalVolume)}</Text>
            <Text className={styles.heroStatLabel}>总体积</Text>
          </View>
          <View className={styles.heroStat}>
            <Text className={styles.heroStatValue}>{product.outboundRecords.length}</Text>
            <Text className={styles.heroStatLabel}>出库记录</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>库存追踪</Text>
        <View className={styles.progressSection}>
          <View className={styles.progressHeader}>
            <Text className={styles.progressLabel}>出库进度</Text>
            <Text className={styles.progressText}>{progressPercent}%</Text>
          </View>
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </View>
          <View className={styles.progressLegend}>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.legendUsed}`} />
              <Text>已出库 {usedBags}袋 / {formatVolume(usedVolume)}</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.legendRemain}`} />
              <Text>剩余 {product.remainingBags}袋 / {formatVolume(product.remainingVolume)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>批次详情</Text>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>生产日期</Text>
            <Text className={styles.infoValue}>{formatDate(product.productionDate)}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>有效期至</Text>
            <Text className={styles.infoValue} style={{ color: isExpiringSoon ? '#F53F3F' : '#1D2129' }}>
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
          {product.remark && (
            <View className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
              <Text className={styles.infoLabel}>备注</Text>
              <Text className={styles.infoValue}>{product.remark}</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>科室去向分布</Text>
        <View className={styles.distributionSection}>
          <View className={styles.distributionHeader}>
            <Text className={styles.progressLabel} style={{ marginBottom: 0 }}>各科室出库统计</Text>
            <Text className={styles.distributionTotal}>共 {totalOutVolume > 0 ? distribution.length : 0} 个科室</Text>
          </View>

          {distribution.length > 0 ? (
            distribution.map((item, idx) => (
              <View key={idx} className={styles.distributionItem}>
                <Text className={styles.deptLabel}>{item.department}</Text>
                <View className={styles.deptBarWrap}>
                  <View className={styles.deptBar}>
                    <View
                      className={styles.deptBarFill}
                      style={{ width: `${(item.volume / maxDeptVolume) * 100}%` }}
                    />
                  </View>
                </View>
                <View className={styles.deptStats}>
                  <Text className={styles.deptCount}>{item.count} 袋</Text>
                  <Text className={styles.deptVolume}>{formatVolume(item.volume)}</Text>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyDistribution}>
              <Text className={styles.emptyIcon}>📦</Text>
              <Text className={styles.emptyText}>暂无出库记录</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>出库历史记录</Text>
        <View className={styles.historySection}>
          {product.outboundRecords.length > 0 ? (
            product.outboundRecords.map(record => (
              <View key={record.id} className={styles.historyItem}>
                <View className={styles.historyHeader}>
                  <Text className={styles.historyBag}>袋编号: {record.bagNumber}</Text>
                  <Text className={styles.historyDate}>{formatDate(record.outboundDate)}</Text>
                </View>
                <View className={styles.historyInfo}>
                  <View className={styles.historyField}>
                    <Text className={styles.historyFieldLabel}>所属科室</Text>
                    <Text className={styles.historyFieldValue}>{record.department}</Text>
                  </View>
                  <View className={styles.historyField}>
                    <Text className={styles.historyFieldLabel}>受血者</Text>
                    <Text className={styles.historyFieldValue}>{record.recipient}</Text>
                  </View>
                  <View className={styles.historyField}>
                    <Text className={styles.historyFieldLabel}>出库体积</Text>
                    <Text className={styles.historyFieldValue}>{formatVolume(record.volume)}</Text>
                  </View>
                  <View className={styles.historyField}>
                    <Text className={styles.historyFieldLabel}>操作员</Text>
                    <Text className={styles.historyFieldValue}>{record.operator}</Text>
                  </View>
                </View>
                {record.remark && (
                  <View className={styles.historyRemark}>
                    <Text>备注: {record.remark}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className={styles.emptyDistribution}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无出库历史</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.actionRow}>
        <Button className={styles.secondaryBtn} onClick={handleBack}>
          返回列表
        </Button>
        <Button
          className={styles.primaryBtn}
          onClick={handleOutbound}
          disabled={product.status === '已出库' || product.status === '已过期'}
        >
          {product.status === '已出库' ? '已全部出库' : product.status === '已过期' ? '已过期' : '继续出库'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default TracePage;
