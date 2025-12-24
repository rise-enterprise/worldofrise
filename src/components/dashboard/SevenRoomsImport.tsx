import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface SevenRoomsImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'upload' | 'mapping' | 'options' | 'preview' | 'importing' | 'done';

// Rise Loyalty fields that can be mapped
const RISE_FIELDS = [
  { key: 'salutation', label: 'Salutation', required: false },
  { key: 'first_name', label: 'First Name', required: true },
  { key: 'last_name', label: 'Last Name', required: true },
  { key: 'is_vip', label: 'VIP', required: false },
  { key: 'total_visits', label: 'Number of Visits', required: false },
  { key: 'birthday', label: 'Birthday', required: false },
  { key: 'phone', label: 'Phone', required: true },
  { key: 'email', label: 'Email', required: false },
  { key: 'notes', label: 'Notes', required: false },
  { key: 'tags', label: 'Tags', required: false },
  { key: 'last_location', label: 'Last Location', required: false },
  { key: 'last_visit_date', label: 'Last Visit', required: false },
] as const;

// Known SevenRooms column patterns for auto-detection
const SEVENROOMS_PATTERNS: Record<string, string[]> = {
  salutation: ['salutation', 'title', 'prefix', 'mr', 'mrs', 'ms'],
  first_name: ['first name', 'firstname', 'first', 'client first name'],
  last_name: ['last name', 'lastname', 'last', 'surname', 'client last name'],
  is_vip: ['vip', 'is vip', 'vip status', 'vip guest'],
  total_visits: ['visits', 'total visits', 'visit count', 'number of visits', 'reservation count'],
  birthday: ['birthday', 'birth date', 'dob', 'date of birth'],
  phone: ['phone', 'phone number', 'mobile', 'cell', 'tel', 'telephone'],
  email: ['email', 'e-mail', 'email address'],
  notes: ['notes', 'guest notes', 'client notes', 'comments'],
  tags: ['tags', 'guest tags', 'labels'],
  last_location: ['last location', 'venue', 'location', 'venue name', 'last venue'],
  last_visit_date: ['last visit', 'last visit date', 'last reservation', 'last booking'],
};

interface ParsedRow {
  data: Record<string, string>;
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
  existingMemberId?: string;
}

type DuplicateHandling = 'skip' | 'update' | 'create';

const TEMPLATE_CSV = `Salutation,First Name,Last Name,VIP,Number of Visits,Birthday,Phone,Email,Notes,Tags,Last Location,Last Visit
Mr.,John,Smith,Yes,5,1990-05-15,+974 5555 1234,john@email.com,Prefers window seat,VIP;Regular,Noir Doha,2024-12-20
Mrs.,Sarah,Johnson,No,12,1985-08-22,+966 5555 5678,sarah@email.com,Allergic to nuts,,Sasso Riyadh,2024-12-18
Mr.,Ahmed,Al Rashid,Yes,3,1992-03-10,+974 5555 9012,ahmed@email.com,New member,New Guest,Noir Doha,2024-12-15`;

