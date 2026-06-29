import {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  updateUserAttributes,
  SignInInput,
  SignUpInput,
  ConfirmSignUpInput,
  ResendSignUpCodeInput,
  ResetPasswordInput,
  ConfirmResetPasswordInput,
} from 'aws-amplify/auth';

/**
 * Handle Login
 */
export async function handleSignIn({ username, password }: SignInInput) {
  try {
    const { isSignedIn, nextStep } = await signIn({ username, password });
    return { isSignedIn, nextStep };
  } catch (error: any) {
    console.error('Sign-in error:', error);
    // If the user is already signed in but the app state didn't reflect it,
    // clear the stale session and retry the sign in.
    if (error?.message?.toLowerCase().includes('already signed in') || error?.message?.toLowerCase().includes('already authenticated') || error?.name === 'UserAlreadyAuthenticatedException') {
      try {
        console.log('User already signed in. Clearing stale session and retrying...');
        await signOut();
        const { isSignedIn, nextStep } = await signIn({ username, password });
        return { isSignedIn, nextStep };
      } catch (retryError) {
        console.error('Retry sign-in error:', retryError);
        throw retryError;
      }
    }
    throw error;
  }
}

/**
 * Handle Logout
 */
export async function handleSignOut() {
  try {
    await signOut();
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

/**
 * Handle Signup
 */
export async function handleSignUp({ username, password, options }: SignUpInput) {
  try {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username,
      password,
      options,
    });
    return { isSignUpComplete, userId, nextStep };
  } catch (error: any) {
    console.error('Sign-up error:', error);
    if (error?.message?.toLowerCase().includes('already signed in') || error?.message?.toLowerCase().includes('already authenticated') || error?.name === 'UserAlreadyAuthenticatedException') {
      try {
        console.log('User already signed in. Clearing stale session and retrying sign up...');
        await signOut();
        const { isSignUpComplete, userId, nextStep } = await signUp({
          username,
          password,
          options,
        });
        return { isSignUpComplete, userId, nextStep };
      } catch (retryError) {
        console.error('Retry sign-up error:', retryError);
        throw retryError;
      }
    }
    throw error;
  }
}

/**
 * Confirm Signup (OTP)
 */
export async function handleConfirmSignUp({ username, confirmationCode }: ConfirmSignUpInput) {
  try {
    const { isSignUpComplete, nextStep } = await confirmSignUp({
      username,
      confirmationCode
    });
    return { isSignUpComplete, nextStep };
  } catch (error) {
    console.error('Confirm sign-up error:', error);
    throw error;
  }
}

/**
 * Resend Signup Code
 */
export async function handleResendSignUpCode({ username }: ResendSignUpCodeInput) {
  try {
    await resendSignUpCode({ username });
  } catch (error) {
    console.error('Resend code error:', error);
    throw error;
  }
}

/**
 * Handle Forgot Password
 */
export async function handleForgotPassword({ username }: ResetPasswordInput) {
  try {
    const output = await resetPassword({ username });
    return output;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
}

/**
 * Confirm Reset Password
 */
export async function handleConfirmForgotPassword({ username, confirmationCode, newPassword }: ConfirmResetPasswordInput) {
  try {
    await confirmResetPassword({ username, confirmationCode, newPassword });
  } catch (error) {
    console.error('Confirm reset password error:', error);
    throw error;
  }
}

/**
 * Get Current Authenticated User
 */
export async function handleGetCurrentUser() {
  try {
    const user = await getCurrentUser();
    let attributes = {};
    try {
      attributes = await fetchUserAttributes();
    } catch (attrError) {
      console.warn('Could not fetch user attributes, continuing with empty attributes:', attrError);
    }
    return { ...user, attributes };
  } catch (error) {
    // Only log at debug/trace level for not signed in, as it's a common flow
    if (error?.toString().includes('User unauthenticated')) {
      console.log('No user currently signed in via Amplify.');
    } else {
      console.error('Error in handleGetCurrentUser:', error);
    }
    return null;
  }
}

/**
 * Helper to check if user is admin based on email
 * Uses the same hardcoded logic as the Flutter app
 */
export function isUserAdmin(email: string): boolean {
  const adminEmails = [
    'awadhropar@gmail.com',
    'ashutoshrj12@gmail.com'
  ];
  return adminEmails.includes(email.toLowerCase());
}