import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
    onScan: (data: string) => void;
    onError?: (error: any) => void;
    className?: string;
}

export default function QRScanner({ onScan, onError, className = '' }: QRScannerProps) {
    const [scanning, setScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);

    useEffect(() => {
        return () => {
            // Cleanup scanner on unmount
            if (scannerRef.current) {
                scannerRef.current.destroy();
                scannerRef.current = null;
            }
        };
    }, []);

    const startScanning = async () => {
        if (!videoRef.current) return;

        try {
            setScanning(true);

            scannerRef.current = new QrScanner(
                videoRef.current,
                (result) => {
                    onScan(result.data);
                    stopScanning();
                },
                {
                    onDecodeError: (error) => {
                        // Ignore decode errors, they're normal
                    },
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );

            await scannerRef.current.start();
        } catch (error) {
            console.error('Failed to start QR scanner:', error);
            if (onError) onError(error);
            setScanning(false);
        }
    };

    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.destroy();
            scannerRef.current = null;
        }
        setScanning(false);
    };

    return (
        <div className={`qr-scanner ${className}`}>
            {!scanning ? (
                <div className="text-center">
                    <button
                        onClick={startScanning}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                    >
                        Scanner un QR Code
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                        Cliquez pour activer la caméra et scanner la carte d'étudiant
                    </p>
                </div>
            ) : (
                <div className="text-center">
                    <div className="mb-4">
                        <video
                            ref={videoRef}
                            style={{
                                width: '320px',
                                height: '240px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px'
                            }}
                        />
                    </div>
                    <button
                        onClick={stopScanning}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                    >
                        Arrêter le scan
                    </button>
                </div>
            )}
        </div>
    );
}