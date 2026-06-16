import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Input, Button, ScrollView, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useDonorStore } from '@/store/donorStore';
import { validateDonationInterval, validateVolume } from '@/utils/validator';
import { formatDate, formatVolume } from '@/utils/formatter';
import dayjs from 'dayjs';

const volumeOptions = [200, 300, 400];
const locationOptions = ['市中心血站', '东区献血屋', '西区献血屋', '南区献血屋', '北区献血屋'];

const DonationRegisterPage: React.FC = () => {
  const router = useRouter();
  const { donors, getDonorById, addDonationRecord, getLevelByVolume } = useDonorStore();

  const [selectedDonorId, setSelectedDonorId] = useState<string>('');
  const [volume, setVolume] = useState<number>(400);
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [location, setLocation] = useState<string>('市中心血站');
  const [locationIndex, setLocationIndex] = useState<number>(0);
  const [type, setType] = useState<string>('全血');
  const [operator, setOperator] = useState<string>('');

  useEffect(() => {
    const donorId = router.params.donorId;
    if (donorId) {
      setSelectedDonorId(donorId);
    }
  }, [router.params.donorId]);

  const selectedDonor = useMemo(() => {
    return selectedDonorId ? getDonorById(selectedDonorId) : undefined;
  }, [selectedDonorId, getDonorById]);

  const intervalResult = useMemo(() => {
    if (!selectedDonor) return null;
    return validateDonationInterval(selectedDonor.lastDonationDate, date);
  }, [selectedDonor, date]);

  const newLevel = useMemo(() => {
    if (!selectedDonor) return null;
    const newVolume = selectedDonor.totalVolume + volume;
    return getLevelByVolume(newVolume);
  }, [selectedDonor, volume, getLevelByVolume]);

  const canSubmit = useMemo(() => {
    if (!selectedDonor) return false;
    if (!validateVolume(volume)) return false;
    if (!intervalResult?.valid) return false;
    return true;
  }, [selectedDonor, volume, intervalResult]);

  const handleDonorSelect = (e: any) => {
    const idx = e.detail.value;
    setSelectedDonorId(donors[idx]?.id || '');
  };

  const handleSubmit = () => {
    if (!canSubmit || !selectedDonor) {
      Taro.showToast({ title: '请检查表单填写', icon: 'none' });
      return;
    }

    addDonationRecord(selectedDonor.id, {
      date,
      volume,
      location,
      type,
      operator: operator || '系统'
    });

    Taro.showToast({ title: '登记成功', icon: 'success' });
    console.log('[DonationRegister] 献血登记完成', {
      donorName: selectedDonor.name,
      volume,
      date,
      newLevel: newLevel?.name
    });

    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>选择献血者</Text>
        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>献血者</Text>
            <Picker
              mode="selector"
              range={donors.map(d => `${d.name} (${d.bloodType}型 - ${formatVolume(d.totalVolume)})`)}
              value={donors.findIndex(d => d.id === selectedDonorId)}
              onChange={handleDonorSelect}
            >
              <View className={styles.formInput}>
                <Text className={selectedDonor ? styles.pickerText : styles.pickerPlaceholder}>
                  {selectedDonor
                    ? `${selectedDonor.name} - ${selectedDonor.bloodType}型血`
                    : '请选择献血者'}
                </Text>
              </View>
            </Picker>
          </View>
        </View>
      </View>

      {selectedDonor && intervalResult && (
        <View className={styles.validateBox}>
          <View className={styles.validateRow}>
            <Text className={styles.validateLabel}>献血间隔校验</Text>
            <Text className={classnames(styles.validateValue, intervalResult.valid ? styles.valid : styles.invalid)}>
              {intervalResult.valid ? '✓ 符合要求' : '✗ 间隔不足'}
            </Text>
          </View>
          <View className={styles.validateRow}>
            <Text className={styles.validateLabel}>距上次献血</Text>
            <Text className={styles.validateValue}>{intervalResult.daysSinceLast} 天</Text>
          </View>
          {!intervalResult.valid && (
            <View className={styles.validateRow}>
              <Text className={styles.validateLabel}>还需等待</Text>
              <Text className={classnames(styles.validateValue, styles.warning)}>
                {intervalResult.requiredDays - intervalResult.daysSinceLast} 天
              </Text>
            </View>
          )}
        </View>
      )}

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>献血信息</Text>
        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>献血量 (ml)</Text>
            <View className={styles.volumeOptions}>
              {volumeOptions.map(v => (
                <Text
                  key={v}
                  className={classnames(styles.volumeOption, volume === v && styles.active)}
                  onClick={() => setVolume(v)}
                >
                  {v}ml
                </Text>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>献血日期</Text>
            <Picker mode="date" value={date} onChange={(e) => setDate(e.detail.value)}>
              <View className={styles.formInput}>
                <Text className={styles.pickerText}>{date}</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>献血地点</Text>
            <Picker
              mode="selector"
              range={locationOptions}
              value={locationIndex}
              onChange={(e) => {
                setLocationIndex(e.detail.value);
                setLocation(locationOptions[e.detail.value]);
              }}
            >
              <View className={styles.formInput}>
                <Text className={styles.pickerText}>{location}</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>血液类型</Text>
            <View className={styles.formInput}>
              <Text className={styles.pickerText}>{type}</Text>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>操作员</Text>
            <Input
              className={styles.formInput}
              placeholder="请输入操作员姓名"
              placeholderClass={styles.pickerPlaceholder}
              value={operator}
              onInput={(e) => setOperator(e.detail.value)}
            />
          </View>
        </View>
      </View>

      {selectedDonor && newLevel && (
        <View className={styles.previewCard}>
          <Text className={styles.previewTitle}>登记后预览</Text>
          <View className={styles.previewRow}>
            <Text className={styles.previewLabel}>累计献血量</Text>
            <Text className={styles.previewValue}>
              {formatVolume(selectedDonor.totalVolume)} → {formatVolume(selectedDonor.totalVolume + volume)}
            </Text>
          </View>
          <View className={styles.previewRow}>
            <Text className={styles.previewLabel}>献血次数</Text>
            <Text className={styles.previewValue}>
              {selectedDonor.totalDonations} 次 → {selectedDonor.totalDonations + 1} 次
            </Text>
          </View>
          <View className={styles.previewRow}>
            <Text className={styles.previewLabel}>荣誉等级</Text>
            <Text className={classnames(styles.previewValue, newLevel.id !== selectedDonor.levelId && styles.valid)}>
              {selectedDonor.levelName}
              {newLevel.id !== selectedDonor.levelId && ` → ${newLevel.name} ↑`}
            </Text>
          </View>
        </View>
      )}

      <Button
        className={canSubmit ? styles.submitBtn : styles.submitBtnDisabled}
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        确认登记
      </Button>
    </ScrollView>
  );
};

export default DonationRegisterPage;
