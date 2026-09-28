import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  StyleSheet,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/atoms/Button';
import { DateField } from '@/components/atoms/DateField';
import { KeyboardScreen } from '@/components/atoms/KeyboardScreen';
import { SelectField } from '@/components/atoms/SelectField';
import { ScreenSkeleton } from '@/components/atoms/Skeleton';
import { TextField } from '@/components/atoms/TextField';
import { Spacing } from '@/constants/theme';
import { useCandidateMe, useUpdateCandidateMe } from '@/hooks/queries/useCandidateQueries';
import { useDistricts, useProvinces, useTehsils } from '@/hooks/queries/useReferenceQueries';
import { getApiErrorMessage } from '@/lib/errors';
import { useLanguage } from '@/provider/LanguageProvider';
import { personalInfoSchema, PersonalInfoInput } from '@/schemas/registrationSchemas';

export default function PersonalInfoScreen() {
  const { copyEn, copyUr, copy } = useLanguage();
  const meQuery = useCandidateMe();
  const updateMutation = useUpdateCandidateMe();
  const previousProvinceRef = useRef<string>('');
  const previousDistrictRef = useRef<string>('');

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fatherName: '',
      cnic: '',
      dob: '',
      province: '',
      district: '',
      tehsil: '',
      address: '',
    },
  });

  const province = useWatch({ control, name: 'province' });
  const district = useWatch({ control, name: 'district' });

  const provincesQuery = useProvinces();
  const districtsQuery = useDistricts(province || undefined);
  const tehsilsQuery = useTehsils(district || undefined);

  useEffect(() => {
    const me = meQuery.data;
    if (!me) return;
    const nextProvince = me.province?.id || '';
    const nextDistrict = me.district?.id || '';
    previousProvinceRef.current = nextProvince;
    previousDistrictRef.current = nextDistrict;
    reset({
      fatherName: me.fatherName || '',
      cnic: me.cnic || '',
      dob: me.dob ? me.dob.slice(0, 10) : '',
      province: nextProvince,
      district: nextDistrict,
      tehsil: me.tehsil?.id || '',
      address: me.address || '',
    });
  }, [meQuery.data, reset]);

  useEffect(() => {
    if (previousProvinceRef.current !== province) {
      previousProvinceRef.current = province;
      if (district) {
        setValue('district', '');
      }
      setValue('tehsil', '');
    }
  }, [province, district, setValue]);

  useEffect(() => {
    if (previousDistrictRef.current !== district) {
      previousDistrictRef.current = district;
      setValue('tehsil', '');
    }
  }, [district, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({
        fatherName: values.fatherName,
        cnic: values.cnic,
        dob: values.dob,
        province: values.province,
        district: values.district,
        tehsil: values.tehsil,
        address: values.address,
      });
      Toast.show({ type: 'success', text1: 'Profile saved' });
      router.push('/(app)/documents');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Could not save profile',
        text2: getApiErrorMessage(error),
      });
    }
  });
  if (meQuery.isLoading) {
    return <ScreenSkeleton variant="form" />;
  }

  const provinces = Array.isArray(provincesQuery.data) ? provincesQuery.data : [];
  const districts = Array.isArray(districtsQuery.data) ? districtsQuery.data : [];
  const tehsils = Array.isArray(tehsilsQuery.data) ? tehsilsQuery.data : [];

  const provinceError =
    errors.province?.message ||
    (provincesQuery.isError ? getApiErrorMessage(provincesQuery.error) : undefined);
  const districtError =
    errors.district?.message ||
    (province && districtsQuery.isError
      ? getApiErrorMessage(districtsQuery.error)
      : undefined);
  const tehsilError =
    errors.tehsil?.message ||
    (district && tehsilsQuery.isError
      ? getApiErrorMessage(tehsilsQuery.error)
      : undefined);

  return (
    <KeyboardScreen edges={['bottom', 'left', 'right']} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <Controller
          control={control}
          name="fatherName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={copyEn.personalInfo.fatherName}
              labelUrdu={copyUr.personalInfo.fatherName}
              placeholder={copy.personalInfo.fatherNamePlaceholder}
              leftIcon="person-outline"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.fatherName?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="cnic"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={copyEn.personalInfo.cnic}
              labelUrdu={copyUr.personalInfo.cnic}
              placeholder={copy.personalInfo.cnicPlaceholder}
              leftIcon="card-outline"
              keyboardType="number-pad"
              maxLength={13}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.cnic?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="dob"
          render={({ field: { onChange, value } }) => (
            <DateField
              label={copyEn.personalInfo.dob}
              labelUrdu={copyUr.personalInfo.dob}
              value={value}
              onChange={onChange}
              error={errors.dob?.message}
              leftIcon="calendar-outline"
            />
          )}
        />
        <View style={styles.geoBlock}>
          <Controller
            control={control}
            name="province"
            render={({ field: { onChange, value } }) => (
              <SelectField
                label={copyEn.personalInfo.province}
                labelUrdu={copyUr.personalInfo.province}
                placeholder={copy.personalInfo.selectProvince}
                leftIcon="business-outline"
                value={value}
                onChange={onChange}
                loading={provincesQuery.isLoading || provincesQuery.isFetching}
                options={provinces.map((p) => ({ label: p.name, value: p.id }))}
                error={provinceError}
              />
            )}
          />
          <Controller
            control={control}
            name="district"
            render={({ field: { onChange, value } }) => (
              <SelectField
                label={copyEn.personalInfo.district}
                labelUrdu={copyUr.personalInfo.district}
                placeholder={
                  province
                    ? copy.personalInfo.selectDistrict
                    : copy.personalInfo.selectDistrictFirst
                }
                leftIcon="location-outline"
                value={value}
                onChange={onChange}
                disabled={!province}
                loading={!!province && (districtsQuery.isLoading || districtsQuery.isFetching)}
                options={districts.map((d) => ({ label: d.name, value: d.id }))}
                error={districtError}
              />
            )}
          />
          <Controller
            control={control}
            name="tehsil"
            render={({ field: { onChange, value } }) => (
              <SelectField
                label={copyEn.personalInfo.tehsil}
                labelUrdu={copyUr.personalInfo.tehsil}
                placeholder={
                  district
                    ? copy.personalInfo.selectTehsil
                    : copy.personalInfo.selectTehsilFirst
                }
                leftIcon="location-outline"
                value={value}
                onChange={onChange}
                disabled={!district}
                loading={!!district && (tehsilsQuery.isLoading || tehsilsQuery.isFetching)}
                options={tehsils.map((t) => ({ label: t.name, value: t.id }))}
                error={tehsilError}
              />
            )}
          />
        </View>
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={copyEn.personalInfo.address}
              labelUrdu={copyUr.personalInfo.address}
              placeholder={copy.personalInfo.addressPlaceholder}
              leftIcon="home-outline"
              multiline
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.address?.message}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          )}
        />
        <Button
          title={copy.personalInfo.saveContinue}
          onPress={onSubmit}
          loading={updateMutation.isPending}
        />
        <Button
          title={copy.personalInfo.back}
          variant="ghost"
          onPress={() => router.back()}
        />
      </View>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  form: { gap: Spacing.three },
  geoBlock: {
    gap: Spacing.three,
    zIndex: 30,
    overflow: 'visible',
  },
});
