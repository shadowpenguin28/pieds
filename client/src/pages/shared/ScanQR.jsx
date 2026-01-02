import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { qrAPI } from '../../api/client';
import {
    QrCode, Search, User, Calendar, Phone, Mail, Camera, Upload,
    Heart, Pill, AlertTriangle, RefreshCw, CheckCircle, X, Image
} from 'lucide-react';

export default function ScanQR() {
    const [qrInput, setQrInput] = useState('');
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [scanMode, setScanMode] = useState('manual'); // 'manual', 'camera', 'file'
    const [cameraActive, setCameraActive] = useState(false);

    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);

    // Cleanup camera when unmounting or switching modes
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const stopCamera = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch (e) {
                // Ignore errors when stopping
            }
            scannerRef.current = null;
        }
        setCameraActive(false);
    };

    const startCamera = async () => {
        setError(null);

        // Check if we're on HTTPS or localhost (required for camera access)
        const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        if (!isSecure) {
            setError('Camera access requires HTTPS. Please use a secure connection.');
            return;
        }

        // Check if camera API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('Camera API not available in this browser. Try uploading an image instead.');
            return;
        }

        setCameraActive(true);

        try {
            // First request camera permission
            await navigator.mediaDevices.getUserMedia({ video: true });

            // Small delay to ensure the DOM element is ready
            await new Promise(resolve => setTimeout(resolve, 200));

            const readerElement = document.getElementById("qr-reader");
            if (!readerElement) {
                setError('Camera container not found. Please refresh and try again.');
                setCameraActive(false);
                return;
            }

            const html5QrCode = new Html5Qrcode("qr-reader");
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    // Successfully scanned
                    stopCamera();
                    setQrInput(decodedText);
                    handleScanData(decodedText);
                },
                (errorMessage) => {
                    // Ignore scan errors - they happen frequently when searching
                }
            );
        } catch (err) {
            setCameraActive(false);
            console.error('Camera error:', err);

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Camera permission denied. Please allow camera access in your browser settings.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No camera found. Please connect a camera or use image upload.');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError('Camera is in use by another application. Close other apps using the camera.');
            } else {
                setError(`Could not access camera: ${err.message || 'Unknown error'}. Try uploading an image instead.`);
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const html5QrCode = new Html5Qrcode("qr-file-reader");
            const decodedText = await html5QrCode.scanFile(file, true);
            setQrInput(decodedText);
            handleScanData(decodedText);
        } catch (err) {
            setError('Could not read QR code from image. Please try another image.');
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleScanData = async (data) => {
        setLoading(true);
        setError(null);
        setPatientData(null);

        try {
            let qrData;
            try {
                qrData = JSON.parse(data);
            } catch {
                setError('Invalid QR code format. Expected JSON data.');
                setLoading(false);
                return;
            }

            const res = await qrAPI.scanQR(qrData);
            setPatientData(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to lookup patient');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!qrInput.trim()) return;
        handleScanData(qrInput);
    };

    const clearScan = async () => {
        await stopCamera();
        setQrInput('');
        setPatientData(null);
        setError(null);
        setScanMode('manual');
    };

    const switchMode = async (mode) => {
        await stopCamera();
        setScanMode(mode);
        setError(null);

        if (mode === 'camera') {
            // Small delay so DOM can update
            setTimeout(() => startCamera(), 100);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Scan Patient QR</h1>

            {/* Mode Selection */}
            <div className="flex gap-2">
                <button
                    onClick={() => switchMode('manual')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${scanMode === 'manual'
                        ? 'bg-brand-mint/20 text-brand-mint border border-brand-mint/30'
                        : 'bg-brand-slate/50 text-brand-cream/70 border border-brand-cream/10 hover:bg-brand-slate/70'
                        }`}
                >
                    <QrCode className="w-5 h-5" />
                    Manual Input
                </button>
                <button
                    onClick={() => switchMode('camera')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${scanMode === 'camera'
                        ? 'bg-brand-mint/20 text-brand-mint border border-brand-mint/30'
                        : 'bg-brand-slate/50 text-brand-cream/70 border border-brand-cream/10 hover:bg-brand-slate/70'
                        }`}
                >
                    <Camera className="w-5 h-5" />
                    Use Camera
                </button>
                <button
                    onClick={() => switchMode('file')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${scanMode === 'file'
                        ? 'bg-brand-mint/20 text-brand-mint border border-brand-mint/30'
                        : 'bg-brand-slate/50 text-brand-cream/70 border border-brand-cream/10 hover:bg-brand-slate/70'
                        }`}
                >
                    <Image className="w-5 h-5" />
                    Upload Image
                </button>
            </div>

            {/* Scan Area */}
            <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                {/* Manual Input Mode */}
                {scanMode === 'manual' && (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <QrCode className="w-6 h-6 text-brand-mint" />
                            <h2 className="font-semibold">Enter QR Code Data</h2>
                        </div>
                        <p className="text-sm text-brand-cream/60 mb-4">
                            Paste the scanned QR code JSON data below.
                        </p>
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <textarea
                                value={qrInput}
                                onChange={(e) => setQrInput(e.target.value)}
                                placeholder='{"v":"1.0","a":"ABHA_ID","p":1,"s":"signature"}'
                                rows={3}
                                className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint font-mono text-sm"
                            />
                            <button
                                type="submit"
                                disabled={loading || !qrInput.trim()}
                                className="w-full py-3 bg-gradient-to-r from-brand-mint to-brand-teal text-brand-dark font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Lookup Patient
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}

                {/* Camera Mode */}
                {scanMode === 'camera' && (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Camera className="w-6 h-6 text-brand-mint" />
                                <h2 className="font-semibold">Camera Scanner</h2>
                            </div>
                            {cameraActive && (
                                <button
                                    onClick={stopCamera}
                                    className="p-2 text-brand-red hover:bg-brand-red/20 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-brand-cream/60 mb-4">
                            Point your camera at the patient's QR code.
                        </p>
                        <div
                            id="qr-reader"
                            className="w-full rounded-xl overflow-hidden bg-brand-dark/50 min-h-[300px] flex items-center justify-center"
                        >
                            {!cameraActive && (
                                <div className="text-center py-10">
                                    <Camera className="w-12 h-12 mx-auto text-brand-cream/30 mb-3" />
                                    <p className="text-brand-cream/50">Camera initializing...</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* File Upload Mode */}
                {scanMode === 'file' && (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <Image className="w-6 h-6 text-brand-mint" />
                            <h2 className="font-semibold">Upload QR Image</h2>
                        </div>
                        <p className="text-sm text-brand-cream/60 mb-4">
                            Upload an image file containing the patient's QR code.
                        </p>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="qr-file-input"
                        />

                        {/* Hidden div for file scanner */}
                        <div id="qr-file-reader" className="hidden" />

                        <label
                            htmlFor="qr-file-input"
                            className="block w-full py-12 border-2 border-dashed border-brand-cream/20 rounded-xl cursor-pointer hover:border-brand-mint/50 hover:bg-brand-mint/5 transition-colors"
                        >
                            <div className="text-center">
                                {loading ? (
                                    <RefreshCw className="w-12 h-12 mx-auto text-brand-mint animate-spin" />
                                ) : (
                                    <>
                                        <Upload className="w-12 h-12 mx-auto text-brand-cream/30 mb-3" />
                                        <p className="text-brand-cream/60">Click to upload or drag and drop</p>
                                        <p className="text-sm text-brand-cream/40 mt-1">PNG, JPG, WEBP</p>
                                    </>
                                )}
                            </div>
                        </label>
                    </>
                )}

                {error && (
                    <div className="mt-4 p-4 bg-brand-red/20 border border-brand-red/30 rounded-xl text-brand-red flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}
            </div>

            {/* Patient Data */}
            {patientData && (
                <div className="bg-brand-slate/50 rounded-xl border border-brand-cream/10 overflow-hidden">
                    <div className="p-4 bg-green-500/20 border-b border-green-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-300">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Patient Found</span>
                        </div>
                        <button
                            onClick={clearScan}
                            className="text-sm text-brand-cream/60 hover:text-brand-cream"
                        >
                            Clear & Scan New
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-brand-mint/20 flex items-center justify-center">
                                <User className="w-8 h-8 text-brand-mint" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{patientData.name}</h3>
                                <p className="text-sm text-brand-cream/60">ABHA: {patientData.abha_id}</p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-brand-dark/50 rounded-lg">
                                <div className="flex items-center gap-2 text-brand-cream/60 text-sm mb-1">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </div>
                                <p className="font-medium">{patientData.email || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-brand-dark/50 rounded-lg">
                                <div className="flex items-center gap-2 text-brand-cream/60 text-sm mb-1">
                                    <Phone className="w-4 h-4" />
                                    Phone
                                </div>
                                <p className="font-medium">{patientData.phone_number || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-brand-dark/50 rounded-lg">
                                <div className="flex items-center gap-2 text-brand-cream/60 text-sm mb-1">
                                    <Calendar className="w-4 h-4" />
                                    Date of Birth
                                </div>
                                <p className="font-medium">{patientData.date_of_birth || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-brand-dark/50 rounded-lg">
                                <div className="flex items-center gap-2 text-brand-cream/60 text-sm mb-1">
                                    <Heart className="w-4 h-4" />
                                    Blood Group
                                </div>
                                <p className="font-medium">{patientData.blood_group || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Medical Info */}
                        {(patientData.allergies || patientData.current_medications) && (
                            <div className="space-y-3">
                                {patientData.allergies && (
                                    <div className="p-3 bg-brand-red/10 border border-brand-red/20 rounded-lg">
                                        <div className="flex items-center gap-2 text-brand-red text-sm mb-1">
                                            <AlertTriangle className="w-4 h-4" />
                                            Allergies
                                        </div>
                                        <p className="text-brand-cream">{patientData.allergies}</p>
                                    </div>
                                )}
                                {patientData.current_medications && (
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <div className="flex items-center gap-2 text-blue-300 text-sm mb-1">
                                            <Pill className="w-4 h-4" />
                                            Current Medications
                                        </div>
                                        <p className="text-brand-cream">{patientData.current_medications}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Emergency Contact */}
                        {patientData.emergency_contact?.name && (
                            <div className="mt-4 p-3 bg-brand-dark/50 rounded-lg">
                                <p className="text-sm text-brand-cream/60 mb-1">Emergency Contact</p>
                                <p className="font-medium">
                                    {patientData.emergency_contact.name} - {patientData.emergency_contact.phone}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
