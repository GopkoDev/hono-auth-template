import { render } from '@react-email/render';
import React from 'react';
import { ForgotPasswordEmail } from '../../../emails/ForgotPasswordEmail.jsx';

interface RenderResetPasswordEmailProps {
  username: string;
  resetUrl: string;
  pin: string;
}

export async function renderResetPasswordEmail(
  props: RenderResetPasswordEmailProps
): Promise<string> {
  const emailComponent = React.createElement(ForgotPasswordEmail, props);
  return await render(emailComponent);
}
