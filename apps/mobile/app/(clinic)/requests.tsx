import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useClinicReceivedRequests,
  useClinicSentRequests,
  useRespondToDoctorRequest,
} from '../../hooks/useClinic';
import {
  GradientCard,
  Icon,
} from '../../components';
import type { SentDoctorRequest } from '../../types';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../theme';

export default function ClinicRequestsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');

  const {
    data: receivedRequests = [],
    isLoading: loadingReceived,
    refetch: refetchReceived,
    isRefetching: refetchingReceived,
  } = useClinicReceivedRequests();

  const {
    data: sentRequests = [],
    isLoading: loadingSent,
    refetch: refetchSent,
    isRefetching: refetchingSent,
  } = useClinicSentRequests();

  const respondMutation = useRespondToDoctorRequest();

  const handleRefresh = () => {
    refetchReceived();
    refetchSent();
  };

  const currentList = activeTab === 'received' ? receivedRequests : sentRequests;

  const filteredList = useMemo(() => {
    if (statusFilter === 'ALL') return currentList;
    return currentList.filter((r) => r.status?.toUpperCase() === statusFilter);
  }, [currentList, statusFilter]);

  const pendingReceivedCount = receivedRequests.filter(
    (r) => r.status?.toUpperCase() === 'PENDING'
  ).length;

  const handleRespond = (associationId: string, action: 'ACCEPT' | 'REJECT', docName: string) => {
    Alert.alert(
      action === 'ACCEPT' ? 'Accept Doctor' : 'Decline Request',
      `Are you sure you want to ${action.toLowerCase()} the connection request from Dr. ${docName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'ACCEPT' ? 'Accept' : 'Decline',
          style: action === 'ACCEPT' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await respondMutation.mutateAsync({ associationId, action });
              Alert.alert(
                action === 'ACCEPT' ? 'Doctor Connected' : 'Request Declined',
                `The request has been updated.`
              );
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Action failed.');
            }
          },
        },
      ]
    );
  };

  const isLoading = activeTab === 'received' ? loadingReceived : loadingSent;
  const isRefetching = refetchingReceived || refetchingSent;

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
        <Text style={styles.headerBarTitle}>Doctor Connection Requests</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.topContainer}>
        {/* 2. Banner */}
        <GradientCard variant="blue" style={styles.bannerCard}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerTop}>
              <View style={styles.bannerTitles}>
                <Text style={styles.bannerHeading}>Association Management</Text>
                <Text style={styles.bannerSub}>
                  {pendingReceivedCount} Pending incoming doctor applications
                </Text>
              </View>
              <View style={styles.inboxCircle}>
                <Icon name="inbox" size={18} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </GradientCard>

        {/* 3. Received vs Sent Tabs */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'received' && styles.tabBtnActive]}
            onPress={() => setActiveTab('received')}
            activeOpacity={0.8}
          >
            <Icon
              name="inbox"
              size={14}
              color={activeTab === 'received' ? '#FFFFFF' : Colors.light.ink600}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'received' && styles.tabBtnTextActive,
              ]}
            >
              Received {pendingReceivedCount > 0 ? `(${pendingReceivedCount})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'sent' && styles.tabBtnActive]}
            onPress={() => setActiveTab('sent')}
            activeOpacity={0.8}
          >
            <Icon
              name="arrow-right"
              size={14}
              color={activeTab === 'sent' ? '#FFFFFF' : Colors.light.ink600}
            />
            <Text
              style={[styles.tabBtnText, activeTab === 'sent' && styles.tabBtnTextActive]}
            >
              Sent Requests ({sentRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Status Filter Pills */}
        <View style={styles.filterPillsRow}>
          {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((st) => {
            const isSel = statusFilter === st;
            return (
              <TouchableOpacity
                key={st}
                style={[styles.filterPill, isSel && styles.filterPillActive]}
                onPress={() => setStatusFilter(st)}
              >
                <Text
                  style={[styles.filterPillText, isSel && styles.filterPillTextActive]}
                >
                  {st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 5. List Content */}
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={Colors.light.primary} />
          <Text style={styles.centerStateText}>Loading connection requests...</Text>
        </View>
      ) : filteredList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon name="inbox" size={28} color={Colors.light.ink400} />
          </View>
          <Text style={styles.emptyTitle}>No Requests Found</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'received'
              ? 'No incoming doctor association applications found matching the selected filter.'
              : 'No outgoing doctor requests sent.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={Colors.light.primary}
              colors={[Colors.light.primary]}
            />
          }
          renderItem={({ item }) => {
            const docName = item.doctor?.user?.name || 'Doctor';
            const isPending = item.status?.toUpperCase() === 'PENDING';
            const isAccepted = item.status?.toUpperCase() === 'ACCEPTED';

            return (
              <GradientCard variant="blue" style={styles.reqCard}>
                <View style={styles.reqCardContent}>
                  <View style={styles.reqHeaderRow}>
                    <View style={styles.docAvatarCol}>
                      <View style={styles.docAvatar}>
                        <Icon name="stethoscope" size={16} color="#FFFFFF" />
                      </View>
                      <View style={styles.docNameCol}>
                        <Text style={styles.docName}>Dr. {docName}</Text>
                        <Text style={styles.docEmail}>
                          {item.doctor?.user?.email || 'Registered Doctor'}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isPending
                            ? '#FEF3C7'
                            : isAccepted
                            ? '#ECFDF5'
                            : '#FEF2F2',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color: isPending
                              ? '#B45309'
                              : isAccepted
                              ? '#047857'
                              : '#BE123C',
                          },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* Schedule Details */}
                  <View style={styles.detailsRow}>
                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>Day</Text>
                      <Text style={styles.detailVal}>
                        {item.dayOfWeek || 'All Days'}
                      </Text>
                    </View>
                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>Session</Text>
                      <Text style={styles.detailVal}>
                        {item.startTime && item.endTime
                          ? `${item.startTime} - ${item.endTime}`
                          : 'General'}
                      </Text>
                    </View>
                    {item.fee != null ? (
                      <View style={styles.detailBox}>
                        <Text style={styles.detailLabel}>Fee</Text>
                        <Text style={styles.detailVal}>₹{item.fee}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Actions for Received Pending */}
                  {activeTab === 'received' && isPending && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.declineBtn}
                        onPress={() => handleRespond(item.id, 'REJECT', docName)}
                        disabled={respondMutation.isPending}
                        activeOpacity={0.8}
                      >
                        <Icon name="x" size={14} color="#DC2626" />
                        <Text style={styles.declineBtnText}>Decline</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => handleRespond(item.id, 'ACCEPT', docName)}
                        disabled={respondMutation.isPending}
                        activeOpacity={0.85}
                      >
                        <Icon name="check" size={14} color="#FFFFFF" />
                        <Text style={styles.acceptBtnText}>Accept Doctor</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </GradientCard>
            );
          }}
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
  topContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  bannerCard: {
    marginBottom: 0,
  },
  bannerContent: {
    padding: Spacing.four,
  },
  bannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitles: {
    flex: 1,
    gap: 2,
  },
  bannerHeading: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  bannerSub: {
    fontSize: 11,
    color: Colors.light.ink500,
  },
  inboxCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface100,
    borderRadius: Radius.lg,
    padding: 3,
    gap: 3,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  tabBtnActive: {
    backgroundColor: Colors.light.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.ink600,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.surface100,
  },
  filterPillActive: {
    backgroundColor: Colors.light.primary,
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.ink600,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  reqCard: {
    marginBottom: 0,
  },
  reqCardContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  reqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  docAvatarCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  docAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docNameCol: {
    flex: 1,
  },
  docName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.ink900,
  },
  docEmail: {
    fontSize: 11,
    color: Colors.light.ink500,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  detailsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface50,
    borderRadius: Radius.md,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.light.surface200,
  },
  detailBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.ink500,
    textTransform: 'uppercase',
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.ink900,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: 2,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  declineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  acceptBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.six,
    gap: Spacing.two,
  },
  emptyIconCircle: {
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
