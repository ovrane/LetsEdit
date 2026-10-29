/**
 * Multi-Signer API Routes Module (Enterprise Electronic Signatures)
 * Re-exports handleSignRequest as handleMultiSignerRequest for Phase 5 specification.
 */

import { handleSignRequest, SIGNATURE_REQUESTS } from './sign-request-routes.js';

export const handleMultiSignerRequest = handleSignRequest;
export { handleSignRequest, SIGNATURE_REQUESTS };
