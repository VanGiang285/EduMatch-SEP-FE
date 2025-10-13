/**
 * Debug utility for Google ID Token
 */
export const debugGoogleToken = {
  /**
   * Decode Google ID Token (JWT) without verification
   */
  decodeToken(token: string): any {
    try {
      // JWT has 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      // Decode the payload (second part)
      const payload = parts[1];
      // Add padding if needed
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      // Decode base64
      const decodedPayload = atob(paddedPayload);
      // Parse JSON
      const parsedPayload = JSON.parse(decodedPayload);
      return parsedPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },
  /**
   * Validate Google ID Token structure
   */
  validateTokenStructure(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload) {
        console.error('❌ Token decode failed');
        return false;
      }
      console.log('✅ Token decoded successfully');
      console.log('Token payload:', payload);
      // Check required fields
      const requiredFields = ['iss', 'aud', 'sub', 'email', 'email_verified'];
      const missingFields = requiredFields.filter(field => !payload[field]);
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        return false;
      }
      // Check issuer
      if (payload.iss !== 'https://accounts.google.com') {
        console.error('❌ Invalid issuer:', payload.iss);
        return false;
      }
      // Check email verification
      if (!payload.email_verified) {
        console.error('❌ Email not verified');
        return false;
      }
      console.log('✅ Token structure is valid');
      console.log('Email:', payload.email);
      console.log('Name:', payload.name);
      console.log('Picture:', payload.picture);
      console.log('Audience:', payload.aud);
      console.log('Issuer:', payload.iss);
      console.log('Expires:', new Date(payload.exp * 1000));
      return true;
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      return false;
    }
  },
  /**
   * Test Google ID Token
   */
  testToken(token: string): void {
    console.log('🔍 Testing Google ID Token...');
    console.log('Token preview:', token.substring(0, 50) + '...');
    const isValid = this.validateTokenStructure(token);
    if (isValid) {
      console.log('✅ Google ID Token is valid and ready to send to backend');
    } else {
      console.log('❌ Google ID Token has issues');
    }
  }
};
// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).debugGoogleToken = debugGoogleToken;
}