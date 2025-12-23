import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface DataImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedMember {
  salutation?: string;
  last_name: string;
  first_name: string;
  full_name: string;
  visits_count: number;
  phone: string;
  birthday?: string;
  city: 'doha' | 'riyadh';
  last_location?: string;
  last_visit?: string;
  isValid: boolean;
  error?: string;
}

const EXPECTED_COLUMNS = [
  'salutation',
  'client last name',
  'client first name',
  'visits',
  'mobile number',
  'birthday',
  'country',
  'last location',
  'last visit'
];

const TEMPLATE_CSV = `Salutation,Client Last Name,Client First Name,Visits,Mobile Number,Birthday,Country,Last Location,Last Visit
Mr.,Smith,John,5,+974 5555 1234,1985-03-15,Qatar,Noir Doha,2024-01-15
Mrs.,Al-Rahman,Sarah,12,+966 55 123 4567,1990-07-22,Saudi Arabia,Sasso Riyadh,2024-01-10
Dr.,Johnson,Emily,3,+974 6666 7890,1988-11-30,Doha,Noir West Bay,2024-01-08`;

export function DataImport({ open, onOpenChange }: DataImportProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [parsedData, setParsedData] = useState<ParsedMember[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
      
      // Check for required columns (mobile number is required)
      const hasPhoneColumn = headers.some(h => 
        h.includes('mobile') || h.includes('phone') || h === 'mobile number'
      );
      
      if (!hasPhoneColumn) {
        toast({
          title: 'Missing required column',
          description: 'CSV must include a "Mobile Number" column',
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

        // Map columns (case-insensitive)
        const salutation = row['salutation'] || '';
        const lastName = row['client last name'] || '';
        const firstName = row['client first name'] || '';
        const visitsStr = row['visits'] || '0';
        const phone = row['mobile number'] || row['phone'] || row['mobile'] || '';
        const birthday = row['birthday'] || '';
        const country = row['country'] || '';
        const lastLocation = row['last location'] || '';
        const lastVisit = row['last visit'] || '';

        // Build full name
        const nameParts = [salutation, firstName, lastName].filter(Boolean);
        const fullName = nameParts.join(' ').trim();

        const member: ParsedMember = {
          salutation,
          last_name: lastName,
          first_name: firstName,
          full_name: fullName,
          visits_count: parseInt(visitsStr, 10) || 0,
          phone: normalizePhone(phone),
          birthday: birthday || undefined,
          city: validateCountry(country),
          last_location: lastLocation || undefined,
          last_visit: lastVisit || undefined,
          isValid: true,
        };

        // Validate
        if (!member.full_name || (!member.first_name && !member.last_name)) {
          member.isValid = false;
          member.error = 'Missing name';
        } else if (!member.phone) {
          member.isValid = false;
          member.error = 'Missing phone';
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

  const normalizePhone = (phone: string): string => {
    // Remove spaces and keep + prefix if present
    return phone.replace(/\s+/g, ' ').trim();
  };

  const validateCountry = (country: string): 'doha' | 'riyadh' => {
    if (!country) return 'doha';
    const normalized = country.toLowerCase().trim();
    
    // Qatar/Doha variations
    if (normalized === 'doha' || normalized === 'qatar' || normalized === 'qa') {
      return 'doha';
    }
    
    // Saudi Arabia/Riyadh variations
    if (
      normalized === 'riyadh' || 
      normalized === 'ksa' || 
      normalized === 'saudi' || 
      normalized === 'saudi arabia' ||
      normalized === 'sa'
    ) {
      return 'riyadh';
    }
    
    return 'doha'; // Default
  };

  const handleImport = async () => {
    setStep('importing');
    const validMembers = parsedData.filter(m => m.isValid);
    let imported = 0;
    let errors = 0;

    for (const member of validMembers) {
      try {
        // Build notes with additional info
        const notesParts: string[] = [];
        if (member.salutation) notesParts.push(`Salutation: ${member.salutation}`);
        if (member.birthday) notesParts.push(`Birthday: ${member.birthday}`);
        if (member.last_location) notesParts.push(`Last Location: ${member.last_location}`);
        if (member.last_visit) notesParts.push(`Last Visit: ${member.last_visit}`);
        
        const notes = notesParts.length > 0 ? notesParts.join(' | ') : null;

        const { error } = await supabase.from('members').insert({
          full_name: member.full_name,
          phone: member.phone,
          city: member.city,
          brand_affinity: 'both',
          total_visits: member.visits_count,
          notes: notes,
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
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
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">CSV Format</h4>
                <Button variant="ghost" size="sm" onClick={downloadTemplate} className="gap-1">
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Expected columns (in order):
              </p>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <code className="bg-muted px-2 py-0.5 rounded">Salutation</code>
                <code className="bg-muted px-2 py-0.5 rounded">Client Last Name</code>
                <code className="bg-muted px-2 py-0.5 rounded">Client First Name</code>
                <code className="bg-muted px-2 py-0.5 rounded">Visits</code>
                <code className="bg-primary/20 text-primary px-2 py-0.5 rounded font-semibold">Mobile Number*</code>
                <code className="bg-muted px-2 py-0.5 rounded">Birthday</code>
                <code className="bg-muted px-2 py-0.5 rounded">Country</code>
                <code className="bg-muted px-2 py-0.5 rounded">Last Location</code>
                <code className="bg-muted px-2 py-0.5 rounded">Last Visit</code>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Required field. Country accepts: Qatar, Doha, Saudi Arabia, Riyadh, KSA
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
                    <TableHead className="w-[60px]">Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Birthday</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Last Location</TableHead>
                    <TableHead>Last Visit</TableHead>
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
                      <TableCell className="font-medium">{member.full_name}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.visits_count}</TableCell>
                      <TableCell>{member.birthday || '-'}</TableCell>
                      <TableCell className="capitalize">{member.city}</TableCell>
                      <TableCell>{member.last_location || '-'}</TableCell>
                      <TableCell>{member.last_visit || '-'}</TableCell>
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
