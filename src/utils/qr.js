/**
 * Utility functions for QR code parsing
 */

/**
 * Función para verificar si un código QR es compatible con la aplicación
 * @param {string} data - El contenido del código QR
 * @returns {boolean} true si el formato es compatible
 */
export function isValidQrFormat(data) {
  if (!data) return false;
  
  return data.startsWith('BNF:') || 
         (data.startsWith('APP:') && data.split(':').length === 3) ||
         data.startsWith('TEST');
}

/**
 * Parse QR code payload and return structured data
 * @param {string} data - QR code payload string
 * @returns {Object} parsed data with type and relevant fields
 */
export function parseQrPayload(data) {
  if (!data) return { type: 'unknown', rawData: data };
  
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
    if (parts.length !== 3) return { type: 'invalid', rawData: data };
    
    return {
      type: 'customer',
      dni: parts[1],
      nonce: parts[2],
    };
  }
  
  // Case 3: Test code (para debugging)
  if (data.startsWith('TEST')) {
    return {
      type: 'test',
      value: data
    };
  }
  
  // Unknown format
  return { 
    type: 'unknown',
    rawData: data
  };
}
