import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Text,
} from '@react-email/components';

interface ChangeEmailAddressEmailProps {
  username: string;
  pin: string;
}

export const ChangeEmailAddressEmail = ({
  username,
  pin,
}: ChangeEmailAddressEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <div style={logo}>
          <svg
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
          </svg>
        </div>
        <Text style={tertiary}>Email Change Request</Text>
        <Heading style={secondary}>Hi {username}!</Heading>
        <Text style={paragraph}>
          We received a request to change your email address. To complete this
          process, please use the verification code below:
        </Text>
        <Section style={codeContainer}>
          <Text style={code}>{pin}</Text>
        </Section>
        <Text style={paragraph}>
          Enter this verification code in the modal window that opened in your
          browser. If you did not request this change, please ignore this email
          or contact support immediately.
        </Text>
        <Text style={paragraph}>
          This code will expire in 5 minutes for security reasons.
        </Text>
      </Container>
      <Text style={footer}>Start Template</Text>
    </Body>
  </Html>
);

ChangeEmailAddressEmail.PreviewProps = {
  username: 'John Doe',
  verificationUrl: 'https://example.com/settings/email/verify',
  pin: '144833',
} as ChangeEmailAddressEmailProps;

export default ChangeEmailAddressEmail;

const main = {
  backgroundColor: '#1b1c1d',
  fontFamily: 'Geist,HelveticaNeue,Helvetica,Arial,sans-serif',
};

const container = {
  backgroundColor: '#222425',
  border: '1px solid #3f3f46',
  borderRadius: '8px',
  boxShadow: '0 5px 10px rgba(20,50,70,.2)',
  marginTop: '20px',
  maxWidth: '360px',
  margin: '0 auto',
  padding: '68px 0 130px',
};

const logo = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const tertiary = {
  color: '#7c3aed',
  fontSize: '11px',
  fontWeight: 700,
  fontFamily: 'Geist,HelveticaNeue,Helvetica,Arial,sans-serif',
  height: '16px',
  letterSpacing: '0',
  lineHeight: '16px',
  margin: '16px 8px 8px 8px',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
};

const secondary = {
  color: '#f4f4f5',
  display: 'inline-block',
  fontFamily: 'Geist,HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
  fontSize: '20px',
  fontWeight: 500,
  lineHeight: '24px',
  marginBottom: '24px',
  marginTop: '0',
  textAlign: 'center' as const,
  width: '100%',
};

const codeContainer = {
  background: 'rgba(124, 58, 237, 0.1)',
  borderRadius: '8px',
  margin: '16px auto 24px',
  verticalAlign: 'middle',
  width: '280px',
};

const code = {
  color: '#f4f4f5',
  fontFamily: 'Geist,HelveticaNeue-Bold',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '6px',
  lineHeight: '40px',
  paddingBottom: '8px',
  paddingTop: '8px',
  margin: '0 auto',
  display: 'block',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#71717a',
  fontSize: '15px',
  fontFamily: 'Geist,HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
  padding: '0 40px',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const footer = {
  color: '#f4f4f5',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0',
  lineHeight: '23px',
  margin: '0',
  marginTop: '20px',
  fontFamily: 'Geist,HelveticaNeue,Helvetica,Arial,sans-serif',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
};
