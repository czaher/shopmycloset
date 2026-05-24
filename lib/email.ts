import nodemailer from "nodemailer";

export async function sendClaimNotification({
  itemName,
  claimerName,
  contactInfo,
}: {
  itemName: string;
  claimerName: string;
  contactInfo: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"ShopMyCloset" <${process.env.GMAIL_USER}>`,
    to: process.env.NOTIFY_EMAIL || process.env.GMAIL_USER,
    subject: `${claimerName} claimed: ${itemName}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #FAF7F2; border-radius: 8px;">
        <h2 style="color: #2C2418; margin-bottom: 8px;">Someone claimed an item!</h2>
        <hr style="border-color: #E8DDD0; margin: 16px 0;" />
        <p style="color: #2C2418;"><strong>Item:</strong> ${itemName}</p>
        <p style="color: #2C2418;"><strong>Name:</strong> ${claimerName}</p>
        <p style="color: #2C2418;"><strong>How to reach them:</strong> ${contactInfo}</p>
        <hr style="border-color: #E8DDD0; margin: 16px 0;" />
        <p style="color: #9B8070; font-size: 13px;">Reach out to confirm pickup!</p>
      </div>
    `,
  });
}
