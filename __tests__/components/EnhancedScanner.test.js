/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Vibration } from 'react-native';
import { EnhancedScanner } from '../../src/components/BarcodeScanner';

// Mock de módulos necesarios
jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  useCameraPermissions: () => ([{ granted: true }, jest.fn()])
}));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    Alert: {
      ...rn.Alert,
      alert: jest.fn(),
    },
    Vibration: {
      ...rn.Vibration,
      vibrate: jest.fn(),
    }
  };
});

describe('EnhancedScanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with camera permission granted', () => {
    const { getByText } = render(
      <EnhancedScanner onClose={jest.fn()} onBarcode={jest.fn()} />
    );
    
    expect(getByText('Coloca el código QR dentro del marco')).toBeTruthy();
  });

  it('calls onBarcode when a valid barcode is scanned', async () => {
    const mockOnBarcode = jest.fn();
    const { getByProps } = render(
      <EnhancedScanner onClose={jest.fn()} onBarcode={mockOnBarcode} />
    );

    const cameraView = getByProps({ onBarcodeScanned: expect.any(Function) });
    const { onBarcodeScanned } = cameraView.props;
    
    const mockScanResult = {
      data: 'TEST:123',
      type: 'qr',
      cornerPoints: [],
      bounds: {}
    };

    onBarcodeScanned(mockScanResult);

    expect(mockOnBarcode).toHaveBeenCalledWith(expect.objectContaining({
      data: 'TEST:123',
      type: 'qr'
    }));
    expect(Vibration.vibrate).toHaveBeenCalled();
  });

  it('shows alert when a code is scanned', async () => {
    const { getByProps } = render(
      <EnhancedScanner onClose={jest.fn()} onBarcode={jest.fn()} />
    );

    const cameraView = getByProps({ onBarcodeScanned: expect.any(Function) });
    const { onBarcodeScanned } = cameraView.props;
    
    onBarcodeScanned({ data: 'TEST:123', type: 'qr' });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Código detectado',
      expect.stringContaining('TEST:123'),
      expect.any(Array)
    );
  });

  it('throttles rapid scans', async () => {
    const mockOnBarcode = jest.fn();
    const { getByProps } = render(
      <EnhancedScanner onClose={jest.fn()} onBarcode={mockOnBarcode} />
    );

    const cameraView = getByProps({ onBarcodeScanned: expect.any(Function) });
    const { onBarcodeScanned } = cameraView.props;
    
    // Primera llamada
    onBarcodeScanned({ data: 'TEST:123', type: 'qr' });
    
    // Segunda llamada inmediatamente (debería ser throttled)
    onBarcodeScanned({ data: 'TEST:456', type: 'qr' });
    
    // Debería haberse llamado solo una vez
    expect(mockOnBarcode).toHaveBeenCalledTimes(1);
    expect(mockOnBarcode).toHaveBeenCalledWith(expect.objectContaining({
      data: 'TEST:123'
    }));
  });
});