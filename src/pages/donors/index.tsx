import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import DonorCard from '@/components/DonorCard';
import { useDonorStore } from '@/store/donorStore';
import { BloodType } from '@/types/donor';

const bloodTypes: (BloodType | 'all')[] = ['all', 'A', 'B', 'AB', 'O'];

const DonorsPage: React.FC = () => {
  const { donors, searchKeyword, setSearchKeyword, getFilteredDonors } = useDonorStore();
  const [searchText, setSearchText] = useState(searchKeyword);
  const [bloodFilter, setBloodFilter] = useState<BloodType | 'all'>('all');

  const filteredDonors = useMemo(() => {
    let result = getFilteredDonors();
    if (searchText && searchText !== searchKeyword) {
      const kw = searchText.toLowerCase();
      result = donors.filter(
        d => d.name.toLowerCase().includes(kw) ||
             d.phone.includes(kw) ||
             d.idCard.includes(kw)
      );
    }
    if (bloodFilter !== 'all') {
      result = result.filter(d => d.bloodType === bloodFilter);
    }
    return result;
  }, [searchText, bloodFilter, donors, searchKeyword, getFilteredDonors]);

  const handleSearch = () => {
    setSearchKeyword(searchText);
  };

  const handleAddDonor = () => {
    Taro.showToast({ title: '新增献血者功能开发中', icon: 'none' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索姓名/电话/身份证"
            placeholderClass={styles.searchPlaceholder}
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            onConfirm={handleSearch}
          />
        </View>

        <View className={styles.filterBar}>
          {bloodTypes.map(type => (
            <Text
              key={type}
              className={classnames(styles.filterTag, bloodFilter === type && styles.active)}
              onClick={() => setBloodFilter(type)}
            >
              {type === 'all' ? '全部血型' : `${type}型`}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.donorList}>
        {filteredDonors.length > 0 ? (
          filteredDonors.map(donor => <DonorCard key={donor.id} donor={donor} />)
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyTitle}>暂无献血者</Text>
            <Text className={styles.emptyDesc}>请尝试调整搜索条件或筛选条件</Text>
          </View>
        )}
      </View>

      <View className={styles.fab} onClick={handleAddDonor}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </ScrollView>
  );
};

export default DonorsPage;
