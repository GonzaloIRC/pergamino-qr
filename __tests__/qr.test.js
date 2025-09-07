import { processBenefitRedemption, processPointAccumulation, generateNonce } from '../src/services/transactions';
import { parseQrPayload } from '../src/utils/qr';

// Mock de firebase/firestore
jest.mock('../src/services/firebaseClient', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  runTransaction: jest.fn(),
  serverTimestamp: jest.fn(),
  Timestamp: jest.fn(),
  query: jest.fn(),
  where: jest.fn()
}));

describe('parseQrPayload', () => {
  test('should parse a valid BNF QR code', () => {
    const result = parseQrPayload('BNF:SER-0001');
    expect(result).toEqual({
      type: 'benefit',
      serialId: 'SER-0001'
    });
  });

  test('should parse a valid APP QR code', () => {
    const result = parseQrPayload('APP:12345678:ABC123');
    expect(result).toEqual({
      type: 'customer',
      dni: '12345678',
      nonce: 'ABC123'
    });
  });

  test('should handle unknown QR code format', () => {
    const result = parseQrPayload('SOMETHING:ELSE');
    expect(result).toEqual({
      type: 'unknown'
    });
  });
  
  test('should handle empty input', () => {
    const result = parseQrPayload('');
    expect(result).toEqual({
      type: 'unknown'
    });
  });

  test('should handle null input', () => {
    const result = parseQrPayload(null);
    expect(result).toEqual({
      type: 'unknown'
    });
  });
});
