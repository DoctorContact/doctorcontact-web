import React from 'react';
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
import { useDailyDashboard } from '../../hooks/useClinic';
import {
  GradientCard,
  StatCard,
  Icon,
} from '../../components';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../theme';

export default function ClinicAppointmentsScreen() {
  const router = useRouter();

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useDailyDashboard();

  const totalAppointments = dashboard?.totalAppointments ?? 0;
  const totalPatients = dashboard?.totalPatients ?? 0;
  const newPatients = dashboard?.newPatients ?? 0;
  const returningPatients = dashboard?.returningPatients ?? 0;
  const statusBreakdown = dashboard?.statusBreakdown ?? {};
  const doctorWise = dashboard?.doctorWise ?? {};

  const doctorWiseList = Object.entries(doctorWise);

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
        <Text style={styles.headerBarTitle}>Daily Visits & Analytics</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
      >
        {/* 2. Top Summary Card */}
        <GradientCard variant="blue" style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryHeader}>
              <View style={styles.iconCircle}>
                <Icon name="calendar" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.summaryTitle}>Today's Appointment Load</Text>
                <Text style={styles.summarySub}>
                  {dashboard?.date || new Date().toISOString().split('T')[0]}
                </Text>
              </View>
            </View>

            <View style={styles.mainKpiRow}>
              <View style={styles.mainKpiItem}>
                <Text style={styles.mainKpiVal}>{totalAppointments}</Text>
                <Text style={styles.mainKpiLabel}>Total Visits</Text>
              </View>
              <View style={styles.mainKpiDivider} />
              <View style={styles.mainKpiItem}>
                <Text style={styles.mainKpiVal}>{totalPatients}</Text>
                <Text style={styles.mainKpiLabel}>Unique Patients</Text>
              </View>
            </View>
          </View>
        </GradientCard>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color={Colors.light.primary} />
            <Text style={styles.centerStateText}>Compiling daily analytics...</Text>
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={28} color={Colors.light.danger} />
            <Text style={styles.errorTitle}>Unable to load appointment report</Text>
            <Text style={styles.errorSubtitle}>
              {error instanceof Error ? error.message : 'Please check connection.'}
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* 3. Patient Demographics & Returning Stats */}
            <View style={styles.statsRow}>
              <StatCard
                label="New Patients"
                value={newPatients}
                iconName="user"
                variant="green"
              />
              <StatCard
                label="Returning"
                value={returningPatients}
                iconName="refresh-cw"
                variant="purple"
              />
            </View>

            {/* 4. Status Breakdown */}
            <GradientCard variant="green" style={styles.breakdownCard}>
              <View style={styles.breakdownContent}>
                <Text style={styles.sectionTitle}>Status Distribution</Text>

                <View style={styles.statusGrid}>
                  <View style={styles.statusBox}>
                    <Text style={styles.statusLabel}>Completed</Text>
                    <Text style={[styles.statusVal, { color: '#047857' }]}>
                      {statusBreakdown.COMPLETED ?? 0}
                    </Text>
                  </View>

                  <View style={styles.statusBox}>
                    <Text style={styles.statusLabel}>Waiting</Text>
                    <Text style={[styles.statusVal, { color: '#D97706' }]}>
                      {statusBreakdown.WAITING ?? 0}
                    </Text>
                  </View>

                  <View style={styles.statusBox}>
                    <Text style={styles.statusLabel}>In Consultation</Text>
                    <Text style={[styles.statusVal, { color: Colors.light.primary }]}>
                      {statusBreakdown.IN_CONSULTATION ?? 0}
                    </Text>
                  </View>

                  <View style={styles.statusBox}>
                    <Text style={styles.statusLabel}>Cancelled</Text>
                    <Text style={[styles.statusVal, { color: '#DC2626' }]}>
                      {statusBreakdown.CANCELLED ?? 0}
                    </Text>
                  </View>
                </View>
              </View>
            </GradientCard>

            {/* 5. Doctor-Wise Performance Breakdown */}
            <GradientCard variant="blue" style={styles.doctorWiseCard}>
              <View style={styles.doctorWiseContent}>
                <Text style={styles.sectionTitle}>Doctor-Wise Load</Text>

                {doctorWiseList.length === 0 ? (
                  <Text style={styles.noDocText}>
                    No doctor appointment records recorded for today yet.
                  </Text>
                ) : (
                  <View style={styles.doctorListContainer}>
                    {doctorWiseList.map(([docName, stats], idx) => (
                      <View key={`doc-${idx}`} style={styles.docRow}>
                        <View style={styles.docInfoCol}>
                          <Text style={styles.docNameText}>Dr. {docName}</Text>
                          <Text style={styles.docSubText}>
                            {stats.totalAppointments} Total Scheduled
                          </Text>
                        </View>

                        <View style={styles.docStatsCol}>
                          <View style={styles.docPill}>
                            <Text style={styles.docPillText}>
                              {stats.completed} done • {stats.waiting} waiting
                            </Text>
                          </View>
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
  summaryCard: {
    marginBottom: 0,
  },
  summaryContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  summarySub: {
    fontSize: 11,
    color: Colors.light.ink500,
  },
  mainKpiRow: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface50,
    borderRadius: Radius.md,
    padding: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.surface200,
  },
  mainKpiItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  mainKpiVal: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  mainKpiLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.ink500,
    textTransform: 'uppercase',
  },
  mainKpiDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.light.surface200,
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
  errorContainer: {
    alignItems: 'center',
    padding: Spacing.six,
    gap: Spacing.two,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.danger,
  },
  errorSubtitle: {
    fontSize: 12,
    color: '#991B1B',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.light.danger,
    paddingVertical: 8,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  breakdownCard: {
    marginBottom: 0,
  },
  breakdownContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionTitle: {
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
  doctorWiseCard: {
    marginBottom: 0,
  },
  doctorWiseContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  noDocText: {
    fontSize: 12,
    color: Colors.light.ink500,
    fontStyle: 'italic',
    paddingVertical: Spacing.two,
  },
  doctorListContainer: {
    gap: Spacing.two,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.surface50,
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.surface200,
  },
  docInfoCol: {
    gap: 2,
  },
  docNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.ink900,
  },
  docSubText: {
    fontSize: 10,
    color: Colors.light.ink500,
  },
  docStatsCol: {
    alignItems: 'flex-end',
  },
  docPill: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  docPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});
