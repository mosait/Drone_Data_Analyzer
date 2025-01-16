// src/components/shared/ExportDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDataStore } from "@/store/useDataStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { api } from "@/api/endpoints";

interface ExportDialogProps {
  disabled?: boolean;
}

export function ExportDialog({ disabled }: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [filename, setFilename] = useState("export");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileSlot, setSelectedFileSlot] = useState<string>("");

  const { fileSlots } = useDataStore();

  const handleExport = async () => {
    const selectedFile = selectedFileSlot === "slot1" ? fileSlots.slot1 : fileSlots.slot2;
    if (!selectedFile) return;

    try {
      setIsExporting(true);
      setError(null);

      const blob = await api.analysis.export(selectedFile.id, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      setError("Failed to export file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Generate file options based on loaded files
  const getFileOptions = () => {
    const options = [];
    if (fileSlots.slot1) {
      options.push({
        value: "slot1",
        label: `File 1: ${fileSlots.slot1.filename}`
      });
    }
    if (fileSlots.slot2) {
      options.push({
        value: "slot2",
        label: `File 2: ${fileSlots.slot2.filename}`
      });
    }
    return options;
  };

  // Update filename when file selection changes
  const handleFileSelect = (value: string) => {
    setSelectedFileSlot(value);
    const selectedFile = value === "slot1" ? fileSlots.slot1 : fileSlots.slot2;
    if (selectedFile) {
      setFilename(selectedFile.filename.split(".")[0] + "_export");
    }
  };

  const fileOptions = getFileOptions();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 justify-center h-11"
          disabled={disabled}
        >
          <Download className="h-5 w-5" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label>Select File</Label>
            <Select
              value={selectedFileSlot}
              onValueChange={handleFileSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a file to export" />
              </SelectTrigger>
              <SelectContent>
                {fileOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filename">File Name</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter file name"
            />
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(value: "csv" | "json") => setFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full" 
            onClick={handleExport} 
            disabled={isExporting || !selectedFileSlot || !filename}
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Exporting...
              </span>
            ) : (
              "Export"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}