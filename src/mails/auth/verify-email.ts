export const verificationMail = ({
  link,
  pin,
}: {
  link: string;
  pin: string;
}) => `<!DOCTYPE html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Підтвердження електронної пошти</title>
  </head>
  <body>
    <table width="100%" bgcolor="hsl(132, 50%, 10%)" style="color: hsl(132, 5%, 100%); font-family: Arial, sans-serif;">
      <tr>
        <td>
          <table bgcolor="hsl(132, 50%, 10%)" style="color: hsl(132, 5%, 100%); padding: 2rem; border-radius: 0.5rem; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; margin: 0 auto;">
            <tr>
              <td>
                <h1>Перевірка електронної пошти</h1>
                <p>Будь ласка, натисніть кнопку нижче та введіть ПІН-код <b>${pin}</b>, щоб підтвердити вашу електронну адресу.</p>
                <a href="${link}" style="display: inline-flex; align-items: center; background-color: hsl(132, 50%, 32.9%); color: hsl(0, 0%, 100%); padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; text-decoration: none; font-size: 1rem; cursor: pointer; transition: background-color 0.3s; margin-top: 1rem;">
                  <span style="margin-right: 0.5rem;">
                  </span>
                  Підтвердити електронну пошту
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
