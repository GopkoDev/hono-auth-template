export const verificationMail = ({
  link,
  pin,
}: {
  link: string;
  pin: string;
}) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
  </head>
  <body>
    <table width="100%"  bgcolor="#120014" style="color: hsl(132, 5%, 100%); font-family: Arial, sans-serif;">
      <tr>
        <td>
          <table bgcolor="#120014" style="color: hsl(132, 5%, 100%); padding: 2rem; border-radius: 0.5rem; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; margin: 0 auto;">
            <tr>
              <td>
                <h1>Email Verification</h1>
                <p>Please click the button below and enter the PIN code <span style='font-weight: 700; font-size: 16px'>${pin}</span> to verify your email address.</p>
                <a href="${link}" style="display: inline-flex; align-items: center; background-color: hsl(132, 50%, 32.9%); color: hsl(0, 0%, 100%); padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; text-decoration: none; font-size: 1rem; cursor: pointer; transition: background-color 0.3s; margin-top: 1rem;">
                  <span style="margin-right: 0.5rem;">
                  </span>
                  Verify Email
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
