import { render } from '@react-email/render';
import React from 'react';
import { RegistrationEmail } from '../../../emails/RegistrationEmail.jsx';

interface RenderRegistrationEmailProps {
  username: string;
  verificationUrl: string;
  pin: string;
}

export async function renderRegistrationEmail(
  props: RenderRegistrationEmailProps
): Promise<string> {
  const emailComponent = React.createElement(RegistrationEmail, props);
  return await render(emailComponent);
}
