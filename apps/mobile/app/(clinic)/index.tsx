import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth-context';
import {
  useClinicProfile,
  useClinicDoctors,
  useDailyDashboard,
  useClinicUnreadNotificationCount,
} from '../../hooks/useClinic';
import {
  GradientCard,
  StatCard,
  Icon,
} from '../../components';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../theme';

export default function ClinicDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: unreadNotifications = 0 } = useClinicUnreadNotificationCount();

  const {
    data: clinic,
    isLoading: loadingProfile,
    refetch: refetchProfile,
  } = useClinicProfile();

  const {
    data: doctors = [],
    isLoading: loadingDoctors,
    refetch: refetchDoctors,
  } = useClinicDoctors();

  const {
    data: dailyDashboard,
    isLoading: loadingDashboard,
    refetch: refetchDashboard,
    isRefetching,
  } = useDailyDashboard();

  const handleRefreshAll = () => {
    refetchProfile();
    refetchDoctors();
    refetchDashboard();
  };

  const isLoading = loadingProfile || loadingDoctors || loadingDashboard;

  const totalPatients = dailyDashboard?.totalPatients ?? 0;
  const totalAppointments = dailyDashboard?.totalAppointments ?? 0;
  const newPatients = dailyDashboard?.newPatients ?? 0;
  const returningPatients = dailyDashboard?.returningPatients ?? 0;
  const activeDoctorsCount = doctors.filter((d) => d.user?.isActive !== false).length;

  const waitingCount = useMemo(() => {
    if (dailyDashboard?.statusBreakdown?.WAITING) {
      return dailyDashboard.statusBreakdown.WAITING;
    }
    return (dailyDashboard?.queueSummary || []).reduce((acc, curr) => {
      return acc + Math.max(0, (curr.lastTokenIssued || 0) - (curr.currentToken || 0));
    }, 0);
  }, [dailyDashboard]);

  const completedCount = dailyDashboard?.statusBreakdown?.COMPLETED ?? 0;

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const clinicDisplayName = clinic?.clinicName || user?.name || 'Clinic Center';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefreshAll}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
      >
        {/* 1. Header Card */}
        <GradientCard variant="blue" style={styles.headerCard}>
          <View style={styles.headerCardContent}>
            <View style={styles.headerTopRow}>
              <View style={styles.greetingGroup}>
                <View style={styles.badgeRow}>
                  <View style={styles.clinicIconCircle}>
                    <Icon name="building" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={styles.badgeText}>CLINIC PORTAL</Text>
                </View>

                <Text style={styles.greetingTitle}>{clinicDisplayName}</Text>
                <Text style={styles.greetingDate}>
                  {clinic?.city ? `${clinic.city} • ` : ''}
                  {todayFormatted}
                </Text>
              </View>

              <View style={styles.headerRightCol}>
                <TouchableOpacity
                  style={styles.notifBtn}
                  onPress={() => router.push('/(clinic)/notifications')}
                  activeOpacity={0.8}
                >
                  <Icon name="bell" size={18} color={Colors.light.ink800} />
                  {unreadNotifications > 0 && (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifBadgeText}>
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.approvedBadge}>
                  <Icon name="check-circle" size={12} color="#047857" />
                  <Text style={styles.approvedText}>
                    {clinic?.isApproved !== false ? 'Approved' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </GradientCard>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color={Colors.light.primary} />
            <Text style={styles.centerStateText}>Synchronizing clinic operations...</Text>
          </View>
        ) : (
          <>
            {/* 2. 2x2 Primary KPI Metric Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard
                  label="Total Patients"
                  value={totalPatients}
                  iconName="users"
                  variant="blue"
                />
                <StatCard
                  label="Appointments"
                  value={totalAppointments}
                  iconName="calendar"
                  variant="green"
                />
              </View>

              <View style={styles.statsRow}>
                <StatCard
                  label="Waiting in Queue"
                  value={waitingCount}
                  iconName="clock"
                  variant="orange"
                />
                <StatCard
                  label="Practicing Doctors"
                  value={activeDoctorsCount}
                  iconName="stethoscope"
                  variant="purple"
                />
              </View>
            </View>

            {/* 3. Live Queue Summary Hero Banner */}
            <GradientCard variant="purple" style={styles.queueCard}>
              <View style={styles.queueCardContent}>
                <View style={styles.queueHeaderRow}>
                  <View style={styles.queueTitleGroup}>
                    <View style={styles.queueIconBox}>
                      <Icon name="list-ordered" size={16} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={styles.queueCardTitle}>Live Practice Queue</Text>
                      <Text style={styles.queueCardSub}>
                        {dailyDashboard?.queueSummary?.length ?? 0} Active Doctor Sessions
                      </Text>
                    </View>
                  </View>

                  <View style={styles.liveStatusPill}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.liveStatusText}>Live Feed</Text>
                  </View>
                </View>

                {/* Summary counters */}
                <View style={styles.summaryCountersRow}>
                  <View style={styles.counterItem}>
                    <Text style={styles.counterLabel}>Completed</Text>
                    <Text style={styles.counterVal}>{completedCount}</Text>
                  </View>
                  <View style={styles.counterDivider} />
                  <View style={styles.counterItem}>
                    <Text style={styles.counterLabel}>Waiting</Text>
                    <Text style={[styles.counterVal, { color: '#D97706' }]}>
                      {waitingCount}
                    </Text>
                  </View>
                  <View style={styles.counterDivider} />
                  <View style={styles.counterItem}>
                    <Text style={styles.counterLabel}>New / Returning</Text>
                    <Text style={styles.counterVal}>
                      {newPatients}/{returningPatients}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.manageQueueBtn}
                  onPress={() => router.push('/(clinic)/queue')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.manageQueueBtnText}>Monitor Live Queues</Text>
                  <Icon name="chevron-right" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </GradientCard>

            {/* 4. Practice Shortcuts */}
            <View style={styles.shortcutsSection}>
              <Text style={styles.sectionHeading}>Clinic Operations</Text>

              <View style={styles.shortcutsGrid}>
                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(clinic)/queue')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.shortcutIconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <Icon name="list-ordered" size={18} color={Colors.light.primary} />
                  </View>
                  <Text style={styles.shortcutTitle}>Live Queue</Text>
                  <Text style={styles.shortcutSub}>Token counters</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(clinic)/doctors')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.shortcutIconCircle, { backgroundColor: '#FAF5FF' }]}>
                    <Icon name="stethoscope" size={18} color="#7C3AED" />
                  </View>
                  <Text style={styles.shortcutTitle}>Doctors</Text>
                  <Text style={styles.shortcutSub}>Staff directory</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(clinic)/appointments')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.shortcutIconCircle, { backgroundColor: '#F0FDF4' }]}>
                    <Icon name="calendar" size={18} color="#16A34A" />
                  </View>
                  <Text style={styles.shortcutTitle}>Visits</Text>
                  <Text style={styles.shortcutSub}>Daily analytics</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.shortcutsGrid}>
                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(clinic)/requests')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.shortcutIconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <Icon name="inbox" size={18} color={Colors.light.primary} />
                  </View>
                  <Text style={styles.shortcutTitle}>Requests</Text>
                  <Text style={styles.shortcutSub}>Doctor links</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(clinic)/receptionists')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.shortcutIconCircle, { backgroundColor: '#FAF5FF' }]}>
                    <Icon name="users" size={18} color="#7C3AED" />
                  </View>
                  <Text style={styles.shortcutTitle}>Front Desk</Text>
                  <Text style={styles.shortcutSub}>Reception staff</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(clinic)/referrals')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.shortcutIconCircle, { backgroundColor: '#FFF1F2' }]}>
                    <Icon name="activity" size={18} color="#E11D48" />
                  </View>
                  <Text style={styles.shortcutTitle}>Referrals</Text>
                  <Text style={styles.shortcutSub}>Lab orders</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.shortcutsGrid}>
                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(clinic)/reports')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.shortcutIconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <Icon name="trending-up" size={18} color="#059669" />
                  </View>
                  <Text style={styles.shortcutTitle}>Analytics</Text>
                  <Text style={styles.shortcutSub}>Period reports</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(clinic)/schedule')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.shortcutIconCircle, { backgroundColor: '#FFFBEB' }]}>
                    <Icon name="calendar-days" size={18} color="#D97706" />
                  </View>
                  <Text style={styles.shortcutTitle}>Schedule</Text>
                  <Text style={styles.shortcutSub}>Hours & leaves</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(clinic)/profile')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.shortcutIconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <Icon name="building" size={18} color={Colors.light.primary} />
                  </View>
                  <Text style={styles.shortcutTitle}>Profile</Text>
                  <Text style={styles.shortcutSub}>Center settings</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  headerCard: {
    marginBottom: 0,
  },
  headerCardContent: {
    padding: Spacing.four,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingGroup: {
    gap: 3,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  clinicIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#1E40AF',
  },
  greetingTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  greetingDate: {
    fontSize: 12,
    color: Colors.light.ink500,
    fontWeight: '500',
  },
  headerRightCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  notifBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: Radius.full,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  approvedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Radius.full,
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.light.primary,
  },
  onlineText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.primary,
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
  statsGrid: {
    gap: Spacing.three,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  queueCard: {
    marginBottom: 0,
  },
  queueCardContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  queueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  queueTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  queueIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueCardTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  queueCardSub: {
    fontSize: 11,
    color: Colors.light.ink500,
  },
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
  summaryCountersRow: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface50,
    borderRadius: Radius.md,
    padding: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.surface200,
  },
  counterItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  counterLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.ink500,
    textTransform: 'uppercase',
  },
  counterVal: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  counterDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.light.surface200,
  },
  manageQueueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  manageQueueBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  shortcutsSection: {
    gap: Spacing.two,
  },
  sectionHeading: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: Colors.light.surfaceWhite,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.surface200,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 3,
    ...Shadows.sm,
  },
  shortcutIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  shortcutTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.ink900,
    textAlign: 'center',
  },
  shortcutSub: {
    fontSize: 10,
    color: Colors.light.ink500,
    textAlign: 'center',
  },
});