export default function SevenRoomsImport({ open, onOpenChange }: SevenRoomsImportProps) {
  const [step, setStep] = useState<Step>('upload');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [duplicateHandling, setDuplicateHandling] = useState<DuplicateHandling>('update');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importCounts, setImportCounts] = useState({ created: 0, updated: 0, failed: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('upload');
        setCsvHeaders([]);
        setCsvData([]);
        setColumnMapping({});
        setDuplicateHandling('skip');
        setParsedRows([]);
        setImportCounts({ created: 0, updated: 0, failed: 0 });
        setProgress(0);
      }, 300);
    }
  }, [open]);

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sevenrooms_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const autoDetectMapping = (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {};

    headers.forEach((header) => {
      const normalized = header.toLowerCase().trim();
      
      for (const [riseField, patterns] of Object.entries(SEVENROOMS_PATTERNS)) {
        if (patterns.some((p) => normalized.includes(p) || p.includes(normalized))) {
          if (!mapping[riseField]) {
            mapping[riseField] = header;
          }
          break;
        }
      }
    });

    return mapping;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload a CSV file.',
      });
      return;
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim());

    if (lines.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Empty file',
        description: 'The CSV file must contain headers and at least one data row.',
      });
      return;
    }

    const headers = parseCSVLine(lines[0]);
    const data = lines.slice(1).map((line) => parseCSVLine(line));

    setCsvHeaders(headers);
    setCsvData(data);
    setColumnMapping(autoDetectMapping(headers));
    setStep('mapping');

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const normalizePhone = (phone: string): string => {
    return phone.replace(/[^\d+]/g, '').trim();
  };

  const validateCity = (location: string): 'doha' | 'riyadh' => {
    const normalized = location.toLowerCase().trim();
    if (normalized.includes('riyadh') || normalized.includes('saudi') || normalized.includes('ksa')) {
      return 'riyadh';
    }
    return 'doha';
  };

  const parseVipStatus = (value: string): boolean => {
    const normalized = value.toLowerCase().trim();
    return ['yes', 'true', '1', 'vip', 'y'].includes(normalized);
  };

  const parseBirthday = (value: string): string | null => {
    if (!value || !value.trim()) return null;
    const parsed = new Date(value.trim());
    if (isNaN(parsed.getTime())) return null;
    return parsed.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const parseLastVisitDate = (value: string): string | null => {
    if (!value || !value.trim()) return null;
    const parsed = new Date(value.trim());
    if (isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  };

  const processRowsForPreview = async () => {
    setIsProcessing(true);

    // Get mapped fields
    const phoneColumn = columnMapping.phone;
    const emailColumn = columnMapping.email;

    if (!phoneColumn || (!columnMapping.first_name && !columnMapping.last_name)) {
      toast({
        variant: 'destructive',
        title: 'Missing required mapping',
        description: 'Please map Phone, First Name, and Last Name fields.',
      });
      setIsProcessing(false);
      return;
    }

    // Fetch existing members for duplicate check
    const { data: existingMembers } = await supabase
      .from('members')
      .select('id, phone, email');

    const phoneMap = new Map<string, string>();
    const emailMap = new Map<string, string>();
    existingMembers?.forEach((m) => {
      if (m.phone) phoneMap.set(normalizePhone(m.phone), m.id);
      if (m.email) emailMap.set(m.email.toLowerCase(), m.id);
    });

    const rows: ParsedRow[] = csvData.map((row) => {
      const data: Record<string, string> = {};
      csvHeaders.forEach((header, idx) => {
        data[header] = row[idx] || '';
      });

      const errors: string[] = [];
      let isDuplicate = false;
      let existingMemberId: string | undefined;

      // Build full name from salutation + first + last
      const salutation = columnMapping.salutation ? data[columnMapping.salutation]?.trim() || '' : '';
      const first = columnMapping.first_name ? data[columnMapping.first_name]?.trim() || '' : '';
      const last = columnMapping.last_name ? data[columnMapping.last_name]?.trim() || '' : '';
      
      let fullName = '';
      if (salutation) {
        fullName = `${salutation} ${first} ${last}`.trim();
      } else {
        fullName = `${first} ${last}`.trim();
      }

      if (!first && !last) {
        errors.push('Missing name');
      }

      // Validate phone
      const phone = phoneColumn ? normalizePhone(data[phoneColumn] || '') : '';
      if (!phone) {
        errors.push('Missing phone number');
      } else if (phone.length < 8) {
        errors.push('Invalid phone number');
      }

      // Check for duplicates
      if (phone && phoneMap.has(phone)) {
        isDuplicate = true;
        existingMemberId = phoneMap.get(phone);
      } else if (emailColumn && data[emailColumn]) {
        const email = data[emailColumn].toLowerCase().trim();
        if (emailMap.has(email)) {
          isDuplicate = true;
          existingMemberId = emailMap.get(email);
        }
      }

      return {
        data,
        isValid: errors.length === 0,
        errors,
        isDuplicate,
        existingMemberId,
      };
    });

    setParsedRows(rows);
    setIsProcessing(false);
    setStep('options');
  };

  const handleImport = async () => {
    setStep('importing');
    setProgress(0);

    let created = 0;
    let updated = 0;
    let failed = 0;

    const rowsToProcess = parsedRows.filter((row) => {
      if (!row.isValid) return false;
      if (row.isDuplicate && duplicateHandling === 'skip') return false;
      return true;
    });

    // Log the import
    const { data: adminInfo } = await supabase.rpc('get_my_admin_info');
    const adminId = adminInfo?.[0]?.id || null;

    const { data: syncLog } = await supabase
      .from('sevenrooms_sync_logs')
      .insert({
        sync_type: 'manual_csv',
        triggered_by: adminId,
        status: 'running',
        records_processed: rowsToProcess.length,
      })
      .select()
      .single();

    for (let i = 0; i < rowsToProcess.length; i++) {
      const row = rowsToProcess[i];
      setProgress(Math.round(((i + 1) / rowsToProcess.length) * 100));

      try {
        // Build member data from mapped columns
        const salutation = columnMapping.salutation ? row.data[columnMapping.salutation]?.trim() || null : null;
        const first = columnMapping.first_name ? row.data[columnMapping.first_name]?.trim() || '' : '';
        const last = columnMapping.last_name ? row.data[columnMapping.last_name]?.trim() || '' : '';
        
        let fullName = '';
        if (salutation) {
          fullName = `${salutation} ${first} ${last}`.trim();
        } else {
          fullName = `${first} ${last}`.trim();
        }

        const phone = columnMapping.phone ? normalizePhone(row.data[columnMapping.phone] || '') : '';
        const email = columnMapping.email ? row.data[columnMapping.email]?.trim() || null : null;
        const totalVisits = columnMapping.total_visits
          ? parseInt(row.data[columnMapping.total_visits]) || 0
          : 0;
        const notes = columnMapping.notes ? row.data[columnMapping.notes]?.trim() || null : null;
        const tags = columnMapping.tags ? row.data[columnMapping.tags]?.trim() || null : null;
        const isVip = columnMapping.is_vip ? parseVipStatus(row.data[columnMapping.is_vip] || '') : false;
        const birthday = columnMapping.birthday ? parseBirthday(row.data[columnMapping.birthday] || '') : null;
        const lastVisitDate = columnMapping.last_visit_date ? parseLastVisitDate(row.data[columnMapping.last_visit_date] || '') : null;
        
        // Determine city from last location field
        const lastLocationValue = columnMapping.last_location ? row.data[columnMapping.last_location]?.trim() || '' : '';
        const city = lastLocationValue ? validateCity(lastLocationValue) : 'doha';

        // Try to find matching location by name
        let lastLocationId: string | null = null;
        if (lastLocationValue) {
          const { data: locations } = await supabase
            .from('locations')
            .select('id, name')
            .eq('is_active', true);
          
          const matchedLocation = locations?.find(loc => 
            loc.name.toLowerCase().includes(lastLocationValue.toLowerCase()) ||
            lastLocationValue.toLowerCase().includes(loc.name.toLowerCase())
          );
          if (matchedLocation) {
            lastLocationId = matchedLocation.id;
          }
        }

        if (row.isDuplicate && row.existingMemberId) {
          // Update existing member (only when duplicateHandling === 'update')
          if (duplicateHandling === 'update') {
            const { error } = await supabase
              .from('members')
              .update({
                full_name: fullName,
                salutation: salutation || undefined,
                email: email || undefined,
                total_visits: totalVisits,
                notes: notes ? (notes.length > 500 ? notes.substring(0, 500) : notes) : undefined,
                tags: tags || undefined,
                is_vip: isVip,
                birthday: birthday || undefined,
                last_visit_date: lastVisitDate || undefined,
                last_location_id: lastLocationId || undefined,
                city,
              })
              .eq('id', row.existingMemberId);

            if (error) throw error;
            updated++;
          }
          // Skip duplicates otherwise (they were already filtered if duplicateHandling === 'skip')
        } else if (!row.isDuplicate) {
          // Create new member only if NOT a duplicate
          const { error } = await supabase.from('members').insert({
            full_name: fullName,
            salutation,
            phone,
            email,
            total_visits: totalVisits,
            notes: notes ? (notes.length > 500 ? notes.substring(0, 500) : notes) : null,
            tags,
            is_vip: isVip,
            birthday,
            last_visit_date: lastVisitDate,
            last_location_id: lastLocationId,
            city,
            brand_affinity: 'both',
            status: 'active',
          });

          if (error) throw error;
          created++;
        }
      } catch (error) {
        console.error('Failed to import row:', error);
        failed++;
      }
    }

    // Update sync log
    if (syncLog) {
      await supabase
        .from('sevenrooms_sync_logs')
        .update({
          status: failed === rowsToProcess.length ? 'failed' : 'completed',
          completed_at: new Date().toISOString(),
          records_created: created,
          records_updated: updated,
          records_failed: failed,
        })
        .eq('id', syncLog.id);
    }

    setImportCounts({ created, updated, failed });
    setStep('done');
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const duplicateCount = parsedRows.filter((r) => r.isDuplicate).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import from SevenRooms CSV
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload your SevenRooms guest export file'}
            {step === 'mapping' && 'Map CSV columns to Rise Loyalty fields'}
            {step === 'options' && 'Choose how to handle duplicates'}
            {step === 'preview' && 'Review data before importing'}
            {step === 'importing' && 'Importing guests...'}
            {step === 'done' && 'Import complete'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-6 p-4">
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Drop your CSV file here or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  Export guest data from SevenRooms and upload it here
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex-1 h-px bg-border" />
                <span>or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button variant="outline" className="w-full" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template CSV
              </Button>
            </div>
          )}

          {/* Column Mapping Step */}
          {step === 'mapping' && (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4 p-4">
                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <p className="font-medium mb-1">Detected {csvHeaders.length} columns</p>
                  <p className="text-muted-foreground">
                    Map each SevenRooms column to the corresponding Rise Loyalty field.
                    Auto-detected mappings are pre-filled.
                  </p>
                </div>

                <div className="space-y-3">
                  {RISE_FIELDS.map((field) => (
                    <div key={field.key} className="flex items-center gap-4">
                      <div className="w-48 flex items-center gap-2">
                        <Label className="font-medium">{field.label}</Label>
                        {field.required && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <Select
                        value={columnMapping[field.key] || '__none__'}
                        onValueChange={(value) =>
                          setColumnMapping((prev) => ({
                            ...prev,
                            [field.key]: value === '__none__' ? '' : value,
                          }))
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Not mapped —</SelectItem>
                          {csvHeaders.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Sample Data Preview</p>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {csvHeaders.slice(0, 5).map((h) => (
                            <TableHead key={h} className="text-xs">
                              {h}
                            </TableHead>
                          ))}
                          {csvHeaders.length > 5 && <TableHead className="text-xs">...</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvData.slice(0, 3).map((row, i) => (
                          <TableRow key={i}>
                            {row.slice(0, 5).map((cell, j) => (
                              <TableCell key={j} className="text-xs">
                                {cell || '—'}
                              </TableCell>
                            ))}
                            {row.length > 5 && <TableCell className="text-xs">...</TableCell>}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          {/* Options Step */}
          {step === 'options' && (
            <div className="space-y-6 p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{validCount}</p>
                  <p className="text-sm text-muted-foreground">Valid Rows</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-amber-500">{duplicateCount}</p>
                  <p className="text-sm text-muted-foreground">Duplicates Found</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-destructive">{invalidCount}</p>
                  <p className="text-sm text-muted-foreground">Invalid Rows</p>
                </div>
              </div>

              {duplicateCount > 0 && (
                <div className="space-y-4">
                  <Label className="text-base font-medium">How should we handle duplicates?</Label>
                  <RadioGroup
                    value={duplicateHandling}
                    onValueChange={(v) => setDuplicateHandling(v as DuplicateHandling)}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="skip" id="skip" className="mt-1" />
                      <div>
                        <Label htmlFor="skip" className="font-medium cursor-pointer">
                          Skip duplicates
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Existing members will not be modified. Only new guests will be imported.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="update" id="update" className="mt-1" />
                      <div>
                        <Label htmlFor="update" className="font-medium cursor-pointer">
                          Update existing
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Merge new data into existing member records (overwrites name, email, visits).
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="create" id="create" className="mt-1" />
                      <div>
                        <Label htmlFor="create" className="font-medium cursor-pointer">
                          Create anyway
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Import all rows as new members, even if duplicates exist.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.slice(0, 100).map((row, i) => {
                    let fullName = '';
                    if (columnMapping.full_name && row.data[columnMapping.full_name]) {
                      fullName = row.data[columnMapping.full_name];
                    } else {
                      const first = columnMapping.first_name ? row.data[columnMapping.first_name] || '' : '';
                      const last = columnMapping.last_name ? row.data[columnMapping.last_name] || '' : '';
                      fullName = `${first} ${last}`.trim();
                    }

                    const willSkip = row.isDuplicate && duplicateHandling === 'skip';
                    const willUpdate = row.isDuplicate && duplicateHandling === 'update';

                    return (
                      <TableRow key={i} className={!row.isValid || willSkip ? 'opacity-50' : ''}>
                        <TableCell>
                          {!row.isValid ? (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" /> Invalid
                            </Badge>
                          ) : row.isDuplicate ? (
                            <Badge variant="secondary" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {willSkip ? 'Skip' : willUpdate ? 'Update' : 'Duplicate'}
                            </Badge>
                          ) : (
                            <Badge variant="default" className="gap-1 bg-green-600">
                              <CheckCircle className="h-3 w-3" /> New
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{fullName || '—'}</TableCell>
                        <TableCell>
                          {columnMapping.phone ? row.data[columnMapping.phone] || '—' : '—'}
                        </TableCell>
                        <TableCell>
                          {columnMapping.email ? row.data[columnMapping.email] || '—' : '—'}
                        </TableCell>
                        <TableCell>
                          {columnMapping.total_visits ? row.data[columnMapping.total_visits] || '0' : '0'}
                        </TableCell>
                        <TableCell className="text-destructive text-sm">
                          {row.errors.join(', ')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {parsedRows.length > 100 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Showing first 100 of {parsedRows.length} rows
                </p>
              )}
            </ScrollArea>
          )}

          {/* Importing Step */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="w-full max-w-md space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  Importing guests... {progress}%
                </p>
              </div>
            </div>
          )}

          {/* Done Step */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Import Complete!</h3>
                <p className="text-muted-foreground">
                  Successfully processed your SevenRooms data.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-green-600">{importCounts.created}</p>
                  <p className="text-sm text-muted-foreground">Created</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">{importCounts.updated}</p>
                  <p className="text-sm text-muted-foreground">Updated</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-destructive">{importCounts.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          {step === 'upload' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}

          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={processRowsForPreview} disabled={isProcessing}>
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Continue
              </Button>
            </>
          )}

          {step === 'options' && (
            <>
              <Button variant="outline" onClick={() => setStep('mapping')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setStep('preview')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Preview Import
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('options')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={validCount === 0 || (duplicateHandling === 'skip' && duplicateCount === validCount)}
              >
                Import {duplicateHandling === 'skip' ? validCount - duplicateCount : validCount} Guests
              </Button>
            </>
          )}

          {step === 'done' && (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
