import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatCard from '@/components/StatCard';
import DonorCard from '@/components/DonorCard';
import { useDonorStore } from '@/store/donorStore';
import { useProductStore } from '@/store/productStore';
import { useBenefitStore } from '@/store/benefitStore';

const HomePage: React.FC = () => {
  const { donors, getFilteredDonors, setSearchKeyword } = useDonorStore();
  const { products } = useProductStore();
  const { levelChangeRecords } = useBenefitStore();
  const [searchText, setSearchText] = useState('');

  const totalVolume = donors.reduce((sum, d) => sum + d.totalVolume, 0);
  const recentDonors = donors.slice(0, 3);
  const inStockProducts = products.filter(p => p.status === '在库' || p.status === '部分出库').length;

  const handleSearch = () => {
    setSearchKeyword(searchText);
    if (searchText) {
      Taro.switchTab({ url: '/pages/donors/index' });
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'donors':
        Taro.switchTab({ url: '/pages/donors/index' });
        break;
      case 'benefits':
        Taro.switchTab({ url: '/pages/benefits/index' });
        break;
      case 'products':
        Taro.switchTab({ url: '/pages/products/index' });
        break;
      case 'register':
        Taro.navigateTo({ url: '/pages/donation-register/index' });
        break;
    }
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>献血者权益管理</Text>
        <Text className={styles.subtitle}>连锁血站智能管理系统</Text>
      </View>

      <View className={styles.statsRow}>
        <StatCard title="注册献血者" value={donors.length} unit="人" color="primary" />
        <StatCard title="累计献血量" value={(totalVolume / 1000).toFixed(1)} unit="L" color="success" />
      </View>
      <View className={styles.statsRow}>
        <StatCard title="在库血制品" value={inStockProducts} unit="批次" color="warning" />
        <StatCard title="本月等级变更" value={levelChangeRecords.length} unit="次" color="info" />
      </View>

      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索献血者姓名/电话/身份证"
          placeholderClass={styles.searchPlaceholder}
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
          onConfirm={handleSearch}
        />
      </View>

      <Text className={styles.sectionTitle}>快捷功能</Text>
      <View className={styles.quickActions}>
        <View className={styles.actionItem} onClick={() => handleQuickAction('donors')}>
          <View className={`${styles.actionIcon} ${styles.donor1}`}>
            <Text>👥</Text>
          </View>
          <Text className={styles.actionLabel}>献血档案</Text>
        </View>
        <View className={styles.actionItem} onClick={() => handleQuickAction('register')}>
          <View className={`${styles.actionIcon} ${styles.donor2}`}>
            <Text>💉</Text>
          </View>
          <Text className={styles.actionLabel}>献血登记</Text>
        </View>
        <View className={styles.actionItem} onClick={() => handleQuickAction('benefits')}>
          <View className={`${styles.actionIcon} ${styles.donor3}`}>
            <Text>🎖️</Text>
          </View>
          <Text className={styles.actionLabel}>等级权益</Text>
        </View>
        <View className={styles.actionItem} onClick={() => handleQuickAction('products')}>
          <View className={`${styles.actionIcon} ${styles.donor4}`}>
            <Text>🩸</Text>
          </View>
          <Text className={styles.actionLabel}>血制品</Text>
        </View>
      </View>

      <View className={styles.listSection}>
        <View className={styles.listHeader}>
          <Text className={styles.sectionTitle}>最近献血者</Text>
          <Text className={styles.viewAll} onClick={() => Taro.switchTab({ url: '/pages/donors/index' })}>
            查看全部
          </Text>
        </View>
        {recentDonors.length > 0 ? (
          recentDonors.map(donor => <DonorCard key={donor.id} donor={donor} />)
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无献血者数据</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default HomePage;
