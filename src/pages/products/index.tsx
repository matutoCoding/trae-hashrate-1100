import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import ProductCard from '@/components/ProductCard';
import StatCard from '@/components/StatCard';
import { useProductStore } from '@/store/productStore';
import { ProductStatus } from '@/types/product';

const statusFilters: (ProductStatus | 'all')[] = ['all', '在库', '部分出库', '已出库', '已过期'];

const ProductsPage: React.FC = () => {
  const { products, searchKeyword, statusFilter, setSearchKeyword, setStatusFilter, getFilteredProducts } = useProductStore();
  const [searchText, setSearchText] = useState(searchKeyword);

  const filteredProducts = useMemo(() => {
    let result = getFilteredProducts();
    if (searchText && searchText !== searchKeyword) {
      const kw = searchText.toLowerCase();
      result = products.filter(
        p => p.batchNumber.toLowerCase().includes(kw) ||
             p.productType.includes(searchText) ||
             p.bloodType.includes(searchText)
      );
    }
    return result;
  }, [searchText, products, searchKeyword, getFilteredProducts]);

  const inStockCount = products.filter(p => p.status === '在库').length;
  const partialCount = products.filter(p => p.status === '部分出库').length;
  const totalVolume = products.reduce((sum, p) => sum + p.remainingVolume, 0);

  const handleSearch = () => {
    setSearchKeyword(searchText);
  };

  const handleOutbound = () => {
    if (products.length > 0) {
      Taro.navigateTo({ url: `/pages/batch-outbound/index?id=${products[0].id}` });
    } else {
      Taro.showToast({ title: '暂无可出库批次', icon: 'none' });
    }
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索批次号/类型/血型"
            placeholderClass={styles.searchPlaceholder}
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            onConfirm={handleSearch}
          />
        </View>

        <View className={styles.filterBar}>
          {statusFilters.map(status => (
            <Text
              key={status}
              className={classnames(styles.filterTag, statusFilter === status && styles.active)}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? '全部状态' : status}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.statsRow}>
        <StatCard title="在库批次" value={inStockCount} unit="个" color="success" />
        <StatCard title="部分出库" value={partialCount} unit="个" color="warning" />
        <StatCard title="库存总量" value={(totalVolume / 1000).toFixed(1)} unit="L" color="info" />
      </View>

      <View className={styles.productList}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => <ProductCard key={product.id} product={product} />)
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🩸</Text>
            <Text className={styles.emptyTitle}>暂无血制品</Text>
            <Text className={styles.emptyDesc}>请尝试调整搜索条件或筛选条件</Text>
          </View>
        )}
      </View>

      <View className={styles.fab} onClick={handleOutbound}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </ScrollView>
  );
};

export default ProductsPage;
