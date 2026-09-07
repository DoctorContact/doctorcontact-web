import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GradientCard } from './GradientCard';
import { Icon } from './Icon';
import type { ClinicDoctor } from '../types';
import { Colors, Spacing, Radius, Typography, Shadows } from '../theme';

interface ClinicDoctorCardProps {
  doctor: ClinicDoctor;
  onEdit: (doctor: ClinicDoctor) => void;
}

export function ClinicDoctorCard({ doctor, onEdit }: ClinicDoctorCardProps) {
  const doctorName = doctor.user?.name || 'Practicing Doctor';
  const isActive = doctor.user?.isActive ?? true;

  return (
    <GradientCard variant="blue" style={styles.card}>
      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.doctorInfoRow}>
            <View style={styles.avatarBox}>
              <Icon name="stethoscope" size={20} color="#FFFFFF" />
            </View>

            <View style={styles.nameCol}>
              <View style={styles.titleRow}>
                <Text style={styles.doctorNameText} numberOfLines={1}>
                  Dr. {doctorName}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: isActive ? '#ECFDF5' : '#FEF2F2' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: isActive ? '#047857' : '#BE123C' },
                    ]}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              <Text style={styles.specialtyText}>
                {[doctor.specialization, doctor.qualification].filter(Boolean).join(' • ') ||
                  'General Physician'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onEdit(doctor)}
            activeOpacity={0.8}
          >
            <Icon name="sliders" size={14} color={Colors.light.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Contact info */}
        {(doctor.user?.email || doctor.user?.phone) && (
          <View style={styles.contactRow}>
            {doctor.user?.phone ? (
              <View style={styles.contactItem}>
                <Icon name="phone" size={12} color={Colors.light.ink500} />
                <Text style={styles.contactText}>{doctor.user.phone}</Text>
              </View>
            ) : null}

            {doctor.user?.email ? (
              <View style={styles.contactItem}>
                <Icon name="mail" size={12} color={Colors.light.ink500} />
                <Text style={styles.contactText} numberOfLines={1}>
                  {doctor.user.email}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Meta & Terms Grid */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Consultation Fee</Text>
            <Text style={styles.metaValue}>
              {doctor.fee != null ? `₹${doctor.fee}` : 'Not set'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Start Time</Text>
            <Text style={styles.metaValue}>
              {doctor.startTime || 'Standard Hours'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Experience</Text>
            <Text style={styles.metaValue}>
              {doctor.experience != null ? `${doctor.experience} yrs` : 'N/A'}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  nameCol: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  doctorNameText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.ink900,
  },
  specialtyText: {
    fontSize: 12,
    color: Colors.light.ink600,
    fontWeight: '500',
  },
  statusPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Radius.full,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    backgroundColor: Colors.light.surface50,
    padding: Spacing.two,
    borderRadius: Radius.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 11,
    color: Colors.light.ink600,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface50,
    borderRadius: Radius.md,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.light.surface200,
  },
  metaItem: {
    flex: 1,
    gap: 2,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.ink500,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.ink900,
  },
});
