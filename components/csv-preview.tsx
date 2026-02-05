'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CSVPreviewProps {
    fileName: string;
    fileSize: number;
    data: any[];
    columns: string[];
    totalRows: number;
}

export function CSVPreview({ fileName, fileSize, data, columns, totalRows }: CSVPreviewProps) {
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const detectDataType = (value: any): string => {
        if (value === null || value === undefined || value === '') return 'empty';
        if (!isNaN(Number(value))) return 'number';
        if (Date.parse(value)) return 'date';
        return 'text';
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle className="text-lg">{fileName}</CardTitle>
                            <CardDescription>
                                {formatFileSize(fileSize)} • {totalRows.toLocaleString()} rows • {columns.length} columns
                            </CardDescription>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="w-full">
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">#</th>
                                    {columns.map((col, idx) => (
                                        <th key={idx} className="px-4 py-3 text-left font-medium">
                                            <div className="flex flex-col gap-1">
                                                <span>{col}</span>
                                                <Badge variant="outline" className="w-fit text-xs">
                                                    {detectDataType(data[0]?.[col])}
                                                </Badge>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 10).map((row, rowIdx) => (
                                    <tr key={rowIdx} className="border-t hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 text-muted-foreground">{rowIdx + 1}</td>
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className="px-4 py-3">
                                                {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ScrollArea>
                {totalRows > 10 && (
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                        Showing first 10 rows of {totalRows.toLocaleString()} total rows
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
