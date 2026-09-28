import { format, isValid, parseISO } from 'date-fns';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { KeyboardScreen } from '@/components/atoms/KeyboardScreen';
import { ScreenSkeleton } from '@/components/atoms/Skeleton';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/provider/AuthProvider';
import { useLanguage } from '@/provider/LanguageProvider';
import { useCandidateMe } from '@/hooks/queries/useCandidateQueries';
import { getApiErrorMessage } from '@/lib/errors';
import { candidateService } from '@/services/candidateService';
import { formatTimeLabel } from '@/utils/time';

type DocSlot = {
  id: string;
  type: string;
  name: string;
  status: 'complete' | 'pending';
  fileType?: string | null;
};

function formatDateLabel(value?: string | null, pattern = 'MMMM d, yyyy'): string {
  if (!value) return '';
  try {
    const parsed = parseISO(value.split('T')[0]);
    return isValid(parsed) ? format(parsed, pattern) : value;
  } catch {
    return value;
  }
}

export default function ProfileScreen() {
  const colors = useTheme();
  const { copy } = useLanguage();
  const { examScheduleInfo } = useAuth();
  const meQuery = useCandidateMe();
  const me = meQuery.data;

  const [previewType, setPreviewType] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const expected = [
    { type: 'photo', name: copy.profile.candidatePhoto },
    { type: 'cnicFront', name: copy.profile.cnicFront },
    { type: 'cnicBack', name: copy.profile.cnicBack },
  ];
  const apiDocs = Array.isArray(me?.documents) ? me.documents : [];
  const documents: DocSlot[] = expected.map((slot) => {
    const found = apiDocs.find((d) => d.type === slot.type);
    const complete = !!found?.fileUrl;
    return {
      id: found?.id || slot.type,
      type: slot.type,
      name: slot.name,
      status: complete ? 'complete' : 'pending',
      fileType: found?.fileType,
    };
  });

  const completedDocs = documents.filter((d) => d.status === 'complete');
  const pendingDocs = documents.filter((d) => d.status === 'pending');
  const hasCertificate = !!me?.certificate;
  const registrationDone =
    !!examScheduleInfo?.examScheduled || !!me?.payment?.isPaid;
  const scheduled = !!examScheduleInfo?.examScheduled;

  const openPreview = async (doc: DocSlot) => {
    setPreviewType(doc.type);
    setPreviewTitle(doc.name);
    setPreviewUri(null);
    setPreviewLoading(true);
    try {
      const uri = await candidateService.getDocumentPreviewUri(doc.type);
      setPreviewUri(uri);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: copy.profile.previewNotAvailable,
        text2: getApiErrorMessage(error),
      });
      setPreviewType(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewType(null);
    setPreviewUri(null);
    setPreviewTitle('');
  };

  if (meQuery.isLoading) {
    return <ScreenSkeleton variant="form" />;
  }

  const fullName = me
    ? `${me.user.firstName} ${me.user.lastName}`.trim()
    : copy.common.na;

  const scheduleDateLabel = (() => {
    if (!examScheduleInfo?.examDate) return copy.common.na;
    return formatDateLabel(examScheduleInfo.examDate) || copy.common.na;
  })();

  const trainingStatusLabel = hasCertificate
    ? copy.profile.passed
    : scheduled
      ? `${copy.profile.scheduled} - ${formatDateLabel(examScheduleInfo?.examDate, 'MMM d, yyyy') || copy.common.na}`
      : copy.profile.pendingRegistration;

  return (
    <KeyboardScreen edges={['bottom', 'left', 'right']} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '33' },
            ]}
          >
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.name, { color: colors.text }]}>{fullName}</Text>
            <Text style={[styles.muted, { color: colors.textSecondary }]}>
              {copy.profile.candidateId}:{' '}
              <Text style={{ fontFamily: Fonts.body }}>{me?.userId || copy.common.na}</Text>
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            Toast.show({
              type: 'info',
              text1: copy.profile.fileComplaint,
              text2: copy.profile.complaintComingSoon,
            })
          }
          style={({ pressed }) => [
            styles.complaintBtn,
            {
              borderColor: colors.warning + '66',
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons name="warning-outline" size={16} color={colors.warning} />
          <Text style={[styles.complaintText, { color: colors.warning }]}>
            {copy.profile.fileComplaint}
          </Text>
        </Pressable>

        <View style={styles.contactList}>
          <ContactRow
            icon="mail-outline"
            value={me?.user.email || copy.common.na}
            colors={colors}
          />
          <ContactRow
            icon="call-outline"
            value={me?.user.phoneNumber || copy.common.na}
            colors={colors}
          />
          <ContactRow
            icon="location-outline"
            value={`${me?.city?.name || copy.common.na}, ${copy.common.pakistan}`}
            colors={colors}
          />
        </View>
      </View>

      {/* Training scheduled */}
      {scheduled && !hasCertificate ? (
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.primary + '0D',
              borderColor: colors.primary + '4D',
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: colors.primary + '1A' },
              ]}
            >
              <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {copy.profile.examScheduled}
              </Text>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                {copy.profile.examScheduledDesc}
              </Text>
            </View>
          </View>

          {examScheduleInfo?.wasAutoRescheduled ? (
            <Notice
              icon="refresh"
              text={copy.profile.autoRescheduledNotice}
              bg={colors.warning + '18'}
              border={colors.warning + '4D'}
              color={colors.warning}
            />
          ) : null}

          {(me?.requiresRepayment || examScheduleInfo?.requiresRepayment) ? (
            <Notice
              icon="alert-circle"
              text={copy.profile.requiresRepaymentNotice}
              bg={colors.danger + '18'}
              border={colors.danger + '4D'}
              color={colors.danger}
            />
          ) : null}

          <View style={styles.detailGrid}>
            <InfoBox
              label={copy.profile.examDate}
              value={scheduleDateLabel}
              colors={colors}
            />
            <InfoBox
              label={copy.profile.examTime}
              value={formatTimeLabel(examScheduleInfo?.examStartTime, {
                fallback: '—',
                datePart: examScheduleInfo?.examDate,
              })}
              colors={colors}
            />
          </View>
          {examScheduleInfo?.arriveByTime ? (
            <InfoBox
              label={copy.profile.arriveBy}
              value={formatTimeLabel(examScheduleInfo.arriveByTime, {
                fallback: copy.common.na,
                datePart: examScheduleInfo.examDate,
              })}
              colors={colors}
            />
          ) : null}
          <InfoBox
            label={copy.profile.testCenter}
            value={examScheduleInfo?.centerName || copy.common.na}
            colors={colors}
          />
          <InfoBox
            label={copy.profile.centerAddress}
            value={examScheduleInfo?.centerAddress || copy.common.na}
            colors={colors}
            bold={false}
          />
          <InfoBox
            label={copy.profile.city}
            value={examScheduleInfo?.cityName || copy.common.na}
            colors={colors}
          />

          <View
            style={[
              styles.noteBox,
              { backgroundColor: '#3B82F61A', borderColor: '#3B82F64D' },
            ]}
          >
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              <Text style={{ color: colors.text, fontFamily: Fonts.bodySemiBold }}>
                {copy.common.note}{' '}
              </Text>
              {examScheduleInfo?.verificationMessage || copy.profile.examNote}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Personal information */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {copy.profile.personalInfo}
          </Text>
        </View>
        <View style={styles.fields}>
          <Field label={copy.profile.fatherName} value={me?.fatherName || copy.common.na} colors={colors} />
          <Field label={copy.profile.cnicNumber} value={me?.cnic || copy.common.na} colors={colors} mono />
          <Field
            label={copy.profile.dateOfBirth}
            value={me?.dob ? formatDateLabel(me.dob, 'MMMM dd, yyyy') || copy.common.na : copy.common.na}
            colors={colors}
          />
          <Field label={copy.profile.city} value={me?.city?.name || copy.common.na} colors={colors} />
          <Field label={copy.profile.address} value={me?.address || copy.common.na} colors={colors} />
          <Field
            label={copy.profile.registrationDate}
            value={
              me?.createdAt
                ? formatDateLabel(me.createdAt, 'MMMM dd, yyyy') || copy.common.na
                : copy.common.na
            }
            colors={colors}
          />
          <View>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {copy.profile.paymentStatus}
            </Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: me?.payment?.isPaid
                    ? colors.success + '1A'
                    : colors.warning + '1A',
                  borderColor: me?.payment?.isPaid
                    ? colors.success + '4D'
                    : colors.warning + '4D',
                },
              ]}
            >
              <Ionicons
                name={me?.payment?.isPaid ? 'checkmark-circle' : 'time-outline'}
                size={14}
                color={me?.payment?.isPaid ? colors.success : colors.warning}
              />
              <Text
                style={{
                  color: me?.payment?.isPaid ? colors.success : colors.warning,
                  fontFamily: Fonts.bodySemiBold,
                  fontSize: 12,
                }}
              >
                {me?.payment?.isPaid ? copy.profile.paid : copy.profile.unpaid}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Application status */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {copy.profile.applicationStatus}
          </Text>
        </View>
        <View style={styles.statusStack}>
          <StatusCard
            icon={registrationDone ? 'checkmark-circle' : 'time-outline'}
            iconColor={registrationDone ? colors.success : '#2563EB'}
            bg={registrationDone ? colors.success + '1A' : '#3B82F61A'}
            border={registrationDone ? colors.success + '4D' : '#3B82F64D'}
            title={copy.profile.registration}
            subtitle={
              registrationDone ? copy.profile.completedVerified : copy.profile.inProgress
            }
            colors={colors}
          />
          <StatusCard
            icon={
              hasCertificate
                ? 'checkmark-circle'
                : scheduled
                  ? 'calendar-outline'
                  : 'time-outline'
            }
            iconColor={
              hasCertificate ? colors.success : scheduled ? '#2563EB' : colors.warning
            }
            bg={
              hasCertificate
                ? colors.success + '1A'
                : scheduled
                  ? '#3B82F61A'
                  : colors.warning + '1A'
            }
            border={
              hasCertificate
                ? colors.success + '4D'
                : scheduled
                  ? '#3B82F64D'
                  : colors.warning + '4D'
            }
            title={copy.profile.examStatus}
            subtitle={trainingStatusLabel}
            colors={colors}
          />
          <StatusCard
            icon="medal-outline"
            iconColor={hasCertificate ? colors.success : colors.warning}
            bg={hasCertificate ? colors.success + '1A' : colors.warning + '1A'}
            border={hasCertificate ? colors.success + '4D' : colors.warning + '4D'}
            title={copy.profile.certificate}
            subtitle={
              hasCertificate ? copy.profile.issuedAvailable : copy.profile.pendingExam
            }
            colors={colors}
          />
        </View>
      </View>

      {/* Documents */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {copy.profile.uploadedDocuments}
            </Text>
          </View>
          <Text style={[styles.muted, { color: colors.textSecondary, fontSize: 12 }]}>
            {completedDocs.length} {copy.profile.of} {documents.length} {copy.profile.uploaded}
          </Text>
        </View>

        {documents.length === 0 ? (
          <Text style={[styles.muted, { color: colors.textSecondary, textAlign: 'center' }]}>
            {copy.profile.noDocsYet}
          </Text>
        ) : (
          <View style={{ gap: Spacing.two }}>
            {completedDocs.map((doc) => (
              <Pressable
                key={doc.id}
                onPress={() => void openPreview(doc)}
                style={({ pressed }) => [
                  styles.docRow,
                  {
                    backgroundColor: colors.success + '0D',
                    borderColor: colors.success + '33',
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.docIcon,
                    { backgroundColor: colors.success + '1A' },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.docTitle, { color: colors.text }]}>{doc.name}</Text>
                  <Text style={[styles.muted, { color: colors.textSecondary }]}>
                    {copy.profile.uploaded}
                  </Text>
                </View>
                <View style={styles.docActions}>
                  <View style={styles.viewLink}>
                    <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {copy.profile.view}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: colors.success + '1A',
                        borderColor: colors.success + '4D',
                      },
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                    <Text style={{ color: colors.success, fontSize: 11, fontFamily: Fonts.bodySemiBold }}>
                      {copy.profile.uploaded}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}

            {pendingDocs.length > 0 ? (
              <>
                <Text style={{ color: colors.warning, fontSize: 12, fontFamily: Fonts.bodySemiBold }}>
                  {copy.profile.missingRequired}
                </Text>
                {pendingDocs.map((doc) => (
                  <View
                    key={doc.id}
                    style={[
                      styles.docRow,
                      {
                        backgroundColor: colors.warning + '0D',
                        borderColor: colors.warning + '33',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.docIcon,
                        { backgroundColor: colors.warning + '1A' },
                      ]}
                    >
                      <Ionicons name="document-text-outline" size={20} color={colors.warning} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.docTitle, { color: colors.text }]}>{doc.name}</Text>
                      <Text style={[styles.muted, { color: colors.textSecondary }]}>
                        {copy.profile.required}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: colors.warning + '1A',
                          borderColor: colors.warning + '4D',
                        },
                      ]}
                    >
                      <Ionicons name="time-outline" size={12} color={colors.warning} />
                      <Text style={{ color: colors.warning, fontSize: 11, fontFamily: Fonts.bodySemiBold }}>
                        {copy.profile.pending}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            ) : null}
          </View>
        )}
      </View>

      <Modal visible={!!previewType} transparent animationType="fade" onRequestClose={closePreview}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, flex: 1 }]}>
                {previewTitle}
              </Text>
              <Pressable onPress={closePreview} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              {previewLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
              ) : (
                <Text style={{ color: colors.textSecondary }}>{copy.profile.previewNotAvailable}</Text>
              )}
            </View>
            <Pressable
              onPress={closePreview}
              style={[styles.closeBtn, { borderColor: colors.border }]}
            >
              <Text style={{ color: colors.text, fontFamily: Fonts.bodySemiBold }}>
                {copy.profile.close}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardScreen>
  );
}

