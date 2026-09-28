export interface CandidateDocument {
  id?: string;
  type: string;
  fileUrl?: string | null;
  fileType?: string | null;
  reviewStatus?: string;
  reviewNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateCertificate {
  id: string;
  certificate_number: string;
  issuedDate: string;
  expiryDate: string | null;
  score: string;
  status: string;
  downloadUrl: string | null;
}

export interface CandidatePayment {
  isPaid: boolean;
  status: string;
  paidAt: string;
  transactionId: string;
}

export interface CandidateMe {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
    status: string;
  };
  userId: string;
  cnic: string;
  fatherName: string;
  dob: string;
  city: {
    id: string;
    name: string;
  } | null;
  province: {
    id: string;
    name: string;
  } | null;
  district: {
    id: string;
    name: string;
    provinceId: string;
  } | null;
  tehsil: {
    id: string;
    name: string;
    districtId: string;
  } | null;
  address: string;
  has16YearsEducation: boolean;
  certificationPath?: 'EXAM' | 'DEGREE';
  certificateIssued: boolean;
  createdAt: string;
  updatedAt: string;
  certificate?: CandidateCertificate | null;
  payment?: CandidatePayment;
  requiresRepayment?: boolean;
  consecutiveMisses?: number;
  documents?: CandidateDocument[];
}

export interface DocumentValidationResult {
  canProceedToPayment: boolean;
  missingDocuments?: string[];
}

export interface PaymentStatus {
  hasPayment?: boolean;
  status: string | null;
  amount?: number | null;
  paidAt?: string | null;
  qrCodeBase64?: string | null;
  expiresAt?: string | null;
  transactionId?: string | null;
  orderId?: string | null;
  canProceedToExam?: boolean;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  qrCodeBase64: string;
  amount: number;
  expiresAt: string;
  transactionId: string;
  orderId: string;
  status: string;
}

export interface UploadDocumentResponse {
  type: string;
  url: string;
  fileType?: string | null;
  status: string;
}

export interface EligibleCity {
  cityId: string;
  cityName: string;
  distanceKm: number | null;
  availableSlots: number;
}

export interface EligibleCitiesResponse {
  zoneMatched: boolean;
  radiusKm: number | null;
  widened: boolean;
  cities: EligibleCity[];
}

export interface ScheduleExamResponse {
  success: boolean;
  message: string;
  data: {
    examSessionId: string;
    centerId: string;
    centerName?: string;
    centerAddress?: string;
    cityName?: string;
    examStartTime: string;
    trainingEndTime: string;
    arriveByTime: string;
    verificationClosesAt: string;
    verificationMessage: string;
    date: string;
  };
}

export interface ConfirmPaymentResponse {
  message: string;
}

export interface Province {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
  provinceId: string;
}

export interface Tehsil {
  id: string;
  name: string;
  districtId: string;
}

/** RN multipart file shape for document upload. */
export interface DocumentFile {
  uri: string;
  name: string;
  type: string;
}
