import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Minus, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { insertBreedSchema, type Breed, type InsertBreed } from "@shared/schema";
import { z } from "zod";

const formSchema = insertBreedSchema.extend({
  subBreeds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BreedFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  breed?: Breed;
}

export default function BreedFormModal({ isOpen, onClose, breed }: BreedFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!breed;

  const [subBreedInputs, setSubBreedInputs] = useState<string[]>(
    breed?.subBreeds?.map(sb => sb.name) || ['']
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: breed?.name || '',
      description: breed?.description || '',
      subBreeds: breed?.subBreeds?.map(sb => sb.name) || [],
    },
  });

  const createMutation = useMutation({
    mutationFn: api.createBreed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/breeds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Breed has been successfully created.",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create breed.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertBreed> }) =>
      api.updateBreed(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/breeds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Breed has been successfully updated.",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update breed.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    reset();
    setSubBreedInputs(['']);
    onClose();
  };

  const addSubBreedInput = () => {
    setSubBreedInputs([...subBreedInputs, '']);
  };

  const removeSubBreedInput = (index: number) => {
    const newInputs = subBreedInputs.filter((_, i) => i !== index);
    setSubBreedInputs(newInputs.length === 0 ? [''] : newInputs);
    setValue('subBreeds', newInputs.filter(input => input.trim()));
  };

  const updateSubBreedInput = (index: number, value: string) => {
    const newInputs = [...subBreedInputs];
    newInputs[index] = value;
    setSubBreedInputs(newInputs);
    setValue('subBreeds', newInputs.filter(input => input.trim()));
  };

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      subBreeds: subBreedInputs.filter(input => input.trim()),
    };

    if (isEditing && breed) {
      updateMutation.mutate({ id: breed.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Breed' : 'Add New Breed'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Breed Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter breed name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter breed description"
              rows={3}
            />
          </div>

          <div>
            <Label>Sub-breeds (Optional)</Label>
            <div className="space-y-2 mt-2">
              {subBreedInputs.map((input, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => updateSubBreedInput(index, e.target.value)}
                    placeholder="Sub-breed name"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSubBreedInput(index)}
                    className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addSubBreedInput}
              className="mt-2 text-primary-600 hover:text-primary-800"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Sub-breed
            </Button>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-surface-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary-600 text-white"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEditing ? 'Updating...' : 'Adding...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span>{isEditing ? 'Save Changes' : 'Add Breed'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}