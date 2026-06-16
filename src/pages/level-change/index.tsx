import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Picker, Button, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useDonorStore } from '@/store/donorStore';
import { useBenefitStore } from '@/store/benefitStore';
import { ChangeType } from '@/types/benefit';
import { formatVolume, formatMoney } from '@/utils/formatter';
import dayjs from 'dayjs';

const LevelChangePage: React.FC = () => {
  const router = useRouter();
  const donorList = useDonorStore(state => state.donors);
  const { honorLevels, getBenefitByDonorId, calculateCarryOver, processLevelChange } = useBenefitStore();
  const donorBenefits = useBenefitStore(state => state.donorBenefits);

  const [selectedDonorId, setSelectedDonorId] = useState<string>('');
  const [changeType, setChangeType] = useState<ChangeType>('upgrade');
  const [fromLevelId, setFromLevelId] = useState<string>('');
  const [toLevelId, setToLevelId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [operator, setOperator] = useState<string>('');

  useEffect(() => {
    const donorId = router.params.donorId;
    if (donorId) {
      setSelectedDonorId(donorId);
    }
  }, [router.params.donorId]);

  const selectedDonor = useMemo(() => {
    return selectedDonorId ? donorList.find(d => d.id === selectedDonorId) : undefined;
  }, [selectedDonorId, donorList]);

  const donorBenefit = useMemo(() => {
    return selectedDonorId ? donorBenefits.find(b => b.donorId === selectedDonorId) : undefined;
  }, [selectedDonorId, donorBenefits]);

  useEffect(() => {
    if (selectedDonor && !fromLevelId) {
      setFromLevelId(selectedDonor.levelId);
    }
  }, [selectedDonor, fromLevelId]);

  const fromLevel = useMemo(() => honorLevels.find(l => l.id === fromLevelId), [fromLevelId, honorLevels]);
  const toLevel = useMemo(() => honorLevels.find(l => l.id === toLevelId), [toLevelId, honorLevels]);

  const carryOverResult = useMemo(() => {
    if (!fromLevel || !toLevel) return null;
    const currentRemaining = donorBenefit?.remainingQuota || fromLevel.quota;
    return calculateCarryOver(fromLevel, toLevel, currentRemaining, changeType);
  }, [fromLevel, toLevel, donorBenefit, changeType, calculateCarryOver]);

  const handleDonorSelect = (e: any) => {
    const idx = e.detail.value;
    const donor = donorList[idx];
    if (donor) {
      setSelectedDonorId(donor.id);
      setFromLevelId(donor.levelId);
      setToLevelId('');
    }
  };

  const handleFromLevelSelect = (e: any) => {
    setFromLevelId(honorLevels[e.detail.value].id);
  };

  const handleToLevelSelect = (e: any) => {
    setToLevelId(honorLevels[e.detail.value].id);
  };

  const handleSubmit = () => {
    if (!selectedDonor || !fromLevel || !toLevel || !carryOverResult) {
      Taro.showToast({ title: '请完善信息', icon: 'none' });
      return;
    }

    if (fromLevel.id === toLevel.id) {
      Taro.showToast({ title: '新等级不能与原等级相同', icon: 'none' });
      return;
    }

    processLevelChange(
      selectedDonor.id,
      selectedDonor.name,
      fromLevel,
      toLevel,
      changeType,
      operator || '系统',
      reason || (changeType === 'upgrade' ? '累计献血量达标，自动升级' : '年度权益调整')
    );

    Taro.showToast({ title: '变更成功', icon: 'success' });
    console.log('[LevelChange] 等级变更完成', {
      donorName: selectedDonor.name,
      from: fromLevel.name,
      to: toLevel.name,
      changeType
    });

    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择献血者</Text>
        <View className={styles.card}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>献血者</Text>
            <Picker
              mode="selector"
              range={donors.map(d => `${d.name} (${d.levelName} - ${formatVolume(d.totalVolume)})`)}
              value={donors.findIndex(d => d.id === selectedDonorId)}
              onChange={handleDonorSelect}
            >
              <View className={styles.formInput}>
                <Text className={selectedDonor ? styles.pickerText : styles.pickerPlaceholder}>
                  {selectedDonor
                    ? `${selectedDonor.name} - ${selectedDonor.levelName}`
                    : '请选择献血者'}
                </Text>
              </View>
            </Picker>
          </View>
        </View>
      </View>

      {selectedDonor && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>变更类型</Text>
          <View className={styles.card}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>变更类型</Text>
              <View className={styles.changeTypeOptions}>
                <Text
                  className={classnames(styles.changeTypeOption, changeType === 'upgrade' && styles.activeUpgrade)}
                  onClick={() => setChangeType('upgrade')}
                >
                  ↑ 升级
                </Text>
                <Text
                  className={classnames(styles.changeTypeOption, changeType === 'downgrade' && styles.activeDowngrade)}
                  onClick={() => setChangeType('downgrade')}
                >
                  ↓ 降级
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {selectedDonor && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>等级选择</Text>
          <View className={styles.card}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>原等级</Text>
              <Picker
                mode="selector"
                range={honorLevels.map(l => l.name)}
                value={honorLevels.findIndex(l => l.id === fromLevelId)}
                onChange={handleFromLevelSelect}
              >
                <View className={styles.formInput}>
                  <Text className={styles.pickerText}>{fromLevel?.name || '请选择'}</Text>
                </View>
              </Picker>
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>新等级</Text>
              <Picker
                mode="selector"
                range={honorLevels.map(l => l.name)}
                value={honorLevels.findIndex(l => l.id === toLevelId)}
                onChange={handleToLevelSelect}
              >
                <View className={styles.formInput}>
                  <Text className={toLevel ? styles.pickerText : styles.pickerPlaceholder}>
                    {toLevel?.name || '请选择新等级'}
                  </Text>
                </View>
              </Picker>
            </View>
          </View>
        </View>
      )}

      {fromLevel && toLevel && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>额度结转预览</Text>
          <View className={styles.levelCompare}>
            <View className={styles.levelSide}>
              <Text className={styles.levelName} style={{ color: fromLevel.color }}>
                {fromLevel.name}
              </Text>
              <Text className={styles.levelSub}>原等级额度</Text>
            </View>
            <Text className={styles.arrow}>→</Text>
            <View className={styles.levelSide}>
              <Text className={styles.levelName} style={{ color: toLevel.color }}>
                {toLevel.name}
              </Text>
              <Text className={styles.levelSub}>新等级额度</Text>
            </View>
          </View>

          <View className={styles.quotaCompare}>
            <View className={styles.quotaItem}>
              <Text className={styles.quotaItemTitle}>体检</Text>
              <Text className={styles.quotaItemValue}>{fromLevel.quota.physicalExam}次</Text>
            </View>
            <Text className={styles.quotaArrow}>→</Text>
            <View className={styles.quotaItem}>
              <Text className={styles.quotaItemTitle}>体检</Text>
              <Text className={styles.quotaItemValue}>{toLevel.quota.physicalExam}次</Text>
            </View>

            <View className={styles.quotaItem}>
              <Text className={styles.quotaItemTitle}>优先用血</Text>
              <Text className={styles.quotaItemValue}>{fromLevel.quota.priorityBlood}次</Text>
            </View>
            <Text className={styles.quotaArrow}>→</Text>
            <View className={styles.quotaItem}>
              <Text className={styles.quotaItemTitle}>优先用血</Text>
              <Text className={styles.quotaItemValue}>{toLevel.quota.priorityBlood}次</Text>
            </View>

            <View className={styles.quotaItem}>
              <Text className={styles.quotaItemTitle}>医疗补贴</Text>
              <Text className={styles.quotaItemValue}>{formatMoney(fromLevel.quota.medicalSubsidy)}</Text>
            </View>
            <Text className={styles.quotaArrow}>→</Text>
            <View className={styles.quotaItem}>
              <Text className={styles.quotaItemTitle}>医疗补贴</Text>
              <Text className={styles.quotaItemValue}>{formatMoney(toLevel.quota.medicalSubsidy)}</Text>
            </View>
          </View>

          {carryOverResult && (
            <View className={styles.carryOverBox}>
              <Text className={styles.carryOverTitle}>结转计算结果</Text>
              <View className={styles.carryOverRow}>
                <Text className={styles.carryOverLabel}>结转后体检次数</Text>
                <Text className={styles.carryOverValue}>{carryOverResult.remainingQuota.physicalExam}次</Text>
              </View>
              <View className={styles.carryOverRow}>
                <Text className={styles.carryOverLabel}>结转后优先用血</Text>
                <Text className={styles.carryOverValue}>{carryOverResult.remainingQuota.priorityBlood}次</Text>
              </View>
              <View className={styles.carryOverRow}>
                <Text className={styles.carryOverLabel}>结转后医疗补贴</Text>
                <Text className={styles.carryOverValue}>{formatMoney(carryOverResult.remainingQuota.medicalSubsidy)}</Text>
              </View>
              {carryOverResult.clearedAmount > 0 && (
                <View className={styles.carryOverRow}>
                  <Text className={classnames(styles.carryOverLabel, styles.cleared)}>降级清零金额</Text>
                  <Text className={classnames(styles.carryOverValue, styles.cleared)}>
                    -{formatMoney(carryOverResult.clearedAmount)}
                  </Text>
                </View>
              )}
              {carryOverResult.supplementedAmount > 0 && (
                <View className={styles.carryOverRow}>
                  <Text className={classnames(styles.carryOverLabel, styles.supplemented)}>升级补足金额</Text>
                  <Text className={classnames(styles.carryOverValue, styles.supplemented)}>
                    +{formatMoney(carryOverResult.supplementedAmount)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>变更信息</Text>
        <View className={styles.card}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>变更原因</Text>
            <Textarea
              className={styles.textarea}
              placeholder="请输入变更原因"
              placeholderClass={styles.pickerPlaceholder}
              value={reason}
              onInput={(e) => setReason(e.detail.value)}
              maxlength={200}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>操作员</Text>
            <View className={styles.formInput}>
              <Text className={styles.pickerPlaceholder} style={{ display: 'none' }} />
              <Textarea
                value={operator}
                onInput={(e) => setOperator(e.detail.value)}
                placeholder="请输入操作员姓名"
                placeholderClass={styles.pickerPlaceholder}
                style={{ width: '100%', fontSize: '28rpx', color: '#1D2129', background: 'transparent', border: 'none', padding: 0 }}
                maxlength={50}
              />
            </View>
          </View>
        </View>
      </View>

      <Button className={styles.submitBtn} onClick={handleSubmit}>
        确认变更并留痕
      </Button>
    </ScrollView>
  );
};

export default LevelChangePage;
