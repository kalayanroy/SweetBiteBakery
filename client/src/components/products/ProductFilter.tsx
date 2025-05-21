import { useState, useEffect } from 'react';
import { useQueryState } from '@/hooks/use-query-state';
import { Category } from '@shared/schema';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type ProductFilterProps = {
  categories: Category[];
};

const ProductFilter = ({ categories }: ProductFilterProps) => {
  const [filters, setFilters] = useQueryState();
  
  // Initialize filter values
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.category ? [filters.category] : []
  );
  const [selectedDietaryOptions, setSelectedDietaryOptions] = useState<string[]>(
    filters.dietary ? filters.dietary.split(',') : []
  );
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>(
    filters.price ? filters.price.split(',') : []
  );

  // Update URL when filters change
  useEffect(() => {
    const newFilters = { ...filters };
    
    if (selectedCategories.length) {
      newFilters.category = selectedCategories[0];
    } else {
      delete newFilters.category;
    }
    
    if (selectedDietaryOptions.length) {
      newFilters.dietary = selectedDietaryOptions.join(',');
    } else {
      delete newFilters.dietary;
    }
    
    if (selectedPriceRanges.length) {
      newFilters.price = selectedPriceRanges.join(',');
    } else {
      delete newFilters.price;
    }
    
    setFilters(newFilters);
  }, [selectedCategories, selectedDietaryOptions, selectedPriceRanges, setFilters]);

  // Helper function to toggle selection
  const toggleSelection = (
    value: string, 
    currentSelection: string[], 
    setSelectionFn: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (currentSelection.includes(value)) {
      setSelectionFn(currentSelection.filter(item => item !== value));
    } else {
      setSelectionFn([...currentSelection, value]);
    }
  };

  return (
    <div className="sticky top-24">
      <h2 className="font-heading text-2xl font-bold text-primary mb-6">Filters</h2>
      
      {/* Categories Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox 
              id="all-categories" 
              checked={selectedCategories.length === 0}
              onCheckedChange={() => setSelectedCategories([])}
              className="text-primary h-5 w-5 rounded"
            />
            <Label htmlFor="all-categories" className="ml-2">All Products</Label>
          </div>
          
          {categories.map(category => (
            <div key={category.id} className="flex items-center">
              <Checkbox 
                id={`category-${category.id}`} 
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => {
                  // If selecting a category, replace current selection
                  if (!selectedCategories.includes(category.slug)) {
                    setSelectedCategories([category.slug]);
                  } else {
                    setSelectedCategories([]);
                  }
                }}
                className="text-primary h-5 w-5 rounded"
              />
              <Label htmlFor={`category-${category.id}`} className="ml-2">{category.name}</Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dietary Restrictions Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Dietary Options</h3>
        <div className="space-y-2">
          {['gluten-free', 'vegan', 'nut-free', 'sugar-free'].map((option) => (
            <div key={option} className="flex items-center">
              <Checkbox 
                id={`dietary-${option}`}
                checked={selectedDietaryOptions.includes(option)}
                onCheckedChange={() => toggleSelection(
                  option, 
                  selectedDietaryOptions, 
                  setSelectedDietaryOptions
                )}
                className="text-primary h-5 w-5 rounded"
              />
              <Label htmlFor={`dietary-${option}`} className="ml-2">
                {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Price Range Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          {[
            { id: 'under-10', label: 'Under $10', value: '0-10' },
            { id: '10-25', label: '$10 - $25', value: '10-25' },
            { id: '25-50', label: '$25 - $50', value: '25-50' },
            { id: 'over-50', label: 'Over $50', value: '50-1000' }
          ].map((range) => (
            <div key={range.id} className="flex items-center">
              <Checkbox 
                id={`price-${range.id}`}
                checked={selectedPriceRanges.includes(range.value)}
                onCheckedChange={() => toggleSelection(
                  range.value, 
                  selectedPriceRanges, 
                  setSelectedPriceRanges
                )}
                className="text-primary h-5 w-5 rounded"
              />
              <Label htmlFor={`price-${range.id}`} className="ml-2">{range.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
