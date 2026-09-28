import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/atoms/Button';
import { KeyboardScreen } from '@/components/atoms/KeyboardScreen';
import { ScreenSkeleton } from '@/components/atoms/Skeleton';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  useCandidateMe,
  useDocumentValidation,
  useUploadDocument,
} from '@/hooks/queries/useCandidateQueries';
import { getApiErrorMessage } from '@/lib/errors';
import { useLanguage } from '@/provider/LanguageProvider';
import { candidateService } from '@/services/candidateService';
import { DocumentFile } from '@/types/candidate';

type Source = 'camera' | 'library';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toUploadFile(
  type: string,
  asset: ImagePicker.ImagePickerAsset,
): DocumentFile {
  const ext =
    asset.uri.split('.').pop()?.split('?')[0]?.toLowerCase() ||
    (asset.mimeType?.includes('png') ? 'png' : 'jpg');
  return {
    uri: asset.uri,
    name: asset.fileName || `${type}-${Date.now()}.${ext}`,
    type: asset.mimeType || (ext === 'png' ? 'image/png' : 'image/jpeg'),
  };
}

export default function DocumentsScreen() {
  const colors = useTheme();
  const { copy } = useLanguage();
  const DOC_TYPES = [
    { type: 'photo', label: copy.documents.candidatePhoto, allowCamera: true },
    { type: 'cnicFront', label: copy.documents.cnicFront, allowCamera: false },
    { type: 'cnicBack', label: copy.documents.cnicBack, allowCamera: false },
  ] as const;
  const meQuery = useCandidateMe();
  const validationQuery = useDocumentValidation();
  const uploadMutation = useUploadDocument();
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  /** Local / data-URI previews keyed by document type. */
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const pendingTypeRef = useRef<string | null>(null);
  const loadedRemoteRef = useRef<Set<string>>(new Set());

  const documents = meQuery.data?.documents ?? [];

  const setPreview = (type: string, uri: string) => {
    setPreviews((prev) => ({ ...prev, [type]: uri }));
  };

  const uploadAsset = async (
    type: string,
    asset: ImagePicker.ImagePickerAsset,
  ) => {
    // Show the picked image immediately (API fileUrl is an auth download route).
    loadedRemoteRef.current.add(type);
    setPreview(type, asset.uri);

    const file = toUploadFile(type, asset);
    setUploadingType(type);
    try {
      await uploadMutation.mutateAsync({ type, file });
      Toast.show({ type: 'success', text1: 'Document uploaded' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: getApiErrorMessage(error),
      });
    } finally {
      setUploadingType(null);
      pendingTypeRef.current = null;
    }
  };

  // Android can kill MainActivity while the camera/picker is open — recover the result.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pending = await ImagePicker.getPendingResultAsync();
        if (cancelled || !pending) return;
        if ('canceled' in pending && pending.canceled) return;
        const asset = 'assets' in pending ? pending.assets?.[0] : undefined;
        const type = pendingTypeRef.current;
        if (!asset || !type) return;
        await uploadAsset(type, asset);
      } catch {
        // No pending result — ignore.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  // Load authenticated previews for documents already on the server.
  useEffect(() => {
    let cancelled = false;
    const existing = meQuery.data?.documents ?? [];
    (async () => {
      for (const doc of existing) {
        if (!doc.type || !doc.fileUrl) continue;
        if (loadedRemoteRef.current.has(doc.type)) continue;
        loadedRemoteRef.current.add(doc.type);
        try {
          const uri = await candidateService.getDocumentPreviewUri(doc.type);
          if (!cancelled) setPreview(doc.type, uri);
        } catch {
          loadedRemoteRef.current.delete(doc.type);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [meQuery.data?.documents]);

  const pickFromSource = async (type: string, source: Source) => {
    setPickerFor(null);
    pendingTypeRef.current = type;

    // Let the modal finish dismissing before opening the system camera (Android).
    if (Platform.OS === 'android') {
      await sleep(350);
    }

    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Toast.show({
            type: 'error',
            text1: 'Permission needed',
            text2: 'Allow camera access to take your profile photo.',
          });
          return;
        }

        let result: ImagePicker.ImagePickerResult;
        try {
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            // Prefer front for selfie; some Android OEMs crash if forced — fallback below.
            cameraType: ImagePicker.CameraType.front,
            exif: false,
          });
        } catch {
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            cameraType: ImagePicker.CameraType.back,
            exif: false,
          });
        }

        if (result.canceled || !result.assets?.[0]) return;
        await uploadAsset(type, result.assets[0]);
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: 'error',
          text1: 'Permission needed',
          text2: 'Allow photo library access to upload documents.',
        });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        exif: false,
      });
      if (result.canceled || !result.assets?.[0]) return;
      await uploadAsset(type, result.assets[0]);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: source === 'camera' ? 'Camera error' : 'Picker error',
        text2: getApiErrorMessage(error) || 'Could not open the camera. Please try again.',
      });
      pendingTypeRef.current = null;
    }
  };

  const startUpload = (type: string, allowCamera: boolean) => {
    if (allowCamera) {
      setPickerFor(type);
      return;
    }
    void pickFromSource(type, 'library');
  };

  if (meQuery.isLoading) {
    return <ScreenSkeleton variant="docs" />;
  }

  const canProceed = !!validationQuery.data?.canProceedToPayment;
  const missing = validationQuery.data?.missingDocuments ?? [];

  return (
    <KeyboardScreen edges={['bottom', 'left', 'right']} contentContainerStyle={styles.content}>
      <Text style={{ color: colors.textSecondary, marginBottom: Spacing.two, fontFamily: Fonts.body }}>
        {copy.documents.identityRequirementDesc}
      </Text>

      {!canProceed && missing.length > 0 ? (
        <Text style={{ color: colors.warning, marginBottom: Spacing.two, fontFamily: Fonts.body }}>
          {copy.documents.missing}: {missing.join(', ')}
        </Text>
      ) : null}

      <View style={styles.list}>
        {DOC_TYPES.map((doc) => {
          const existing = documents.find((d) => d.type === doc.type);
          const previewUri = previews[doc.type];
          const hasUpload = !!existing?.fileUrl || !!previewUri;
          return (
            <View
              key={doc.type}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>{doc.label}</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 8, fontFamily: Fonts.body }}>
                {hasUpload
                  ? `Uploaded · ${existing?.reviewStatus || 'pending'}`
                  : doc.allowCamera
                    ? copy.documents.cameraOnlyHint
                    : 'Not uploaded'}
              </Text>
              {previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.preview} />
              ) : (
                <View
                  style={[
                    styles.previewPlaceholder,
                    { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="image-outline" size={28} color={colors.textSecondary} />
                </View>
              )}
              <Button
                title={
                  hasUpload ? copy.documents.removeFile : copy.documents.uploadButton
                }
                onPress={() => startUpload(doc.type, doc.allowCamera)}
                loading={uploadingType === doc.type}
              />
            </View>
          );
        })}
      </View>

      <Button
        title={copy.documents.continueToPayment}
        onPress={() => router.push('/(app)/payment')}
        disabled={!canProceed}
      />
      <Button title={copy.documents.back} variant="ghost" onPress={() => router.back()} />

      <Modal
        visible={pickerFor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerFor(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPickerFor(null)}>
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {copy.documents.candidatePhoto}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                marginBottom: Spacing.three,
                fontFamily: Fonts.body,
              }}
            >
              {copy.documents.cameraOnlyHint}
            </Text>

            <Pressable
              style={[styles.option, { backgroundColor: colors.backgroundElement }]}
              onPress={() => pickerFor && void pickFromSource(pickerFor, 'camera')}
            >
              <Ionicons name="camera-outline" size={22} color={colors.primary} />
              <Text style={[styles.optionText, { color: colors.text }]}>
                {copy.documents.takePhoto}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.option, { backgroundColor: colors.backgroundElement }]}
              onPress={() => pickerFor && void pickFromSource(pickerFor, 'library')}
            >
              <Ionicons name="images-outline" size={22} color={colors.primary} />
              <Text style={[styles.optionText, { color: colors.text }]}>
                {copy.documents.chooseGallery}
              </Text>
            </Pressable>

            <Button
              title={copy.documents.cancel}
              variant="ghost"
              onPress={() => setPickerFor(null)}
            />
          </View>
        </Pressable>
      </Modal>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  list: { gap: Spacing.three },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardTitle: { fontSize: 16, fontFamily: Fonts.title },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: Radius.md,
    resizeMode: 'cover',
    backgroundColor: '#EEF2EF',
  },
  previewPlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: Fonts.title,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
  },
  optionText: {
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
  },
});
