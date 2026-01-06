import { useState, useEffect } from 'react';
import { reportAPI, journeyAPI } from '../../api/client';
import {
    Upload, FileText, CheckCircle, AlertCircle, RefreshCw, X,
    Search, User, ChevronRight, FlaskConical, QrCode
} from 'lucide-react';

export default function UploadReport() {
    // Flow: Patient lookup -> Select journey step -> Upload file
    const [step, setStep] = useState(1); // 1: Find patient, 2: Select step, 3: Upload

    // Patient lookup
    const [searchInput, setSearchInput] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [patient, setPatient] = useState(null);

    // Journey/step selection
    const [journeys, setJourneys] = useState([]);
    const [selectedStep, setSelectedStep] = useState(null);

    // File upload
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Search patient by ABHA ID
    const handlePatientSearch = async (e) => {
        e.preventDefault();
        if (!searchInput.trim()) return;

        setSearchLoading(true);
        setError(null);

        try {
            // Directly fetch journeys by ABHA ID
            const abhaId = searchInput.trim();
            const journeysRes = await journeyAPI.getByAbha(abhaId);

            // Set patient info from response
            setPatient({
                abha_id: journeysRes.data.patient_abha_id,
                name: journeysRes.data.patient_name
            });
            setJourneys(journeysRes.data.journeys || []);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Patient not found. Please check the ABHA ID.');
        } finally {
            setSearchLoading(false);
        }
    };

    const selectStep = (journey, journeyStep) => {
        setSelectedStep({
            ...journeyStep,
            journeyTitle: journey.title,
            journeyId: journey.id
        });
        setStep(3);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedStep || !file) {
            setError('Please select a step and file');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const res = await reportAPI.upload(selectedStep.id, file);
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const resetFlow = () => {
        setStep(1);
        setSearchInput('');
        setPatient(null);
        setJourneys([]);
        setSelectedStep(null);
        setFile(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Upload Report</h1>
                {step > 1 && (
                    <button
                        onClick={resetFlow}
                        className="text-sm text-brand-cream/60 hover:text-brand-cream"
                    >
                        Start Over
                    </button>
                )}
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2">
                {[
                    { num: 1, label: 'Find Patient' },
                    { num: 2, label: 'Select Test' },
                    { num: 3, label: 'Upload Report' }
                ].map((s, idx) => (
                    <div key={s.num} className="flex items-center">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${step >= s.num
                            ? 'bg-brand-mint/20 text-brand-mint'
                            : 'bg-brand-slate/50 text-brand-cream/40'
                            }`}>
                            <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                                {step > s.num ? '✓' : s.num}
                            </span>
                            {s.label}
                        </div>
                        {idx < 2 && <ChevronRight className="w-4 h-4 text-brand-cream/30 mx-1" />}
                    </div>
                ))}
            </div>

            {/* Step 1: Find Patient */}
            {step === 1 && (
                <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                    <div className="flex items-center gap-3 mb-4">
                        <Search className="w-6 h-6 text-brand-mint" />
                        <h2 className="font-semibold">Find Patient</h2>
                    </div>

                    <p className="text-sm text-brand-cream/60 mb-4">
                        Enter the patient's ABHA ID to find their health journeys.
                    </p>

                    <form onSubmit={handlePatientSearch} className="space-y-4">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Enter ABHA ID (e.g., yourname@crescere)"
                            className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                        />

                        <button
                            type="submit"
                            disabled={searchLoading || !searchInput.trim()}
                            className="w-full py-3 bg-gradient-to-r from-brand-mint to-brand-teal text-brand-dark font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {searchLoading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Find Patient
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-4 pt-4 border-t border-brand-cream/10">
                        <p className="text-xs text-brand-cream/50 text-center">
                            💡 Tip: Use "Scan Patient QR" from the sidebar to scan the patient's QR code first
                        </p>
                    </div>
                </div>
            )}

            {/* Step 2: Select Journey Step */}
            {step === 2 && patient && (
                <div className="space-y-4">
                    {/* Patient Card */}
                    <div className="bg-brand-slate/50 rounded-xl p-4 border border-brand-cream/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-mint/20 flex items-center justify-center">
                            <User className="w-6 h-6 text-brand-mint" />
                        </div>
                        <div>
                            <p className="font-semibold">{patient.name}</p>
                            <p className="text-sm text-brand-cream/60">ABHA: {patient.abha_id}</p>
                        </div>
                    </div>

                    {/* Journey Steps */}
                    <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                        <div className="flex items-center gap-3 mb-4">
                            <FlaskConical className="w-6 h-6 text-brand-mint" />
                            <h2 className="font-semibold">Select Test Step</h2>
                        </div>

                        {journeys.length === 0 || !journeys.some(j => j.steps?.some(s => s.type === 'TEST')) ? (
                            <div className="text-center py-8">
                                <FlaskConical className="w-12 h-12 mx-auto text-brand-cream/30 mb-3" />
                                <p className="text-brand-cream/60">No active journeys with test steps</p>
                                <p className="text-sm text-brand-cream/40 mt-1 mb-4">
                                    A doctor must add a TEST step to the patient's journey first
                                </p>
                                <button
                                    onClick={() => { setStep(1); setPatient(null); setSearchInput(''); }}
                                    className="px-4 py-2 bg-brand-mint/20 text-brand-mint rounded-lg hover:bg-brand-mint/30 transition-colors"
                                >
                                    ← Search Another Patient
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {journeys.map(journey => (
                                    <div key={journey.id} className="border border-brand-cream/10 rounded-lg overflow-hidden">
                                        <div className="px-4 py-2 bg-brand-dark/30 text-sm font-medium">
                                            {journey.title || `Journey #${journey.id}`}
                                        </div>
                                        <div className="divide-y divide-brand-cream/10">
                                            {journey.steps
                                                .filter(s => s.type === 'TEST')
                                                .map(journeyStep => (
                                                    <button
                                                        key={journeyStep.id}
                                                        onClick={() => selectStep(journey, journeyStep)}
                                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-brand-mint/10 transition-colors text-left"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <FlaskConical className="w-5 h-5 text-purple-400" />
                                                            <div>
                                                                <p className="font-medium">
                                                                    {journeyStep.notes || `Test Step #${journeyStep.id}`}
                                                                </p>
                                                                <p className="text-xs text-brand-cream/50">
                                                                    {journeyStep.report ? '✓ Report attached' : 'No report yet'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-brand-cream/40" />
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 3: Upload File */}
            {step === 3 && selectedStep && !result && (
                <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                    {/* Selected Info */}
                    <div className="mb-6 p-4 bg-brand-dark/30 rounded-lg">
                        <p className="text-sm text-brand-cream/60 mb-1">Uploading for:</p>
                        <p className="font-medium">{patient?.name}</p>
                        <p className="text-sm text-brand-cream/60">
                            {selectedStep.journeyTitle} → {selectedStep.notes || 'Test Step'}
                        </p>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-4">
                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-brand-cream/80 mb-2">
                                Report File
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex items-center justify-center gap-3 w-full p-6 border-2 border-dashed border-brand-cream/20 rounded-xl cursor-pointer hover:border-brand-mint/50 transition-colors"
                                >
                                    {file ? (
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-8 h-8 text-brand-mint" />
                                            <div className="text-left">
                                                <p className="font-medium">{file.name}</p>
                                                <p className="text-sm text-brand-cream/60">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setFile(null); }}
                                                className="p-1 hover:bg-brand-red/20 rounded"
                                            >
                                                <X className="w-4 h-4 text-brand-red" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="w-10 h-10 mx-auto mb-2 text-brand-cream/40" />
                                            <p className="text-brand-cream/60">Click to select file</p>
                                            <p className="text-xs text-brand-cream/40 mt-1">
                                                PDF, JPG, PNG, DOC (max 10MB)
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={uploading || !file}
                            className="w-full py-3 bg-gradient-to-r from-brand-mint to-brand-teal text-brand-dark font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Upload Report
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Success Result */}
            {result && (
                <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                    <div className="text-center py-6">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-green-300 mb-2">Report Uploaded!</h3>
                        <p className="text-brand-cream/60 mb-4">{result.message}</p>

                        {result.file_url && (
                            <a
                                href={result.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-brand-mint hover:underline mb-4"
                            >
                                <FileText className="w-4 h-4" />
                                View uploaded file
                            </a>
                        )}

                        <div className="pt-4">
                            <button
                                onClick={resetFlow}
                                className="px-6 py-2 bg-brand-mint/20 text-brand-mint rounded-lg hover:bg-brand-mint/30 transition-colors"
                            >
                                Upload Another Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 bg-brand-red/20 border border-brand-red/30 rounded-xl text-brand-red flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}
