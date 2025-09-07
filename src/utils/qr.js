/**
 * Utility functions for QR code parsing
 */

/**
 * Parse QR code payload and return structured data
 * @param {string} data - QR code payload string
 * @returns {Object} parsed data with type and relevant fields
 */
export function parseQrPayload(data) {
  if (!data) return { type: 'unknown' };
  
  // Case 1: Benefit QR code
  if (data.startsWith('BNF:')) {
    const serialId = data.substring(4); // Remove the BNF: prefix
    return {
      type: 'benefit',
      serialId,
    };
  }
  
  // Case 2: Customer code (APP:DNI:NONCE format)
  if (data.startsWith('APP:')) {
    const parts = data.split(':');
    if (parts.length !== 3) return { type: 'invalid' };
    
    return {
      type: 'customer',
      dni: parts[1],
      nonce: parts[2],
    };
  }
  
  // Unknown format
  return { type: 'unknown' };
}
