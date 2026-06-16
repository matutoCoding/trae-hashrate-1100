import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Picker, Input, Button, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useProductStore } from '@/store/productStore';
import { formatVolume, formatDate } from '@/utils/formatter';
import { validateOutboundVolume, validateBagNumber } from '@/utils/validator';
import { ProductStatus } from '@/types/product';

const DEPARTMENTS = ['心内科', '普外科', '急诊科', '血液科', 'ICU', '骨科', '产科', '外科', '其他科室'];

interface SplitItem {
  bagNumber: string;
  volume: string;
  department: string;
  departmentIndex: number;
  recipient: string;
  remark: string;
}

const BatchOutboundPage: React.FC = () => {
  const router = useRouter();
  const { products, getProductById, processBatchOutbound } = useProductStore();

  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [splitItems, setSplitItems] = useState<SplitItem[]>([
    { bagNumber: '', volume: '400', department: '心内科', departmentIndex: 0, recipient: '', remark: '' }
  ]);
  const [operator, setOperator] = useState('');
  const [outboundRemark, setOutboundRemark] = useState('');

  useEffect(() => {
    const batchId = router.params.id;
    if (batchId) {
      setSelectedBatchId(batchId);
    }
  }, [router.params.id]);

  const availableProducts = useMemo(() => {
    return products.filter(p => p.status === '在库' || p.status === '部分出库');
  }, [products]);

  const selectedProduct = useMemo(() => {
    return selectedBatchId ? getProductById(selectedBatchId) : undefined;
  }, [selectedBatchId, getProductById]);

  const handleBatchSelect = (e: any) => {
    const idx = e.detail.value;
    const product = availableProducts[idx];
    if (product) {
      setSelectedBatchId(product.id);
    }
  };

  const addSplitItem = () => {
    if (!selectedProduct || splitItems.length >= selectedProduct.remainingBags) {
      Taro.showToast({ title: '已达最大袋数', icon: 'none' });
      return;
    }
    const nextBagNum = splitItems.length + 1;
    setSplitItems([
      ...splitItems,
      { bagNumber: '', volume: '400', department: '心内科', departmentIndex: 0, recipient: '', remark: '' }
    ]);
  };

  const removeSplitItem = (index: number) => {
    if (splitItems.length <= 1) {
      Taro.showToast({ title: '至少保留一项', icon: 'none' });
      return;
    }
    setSplitItems(splitItems.filter((_, i) => i !== index));
  };

  const updateSplitItem = (index: number, field: keyof SplitItem, value: string | number) => {
    const newItems = [...splitItems];
    if (field === 'departmentIndex') {
      const deptIdx = value as number;
      newItems[index] = {
        ...newItems[index],
        departmentIndex: deptIdx,
        department: DEPARTMENTS[deptIdx]
      };
    } else if (field === 'volume') {
      const rawValue = String(value);
      const numValue = parseInt(rawValue);
      
      if (rawValue === '' || rawValue === '-') {
        newItems[index] = { ...newItems[index], volume: rawValue };
      } else if (isNaN(numValue)) {
        Taro.showToast({ title: '请输入有效数字', icon: 'none' });
        return;
      } else if (numValue < 0) {
        Taro.showToast({ title: '体积不能为负数', icon: 'none' });
        return;
      } else if (selectedProduct && numValue > selectedProduct.remainingVolume) {
        Taro.showToast({ title: `不能超过${selectedProduct.remainingVolume}ml`, icon: 'none' });
        return;
      } else {
        const validation = validateOutboundVolume(numValue, selectedProduct?.remainingVolume || 999999);
        if (!validation.valid) {
          Taro.showToast({ title: validation.message, icon: 'none' });
          return;
        }
        newItems[index] = { ...newItems[index], volume: rawValue };
      }
    } else if (field === 'bagNumber') {
      const validation = validateBagNumber(String(value));
      if (!validation.valid && value) {
        Taro.showToast({ title: validation.message, icon: 'none' });
      }
      newItems[index] = { ...newItems[index], bagNumber: String(value) };
    } else {
      (newItems[index] as any)[field] = value;
    }
    setSplitItems(newItems);
  };

  const summary = useMemo(() => {
    const totalBags = splitItems.length;
    const totalVolume = splitItems.reduce((sum, item) => {
      const vol = parseInt(item.volume);
      return sum + (isNaN(vol) || vol < 0 ? 0 : vol);
    }, 0);
    let remainingBags = 0;
    let remainingVolume = 0;
    if (selectedProduct) {
      remainingBags = Math.max(0, selectedProduct.remainingBags - totalBags);
      remainingVolume = Math.max(0, selectedProduct.remainingVolume - totalVolume);
    }
    return { totalBags, totalVolume, remainingBags, remainingVolume };
  }, [splitItems, selectedProduct]);

  const getStatusType = (status: ProductStatus) => {
    switch (status) {
      case '在库': return 'success';
      case '部分出库': return 'warning';
      default: return 'default';
    }
  };

  const handleSubmit = () => {
    if (!selectedProduct) {
      Taro.showToast({ title: '请选择批次', icon: 'none' });
      return;
    }

    for (let i = 0; i < splitItems.length; i++) {
      const item = splitItems[i];
      const bagValidation = validateBagNumber(item.bagNumber);
      if (!bagValidation.valid) {
        Taro.showToast({ title: `第${i + 1}袋: ${bagValidation.message}`, icon: 'none' });
        return;
      }
      const volNum = parseInt(item.volume);
      const volValidation = validateOutboundVolume(volNum, selectedProduct.remainingVolume);
      if (!volValidation.valid) {
        Taro.showToast({ title: `第${i + 1}袋: ${volValidation.message}`, icon: 'none' });
        return;
      }
      if (!item.department) {
        Taro.showToast({ title: `第${i + 1}袋: 请选择科室`, icon: 'none' });
        return;
      }
      if (!item.recipient) {
        Taro.showToast({ title: `第${i + 1}袋: 请填写受血者`, icon: 'none' });
        return;
      }
    }

    if (summary.totalVolume > selectedProduct.remainingVolume) {
      Taro.showToast({ title: `出库总体积(${summary.totalVolume}ml)超过剩余(${selectedProduct.remainingVolume}ml)`, icon: 'none' });
      return;
    }

    if (summary.totalBags > selectedProduct.remainingBags) {
      Taro.showToast({ title: `出库袋数(${summary.totalBags})超过剩余(${selectedProduct.remainingBags}袋)`, icon: 'none' });
      return;
    }

    try {
      processBatchOutbound({
        batchId: selectedProduct.id,
        operator: operator || '系统',
        outboundRemark: outboundRemark,
        items: splitItems.map(item => ({
          bagNumber: item.bagNumber,
          volume: parseInt(item.volume) || 0,
          department: item.department,
          recipient: item.recipient,
          remark: item.remark
        }))
      });

      console.log('[BatchOutbound] 批次出库完成', {
        batchNumber: selectedProduct.batchNumber,
        bags: summary.totalBags,
        volume: summary.totalVolume,
        operator: operator || '系统'
      });

      Taro.showToast({ title: '出库成功', icon: 'success' });
      setTimeout(() => {
        Taro.redirectTo({ url: `/pages/trace/index?id=${selectedProduct.id}` });
      }, 1500);
    } catch (error: any) {
      console.error('[BatchOutbound] 出库失败', error);
      Taro.showToast({ title: error.message || '出库失败', icon: 'none' });
    }
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择出库批次</Text>
        <View className={styles.card}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>血制品批次</Text>
            <Picker
              mode="selector"
              range={availableProducts.map(p => `${p.batchNumber} (${p.productType} ${p.bloodType}型 - 剩${p.remainingBags}袋)`)}
              value={availableProducts.findIndex(p => p.id === selectedBatchId)}
              onChange={handleBatchSelect}
            >
              <View className={styles.formInput}>
                <Text className={selectedProduct ? styles.pickerText : styles.pickerPlaceholder}>
                  {selectedProduct ? selectedProduct.batchNumber : '请选择出库批次'}
                </Text>
              </View>
            </Picker>
          </View>

          {selectedProduct && (
            <>
              <View className={styles.batchHeader}>
                <View>
                  <Text className={styles.batchNumber}>{selectedProduct.batchNumber}</Text>
                  <View className={styles.batchMeta}>
                    <Text className={styles.batchTypeTag}>{selectedProduct.productType}</Text>
                    <Text className={styles.batchBloodTag}>{selectedProduct.bloodType}型</Text>
                    <StatusTag text={selectedProduct.status} type={getStatusType(selectedProduct.status)} />
                  </View>
                </View>
              </View>

              <View className={styles.statsRow}>
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>{selectedProduct.remainingBags}</Text>
                  <Text className={styles.statLabel}>剩余袋数</Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>{formatVolume(selectedProduct.remainingVolume)}</Text>
                  <Text className={styles.statLabel}>剩余体积</Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>{formatDate(selectedProduct.expiryDate)}</Text>
                  <Text className={styles.statLabel}>有效期至</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {selectedProduct && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>多袋拆分出库</Text>
          <View className={styles.card}>
            {splitItems.map((item, index) => (
              <View key={index} className={styles.splitItem}>
                <View className={styles.splitHeader}>
                  <Text className={styles.splitIndex}>第 {index + 1} 袋</Text>
                  <View className={styles.removeBtn} onClick={() => removeSplitItem(index)}>
                    <Text>×</Text>
                  </View>
                </View>
                <View className={styles.inputRow}>
                  <Input
                    className={styles.textInput}
                    placeholder="袋编号"
                    placeholderClass={styles.pickerPlaceholder}
                    value={item.bagNumber}
                    onInput={(e) => updateSplitItem(index, 'bagNumber', e.detail.value)}
                  />
                  <Input
                    className={styles.textInput}
                    type="number"
                    placeholder="体积(ml)"
                    placeholderClass={styles.pickerPlaceholder}
                    value={item.volume}
                    onInput={(e) => updateSplitItem(index, 'volume', e.detail.value)}
                  />
                </View>
                <View className={styles.inputRow} style={{ marginTop: '16rpx' }}>
                  <Picker
                    mode="selector"
                    range={DEPARTMENTS}
                    value={item.departmentIndex}
                    onChange={(e) => updateSplitItem(index, 'departmentIndex', parseInt(e.detail.value))}
                  >
                    <View className={styles.textInput} style={{ display: 'flex', alignItems: 'center' }}>
                      <Text className={item.department ? styles.pickerText : styles.pickerPlaceholder}>
                        {item.department || '选择科室'}
                      </Text>
                    </View>
                  </Picker>
                  <Input
                    className={styles.textInput}
                    placeholder="受血者"
                    placeholderClass={styles.pickerPlaceholder}
                    value={item.recipient}
                    onInput={(e) => updateSplitItem(index, 'recipient', e.detail.value)}
                  />
                </View>
                <View className={styles.inputRow} style={{ marginTop: '16rpx' }}>
                  <View className={styles.fullWidth}>
                    <Input
                      className={styles.textInput}
                      placeholder="备注(选填)"
                      placeholderClass={styles.pickerPlaceholder}
                      value={item.remark}
                      onInput={(e) => updateSplitItem(index, 'remark', e.detail.value)}
                    />
                  </View>
                </View>
              </View>
            ))}

            <View className={styles.addBtn} onClick={addSplitItem}>
              <Text>+</Text>
              <Text>添加出库袋</Text>
            </View>
          </View>
        </View>
      )}

      {selectedProduct && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>出库汇总</Text>
          <View className={styles.summaryBox}>
            <Text className={styles.summaryTitle}>出库确认信息</Text>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>出库袋数</Text>
              <Text className={styles.summaryValue}>
                <Text className={styles.summaryHighlight}>{summary.totalBags}</Text> / {selectedProduct.remainingBags} 袋
              </Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>出库总体积</Text>
              <Text className={styles.summaryValue}>
                <Text className={styles.summaryHighlight}>{formatVolume(summary.totalVolume)}</Text>
              </Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>出库后剩余</Text>
              <Text className={styles.summaryValue}>
                {summary.remainingBags}袋 ({formatVolume(summary.remainingVolume)})
              </Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>涉及科室</Text>
              <Text className={styles.summaryValue}>
                {Array.from(new Set(splitItems.map(i => i.department))).filter(Boolean).join('、') || '-'}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>出库信息</Text>
        <View className={styles.card}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>操作员</Text>
            <View className={styles.formInput}>
              <Input
                style={{ width: '100%', fontSize: '28rpx', color: '#1D2129', background: 'transparent', border: 'none', padding: 0 }}
                placeholder="请输入操作员姓名"
                placeholderClass={styles.pickerPlaceholder}
                value={operator}
                onInput={(e) => setOperator(e.detail.value)}
              />
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>出库备注</Text>
            <Textarea
              className={styles.textarea}
              placeholder="请输入出库备注（选填）"
              placeholderClass={styles.pickerPlaceholder}
              value={outboundRemark}
              onInput={(e) => setOutboundRemark(e.detail.value)}
              maxlength={200}
            />
          </View>
        </View>
      </View>

      <Button className={styles.submitBtn} onClick={handleSubmit}>
        确认出库
      </Button>
    </ScrollView>
  );
};

export default BatchOutboundPage;
