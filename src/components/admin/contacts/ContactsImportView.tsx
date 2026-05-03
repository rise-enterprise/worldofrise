import { useState, useCallback, useRef } from "react";
import { Upload, AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CONTACT_COLUMNS, HEADER_TO_DB_MAP } from "./contactColumns";
import { autoMapHeaders, normalizeRow, deduplicateRows } from "./contactUtils";
import { useContactsCount } from "@/hooks/useContacts";
import { useAdminAuthContext } from "@/contexts/AdminAuthContext";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type ImportStep = "upload" | "parsing" | "mapping" | "confirm" | "importing" | "done";

interface ImportResult {
  totalRows: number;
  inserted: number;
  deduped: number;
  rejected: number;
  rejectedDetails: { row: number; reason: string }[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatETA(seconds: number): string {
  if (seconds < 60) return `~${Math.ceil(seconds)}s remaining`;
  const m = Math.floor(seconds / 60);
  const s = Math.ceil(seconds % 60);
  return `~${m}m ${s}s remaining`;
}

/** Stream-parse a CSV file in chunks to avoid loading entire file into memory */
async function streamParseCSV(
  file: File,
  onProgress: (pct: number) => void
): Promise<{ rows: Record<string, unknown>[]; headers: string[] }> {
  return new Promise((resolve, reject) => {
    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks
    let offset = 0;
    let remainder = "";
    let headers: string[] | null = null;
    const rows: Record<string, unknown>[] = [];
    const reader = new FileReader();

    function parseCSVLine(line: string): string[] {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
          if (ch === '"') {
            if (i + 1 < line.length && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            current += ch;
          }
        } else {
          if (ch === '"') {
            inQuotes = true;
          } else if (ch === ",") {
            result.push(current);
            current = "";
          } else {
            current += ch;
          }
        }
      }
      result.push(current);
      return result;
    }

    function readNextChunk() {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsText(slice);
    }

    reader.onload = () => {
      const text = remainder + (reader.result as string);
      const lines = text.split(/\r?\n/);
      // Last element may be incomplete — keep as remainder
      remainder = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const values = parseCSVLine(line);
        if (!headers) {
          headers = values.map((v) => v.trim());
          continue;
        }
        const row: Record<string, unknown> = {};
        for (let i = 0; i < headers.length; i++) {
          row[headers[i]] = i < values.length ? values[i].trim() || null : null;
        }
        rows.push(row);
      }

      offset += CHUNK_SIZE;
      onProgress(Math.min(100, Math.round((offset / file.size) * 100)));

      if (offset < file.size) {
        readNextChunk();
      } else {
        // Process any remainder
        if (remainder.trim() && headers) {
          const values = parseCSVLine(remainder);
          const row: Record<string, unknown> = {};
          for (let i = 0; i < headers.length; i++) {
            row[headers[i]] = i < values.length ? values[i].trim() || null : null;
          }
          rows.push(row);
        }
        resolve({ rows, headers: headers || [] });
      }
    };

    reader.onerror = () => reject(new Error("Failed to read CSV file"));
    readNextChunk();
  });
}

