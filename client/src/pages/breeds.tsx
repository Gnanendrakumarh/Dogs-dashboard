import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dog, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "../hooks/use-debounce";
import { api } from "../lib/api";
import BreedTable from "../components/breed-table";
import BreedFormModal from "../components/breed-form-modal";

export default function BreedsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: breedsData, isLoading: isBreedsLoading } = useQuery({
    queryKey: ["/api/breeds", { search: debouncedSearch, limit: pageSize, offset: (currentPage - 1) * pageSize }],
    queryFn: () => api.getBreeds({
      search: debouncedSearch || undefined,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: api.getStats,
  });

  const totalPages = Math.ceil((breedsData?.total || 0) / pageSize);

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white shadow-material sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Dog className="text-primary text-2xl" />
              <h1 className="text-xl font-medium text-gray-900"> dashboard</h1>
              <span className="hidden sm:inline-block bg-surface-200 text-gray-600 px-2 py-1 rounded text-sm">
                Breed Management
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search breeds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary-600 text-white flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Breed</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-material">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Dog className="text-primary text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Breeds</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.totalBreeds || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-material">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Dog className="text-green-500 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sub-breeds</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.totalSubBreeds || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-material">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Dog className="text-orange-500 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-2xl font-semibold text-gray-900">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search breeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Breed Table */}
        <BreedTable
          breeds={breedsData?.breeds || []}
          isLoading={isBreedsLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          total={breedsData?.total || 0}
          pageSize={pageSize}
        />
      </main>

      {/* Add Breed Modal */}
      <BreedFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
