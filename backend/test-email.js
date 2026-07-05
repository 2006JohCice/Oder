require("dotenv").config({ path: "./.env" });
const sendMailHelper = require("./helpers/sendMail");

const html = `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body style="margin:0;padding:0;background-color:#1a1a1a;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#2a2a2a;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:1px solid #3a3a3a;">
            <tr>
              <td style="background: linear-gradient(135deg, #8B0000 0%, #4A0000 100%);padding:40px 0;text-align:center;border-bottom:3px solid #D4AF37;">
                <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:2px;font-weight:600;text-transform:uppercase;">Gourmet Pulse</h1>
                <p style="color:#D4AF37;margin:10px 0 0 0;font-size:14px;letter-spacing:4px;text-transform:uppercase;">Xác Thực Tài Khoản</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px;text-align:center;">
                <div style="margin:30px 0;">
                  <span style="display:inline-block;background-color:#111111;color:#D4AF37;font-size:36px;letter-spacing:8px;padding:20px 40px;border-radius:8px;font-weight:bold;border:1px solid #D4AF37;box-shadow:0 4px 15px rgba(212, 175, 55, 0.1);">
                    123456
                  </span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

sendMailHelper.sendMail("neicjoh@gmail.com", "Test Email", html);
