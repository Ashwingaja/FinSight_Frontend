'use client';

import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, Loader2, BarChart3, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [showDataDialog, setShowDataDialog] = useState(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/auth/signin');
        }
    }, [isLoaded, isSignedIn, router]);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchDocuments();
        }
    }, [isLoaded, isSignedIn]);

    const fetchDocuments = async () => {
        try {
            const response = await fetch('/api/upload');
            const data = await response.json();
            setDocuments(data.documents || []);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
            if (!['csv', 'xlsx', 'xlsm', 'pdf'].includes(fileType || '')) {
                setError('Invalid file type. Please upload CSV, XLSX, XLSM, or PDF files.');
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File too large. Maximum size is 10MB.');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setUploadResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('document', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setUploadResult(data);
            
            // Show extracted data if available
            if (data.extractedData) {
                setExtractedData(data.extractedData);
                setShowDataDialog(true);
            }
            
            setFile(null);
            fetchDocuments();
            
            // Redirect to dashboard to see revenue immediately
            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const waitForProcessing = async (documentId: string) => {
        const maxAttempts = 20;
        const delayMs = 3000;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            try {
                const response = await fetch('/api/upload');
                const data = await response.json();
                const docs = data.documents || [];
                const doc = docs.find((d: any) => d._id === documentId || d.id === documentId);
                const status = doc?.processingStatus || doc?.status;

                if (status === 'completed' || status === 'processed') {
                    // ✅ Redirect to analysis page to see AI-generated report
                    router.push('/analysis');
                    return;
                }

                if (status === 'failed') {
                    setError(doc?.processingError || 'Processing failed');
                    return;
                }
            } catch (err) {
                // Ignore polling errors; try again
            }

            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        // Fallback to analysis page even if polling times out
        router.push('/analysis');
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <DashboardHeader
                userName={user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User'}
                onSignOut={() => signOut({ redirectUrl: '/' })}
            />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Upload Financial Documents</h1>
                    <p className="text-muted-foreground">
                        Upload CSV, Excel, or PDF files containing your financial data for analysis
                    </p>
                </div>

                {/* Upload Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Upload New Document</CardTitle>
                        <CardDescription>
                            Supported formats: CSV, XLSX, XLSM, PDF (max 10MB)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xlsm,.pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                                disabled={uploading || processing}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Button variant="outline" disabled={uploading || processing} asChild>
                                    <span>Choose File</span>
                                </Button>
                            </label>
                            {file && (
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <span className="font-medium">{file.name}</span>
                                    <Badge>{(file.size / 1024).toFixed(2)} KB</Badge>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
                                <XCircle className="h-5 w-5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {uploadResult && showDataDialog && extractedData && (
                            <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="h-6 w-6" />
                                    <h3 className="text-lg font-semibold">✅ Data Extracted Successfully!</h3>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white rounded-lg shadow-sm">
                                        <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ₹{extractedData.financialData?.revenue?.total?.toLocaleString('en-IN') || '0'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow-sm">
                                        <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            ₹{extractedData.financialData?.expenses?.total?.toLocaleString('en-IN') || '0'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow-sm">
                                        <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            ₹{extractedData.financialData?.profitability?.netProfit?.toLocaleString('en-IN') || '0'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow-sm">
                                        <p className="text-sm text-muted-foreground mb-1">Rows Processed</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {extractedData.extractedRows || 0}
                                        </p>
                                    </div>
                                </div>
                                
                                {extractedData.columns && extractedData.columns.length > 0 && (
                                    <div className="p-4 bg-white rounded-lg shadow-sm">
                                        <p className="text-sm font-semibold mb-2">Detected Columns:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {extractedData.columns.map((col: string, idx: number) => (
                                                <Badge key={idx} variant="outline">{col}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <p className="text-sm text-muted-foreground text-center">
                                    Redirecting to dashboard in 3 seconds...
                                </p>
                            </div>
                        )}

                        {processing && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Processing financial data...</span>
                                </div>
                                <Progress value={66} className="h-2" />
                            </div>
                        )}

                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading || processing}
                            className="w-full"
                            size="lg"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : processing ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-5 w-5 mr-2" />
                                    Upload and Process
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Recent Uploads */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Uploads</CardTitle>
                        <CardDescription>Your uploaded documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {documents.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No documents uploaded yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {documents.map((doc) => (
                                    <div
                                        key={doc._id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-primary" />
                                            <div>
                                                <p className="font-medium">{doc.fileName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(doc.uploadDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Status badge removed for cleaner UI */}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DashboardHeader({
    userName,
    onSignOut,
}: {
    userName: string;
    onSignOut: () => void;
}) {
    return (
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        FinSight Pro
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            Dashboard
                        </Button>
                    </Link>
                    <span className="text-sm text-muted-foreground">{userName}</span>
                    <Button variant="outline" size="sm" onClick={onSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </header>
    );
}
