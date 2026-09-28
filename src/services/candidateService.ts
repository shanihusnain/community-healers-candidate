import { api } from '@/api';
import {
  CandidateMe,
  ConfirmPaymentResponse,
  DocumentFile,
  DocumentValidationResult,
  EligibleCitiesResponse,
  InitiatePaymentResponse,
  PaymentStatus,
  ScheduleExamResponse,
  UploadDocumentResponse,
} from '@/types/candidate';

export const getMe = async (): Promise<CandidateMe> => {
  const response = await api.get('/candidates/me');
  return response.data;
};

export const updateMe = async (payload: Record<string, unknown>): Promise<CandidateMe> => {
  const response = await api.put('/candidates/me', payload);
  return response.data;
};

export const validateDocuments = async (): Promise<DocumentValidationResult> => {
  const response = await api.get('/candidates/me/validate-documents');
  return response.data;
};

export const uploadDocument = async (
  type: string,
  file: DocumentFile,
): Promise<UploadDocumentResponse> => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
  formData.append('type', type);

  const response = await api.post('/candidates/me/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Authenticated document bytes as a data URI for <Image>.
 * `fileUrl` from the API is a cookie-protected download route, not a public image URL.
 */
export const getDocumentPreviewUri = async (type: string): Promise<string> => {
  const response = await api.get(`/candidates/me/documents/${type}/download`, {
    responseType: 'arraybuffer',
  });
  const contentType =
    (response.headers?.['content-type'] as string | undefined)?.split(';')[0]?.trim() ||
    'image/jpeg';
  const base64 = arrayBufferToBase64(response.data as ArrayBuffer);
  return `data:${contentType};base64,${base64}`;
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return globalThis.btoa(binary);
}

export const scheduleExam = async (
  examDate: string,
  cityId: string,
): Promise<ScheduleExamResponse> => {
  const response = await api.post('/candidates/me/schedule', { examDate, cityId });
  return response.data;
};

export const getEligibleCities = async (examDate: string): Promise<EligibleCitiesResponse> => {
  const response = await api.get('/candidates/me/cities', { params: { date: examDate } });
  return response.data;
};

export const getPaymentStatus = async (): Promise<PaymentStatus | null> => {
  const response = await api.get('/candidates/payments/status');
  return response.data;
};

export const initiatePayment = async (): Promise<InitiatePaymentResponse> => {
  const response = await api.post('/candidates/payments/initiate');
  return response.data;
};

export const confirmPayment = async (
  transactionId: string,
  bankTransactionRef: string,
): Promise<ConfirmPaymentResponse> => {
  const response = await api.post(`/candidates/payments/confirm/${transactionId}`, {
    bankTransactionRef,
  });
  return response.data;
};

export const candidateService = {
  getMe,
  updateMe,
  validateDocuments,
  uploadDocument,
  getDocumentPreviewUri,
  scheduleExam,
  getEligibleCities,
  getPaymentStatus,
  initiatePayment,
  confirmPayment,
};
