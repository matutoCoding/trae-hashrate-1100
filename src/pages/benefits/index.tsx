import React, { useState } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import BenefitCard from '@/components/BenefitCard';
import { useBenefitStore } from '@/store/benefitStore';
import { useDonorStore } from '@/store/donorStore';
import { formatDate, formatMoney } from '@/utils/formatter';

const BenefitsPage: React.FC = () => {
  const { honorLevels, levelChangeRecords, donorBenefits } = useBenefitStore();
  const { donors } = useDonorStore();
  const [activeTab, setActiveTab] = useState<'levels' | 'records' | 'my'>('levels');

  const handleLevelChange = () => {
    Taro.navigateTo({ url: '/pages/level-change/index' });
  };

  const donorWithBenefit = donors.slice(0, 1).map(d => {
    const benefit = donorBenefits.find(b => b.donorId === d.id);
    return { donor: d, benefit };
  }).filter(x => x.benefit);

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
                      <Text className={styles.carryOverLabel}>免费体检结转</Text>
                      <Text className={styles.carryOverValue}>{record.carryOverDetail.physicalExam}次</Text>
                    </View>
                    <View className={styles.carryOverRow}>
                      <Text className={styles.carryOverLabel}>优先用血结转</Text>
                      <Text className={styles.carryOverValue}>{record.carryOverDetail.priorityBlood}次</Text>
                    </View>
                    <View className={styles.carryOverRow}>
                      <Text className={styles.carryOverLabel}>医疗补贴结转</Text>
                      <Text className={styles.carryOverValue}>{formatMoney(record.carryOverDetail.medicalSubsidy)}</Text>
                    </View>
                    {record.carryOverDetail.clearedAmount > 0 && (
                      <View className={styles.carryOverRow}>
                        <Text className={styles.carryOverLabel} style={{ color: '#F53F3F' }}>清零金额</Text>
                        <Text className={styles.carryOverValue} style={{ color: '#F53F3F' }}>
                          -{formatMoney(record.carryOverDetail.clearedAmount)}
                        </Text>
                      </View>
                    )}
                    {record.carryOverDetail.supplementedAmount > 0 && (
                      <View className={styles.carryOverRow}>
                        <Text className={styles.carryOverLabel} style={{ color: '#00B42A' }}>补足金额</Text>
                        <Text className={styles.carryOverValue} style={{ color: '#00B42A' }}>
                          +{formatMoney(record.carryOverDetail.supplementedAmount)}
                        </Text>
                      </View>
                    )}
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
          {donorWithBenefit.length > 0 ? (
            donorWithBenefit.map(({ donor, benefit }) => (
              benefit && (
                <View key={donor.id}>
                  <View className={styles.benefitHeader}>
                    <Text className={styles.benefitTitle}>{donor.name} - {benefit.levelName}</Text>
                    <Text className={styles.benefitSubtitle}>
                      有效期: {formatDate(benefit.effectiveDate)} ~ {formatDate(benefit.expiryDate)}
                    </Text>
                    <View className={styles.benefitStats}>
                      <View className={styles.benefitStat}>
                        <Text className={styles.benefitStatValue}>{donor.totalVolume}</Text>
                        <Text className={styles.benefitStatLabel}>累计献血(ml)</Text>
                      </View>
                      <View className={styles.benefitStat}>
                        <Text className={styles.benefitStatValue}>{donor.totalDonations}</Text>
                        <Text className={styles.benefitStatLabel}>献血次数</Text>
                      </View>
                    </View>
                  </View>

                  <View className={styles.quotaSection}>
                    <View className={styles.quotaCard}>
                      <View className={styles.quotaHeader}>
                        <Text className={styles.quotaName}>年度权益额度</Text>
                        <Text className={styles.quotaLevel}>{benefit.levelName}</Text>
                      </View>
                      <View className={styles.quotaRow}>
                        <Text className={styles.quotaLabel}>免费体检</Text>
                        <View className={styles.quotaValues}>
                          <Text className={styles.quotaUsed}>已用{benefit.usedQuota.physicalExam}</Text>
                          <Text className={styles.quotaRemaining}>剩余{benefit.remainingQuota.physicalExam}</Text>
                          <Text className={styles.quotaTotal}>/共{benefit.currentQuota.physicalExam}次</Text>
                        </View>
                      </View>
                      <View className={styles.quotaRow}>
                        <Text className={styles.quotaLabel}>优先用血</Text>
                        <View className={styles.quotaValues}>
                          <Text className={styles.quotaUsed}>已用{benefit.usedQuota.priorityBlood}</Text>
                          <Text className={styles.quotaRemaining}>剩余{benefit.remainingQuota.priorityBlood}</Text>
                          <Text className={styles.quotaTotal}>/共{benefit.currentQuota.priorityBlood}次</Text>
                        </View>
                      </View>
                      <View className={styles.quotaRow}>
                        <Text className={styles.quotaLabel}>医疗补贴</Text>
                        <View className={styles.quotaValues}>
                          <Text className={styles.quotaUsed}>已用{formatMoney(benefit.usedQuota.medicalSubsidy)}</Text>
                          <Text className={styles.quotaRemaining}>剩余{formatMoney(benefit.remainingQuota.medicalSubsidy)}</Text>
                          <Text className={styles.quotaTotal}>/共{formatMoney(benefit.currentQuota.medicalSubsidy)}</Text>
                        </View>
                      </View>
                      <View className={styles.quotaRow}>
                        <Text className={styles.quotaLabel}>其他权益</Text>
                        <View className={styles.quotaValues}>
                          <Text className={styles.quotaUsed}>已用{benefit.usedQuota.otherBenefits}</Text>
                          <Text className={styles.quotaRemaining}>剩余{benefit.remainingQuota.otherBenefits}</Text>
                          <Text className={styles.quotaTotal}>/共{benefit.currentQuota.otherBenefits}项</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )
            ))
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
