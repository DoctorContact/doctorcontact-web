import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePeriodReport, useGrowthReport } from '../../hooks/useClinic';
import {
  GradientCard,
  StatCard,
  Icon,
} from '../../components';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../theme';

export default function ClinicReportsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const {
    data: report,
    isLoading: loadingReport,
    refetch: refetchReport,
    isRefetching: refetchingReport,
  } = usePeriodReport(period);

  const {
    data: growth,
    isLoading: loadingGrowth,
    refetch: refetchGrowth,
    isRefetching: refetchingGrowth,
  } = useGrowthReport(period);

  const handleRefresh = () => {
    refetchReport();
    refetchGrowth();
  };

  const isLoading = loadingReport || loadingGrowth;
  const isRefetching = refetchingReport || refetchingGrowth;

  const totalAppointments = report?.totalAppointments ?? 0;
  const estimatedRevenue = report?.estimatedRevenue ?? 0;
  const byStatus = report?.byStatus ?? {};
  const byDoctor = Object.entries(report?.byDoctor ?? {});

  const growthSummary = growth?.summary;
  const growthRate = growthSummary?.growthRatePercent ?? 0;
  const isPositiveGrowth = growthRate >= 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Icon name="arrow-left" size={18} color={Colors.light.ink900} />
        </TouchableOpacity>
        <Text style={styles.headerBarTitle}>Reports & Analytics</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
      >
        {/* 2. Period Switcher Chips */}
        <View style={styles.periodSwitcher}>
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => {
            const isSel = period === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.periodTab, isSel && styles.periodTabActive]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.periodTabText, isSel && styles.periodTabTextActive]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. Revenue Hero Banner */}
        <GradientCard variant="green" style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroSub}>ESTIMATED REVENUE</Text>
                <Text style={styles.heroRevenueText}>₹{estimatedRevenue.toLocaleString()}</Text>
              </View>
              <View style={styles.growthBadge}>
                <Icon
                  name="trending-up"
                  size={14}
                  color={isPositiveGrowth ? '#047857' : '#DC2626'}
                />
                <Text
                  style={[
                    styles.growthBadgeText,
                    { color: isPositiveGrowth ? '#047857' : '#DC2626' },
                  ]}
                >
                  {isPositiveGrowth ? '+' : ''}
                  {growthRate}%
                </Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroKpiRow}>
              <View style={styles.heroKpi}>
                <Text style={styles.heroKpiVal}>{totalAppointments}</Text>
                <Text style={styles.heroKpiLabel}>Total Consultations</Text>
              </View>
              <View style={styles.heroKpi}>
                <Text style={styles.heroKpiVal}>
                  {growthSummary?.currentPeriodPatients ?? 0}
                </Text>
                <Text style={styles.heroKpiLabel}>Active Patients</Text>
              </View>
            </View>
          </View>
        </GradientCard>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color={Colors.light.primary} />
            <Text style={styles.centerStateText}>Calculating performance metrics...</Text>
          </View>
        ) : (
          <>
            {/* 4. Status Breakdown */}
            <GradientCard variant="blue" style={styles.sectionCard}>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionHeading}>Consultation Status Split</Text>

                <View style={styles.statusGrid}>
                  <View style={styles.statusBox}>
                    <Text style={styles.statusLabel}>Completed</Text>
                    <Text style={[styles.statusVal, { color: '#047857' }]}>
                      {byStatus.COMPLETED ?? 0}
                    </Text>
                  </View>
                  <View style={styles.statusBox}>
                    <Text style={styles.statusLabel}>Waiting</Text>
                    <Text style={[styles.statusVal, { color: '#D97706' }]}>
                      {byStatus.WAITING ?? 0}
                    </Text>
                  </View>
                  <View style={styles.statusBox}>
                    <Text style={styles.statusLabel}>In Consultation</Text>
                    <Text style={[styles.statusVal, { color: Colors.light.primary }]}>
                      {byStatus.IN_CONSULTATION ?? 0}
                    </Text>
                  </View>
                  <View style={styles.statusBox}>
                    <Text style={styles.statusLabel}>Cancelled</Text>
                    <Text style={[styles.statusVal, { color: '#DC2626' }]}>
                      {byStatus.CANCELLED ?? 0}
                    </Text>
                  </View>
                </View>
              </View>
            </GradientCard>

            {/* 5. Doctor-Wise Performance & Revenue */}
            <GradientCard variant="purple" style={styles.sectionCard}>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionHeading}>Doctor Volume & Revenue</Text>

                {byDoctor.length === 0 ? (
                  <Text style={styles.noDataText}>
                    No doctor volume data recorded for this period.
                  </Text>
                ) : (
                  <View style={styles.doctorList}>
                    {byDoctor.map(([docName, dStats], idx) => (
                      <View key={`doc-rep-${idx}`} style={styles.doctorRow}>
                        <View style={styles.doctorInfoCol}>
                          <Text style={styles.doctorName}>Dr. {docName}</Text>
                          <Text style={styles.doctorSub}>
                            {dStats.totalAppointments} Visits • {dStats.completed} Completed
                          </Text>
                        </View>

                        <View style={styles.doctorRevenueCol}>
                          <Text style={styles.doctorRevenue}>
                            ₹{dStats.revenue?.toLocaleString() || 0}
                          </Text>
                          <Text style={styles.doctorRevenueLabel}>Revenue</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </GradientCard>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSoft,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.light.surfaceWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surface100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBarTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  periodSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface100,
    borderRadius: Radius.lg,
    padding: 3,
    gap: 3,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: Colors.light.primary,
  },
  periodTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.ink600,
  },
  periodTabTextActive: {
    color: '#FFFFFF',
  },
  heroCard: {
    marginBottom: 0,
  },
  heroContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroSub: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#047857',
  },
  heroRevenueText: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
    marginTop: 2,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  growthBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  heroDivider: {
    height: 1,
    backgroundColor: Colors.light.surface200,
  },
  heroKpiRow: {
    flexDirection: 'row',
  },
  heroKpi: {
    flex: 1,
    gap: 2,
  },
  heroKpiVal: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  heroKpiLabel: {
    fontSize: 10,
    color: Colors.light.ink500,
    fontWeight: '600',
  },
  sectionCard: {
    marginBottom: 0,
  },
  sectionContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionHeading: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statusBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.light.surface50,
    borderRadius: Radius.md,
    padding: Spacing.two,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.light.surface200,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.ink600,
  },
  statusVal: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
  noDataText: {
    fontSize: 12,
    color: Colors.light.ink500,
    fontStyle: 'italic',
    paddingVertical: Spacing.two,
  },
  doctorList: {
    gap: Spacing.two,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.surface50,
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.surface200,
  },
  doctorInfoCol: {
    gap: 2,
  },
  doctorName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.ink900,
  },
  doctorSub: {
    fontSize: 10,
    color: Colors.light.ink500,
  },
  doctorRevenueCol: {
    alignItems: 'flex-end',
  },
  doctorRevenue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#047857',
  },
  doctorRevenueLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.light.ink500,
  },
  centerState: {
    alignItems: 'center',
    padding: Spacing.six,
    gap: Spacing.two,
  },
  centerStateText: {
    fontSize: 13,
    color: Colors.light.ink500,
  },
});
