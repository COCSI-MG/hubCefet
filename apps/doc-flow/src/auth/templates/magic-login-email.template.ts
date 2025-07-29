export interface MagicLoginEmailData {
  userName: string;
  magicUrl: string;
}

export function generateMagicLoginEmailTemplate(data: MagicLoginEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Acesso sem Senha - DocFlow</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1976d2; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔐 Acesso sem Senha</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">DocFlow - Sistema Acadêmico CEFET</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #ffffff;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Olá, ${data.userName}!</h2>
              
              <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">Você solicitou acesso sem senha ao sistema DocFlow.</p>
              
              <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px; line-height: 1.6;">Clique no botão abaixo para fazer login automaticamente:</p>
              
              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background-color: #1976d2; text-align: center;">
                    <a href="${data.magicUrl}" target="_blank" style="display: inline-block; padding: 16px 32px; font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px; background-color: #1976d2; border: 2px solid #1976d2;">
                      🔑 Acessar Sistema
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Warning Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px;">
                    <p style="margin: 0 0 15px 0; color: #856404; font-size: 16px; font-weight: bold;">⚠️ Importante:</p>
                    <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px;">
                      <li style="margin-bottom: 8px;">Este link é válido por <strong>30 minutos</strong></li>
                      <li style="margin-bottom: 8px;">Pode ser usado apenas <strong>uma vez</strong></li>
                      <li>Se não foi você quem solicitou, ignore este email</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 15px 0; color: #555555; font-size: 16px; line-height: 1.6;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; word-break: break-all;">
                    <a href="${data.magicUrl}" target="_blank" style="color: #1976d2; text-decoration: none; font-family: monospace; font-size: 14px;">${data.magicUrl}</a>
                  </td>
                </tr>
              </table>
              
              <hr style="margin: 40px 0; border: none; border-top: 1px solid #dddddd;">
              
              <p style="margin: 0 0 15px 0; color: #555555; font-size: 16px; font-weight: bold;">Por que recebo este email?</p>
              <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Você solicitou acesso sem senha como estudante do CEFET. Este é um método seguro de autenticação que não requer memorizar senhas.</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px;">DocFlow - Sistema Acadêmico CEFET-RJ</p>
              <p style="margin: 0; color: #666666; font-size: 12px;">Este é um email automático, não responda.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
} 
 
 