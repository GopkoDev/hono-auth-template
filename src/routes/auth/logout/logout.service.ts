import { db } from '../../../lib/db.js';

interface LogoutServiceRequest {
  refreshToken: string | undefined;
}
interface LogoutServiceResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const logoutService = async ({
  refreshToken,
}: LogoutServiceRequest): Promise<LogoutServiceResponse> => {
  try {
    if (!refreshToken) {
      return { success: false, error: 'Already logged out' };
    }

    const existingToken = await db.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (existingToken) {
      await db.refreshToken.delete({ where: { token: refreshToken } });
    }

    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('[LOGOUT] Error:', error);
    return { success: false, error: 'Failed to logout' };
  }
};
