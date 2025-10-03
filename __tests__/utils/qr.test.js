/**
 * @jest-environment jsdom
 */
import { parseQrPayload, isValidQrFormat } from '../../src/utils/qr';

describe('QR Utility Functions', () => {
  describe('isValidQrFormat', () => {
    it('validates BNF format correctly', () => {
      expect(isValidQrFormat('BNF:123456')).toBe(true);
      expect(isValidQrFormat('BNF:')).toBe(true); // Válido aunque no tenga serial
    });

    it('validates APP format correctly', () => {
      expect(isValidQrFormat('APP:12345678:abc123')).toBe(true);
      expect(isValidQrFormat('APP:123')).toBe(false); // Inválido, faltan partes
    });

    it('validates TEST format correctly', () => {
      expect(isValidQrFormat('TEST:anything')).toBe(true);
      expect(isValidQrFormat('TEST')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(isValidQrFormat('INVALID:format')).toBe(false);
      expect(isValidQrFormat('')).toBe(false);
      expect(isValidQrFormat(null)).toBe(false);
      expect(isValidQrFormat(undefined)).toBe(false);
    });
  });

  describe('parseQrPayload', () => {
    it('parses BNF format correctly', () => {
      const result = parseQrPayload('BNF:123456');
      expect(result).toEqual({
        type: 'benefit',
        serialId: '123456',
      });
    });

    it('parses APP format correctly', () => {
      const result = parseQrPayload('APP:12345678:abc123');
      expect(result).toEqual({
        type: 'customer',
        dni: '12345678',
        nonce: 'abc123',
      });
    });

    it('handles TEST format', () => {
      const result = parseQrPayload('TEST:SIMPLE');
      expect(result).toEqual({
        type: 'test',
        value: 'TEST:SIMPLE',
      });
    });

    it('handles invalid APP format', () => {
      const result = parseQrPayload('APP:missing-parts');
      expect(result).toEqual({
        type: 'invalid',
        rawData: 'APP:missing-parts',
      });
    });

    it('handles unknown format with raw data', () => {
      const result = parseQrPayload('UNKNOWN:format');
      expect(result).toEqual({
        type: 'unknown',
        rawData: 'UNKNOWN:format',
      });
    });

    it('handles empty or null input', () => {
      expect(parseQrPayload('')).toEqual({
        type: 'unknown',
        rawData: '',
      });
      expect(parseQrPayload(null)).toEqual({
        type: 'unknown',
        rawData: null,
      });
    });
  });
});