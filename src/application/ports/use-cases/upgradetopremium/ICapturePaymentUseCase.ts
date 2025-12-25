export interface CapturePaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface CapturePaymentOutput {
  success: boolean;
  message: string;
}

export interface ICapturePaymentUseCase {
  execute(input: CapturePaymentInput): Promise<CapturePaymentOutput>;
}
