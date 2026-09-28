import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/atoms/Button';
import { KeyboardScreen } from '@/components/atoms/KeyboardScreen';
import { ScreenSkeleton } from '@/components/atoms/Skeleton';
import { TextField } from '@/components/atoms/TextField';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  useConfirmPayment,
  useInitiatePayment,
  usePaymentStatus,
} from '@/hooks/queries/useCandidateQueries';
import { getApiErrorMessage } from '@/lib/errors';
import { useLanguage } from '@/provider/LanguageProvider';
import { InitiatePaymentResponse } from '@/types/candidate';

export default function PaymentScreen() {
  const colors = useTheme();
  const { copy } = useLanguage();
  const [bankRef, setBankRef] = useState('');
  const [initiated, setInitiated] = useState<InitiatePaymentResponse | null>(null);

  const paymentQuery = usePaymentStatus({
    refetchInterval: 5000,
  });
  const initiateMutation = useInitiatePayment();
  const confirmMutation = useConfirmPayment();

  const payment = paymentQuery.data;
  const paid = payment?.status === 'PAID' || !!payment?.canProceedToExam;
  const qr = initiated?.qrCodeBase64 || payment?.qrCodeBase64 || null;
  const transactionId = initiated?.transactionId || payment?.transactionId || null;

  const handleInitiate = async () => {
    try {
      const result = await initiateMutation.mutateAsync();
      setInitiated(result);
      await paymentQuery.refetch();
      Toast.show({ type: 'success', text1: 'Payment initiated' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Could not start payment',
        text2: getApiErrorMessage(error),
      });
    }
  };

  const handleConfirm = async () => {
    if (!transactionId || !bankRef.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Transaction reference required',
        text2: 'Enter the bank transaction ID from your transfer.',
      });
      return;
    }
    try {
      await confirmMutation.mutateAsync({
        transactionId,
        bankTransactionRef: bankRef.trim(),
      });
      Toast.show({ type: 'success', text1: 'Payment confirmed' });
      router.push('/(app)/schedule');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Confirmation failed',
        text2: getApiErrorMessage(error),
      });
    }
  };

  if (paymentQuery.isLoading) {
    return <ScreenSkeleton variant="form" />;
  }

  return (
    <KeyboardScreen edges={['bottom', 'left', 'right']} contentContainerStyle={styles.content}>
      <Text
        style={{
          color: colors.textSecondary,
          marginBottom: Spacing.two,
          fontFamily: Fonts.body,
        }}
      >
        {copy.payment.description}
      </Text>

      {paid ? (
        <View
          style={[
            styles.banner,
            { backgroundColor: colors.success + '18', borderColor: colors.success },
          ]}
        >
          <Text style={{ color: colors.success, fontFamily: Fonts.title }}>
            {copy.payment.successful}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              marginTop: 4,
              fontFamily: Fonts.body,
            }}
          >
            {copy.payment.successDesc}
          </Text>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {payment?.amount != null ? (
            <Text style={[styles.amount, { color: colors.text }]}>
              {copy.payment.registrationFee}: PKR {payment.amount}
            </Text>
          ) : null}
          <Text style={{ color: colors.textSecondary, fontFamily: Fonts.body }}>
            Status: {payment?.status || 'Not started'}
          </Text>

          {qr ? (
            <Image
              source={{
                uri: qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`,
              }}
              style={styles.qr}
            />
          ) : (
            <Button
              title={copy.payment.generateQr}
              onPress={() => void handleInitiate()}
              loading={initiateMutation.isPending}
            />
          )}

          {transactionId ? (
            <>
              <TextField
                label={copy.payment.bankRef}
                value={bankRef}
                onChangeText={setBankRef}
                placeholder={copy.payment.bankRefPlaceholder}
                autoCapitalize="characters"
              />
              <Button
                title={copy.payment.confirmPayment}
                onPress={() => void handleConfirm()}
                loading={confirmMutation.isPending}
              />
            </>
          ) : null}
        </View>
      )}

      <Button
        title={copy.payment.continueToScheduling}
        onPress={() => router.push('/(app)/schedule')}
        disabled={!paid}
      />
      <Button title={copy.payment.back} variant="ghost" onPress={() => router.back()} />
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  amount: { fontSize: 20, fontFamily: Fonts.title },
  qr: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  banner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
});
