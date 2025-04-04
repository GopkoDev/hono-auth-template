export const resetPasswordMail = ({
  url,
  pin,
}: {
  url: string;
  pin: string;
}): string => `<!DOCTYPE html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Відновлення паролю</title>
  </head>
  <body>
    <table width="100%" bgcolor="hsl(132, 50%, 10%)" style="color: hsl(132, 5%, 100%); font-family: Arial, sans-serif;">
      <tr>
        <td>
          <table bgcolor="hsl(132, 50%, 10%)" style="color: hsl(132, 5%, 100%); padding: 2rem; border-radius: 0.5rem; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; margin: 0 auto;">
            <tr>
              <td>
                <h1>Відновлення паролю</h1>
                <p>Будь ласка, натисніть кнопку нижче, щоб перейти до відновлення паролю та введіть пароль ${pin}.</p>
                <a href="${url}" style="display: inline-flex; align-items: center; background-color: hsl(132, 50%, 32.9%); color: hsl(0, 0%, 100%); padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; text-decoration: none; font-size: 1rem; cursor: pointer; transition: background-color 0.3s; margin-top: 1rem;">
                  <span style="margin-right: 0.5rem;">
                  </span>
                  Відновити пароль
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
