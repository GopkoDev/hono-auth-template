export const resetPasswordMail = ({
  url,
  pin,
}: {
  url: string;
  pin: string;
}): string => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
  </head>
  <body>
    <table width="100%" bgcolor="#120014" style="color: hsl(132, 5%, 100%); font-family: Arial, sans-serif;">
      <tr>
        <td>
          <table bgcolor="#120014" style="color: hsl(132, 5%, 100%); padding: 2rem; border-radius: 0.5rem; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; margin: 0 auto;">
            <tr>
              <td>
                <h1>Password Reset</h1>
                <p>Please click the button below to proceed with resetting your password and enter the code <span style='font-weight: 700; font-size: 16px'>${pin}</span>.</p>
                <a href="${url}" style="display: inline-flex; align-items: center; background-color: #7c3aed; color: hsl(0, 0%, 100%); padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; text-decoration: none; font-size: 1rem; cursor: pointer; transition: background-color 0.3s; margin-top: 1rem;">
                  <span style="margin-right: 0.5rem;">
                  </span>
                  Reset Password
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
