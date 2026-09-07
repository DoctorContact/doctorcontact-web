import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GradientCard } from './GradientCard';
import { Icon } from './Icon';
import type { DailyDashboardQueueItem } from '../types';
import { Colors, Spacing, Radius, Typography, Shadows } from '../theme';

interface ClinicQueueCardProps {
  queueItem: DailyDashboardQueueItem;
}

export function ClinicQueueCard({ queueItem }: ClinicQueueCardProps) {
  const currentToken = queueItem.currentToken || 0;
  const lastIssued = queueItem.lastTokenIssued || 0;
  const waitingCount = Math.max(0, lastIssued - currentToken);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return { bg: '#ECFDF5', color: '#047857', label: 'Active' };
      case 'PAUSED':
        return { bg: '#FEF3C7', color: '#B45309', label: 'Paused' };
      case 'CLOSED':
      default:
        return { bg: '#F3F4F6', color: '#4B5563', label: status || 'Closed' };
    }
  };

  const statusBadge = getStatusBadge(queueItem.status);

  return (
    <GradientCard variant="purple" style={styles.card}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.doctorInfoRow}>
            <View style={styles.iconCircle}>
              <Icon name="stethoscope" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.doctorNameText} numberOfLines={1}>
              Dr. {queueItem.doctorName}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
              {statusBadge.label}
            </Text>
          </View>
        </View>

        {/* 3 Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Serving Now</Text>
            <Text style={[styles.metricValue, { color: Colors.light.primary }]}>
              {currentToken > 0 ? `#${currentToken}` : '--'}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Last Issued</Text>
            <Text style={styles.metricValue}>
              {lastIssued > 0 ? `#${lastIssued}` : '--'}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Waiting</Text>
            <Text style={[styles.metricValue, { color: '#D97706' }]}>
              {waitingCount}
            </Text>
          </View>
        </View>
      </View>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.three,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorNameText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface50,
    borderRadius: Radius.md,
    padding: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.surface200,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.ink500,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  metricDivider: {
    width: 1,
    height: 26,
    backgroundColor: Colors.light.surface200,
  },
});
