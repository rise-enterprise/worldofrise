import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface DataImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedMember {
  full_name: string;
  phone: string;
  email?: string;
  city?: 'doha' | 'riyadh';
  brand_affinity?: 'noir' | 'sasso' | 'both';
  notes?: string;
  isValid: boolean;
  error?: string;
}

const REQUIRED_COLUMNS = ['full_name', 'phone'];
const OPTIONAL_COLUMNS = ['email', 'city', 'brand_affinity', 'notes'];

export function DataImport({ open, onOpenChange }: DataImportProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [parsedData, setParsedData] = useState<ParsedMember[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: 'Invalid file',
          description: 'CSV file must have a header row and at least one data row',
          variant: 'destructive',
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      
      // Check for required columns
      const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
      if (missingColumns.length > 0) {
        toast({
          title: 'Missing required columns',
          description: `CSV must include: ${missingColumns.join(', ')}`,
          variant: 'destructive',
        });
        return;
      }

      const parsed: ParsedMember[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        
        headers.forEach((header, idx) => {
          row[header] = values[idx]?.trim().replace(/['"]/g, '') || '';
        });

        const member: ParsedMember = {
          full_name: row.full_name || '',
          phone: row.phone || '',
          email: row.email || undefined,
          city: validateCity(row.city),
          brand_affinity: validateBrand(row.brand_affinity),
          notes: row.notes || undefined,
          isValid: true,
        };

        // Validate
        if (!member.full_name) {
          member.isValid = false;
          member.error = 'Missing name';
        } else if (!member.phone) {
          member.isValid = false;
          member.error = 'Missing phone';
        } else if (member.email && !isValidEmail(member.email)) {
          member.isValid = false;
          member.error = 'Invalid email';
        }

        parsed.push(member);
      }

      setParsedData(parsed);
      setStep('preview');
    } catch (error) {
      toast({
        title: 'Error parsing file',
        description: 'Could not parse the CSV file',
        variant: 'destructive',
      });
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const validateCity = (city?: string): 'doha' | 'riyadh' | undefined => {
    if (!city) return undefined;
    const normalized = city.toLowerCase();
    if (normalized === 'doha' || normalized === 'qatar') return 'doha';
    if (normalized === 'riyadh' || normalized === 'ksa' || normalized === 'saudi') return 'riyadh';
    return undefined;
  };

  const validateBrand = (brand?: string): 'noir' | 'sasso' | 'both' | undefined => {
    if (!brand) return undefined;
    const normalized = brand.toLowerCase();
    if (normalized === 'noir') return 'noir';
    if (normalized === 'sasso') return 'sasso';
    if (normalized === 'both') return 'both';
    return undefined;
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleImport = async () => {
    setStep('importing');
    const validMembers = parsedData.filter(m => m.isValid);
    let imported = 0;
    let errors = 0;

    for (const member of validMembers) {
      try {
        const { error } = await supabase.from('members').insert({
          full_name: member.full_name,
          phone: member.phone,
          email: member.email || null,
          city: member.city || 'doha',
          brand_affinity: member.brand_affinity || 'both',
          notes: member.notes || null,
        });

        if (error) {
          console.error('Import error:', error);
          errors++;
        } else {
          imported++;
        }
      } catch (e) {
        errors++;
      }
    }

    setImportedCount(imported);
    setErrorCount(errors);
    setStep('done');
    queryClient.invalidateQueries({ queryKey: ['members'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
  };

  const handleClose = () => {
    setStep('upload');
    setParsedData([]);
    setImportedCount(0);
    setErrorCount(0);
    onOpenChange(false);
  };

  const validCount = parsedData.filter(m => m.isValid).length;
  const invalidCount = parsedData.filter(m => !m.isValid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Members
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import members into the database
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drop your CSV file here or click to browse
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">CSV Format</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Required columns: <code className="bg-muted px-1 rounded">full_name</code>, <code className="bg-muted px-1 rounded">phone</code>
              </p>
              <p className="text-sm text-muted-foreground">
                Optional columns: <code className="bg-muted px-1 rounded">email</code>, <code className="bg-muted px-1 rounded">city</code> (doha/riyadh), <code className="bg-muted px-1 rounded">brand_affinity</code> (noir/sasso/both), <code className="bg-muted px-1 rounded">notes</code>
              </p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-500">
                <CheckCircle className="h-4 w-4" />
                {validCount} valid
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center gap-1 text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {invalidCount} invalid
                </div>
              )}
            </div>

            <div className="border rounded-lg overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Brand</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 50).map((member, idx) => (
                    <TableRow key={idx} className={!member.isValid ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                      <TableCell>
                        {member.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-red-500 text-xs">{member.error}</span>
                        )}
                      </TableCell>
                      <TableCell>{member.full_name}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.email || '-'}</TableCell>
                      <TableCell>{member.city || 'doha'}</TableCell>
                      <TableCell>{member.brand_affinity || 'both'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {parsedData.length > 50 && (
              <p className="text-sm text-muted-foreground">
                Showing first 50 of {parsedData.length} rows
              </p>
            )}
          </div>
        )}

        {step === 'importing' && (
          <div className="text-center py-8">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Importing members...</p>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Import Complete</h3>
            <p className="text-muted-foreground">
              Successfully imported {importedCount} members
              {errorCount > 0 && ` (${errorCount} failed)`}
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={validCount === 0}>
                Import {validCount} Members
              </Button>
            </>
          )}
          {step === 'done' && (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
