import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import BenefitCard from '@/components/BenefitCard';
import { useBenefitStore } from '@/store/benefitStore';
import { useDonorStore } from '@/store/donorStore';
import { formatDate, formatMoney, formatVolume } from '@/utils/formatter';

const BenefitsPage: React.FC = () => {
  const honorLevels = useBenefitStore(state => state.honorLevels);
  const levelChangeRecords = useBenefitStore(state => state.levelChangeRecords);
  const donorBenefits = useBenefitStore(state => state.donorBenefits);
  const donorList = useDonorStore(state => state.donors);
  
  const [activeTab, setActiveTab] = useState<'levels' | 'records' | 'my'>('levels');
  const [selectedDonorIndex, setSelectedDonorIndex] = useState(0);

  const handleLevelChange = () => {
    Taro.navigateTo({ url: '/pages/level-change/index' });
  };

  const allDonorBenefits = useMemo(() => {
    return donorBenefits.map(benefit => {
      const donor = donorList.find(d => d.id === benefit.donorId);
      return {
        ...benefit,
        totalVolume: donor?.totalVolume || benefit.totalVolume,
        totalDonations: donor?.totalDonations || 0
      };
    }).sort((a, b) => b.totalVolume - a.totalVolume);
  }, [donorBenefits, donorList]);

  const selectedBenefit = useMemo(() => allDonorBenefits[selectedDonorIndex], [allDonorBenefits, selectedDonorIndex]);
  const donorPickerOptions = useMemo(() => 
    allDonorBenefits.map(b => `${b.donorName} - ${b.levelName}`), 
    [allDonorBenefits]
  );

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.tabs}>
          <Text
            className={classnames(styles.tab, activeTab === 'levels' && styles.active)}
            onClick={() => setActiveTab('levels')}
          >
            等级配置
          </Text>
          <Text
            className={classnames(styles.tab, activeTab === 'records' && styles.active)}
            onClick={() => setActiveTab('records')}
          >
            变更记录
          </Text>
          <Text
            className={classnames(styles.tab, activeTab === 'my' && styles.active)}
            onClick={() => setActiveTab('my')}
          >
            权益额度
          </Text>
        </View>
      </View>

      {activeTab === 'levels' && (
        <>
          <Text className={styles.sectionTitle}>荣誉等级体系</Text>
          <View className={styles.levelGrid}>
            {honorLevels.map(level => (
              <BenefitCard key={level.id} level={level} />
            ))}
          </View>
          <Button className={styles.actionBtn} onClick={handleLevelChange}>
            等级变更操作
          </Button>
        </>
      )}

      {activeTab === 'records' && (
        <>
          <Text className={styles.sectionTitle}>等级变更记录</Text>
          <View className={styles.recordList}>
            {levelChangeRecords.length > 0 ? (
              levelChangeRecords.map(record => (
                <View key={record.id} className={styles.recordCard}>
                  <View className={styles.recordHeader}>
                    <Text className={styles.recordTitle}>{record.donorName}</Text>
                    <Text className={styles.recordDate}>{formatDate(record.changeDate)}</Text>
                  </View>
                  <View className={classnames(styles.levelChange, record.changeType)}>
                    <View className={styles.levelItem}>
                      <Text className={styles.levelName} style={{ color: '#9E9E9E' }}>
                        {record.fromLevelName}
                      </Text>
                      <Text className={styles.levelLabel}>原等级</Text>
                    </View>
                    <Text className={styles.arrow}>
                      {record.changeType === 'upgrade' ? '↑' : record.changeType === 'downgrade' ? '↓' : '→'}
                    </Text>
                    <View className={styles.levelItem}>
                      <Text className={styles.levelName} style={{ color: '#FFB300' }}>
                        {record.toLevelName}
                      </Text>
                      <Text className={styles.levelLabel}>新等级</Text>
                    </View>
                  </View>
                  <View className={styles.recordInfo}>
                    <View className={styles.infoItem}>
                      <Text className={styles.infoLabel}>变更类型</Text>
                      <Text className={styles.infoValue}>
                        {record.changeType === 'upgrade' ? '升级' : record.changeType === 'downgrade' ? '降级' : '调整'}
                      </Text>
                    </View>
                    <View className={styles.infoItem}>
                      <Text className={styles.infoLabel}>操作人</Text>
                      <Text className={styles.infoValue}>{record.operator}</Text>
                    </View>
                  </View>
                  <View className={styles.carryOverBox}>
                    <Text className={styles.carryOverTitle}>额度结转明细</Text>
                    <View className={styles.carryOverRow}>
                      <Text className={styles.carryOverLabel}>免费体检</Text>
                      <Text className={styles.carryOverValue}>
                        剩余{record.carryOverDetail.physicalExam.remaining}次
                        {record.carryOverDetail.physicalExam.diff > 0 && (
                          <Text style={{ color: '#00B42A' }}> (+补{record.carryOverDetail.physicalExam.diff}次)</Text>
                        )}
                        {record.carryOverDetail.physicalExam.diff < 0 && (
                          <Text style={{ color: '#F53F3F' }}> (-清{Math.abs(record.carryOverDetail.physicalExam.diff)}次)</Text>
                        )}
                      </Text>
                    </View>
                    <View className={styles.carryOverRow}>
                      <Text className={styles.carryOverLabel}>优先用血</Text>
                      <Text className={styles.carryOverValue}>
                        剩余{record.carryOverDetail.priorityBlood.remaining}次
                        {record.carryOverDetail.priorityBlood.diff > 0 && (
                          <Text style={{ color: '#00B42A' }}> (+补{record.carryOverDetail.priorityBlood.diff}次)</Text>
                        )}
                        {record.carryOverDetail.priorityBlood.diff < 0 && (
                          <Text style={{ color: '#F53F3F' }}> (-清{Math.abs(record.carryOverDetail.priorityBlood.diff)}次)</Text>
                        )}
                      </Text>
                    </View>
                    <View className={styles.carryOverRow}>
                      <Text className={styles.carryOverLabel}>医疗补贴</Text>
                      <Text className={styles.carryOverValue}>
                        剩余{formatMoney(record.carryOverDetail.medicalSubsidy.remaining)}
                        {record.carryOverDetail.medicalSubsidy.diff > 0 && (
                          <Text style={{ color: '#00B42A' }}> (+补{formatMoney(record.carryOverDetail.medicalSubsidy.diff)})</Text>
                        )}
                        {record.carryOverDetail.medicalSubsidy.diff < 0 && (
                          <Text style={{ color: '#F53F3F' }}> (-清{formatMoney(Math.abs(record.carryOverDetail.medicalSubsidy.diff))})</Text>
                        )}
                      </Text>
                    </View>
                    <View className={styles.carryOverRow}>
                      <Text className={styles.carryOverLabel}>其他权益</Text>
                      <Text className={styles.carryOverValue}>
                        剩余{record.carryOverDetail.otherBenefits.remaining}项
                        {record.carryOverDetail.otherBenefits.diff > 0 && (
                          <Text style={{ color: '#00B42A' }}> (+补{record.carryOverDetail.otherBenefits.diff}项)</Text>
                        )}
                        {record.carryOverDetail.otherBenefits.diff < 0 && (
                          <Text style={{ color: '#F53F3F' }}> (-清{Math.abs(record.carryOverDetail.otherBenefits.diff)}项)</Text>
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📝</Text>
                <Text className={styles.emptyTitle}>暂无变更记录</Text>
                <Text className={styles.emptyDesc}>等级变更后将在此显示</Text>
              </View>
            )}
          </View>
        </>
      )}

      {activeTab === 'my' && (
        <>
          <Text className={styles.sectionTitle}>献血者权益额度</Text>
          {allDonorBenefits.length > 0 ? (
            <>
              <View className={styles.donorSelectorCard}>
                <View className={styles.donorSelectorLabel}>
                  <Text className={styles.formLabel}>选择献血者</Text>
                  <Text className={styles.donorCount}>共 {allDonorBenefits.length} 人</Text>
                </View>
                <Picker
                  mode="selector"
                  range={donorPickerOptions}
                  value={selectedDonorIndex}
                  onChange={(e) => setSelectedDonorIndex(parseInt(e.detail.value))}
                >
                  <View className={styles.donorSelectorInput}>
                    <Text className={styles.donorSelectorText}>
                      {selectedBenefit?.donorName || '请选择献血者'}
                    </Text>
                    <Text className={styles.donorSelectorArrow}>▼</Text>
                  </View>
                </Picker>
              </View>

              {selectedBenefit && (
                <View key={selectedBenefit.donorId}>
                  <View className={styles.benefitHeader}>
                    <Text className={styles.benefitTitle}>{selectedBenefit.donorName} - {selectedBenefit.levelName}</Text>
                    <Text className={styles.benefitSubtitle}>
                      有效期: {formatDate(selectedBenefit.effectiveDate)} ~ {formatDate(selectedBenefit.expiryDate)}
                    </Text>
                    <View className={styles.benefitStats}>
                      <View className={styles.benefitStat}>
                        <Text className={styles.benefitStatValue}>{formatVolume(selectedBenefit.totalVolume)}</Text>
                        <Text className={styles.benefitStatLabel}>累计献血</Text>
                      </View>
                      <View className={styles.benefitStat}>
                        <Text className={styles.benefitStatValue}>{selectedBenefit.totalDonations}</Text>
                        <Text className={styles.benefitStatLabel}>献血次数</Text>
                      </View>
                    </View>
                  </View>

                  <View className={styles.quotaSection}>
                    <View className={styles.quotaCard}>
                      <View className={styles.quotaHeader}>
                        <Text className={styles.quotaName}>年度权益额度</Text>
                        <Text className={styles.quotaLevel}>{selectedBenefit.levelName}</Text>
                      </View>
                      <View className={styles.quotaRow}>
                        <Text className={styles.quotaLabel}>免费体检</Text>
                        <View className={styles.quotaValues}>
                          <Text className={styles.quotaUsed}>已用{selectedBenefit.usedQuota.physicalExam}</Text>
                          <Text className={styles.quotaRemaining}>剩余{selectedBenefit.remainingQuota.physicalExam}</Text>
                          <Text className={styles.quotaTotal}>/共{selectedBenefit.currentQuota.physicalExam}次</Text>
                        </View>
                      </View>
                      <View className={styles.quotaRow}>
                        <Text className={styles.quotaLabel}>优先用血</Text>
                        <View className={styles.quotaValues}>
                          <Text className={styles.quotaUsed}>已用{selectedBenefit.usedQuota.priorityBlood}</Text>
                          <Text className={styles.quotaRemaining}>剩余{selectedBenefit.remainingQuota.priorityBlood}</Text>
                          <Text className={styles.quotaTotal}>/共{selectedBenefit.currentQuota.priorityBlood}次</Text>
                        </View>
                      </View>
                      <View className={styles.quotaRow}>
                        <Text className={styles.quotaLabel}>医疗补贴</Text>
                        <View className={styles.quotaValues}>
                          <Text className={styles.quotaUsed}>已用{formatMoney(selectedBenefit.usedQuota.medicalSubsidy)}</Text>
                          <Text className={styles.quotaRemaining}>剩余{formatMoney(selectedBenefit.remainingQuota.medicalSubsidy)}</Text>
                          <Text className={styles.quotaTotal}>/共{formatMoney(selectedBenefit.currentQuota.medicalSubsidy)}</Text>
                        </View>
                      </View>
                      <View className={styles.quotaRow}>
                        <Text className={styles.quotaLabel}>其他权益</Text>
                        <View className={styles.quotaValues}>
                          <Text className={styles.quotaUsed}>已用{selectedBenefit.usedQuota.otherBenefits}</Text>
                          <Text className={styles.quotaRemaining}>剩余{selectedBenefit.remainingQuota.otherBenefits}</Text>
                          <Text className={styles.quotaTotal}>/共{selectedBenefit.currentQuota.otherBenefits}项</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🎖️</Text>
              <Text className={styles.emptyTitle}>暂无权益数据</Text>
              <Text className={styles.emptyDesc}>献血者完成献血后将获得相应权益</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default BenefitsPage;
