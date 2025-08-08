import { useState } from "react";
import { Edit, Trash, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Breed } from "@shared/schema";
import BreedFormModal from "./breed-form-modal";
import DeleteConfirmationModal from "./delete-confirmation-modal";

interface BreedTableProps {
  breeds: Breed[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
  pageSize: number;
}

export default function BreedTable({
  breeds,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  total,
  pageSize,
}: BreedTableProps) {
  const [editingBreed, setEditingBreed] = useState<Breed | null>(null);
  const [deletingBreed, setDeletingBreed] = useState<Breed | null>(null);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  if (isLoading) {
    return (
      <Card className="shadow-material">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-medium text-gray-900">Breed Management</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-material">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-medium text-gray-900">Breed Management</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-100">
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Breed Name
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sub-breeds
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-surface-200">
              {breeds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No breeds found. Add your first breed to get started.
                  </TableCell>
                </TableRow>
              ) : (
                breeds.map((breed) => (
                  <TableRow key={breed.id} className="hover:bg-surface-50 transition-colors duration-150">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          🐕
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{breed.name}</div>
                          <div className="text-sm text-gray-500">ID: {breed.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {breed.subBreeds && breed.subBreeds.length > 0 ? (
                        <div>
                          <div className="flex flex-wrap gap-1">
                            {breed.subBreeds.slice(0, 3).map((subBreed) => (
                              <Badge key={subBreed.id} variant="secondary" className="bg-primary-100 text-primary-800">
                                {subBreed.name}
                              </Badge>
                            ))}
                            {breed.subBreeds.length > 3 && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                +{breed.subBreeds.length - 3} more
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {breed.subBreeds.length} sub-breed{breed.subBreeds.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No sub-breeds</div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingBreed(breed)}
                          className="text-primary-600 hover:text-primary-900 hover:bg-primary-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-900 hover:bg-red-50"
                          onClick={() => setDeletingBreed(breed)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-surface-50 px-6 py-3 border-t border-surface-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startItem}</span> to{" "}
                <span className="font-medium">{endItem}</span> of{" "}
                <span className="font-medium">{total}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="border-surface-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className={
                        currentPage === pageNum
                          ? "bg-primary text-white"
                          : "border-surface-300 text-gray-700 hover:bg-surface-50"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="border-surface-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      {editingBreed && (
        <BreedFormModal
          isOpen={true}
          onClose={() => setEditingBreed(null)}
          breed={editingBreed}
        />
      )}

      {/* Delete Modal */}
      {deletingBreed && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setDeletingBreed(null)}
          breed={deletingBreed}
        />
      )}
    </>
  );
}