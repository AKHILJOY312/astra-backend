import { inject, injectable } from "inversify";
import { IPaymentRepository } from "@/application/ports/repositories/IPaymentRepository";
import { IPdfInvoiceService } from "@/application/ports/services/IPdfInvoiceService";
import { TYPES } from "@/config/di/types";
import {
  DownloadInvoiceInput,
  DownloadInvoiceOutput,
  IDownloadInvoiceUseCase,
} from "@/application/ports/use-cases/upgradetopremium/IDownloadInvoiceOutput";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";

@injectable()
export class DownloadInvoiceUseCase implements IDownloadInvoiceUseCase {
  constructor(
    @inject(TYPES.PaymentRepository)
    private paymentRepository: IPaymentRepository,

    @inject(TYPES.PdfInvoiceService)
    private invoicePdfGenerator: IPdfInvoiceService,
  ) {}

  async execute(input: DownloadInvoiceInput): Promise<DownloadInvoiceOutput> {
    const payment = await this.paymentRepository.findById(input.paymentId);

    if (!payment) {
      throw new BadRequestError("Payment not found");
    }
    if (payment.userId !== input.userId) {
      throw new UnauthorizedError("User not authorized");
    }
    if (payment.status !== "captured") {
      throw new BadRequestError("Invoice available only for captured payments");
    }

    if (!payment.invoiceNumber) {
      throw new Error("Invoice number missing for this payment");
    }

    const pdfBuffer = await this.invoicePdfGenerator.generate(payment);

    return {
      fileName: `invoice-${payment.invoiceNumber}.pdf`,
      pdfBuffer,
    };
  }
}
