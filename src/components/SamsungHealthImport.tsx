import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SamsungHealthImport() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setMessage('');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await api.importHealthData(data);
      setMessage(`Imported ${result.count} records successfully!`);
    } catch (err: any) {
      setMessage(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Samsung Health Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="file"
          accept=".json,.csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-muted-foreground"
        />
        {file && <p className="text-sm">Selected: {file.name}</p>}
        <Button onClick={handleImport} disabled={!file || loading} className="w-full">
          {loading ? 'Importing...' : 'Import Data'}
        </Button>
        {message && <p className="text-sm text-center">{message}</p>}
        <p className="text-xs text-muted-foreground">
          To export from Samsung Health: Settings → Download personal data → Select data types → Download JSON
        </p>
      </CardContent>
    </Card>
  );
}
