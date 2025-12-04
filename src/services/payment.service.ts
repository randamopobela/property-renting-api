import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export class PaymentService {
  async createTransaction(
    orderId: string, 
    amount: number, 
    customerDetails: { firstName: string; email: string; phone?: string }
  ) {
    const parameter = {
      transaction_details: {
        order_id: orderId,     
        gross_amount: amount,  
      },
      customer_details: {
        first_name: customerDetails.firstName,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
      expiry: {
        unit: "hours",
        duration: 2
      },
      enabled_payments: [
        "credit_card", 
        "cimb_clicks", 
        "bca_klikbca", 
        "bca_klikpay", 
        "bri_epay", 
        "echannel", 
        "permata_va", 
        "bca_va", 
        "bni_va", 
        "bri_va", 
        "other_va", 
        "gopay", 
        "indomaret", 
        "danamon_online", 
        "akulaku", 
        "shopeepay"
      ]
    };

    try {
      // Request ke Midtrans untuk buat transaksi
      const transaction = await snap.createTransaction(parameter);
      
      // Kembalikan Token & Redirect URL
      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url
      };
    } catch (error) {
      console.error("Midtrans Error:", error);
      throw new Error("Gagal membuat transaksi payment gateway");
    }
  }
}

export const paymentService = new PaymentService();