type ThemeColors = ReturnType<typeof useTheme>;

function ContactRow({
  icon,
  value,
  colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.contactRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={[styles.contactText, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function InfoBox({
  label,
  value,
  colors,
  bold = true,
}: {
  label: string;
  value: string;
  colors: ThemeColors;
  bold?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoBox,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text
        style={{
          color: colors.text,
          fontFamily: bold ? Fonts.bodySemiBold : Fonts.body,
          fontSize: 15,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Field({
  label,
  value,
  colors,
  mono,
}: {
  label: string;
  value: string;
  colors: ThemeColors;
  mono?: boolean;
}) {
  return (
    <View>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text
        style={{
          color: colors.text,
          fontFamily: Fonts.bodySemiBold,
          fontSize: 15,
          fontVariant: mono ? ['tabular-nums'] : undefined,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function StatusCard({
  icon,
  iconColor,
  bg,
  border,
  title,
  subtitle,
  colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  bg: string;
  border: string;
  title: string;
  subtitle: string;
  colors: ThemeColors;
}) {
  return (
    <View style={[styles.statusCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={icon} size={20} color={iconColor} />
        <Text style={{ color: colors.text, fontFamily: Fonts.bodySemiBold, fontSize: 15 }}>
          {title}
        </Text>
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 6 }}>{subtitle}</Text>
    </View>
  );
}

function Notice({
  icon,
  text,
  bg,
  border,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  text: string;
  bg: string;
  border: string;
  color: string;
}) {
  return (
    <View style={[styles.notice, { backgroundColor: bg, borderColor: border }]}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={{ flex: 1, color, fontSize: 13, fontFamily: Fonts.body, lineHeight: 18 }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontFamily: Fonts.title,
  },
  muted: {
    fontSize: 13,
    fontFamily: Fonts.body,
  },
  complaintBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  complaintText: {
    fontSize: 13,
    fontFamily: Fonts.bodySemiBold,
  },
  contactList: { gap: Spacing.two },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.body,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: Fonts.title,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  infoBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: 4,
  },
  noteBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  noteText: {
    fontSize: 12,
    fontFamily: Fonts.body,
    lineHeight: 18,
  },
  fields: { gap: Spacing.three },
  fieldLabel: {
    fontSize: 12,
    fontFamily: Fonts.body,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusStack: { gap: Spacing.two },
  statusCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  docRow: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
  },
  docActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    maxHeight: '85%',
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  modalBody: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: 320,
  },
  closeBtn: {
    borderWidth: 1,
    borderRadius: Radius.md,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