export default function ContactsImportView() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: existingCount = 0 } = useContactsCount();
  const { admin } = useAdminAuthContext();
  const isSuperAdmin = admin?.role === "super_admin";
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const [step, setStep] = useState<ImportStep>("upload");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [rawRowCount, setRawRowCount] = useState(0);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [unmappedHeaders, setUnmappedHeaders] = useState<string[]>([]);
  const [processedRows, setProcessedRows] = useState<Record<string, unknown>[]>([]);
  const [dupCount, setDupCount] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [progressText, setProgressText] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [parseProgress, setParseProgress] = useState(0);
  const [insertedCount, setInsertedCount] = useState(0);
  const [etaText, setEtaText] = useState("");

  // Store raw rows in ref to avoid keeping huge arrays in React state
  const rawRowsRef = useRef<Record<string, unknown>[]>([]);

  const reset = () => {
    setStep("upload");
    setFileName("");
    setFileSize(0);
    setRawRowCount(0);
    rawRowsRef.current = [];
    setFileHeaders([]);
    setMapping({});
    setUnmappedHeaders([]);
    setProcessedRows([]);
    setDupCount(0);
    setResult(null);
    setErrors([]);
    setIsImporting(false);
    setInsertedCount(0);
    setEtaText("");
    setParseProgress(0);
  };

  const processAndPrepare = useCallback((rows: Record<string, unknown>[], map: Record<string, string>) => {
    const normalized = rows.map((r) => normalizeRow(r, map));
    const { unique, dupCount: dups } = deduplicateRows(normalized);
    setProcessedRows(unique);
    setDupCount(dups);
    setStep("confirm");
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setErrors([]);
    setFileName(file.name);
    setFileSize(file.size);
    setStep("parsing");
    setParseProgress(0);

    const isCSV = file.name.toLowerCase().endsWith(".csv");

    try {
      let rows: Record<string, unknown>[];
      let headers: string[];

      if (isCSV) {
        // Stream-parse CSV to avoid loading entire file in memory
        const result = await streamParseCSV(file, (pct) => {
          setParseProgress(pct);
        });
        rows = result.rows;
        headers = result.headers;
      } else {
        // Parse XLSX inline with dynamic import
        setParseProgress(10);
        const XLSX = await import("xlsx");
        setParseProgress(30);
        const data = await file.arrayBuffer();
        setParseProgress(60);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
        setParseProgress(90);
        rows = json;
        headers = json.length > 0 ? Object.keys(json[0]) : [];
      }

      setParseProgress(100);

      if (rows.length === 0) {
        setErrors(["File contains no data rows."]);
        setStep("upload");
        return;
      }

      // Ensure the parsing UI is visible for at least 800ms so the user sees feedback
      await new Promise((resolve) => setTimeout(resolve, 800));

      setFileHeaders(headers);
      rawRowsRef.current = rows;
      setRawRowCount(rows.length);

      // Attempt auto-mapping
      const { mapping: autoMap, unmapped } = autoMapHeaders(headers);
      setMapping(autoMap);

      const mappedDbFields = new Set(Object.values(autoMap));
      const allDbFields = CONTACT_COLUMNS.map((c) => c.dbField);
      const missingRequired = allDbFields.filter((f) => !mappedDbFields.has(f));

      if (unmapped.length > 0 || missingRequired.length > 0) {
        setUnmappedHeaders(unmapped);
        setStep("mapping");
      } else {
        processAndPrepare(rows, autoMap);
      }
    } catch (err) {
      console.error("File parse error:", err);
      setErrors([`Failed to parse file: ${(err as Error).message}`]);
      setStep("upload");
    }
  }, [processAndPrepare]);

  const handleMappingComplete = () => {
    if (Object.keys(mapping).length === 0) {
      setErrors(["No columns mapped. Please map at least some columns."]);
      return;
    }
    processAndPrepare(rawRowsRef.current, mapping);
  };

  const handleImport = async () => {
    setShowConfirm(false);
    setStep("importing");
    setIsImporting(true);
    setInsertedCount(0);
    setEtaText("");

    try {
      const CHUNK_SIZE = 500;
      const totalChunks = Math.ceil(processedRows.length / CHUNK_SIZE);
      let totalInserted = 0;
      let totalRejected = 0;
      const allRejectedDetails: { row: number; reason: string }[] = [];
      const startTime = Date.now();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
        const start = chunkIdx * CHUNK_SIZE;
        const chunk = processedRows.slice(start, start + CHUNK_SIZE);
        const isFirst = chunkIdx === 0;
        const isLast = chunkIdx === totalChunks - 1;

        setProgressText(`Chunk ${chunkIdx + 1} of ${totalChunks} (${chunk.length.toLocaleString()} rows)`);
        setProgressPercent(Math.round(((start + chunk.length) / processedRows.length) * 100));

        let response;
        try {
          response = await supabase.functions.invoke("import-contacts", {
            body: {
              rows: chunk,
              fileName,
              clearFirst: isFirst,
              isLastChunk: isLast,
            },
          });
        } catch (networkErr) {
          // Retry once on transient network failure
          console.warn(`Chunk ${chunkIdx + 1} failed, retrying...`, networkErr);
          response = await supabase.functions.invoke("import-contacts", {
            body: {
              rows: chunk,
              fileName,
              clearFirst: isFirst,
              isLastChunk: isLast,
            },
          });
        }

        if (response.error) {
          throw new Error(response.error.message || "Edge function call failed");
        }

        const data = response.data;
        if (!data.success) {
          throw new Error(data.error || "Import chunk failed");
        }

        totalInserted += data.inserted;
        totalRejected += data.rejected;
        if (data.rejectedDetails) {
          allRejectedDetails.push(
            ...data.rejectedDetails.map((r: { row: number; reason: string }) => ({
              row: r.row + start,
              reason: r.reason,
            }))
          );
        }

        setInsertedCount(totalInserted);

        // Calculate ETA
        const elapsed = (Date.now() - startTime) / 1000;
        const rowsDone = start + chunk.length;
        const rowsLeft = processedRows.length - rowsDone;
        const rate = rowsDone / elapsed;
        if (rate > 0 && rowsLeft > 0) {
          setEtaText(formatETA(rowsLeft / rate));
        } else {
          setEtaText("");
        }
      }

      setResult({
        totalRows: rawRowCount,
        inserted: totalInserted,
        deduped: dupCount,
        rejected: totalRejected,
        rejectedDetails: allRejectedDetails.slice(0, 100),
      });

      // Free memory
      rawRowsRef.current = [];
      setProcessedRows([]);

      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contacts-count"] });
      toast.success(`Successfully imported ${totalInserted.toLocaleString()} contacts`);
      setStep("done");
    } catch (err) {
      setErrors([(err as Error).message]);
      setStep("confirm");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const updateMapping = (fileHeader: string, dbField: string) => {
    setMapping((prev) => {
      if (dbField === "__ignore__") {
        const next = { ...prev };
        delete next[fileHeader];
        return next;
      }
      return { ...prev, [fileHeader]: dbField };
    });
  };

  const isLargeFile = fileSize > 100 * 1024 * 1024;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Import / Replace Database</h2>
        <p className="text-sm text-muted-foreground">Upload a CSV or XLSX file to replace all existing contact records.</p>
      </div>

      {errors.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 space-y-1">
            {errors.map((e, i) => (
              <p key={i} className="text-sm text-destructive flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {e}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step: Upload */}
      {step === "upload" && (
        <Card>
          <CardContent className="p-8">
            <div
              className="border-2 border-dashed border-border/60 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">Drop your file here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">Supports CSV and XLSX files</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Parsing */}
      {step === "parsing" && (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Parsing {fileName}...</p>
            {fileSize > 0 && (
              <p className="text-sm text-muted-foreground">{formatFileSize(fileSize)}</p>
            )}
            <div className="max-w-md mx-auto space-y-2">
              <Progress value={parseProgress} className="h-3" />
              <p className="text-sm text-primary font-medium">
                {parseProgress < 100 ? `Parsing... ${parseProgress}%` : "Processing columns..."}
              </p>
            </div>
            {isLargeFile && (
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">Large file — this may take several minutes.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step: Column Mapping */}
      {step === "mapping" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Column Mapping — {fileName}
              {fileSize > 0 && (
                <Badge variant="outline" className="ml-2 font-normal">{formatFileSize(fileSize)}</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Some headers don't match. Map each file column to the correct database field.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {fileHeaders.map((fh) => (
              <div key={fh} className="flex items-center gap-3">
                <span className="text-sm w-64 truncate shrink-0 font-mono">{fh}</span>
                <span className="text-muted-foreground">→</span>
                <Select
                  value={mapping[fh] || "__ignore__"}
                  onValueChange={(v) => updateMapping(fh, v)}
                >
                  <SelectTrigger className="h-8 flex-1">
                    <SelectValue placeholder="Ignore" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__ignore__">— Ignore —</SelectItem>
                    {CONTACT_COLUMNS.map((col) => (
                      <SelectItem key={col.dbField} value={col.dbField}>
                        {col.header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleMappingComplete}>Continue with Mapping</Button>
              <Button variant="outline" onClick={reset}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import Summary Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLargeFile && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-sm text-foreground">
                  Large file ({formatFileSize(fileSize)}) — import may take several minutes.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{rawRowCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Rows Read</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{processedRows.length.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">After Dedup</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-amber-500">{dupCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Duplicates Removed</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-destructive/10">
                <p className="text-2xl font-bold text-destructive">{existingCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Records to Replace</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-sm text-foreground">
                This will <strong>permanently delete</strong> all {existingCount.toLocaleString()} existing contacts and replace them with {processedRows.length.toLocaleString()} new records.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => setShowConfirm(true)} disabled={isImporting}>
                Replace All Contacts
              </Button>
              <Button variant="outline" onClick={reset}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Importing */}
      {step === "importing" && (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Importing contacts...</p>
            <div className="max-w-md mx-auto space-y-2">
              <Progress value={progressPercent} className="h-3" />
              <p className="text-sm text-primary font-medium">
                {insertedCount.toLocaleString()} of {processedRows.length.toLocaleString()} rows — {progressPercent}%
              </p>
              <p className="text-sm text-muted-foreground">{progressText}</p>
              {etaText && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" /> {etaText}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Done */}
      {step === "done" && result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{result.totalRows.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Read</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                <p className="text-2xl font-bold text-emerald-600">{result.inserted.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Inserted</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-amber-500">{result.deduped.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Deduped</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-destructive/10">
                <p className="text-2xl font-bold text-destructive">{result.rejected.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>

            {result.rejectedDetails.length > 0 && (
              <div className="border border-border/40 rounded-lg p-3 max-h-40 overflow-y-auto">
                <p className="text-sm font-medium mb-2">Rejected Rows:</p>
                {result.rejectedDetails.map((r, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    Row {r.row}: {r.reason}
                  </p>
                ))}
              </div>
            )}

            <Button onClick={reset}>Import Another File</Button>
          </CardContent>
        </Card>
      )}

      {/* Confirmation dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace All Contacts?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {existingCount.toLocaleString()} existing contact records and insert{" "}
              {processedRows.length.toLocaleString()} new records from <strong>{fileName}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Replace All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
