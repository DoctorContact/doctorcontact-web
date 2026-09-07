import React from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDailyDashboard, useClinicDoctors } from '../../hooks/useClinic';
import { useAppointmentRealtime } from '../../hooks/useAppointmentRealtime';
import {
  GradientCard,
  ClinicQueueCard,
  Icon,
} from '../../components';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../theme';

export default function ClinicQueueScreen() {
  const { isConnected } = useAppointmentRealtime();

  const {
    data: dailyDashboard,
    isLoading: loadingDashboard,
    isError,
    error,
    refetch: refetchDashboard,
    isRefetching,
  } = useDailyDashboard();

  const {
    data: doctors = [],
    isLoading: loadingDoctors,
    refetch: refetchDoctors,
  } = useClinicDoctors();

  const handleRefreshAll = () => {
    refetchDashboard();
    refetchDoctors();
  };

  const queueSummary = dailyDashboard?.queueSummary || [];
  const isLoading = loadingDashboard || loadingDoctors;

  const totalWaiting = queueSummary.reduce((acc, curr) => {
    return acc + Math.max(0, (curr.lastTokenIssued || 0) - (curr.currentToken || 0));
  }, 0);

  const activeQueuesCount = queueSummary.filter(
    (q) => q.status?.toUpperCase() === 'ACTIVE'
  ).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.topContainer}>
        {/* 1. Header Card */}
        <GradientCard variant="blue" style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.headerTitles}>
                <Text style={styles.headerTitle}>Live Practice Queues</Text>
                <Text style={styles.headerSubtitle}>
                  Real-time queue monitoring across all practicing doctors
                </Text>
              </View>

              <View style={styles.realtimePill}>
                <View
                  style={[
                    styles.realtimeDot,
                    { backgroundColor: isConnected ? '#10B981' : '#F59E0B' },
                  ]}
                />
                <Text style={styles.realtimePillText}>
                  {isConnected ? 'Realtime' : 'Connecting'}
                </Text>
              </View>
            </View>

            {/* 3 Metrics Row */}
            <View style={styles.kpiRow}>
              <View style={styles.kpiBox}>
                <Text style={styles.kpiVal}>{doctors.length}</Text>
                <Text style={styles.kpiLabel}>Total Doctors</Text>
              </View>
              <View style={styles.kpiBox}>
                <Text style={[styles.kpiVal, { color: '#047857' }]}>
                  {activeQueuesCount}
                </Text>
                <Text style={styles.kpiLabel}>Active Queues</Text>
              </View>
              <View style={styles.kpiBox}>
                <Text style={[styles.kpiVal, { color: '#D97706' }]}>
                  {totalWaiting}
                </Text>
                <Text style={styles.kpiLabel}>Total Waiting</Text>
              </View>
            </View>
          </View>
        </GradientCard>
      </View>

      {/* 2. Content List */}
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={Colors.light.primary} />
          <Text style={styles.centerStateText}>Synchronizing queue states...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={28} color={Colors.light.danger} />
          <Text style={styles.errorTitle}>Unable to load clinic queues</Text>
          <Text style={styles.errorSubtitle}>
            {error instanceof Error ? error.message : 'Please check your connection.'}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={handleRefreshAll}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : queueSummary.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Icon name="list-ordered" size={28} color={Colors.light.ink400} />
          </View>
          <Text style={styles.emptyTitle}>No Active Queues Today</Text>
          <Text style={styles.emptySubtitle}>
            When doctors begin their consultation sessions and call patient tokens, live queue statuses will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={queueSummary}
          keyExtractor={(item, index) => item.doctorId || `queue-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefreshAll}
              tintColor={Colors.light.primary}
              colors={[Colors.light.primary]}
            />
          }
          renderItem={({ item }) => <ClinicQueueCard queueItem={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSoft,
  },
  topContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  headerCard: {
    marginBottom: 0,
  },
  headerContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.light.ink500,
    marginTop: 1,
  },
  realtimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  realtimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  realtimePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.ink700,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: Colors.light.surface50,
    borderRadius: Radius.md,
    padding: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.surface200,
  },
  kpiVal: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.ink500,
    textTransform: 'uppercase',
  },
  listContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  centerStateText: {
    fontSize: 13,
    color: Colors.light.ink500,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.six,
    gap: Spacing.two,
  },
  emptyIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.surface100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.ink900,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.light.ink500,
    textAlign: 'center',
    maxWidth: 280,
  },
});
