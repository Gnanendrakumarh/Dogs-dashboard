import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Breed } from "@shared/schema";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  breed: Breed;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  breed,
}: DeleteConfirmationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteBreed(breed.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/breeds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Deleted",
        description: "Breed has been successfully deleted.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete breed.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const subBreedCount = breed.subBreeds?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600 h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">Delete Breed</h3>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete "<span className="font-medium">{breed.name}</span>"? 
                This action cannot be undone
                {subBreedCount > 0 && (
                  <> and will also remove {subBreedCount} associated sub-breed{subBreedCount !== 1 ? 's' : ''}</>
                )}.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-surface-50 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Trash className="h-4 w-4" />
                <span>Delete</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}