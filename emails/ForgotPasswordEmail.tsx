import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Text,
} from '@react-email/components';

interface ForgotPasswordEmailProps {
  username: string;
  resetUrl: string;
  pin: string;
}

export const ForgotPasswordEmail = ({
  username,
  resetUrl,
  pin,
}: ForgotPasswordEmailProps) => (
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
        <Text style={tertiary}>Password Reset Request</Text>
        <Heading style={secondary}>Hi, {username}!</Heading>
        <Text style={paragraph}>
          We received a request to reset your password. Use this PIN code to
          confirm it's you:
        </Text>
        <Section style={codeContainer}>
          <Text style={code}>{pin}</Text>
        </Section>
        <Text style={paragraph}>
          You have been automatically redirected to the password reset page. If
          that didn't happen, click the button below:
        </Text>
        <Section style={buttonContainer}>
          <Button href={resetUrl} style={button}>
            Reset Password
          </Button>
        </Section>
        <Text style={paragraph}>
          If you didn't request a password reset, please ignore this email or
          contact support if you're concerned about your account's security.
        </Text>
      </Container>
      <Text style={footer}>Start Template</Text>
    </Body>
  </Html>
);

ForgotPasswordEmail.PreviewProps = {
  username: 'John Doe',
  resetUrl: 'https://example.com/reset-password',
  pin: '144833',
} as ForgotPasswordEmailProps;

export default ForgotPasswordEmail;

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

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#ffffff',
  fontFamily: 'Geist,HelveticaNeue,Helvetica,Arial,sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  border: 'none',
  cursor: 'pointer',
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
