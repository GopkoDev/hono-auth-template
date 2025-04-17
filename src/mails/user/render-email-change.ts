import { render } from '@react-email/render';
import React from 'react';
import ChangeEmailAddressEmail from '../../../emails/ChangeEmailAddressEmail.js';

interface RenderChangeEmailAddressEmail {
  username: string;
  pin: string;
}

export async function renderChangeEmailAddressEmail(
  props: RenderChangeEmailAddressEmail
): Promise<string> {
  const emailComponent = React.createElement(ChangeEmailAddressEmail, props);
  return await render(emailComponent);
}
