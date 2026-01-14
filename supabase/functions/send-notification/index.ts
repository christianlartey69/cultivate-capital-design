import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const sendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "CES Agritech <notifications@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
  
  return response.json();
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "payment_approved" | "payment_rejected" | "farm_visit_confirmed";
  recipientEmail: string;
  recipientName: string;
  details: {
    amount?: number;
    packageName?: string;
    transactionReference?: string;
    visitDate?: string;
    visitTime?: string;
    location?: string;
    rejectionReason?: string;
  };
}

const getEmailContent = (request: NotificationRequest) => {
  const { type, recipientName, details } = request;

  switch (type) {
    case "payment_approved":
      return {
        subject: "Payment Approved - CES Agritech",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2d5a27 0%, #4a7c42 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .highlight { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .btn { display: inline-block; background: #2d5a27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Payment Approved!</h1>
              </div>
              <div class="content">
                <p>Dear ${recipientName},</p>
                <p>Great news! Your payment has been successfully verified and approved.</p>
                
                <div class="highlight">
                  <p><strong>Investment Details:</strong></p>
                  <p>📦 Package: ${details.packageName || "N/A"}</p>
                  <p>💰 Amount: GHS ${details.amount?.toLocaleString() || "N/A"}</p>
                  <p>🔖 Reference: ${details.transactionReference || "N/A"}</p>
                </div>
                
                <p>Your investment is now active and you can track its progress on your dashboard.</p>
                
                <p>Thank you for investing with CES Agritech!</p>
                
                <a href="https://cesagritech.com/dashboard" class="btn">View Dashboard</a>
              </div>
              <div class="footer">
                <p>CES Agritech - Empowering Agriculture Investment in Ghana</p>
                <p>If you have any questions, please contact our support team.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "payment_rejected":
      return {
        subject: "Payment Update - CES Agritech",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #c62828 0%, #e57373 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .highlight { background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .btn { display: inline-block; background: #2d5a27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Payment Update</h1>
              </div>
              <div class="content">
                <p>Dear ${recipientName},</p>
                <p>We regret to inform you that your payment could not be verified.</p>
                
                <div class="highlight">
                  <p><strong>Payment Details:</strong></p>
                  <p>💰 Amount: GHS ${details.amount?.toLocaleString() || "N/A"}</p>
                  <p>🔖 Reference: ${details.transactionReference || "N/A"}</p>
                  ${details.rejectionReason ? `<p>📝 Reason: ${details.rejectionReason}</p>` : ""}
                </div>
                
                <p>Please review the payment details and submit a new payment, or contact our support team for assistance.</p>
                
                <a href="https://cesagritech.com/contact" class="btn">Contact Support</a>
              </div>
              <div class="footer">
                <p>CES Agritech - Empowering Agriculture Investment in Ghana</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "farm_visit_confirmed":
      return {
        subject: "Farm Visit Confirmed - CES Agritech",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2d5a27 0%, #4a7c42 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .highlight { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .btn { display: inline-block; background: #2d5a27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌾 Farm Visit Confirmed!</h1>
              </div>
              <div class="content">
                <p>Dear ${recipientName},</p>
                <p>Your farm visit has been confirmed! We look forward to showing you our operations.</p>
                
                <div class="highlight">
                  <p><strong>Visit Details:</strong></p>
                  <p>📅 Date: ${details.visitDate || "N/A"}</p>
                  <p>🕐 Time: ${details.visitTime || "N/A"}</p>
                  <p>📍 Location: ${details.location || "Kade, Eastern Region"}</p>
                </div>
                
                <p><strong>What to bring:</strong></p>
                <ul>
                  <li>Valid ID for verification</li>
                  <li>Comfortable walking shoes</li>
                  <li>Sun protection (hat, sunscreen)</li>
                  <li>Camera (optional)</li>
                </ul>
                
                <p>If you need to reschedule, please contact us at least 48 hours before your visit.</p>
                
                <a href="https://cesagritech.com/dashboard" class="btn">View Booking Details</a>
              </div>
              <div class="footer">
                <p>CES Agritech - Empowering Agriculture Investment in Ghana</p>
                <p>For directions or questions, call: +233 XX XXX XXXX</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: NotificationRequest = await req.json();
    const { subject, html } = getEmailContent(request);

    const emailResponse = await sendEmail(request.recipientEmail, subject, html);

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
