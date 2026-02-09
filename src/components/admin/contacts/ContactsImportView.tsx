import { useState, useCallback, useRef } from "react";
import { Upload, AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2 } from "lucide-react";
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

type ImportStep = "upload" | "mapping" | "confirm" | "importing" | "done";

interface ImportResult {
  totalRows: number;
  inserted: number;
  deduped: number;
  rejected: number;
  rejectedDetails: { row: number; reason: string }[];
}

export default function ContactsImportView() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: existingCount = 0 } = useContactsCount();

  const [step, setStep] = useState<ImportStep>("upload");
  const [fileName, setFileName] = useState("");
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
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

  const reset = () => {
    setStep("upload");
    setFileName("");
    setRawRows([]);
    setFileHeaders([]);
    setMapping({});
    setUnmappedHeaders([]);
    setProcessedRows([]);
    setDupCount(0);
    setResult(null);
    setErrors([]);
    setIsImporting(false);
  };

  const handleFile = useCallback(async (file: File) => {
    setErrors([]);
    setFileName(file.name);

    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

      if (json.length === 0) {
        setErrors(["File contains no data rows."]);
        return;
      }

      const headers = Object.keys(json[0]);
      setFileHeaders(headers);
      setRawRows(json);

      // Attempt auto-mapping
      const { mapping: autoMap, unmapped } = autoMapHeaders(headers);
      setMapping(autoMap);

      // Check if all required columns are mapped
      const mappedDbFields = new Set(Object.values(autoMap));
      const allDbFields = CONTACT_COLUMNS.map((c) => c.dbField);
      const missingRequired = allDbFields.filter((f) => !mappedDbFields.has(f));

      if (unmapped.length > 0 || missingRequired.length > 0) {
        setUnmappedHeaders(unmapped);
        setStep("mapping");
      } else {
        // Process directly
        processAndPrepare(json, autoMap);
      }
    } catch (err) {
      setErrors([`Failed to parse file: ${(err as Error).message}`]);
    }
  }, []);

  const processAndPrepare = (rows: Record<string, unknown>[], map: Record<string, string>) => {
    const normalized = rows.map((r) => normalizeRow(r, map));
    const { unique, dupCount: dups } = deduplicateRows(normalized);
    setProcessedRows(unique);
    setDupCount(dups);
    setStep("confirm");
  };

  const handleMappingComplete = () => {
    // Validate that at least some columns are mapped
    if (Object.keys(mapping).length === 0) {
      setErrors(["No columns mapped. Please map at least some columns."]);
      return;
    }
    processAndPrepare(rawRows, mapping);
  };

  const handleImport = async () => {
    setShowConfirm(false);
    setStep("importing");
    setIsImporting(true);

    try {
      const sb = supabase as any;

      // Step 1: Delete all existing contacts
      const { error: deleteError } = await sb
        .from("contacts")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) throw new Error(`Failed to clear contacts: ${deleteError.message}`);

      // Step 2: Batch insert (chunks of 50 to avoid connection exhaustion)
      const BATCH_SIZE = 50;
      let totalInserted = 0;
      const rejected: { row: number; reason: string }[] = [];
      const totalBatches = Math.ceil(processedRows.length / BATCH_SIZE);

      for (let i = 0; i < processedRows.length; i += BATCH_SIZE) {
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        setProgressText(`Inserting batch ${batchNum} of ${totalBatches}...`);

        const batch = processedRows.slice(i, i + BATCH_SIZE);
        const { error: insertError } = await sb.from("contacts").insert(batch);

        if (insertError) {
          // Try one-by-one for this batch with delay to avoid flooding
          for (let j = 0; j < batch.length; j++) {
            const { error: singleErr } = await sb.from("contacts").insert([batch[j]]);
            if (singleErr) {
              rejected.push({ row: i + j + 1, reason: singleErr.message });
            } else {
              totalInserted++;
            }
            await new Promise(resolve => setTimeout(resolve, 20));
          }
        } else {
          totalInserted += batch.length;
        }

        // Yield between batches to prevent connection saturation
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Step 3: Log the import to audit_logs
      await sb.from("audit_logs").insert({
        action_type: "import",
        entity_type: "contacts",
        after_json: {
          file_name: fileName,
          total_rows: rawRows.length,
          inserted: totalInserted,
          rejected: rejected.length,
        },
      });

      setResult({
        totalRows: rawRows.length,
        inserted: totalInserted,
        deduped: dupCount,
        rejected: rejected.length,
        rejectedDetails: rejected.slice(0, 100),
      });

      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contacts-count"] });
      toast.success(`Successfully imported ${totalInserted} contacts`);
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

      {/* Step: Column Mapping */}
      {step === "mapping" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Column Mapping — {fileName}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{rawRows.length.toLocaleString()}</p>
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
              <Button variant="destructive" onClick={() => setShowConfirm(true)}>
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
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-lg font-medium">Importing contacts...</p>
            {progressText && <p className="text-sm text-primary font-medium mt-1">{progressText}</p>}
            <p className="text-sm text-muted-foreground mt-1">This may take a moment for large files.</p>
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
