// src/features/dashboard/components/RecentFiles.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileType, Clock, X, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { FileUploadResponse } from '@/api/types';
import { Badge } from '@/components/ui/badge';
import { FileSlotDialog } from '@/components/shared/FileSlotDialog';
import { api } from '@/api/endpoints';

const ITEMS_PER_PAGE = 5;

export const RecentFiles = () => {
  const { 
    recentFiles, 
    fileSlots,
    addFileToSlot,
    removeFileFromSlot,
    loadRecentFiles
  } = useDataStore();

  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileUploadResponse | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil((recentFiles?.length || 0) / ITEMS_PER_PAGE);
  const paginatedFiles = recentFiles?.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleFileSelect = (file: FileUploadResponse) => {
    setSelectedFile(file);
    setSlotDialogOpen(true);
  };

  const handleSlotSelect = async (slot: 1 | 2) => {
    if (selectedFile) {
      await addFileToSlot(selectedFile, slot);
      setSlotDialogOpen(false);
      setSelectedFile(null);
    }
  };

  const getFileSlot = (fileId: string): 1 | 2 | null => {
    if (fileSlots.slot1?.id === fileId) return 1;
    if (fileSlots.slot2?.id === fileId) return 2;
    return null;
  };

  const handleDelete = async (fileId: string) => {
    try {
      const slot = getFileSlot(fileId);
      if (slot) {
        removeFileFromSlot(slot);
      }

      setDeletingFile(fileId);
      await api.files.delete(fileId);
      await loadRecentFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
    } finally {
      setDeletingFile(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paginatedFiles && paginatedFiles.length > 0 ? (
          <div className="space-y-4">
            {/* File List */}
            <div className="space-y-2">
              {paginatedFiles.map((file) => {
                const slot = getFileSlot(file.id);
                const isDeleting = deletingFile === file.id;
                const slotsAreFull = Object.values(fileSlots).filter(Boolean).length >= 2;
                const isDisabled = slotsAreFull || slot !== null;
                
                return (
                  <div
                    key={file.id}
                    role="button"
                    onClick={() => !isDisabled && !slot && handleFileSelect(file)}
                    className={`
                      w-full flex items-center justify-between p-2 rounded-md text-left
                      ${slot ? 'bg-primary/10' : 'hover:bg-muted/50'}
                      ${isDisabled && !slot ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      transition-colors
                    `}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <FileType className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium truncate flex-1">
                        {file.filename}
                      </span>
                      {slot && (
                        <Badge variant="secondary">
                          Slot {slot}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-muted-foreground min-w-20 text-right">
                        {new Date(file.timestamp).toLocaleDateString()}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {/* Delete Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.id);
                          }}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                          )}
                        </Button>

                        {/* Only show remove button if file is in a slot */}
                        {slot && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFileFromSlot(slot);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">No recent files</p>
          </div>
        )}

        <FileSlotDialog
          open={slotDialogOpen}
          onOpenChange={setSlotDialogOpen}
          onSlotSelect={handleSlotSelect}
          file={selectedFile}
        />
      </CardContent>
    </Card>
  );
};