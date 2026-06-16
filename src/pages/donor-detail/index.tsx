import React, { useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import LevelBadge from '@/components/LevelBadge';
import { useDonorStore } from '@/store/donorStore';
import { validateDonationInterval } from '@/utils/validator';
import { formatDate, formatVolume, maskPhone, maskIdCard } from '@/utils/formatter';

const DonorDetailPage: React.FC = () => {
  const router = useRouter();
  const donors = useDonorStore(state => state.donors);
  
  const donor = useMemo(() => {
    const id = router.params.id;
    return id ? donors.find(d => d.id === id) : undefined;
  }, [router.params.id, donors]);

  const handleRegisterDonation = () => {
    if (donor) {
      Taro.navigateTo({ url: `/pages/donation-register/index?donorId=${donor.id}` });
    }
  };

  const handleLevelChange = () => {
    if (donor) {
      Taro.navigateTo({ url: `/pages/level-change/index?donorId=${donor.id}` });
    }
  };

  if (!donor) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>👤</Text>
          <Text className={styles.emptyTitle}>献血者不存在</Text>
          <Text className={styles.emptyDesc}>请返回列表重新选择</Text>
        </View>
      </ScrollView>
    );
  }

  const intervalResult = validateDonationInterval(donor.lastDonationDate);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.profileHeader}>
        <View className={styles.profileRow}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>{donor.name.charAt(0)}</Text>
          </View>
          <View className={styles.profileInfo}>
            <View className={styles.nameRow}>
              <Text className={styles.name}>{donor.name}</Text>
              <LevelBadge levelName={donor.levelName} size="small" />
            </View>
            <Text className={styles.basicInfo}>
              {donor.gender === 'male' ? '男' : '女'} · {donor.age}岁 · {donor.bloodType}型血
            </Text>
            <Text className={styles.contactInfo}>
              {maskPhone(donor.phone)} · {maskIdCard(donor.idCard)}
            </Text>
          </View>
        </View>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{donor.totalDonations}</Text>
            <Text className={styles.statLabel}>献血次数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatVolume(donor.totalVolume)}</Text>
            <Text className={styles.statLabel}>累计献血</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatDate(donor.registerDate).slice(0, 7)}</Text>
            <Text className={styles.statLabel}>注册时间</Text>
          </View>
        </View>
      </View>

      <View className={styles.intervalCard}>
        <View className={styles.intervalHeader}>
          <Text className={styles.intervalTitle}>献血间隔校验</Text>
          <Text
            className={classnames(
              styles.intervalStatus,
              intervalResult.valid ? styles.intervalValid : styles.intervalInvalid
            )}
          >
            {intervalResult.valid ? '✓ 可献血' : '✗ 间隔不足'}
          </Text>
        </View>
        <Text className={styles.intervalMessage}>{intervalResult.message}</Text>
        <Text className={styles.intervalMessage}>
          上次献血: {formatDate(donor.lastDonationDate)}（已过 {intervalResult.daysSinceLast} 天）
        </Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>基本信息</Text>
        </View>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>健康状况</Text>
            <Text className={styles.infoValue}>{donor.healthStatus}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>居住地址</Text>
            <Text className={styles.infoValue}>{donor.address}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>最近献血</Text>
            <Text className={styles.infoValue}>{formatDate(donor.lastDonationDate)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>献血历史</Text>
          <Button className={styles.actionBtn} onClick={handleRegisterDonation}>
            献血登记
          </Button>
        </View>
        {donor.donationRecords.length > 0 ? (
          <View className={styles.recordList}>
            {[...donor.donationRecords].reverse().map(record => (
              <View key={record.id} className={styles.recordItem}>
                <View className={styles.recordHeader}>
                  <Text className={styles.recordDate}>{formatDate(record.date)}</Text>
                  <Text className={styles.recordVolume}>{formatVolume(record.volume)}</Text>
                </View>
                <View className={styles.recordMeta}>
                  <Text className={styles.recordMetaItem}>{record.type}</Text>
                  <Text className={styles.recordMetaItem}>{record.location}</Text>
                  <Text className={styles.recordMetaItem}>操作: {record.operator}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyTitle}>暂无献血记录</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>等级权益</Text>
          <Button className={styles.actionBtn} onClick={handleLevelChange}>
            等级变更
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default DonorDetailPage;
