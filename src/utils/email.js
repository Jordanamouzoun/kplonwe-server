import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email, code) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email Mock] Verification code for ${email}: ${code}`);
    return;
  }

  const mailOptions = {
    from: `"KPLONWE" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Code de vérification - KPLONWE',
    text: `Votre code de vérification est : ${code}. Il expire dans 24 heures.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Bienvenue sur KPLONWE</h2>
        <p>Veuillez utiliser le code suivant pour vérifier votre adresse email :</p>
        <div style="font-size: 24px; font-weight: bold; background: #F3F4F6; padding: 15px; text-align: center; border-radius: 8px; letter-spacing: 5px;">
          ${code}
        </div>
        <p>Ce code expire dans 24 heures.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
        <p style="font-size: 12px; color: #6B7280;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async (email, code) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email Mock] Reset password code for ${email}: ${code}`);
    return;
  }

  const mailOptions = {
    from: `"KPLONWE" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Récupération de mot de passe - KPLONWE',
    text: `Votre code de récupération est : ${code}. Il expire dans 1 heure.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #EF4444;">Récupération de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code :</p>
        <div style="font-size: 24px; font-weight: bold; background: #F3F4F6; padding: 15px; text-align: center; border-radius: 8px; letter-spacing: 5px;">
          ${code}
        </div>
        <p>Ce code expire dans 1 heure.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
        <p style="font-size: 12px; color: #6B7280;">Si vous n'êtes pas à l'origine de cette demande, veuillez sécuriser votre compte.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};
