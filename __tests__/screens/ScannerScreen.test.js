/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert, Vibration } from 'react-native';
import ScannerScreen from '../../src/screens/main/ScannerScreen';
import * as qrUtils from '../../src/utils/qr';
import * as transactions from '../../src/services/transactions';
import { useAuth } from '../../src/context/AuthContext';

// Mocks
jest.mock('react-native-gesture-handler', () => ({}));
jest.mock('../../src/components/BarcodeScanner', () => ({
  EnhancedScanner: (props) => (
    <div data-testid="mock-scanner" {...props} />
  )
}));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    Alert: {
      ...rn.Alert,
      alert: jest.fn((title, message, buttons) => {
        if (buttons && buttons.length > 0 && buttons[0].onPress) {
          buttons[0].onPress();
        }
      }),
    },
    Vibration: {
      ...rn.Vibration,
      vibrate: jest.fn(),
    }
  };
});

jest.mock('../../src/utils/qr', () => ({
  parseQrPayload: jest.fn(),
  isValidQrFormat: jest.fn(),
}));

jest.mock('../../src/services/transactions', () => ({
  processBenefitRedemption: jest.fn(),
  processPointAccumulation: jest.fn(),
}));

jest.mock('../../src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('ScannerScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: { uid: 'test-uid' } });
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<ScannerScreen navigation={mockNavigation} />);
    expect(getByTestId('mock-scanner')).toBeTruthy();
  });

  it('handles benefit QR code correctly', async () => {
    qrUtils.parseQrPayload.mockReturnValue({ type: 'benefit', serialId: '123456' });
    transactions.processBenefitRedemption.mockResolvedValue({ success: true, message: 'Éxito' });
    
    const { getByTestId } = render(<ScannerScreen navigation={mockNavigation} />);
    const scanner = getByTestId('mock-scanner');
    
    // Simulamos un escaneo
    fireEvent(scanner, 'barcode', { data: 'BNF:123456', type: 'qr' });
    
    await waitFor(() => {
      expect(qrUtils.parseQrPayload).toHaveBeenCalledWith('BNF:123456');
      expect(transactions.processBenefitRedemption).toHaveBeenCalledWith('123456', 'test-uid');
      expect(Alert.alert).toHaveBeenCalledWith(
        '¡Beneficio canjeado!',
        'Éxito',
        expect.any(Array)
      );
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  it('handles customer QR code correctly', async () => {
    qrUtils.parseQrPayload.mockReturnValue({ type: 'customer', dni: '12345678', nonce: 'abc123' });
    transactions.processPointAccumulation.mockResolvedValue({ success: true, message: 'Puntos acumulados' });
    
    const { getByTestId } = render(<ScannerScreen navigation={mockNavigation} />);
    const scanner = getByTestId('mock-scanner');
    
    // Simulamos un escaneo
    fireEvent(scanner, 'barcode', { data: 'APP:12345678:abc123', type: 'qr' });
    
    await waitFor(() => {
      expect(qrUtils.parseQrPayload).toHaveBeenCalledWith('APP:12345678:abc123');
      expect(transactions.processPointAccumulation).toHaveBeenCalledWith('12345678', 'abc123', 'test-uid');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Puntos acumulados',
        'Puntos acumulados',
        expect.any(Array)
      );
    });
  });

  it('handles unknown format correctly', async () => {
    qrUtils.parseQrPayload.mockReturnValue({ type: 'unknown', rawData: 'INVALID:DATA' });
    
    const { getByTestId } = render(<ScannerScreen navigation={mockNavigation} />);
    const scanner = getByTestId('mock-scanner');
    
    // Simulamos un escaneo
    fireEvent(scanner, 'barcode', { data: 'INVALID:DATA', type: 'qr' });
    
    await waitFor(() => {
      expect(qrUtils.parseQrPayload).toHaveBeenCalledWith('INVALID:DATA');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Código desconocido',
        expect.stringContaining('unknown'),
        expect.any(Array)
      );
    });
  });
});