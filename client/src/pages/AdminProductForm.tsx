import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  insertProductSchema, 
  type InsertProduct, 
  type ProductWithCategory, 
  type Category
} from "@shared/schema";
import { z } from "zod";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { 
  Form, FormControl, FormDescription, FormField, 
  FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, Loader2, Save, 
  AlertTriangle, AlertCircle 
} from "lucide-react";
import { slugify } from "@/lib/utils";

// Extend product schema for the form
const productFormSchema = insertProductSchema.extend({
  // Make some fields optional for the form
  slug: z.string().optional(),
}).refine(
  data => {
    // If slug is not provided, ensure name is
    return data.slug !== undefined || (data.name !== undefined && data.name.length > 0);
  },
  {
    message: "Either slug or name must be provided",
    path: ["slug"],
  }
);

type ProductFormValues = z.infer<typeof productFormSchema>;

// Dietary options for checkbox group
const dietaryOptions = [
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "vegan", label: "Vegan" },
  { id: "nut-free", label: "Nut-Free" },
  { id: "sugar-free", label: "Sugar-Free" },
];

const AdminProductForm = () => {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!id;

  // Check for admin authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/products', {
          credentials: 'include'
        });
        
        if (response.status === 401) {
          navigate('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/admin/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch product details if in edit mode
  const { 
    data: product, 
    isLoading: productLoading, 
    error: productError 
  } = useQuery<ProductWithCategory>({
    queryKey: [`/api/products/${id}`],
    enabled: isEditMode,
  });

  // Setup form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      image: "",
      categoryId: undefined,
      featured: false,
      isBestseller: false,
      isNew: false,
      isPopular: false,
      dietaryOptions: [],
    },
  });

  // Update form values when product data is loaded
  useEffect(() => {
    if (product && isEditMode) {
      form.reset({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        image: product.image,
        categoryId: product.categoryId,
        featured: product.featured,
        isBestseller: product.isBestseller,
        isNew: product.isNew,
        isPopular: product.isPopular,
        dietaryOptions: Array.isArray(product.dietaryOptions) 
          ? product.dietaryOptions as string[] 
          : [],
      });
    }
  }, [product, isEditMode, form]);

  // Auto-generate slug from name
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name") {
        const productName = value.name as string;
        if (productName) {
          form.setValue("slug", slugify(productName), { shouldValidate: true });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: ProductFormValues) => {
    // Ensure slug is generated if not provided
    if (!data.slug && data.name) {
      data.slug = slugify(data.name);
    }

    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        // Update existing product
        await apiRequest("PUT", `/api/admin/products/${id}`, data);
        toast({
          title: "Product updated",
          description: "The product has been successfully updated",
        });
      } else {
        // Create new product
        await apiRequest("POST", "/api/admin/products", data);
        toast({
          title: "Product created",
          description: "The product has been successfully created",
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/products'],
      });
      
      // Navigate back to products list
      navigate("/admin/products");
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} product. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while fetching data in edit mode
  if (isEditMode && productLoading) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading product data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error if product not found in edit mode
  if (isEditMode && productError) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center items-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-red-500">
                <AlertCircle className="mr-2" />
                Error Loading Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Could not load the requested product. It may have been deleted or you don't have permission to view it.</p>
              <Button onClick={() => navigate("/admin/products")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>{isEditMode ? "Edit" : "Add"} Product | SweetBite Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/products")}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Chocolate Cake" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Product Slug */}
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="chocolate-cake" {...field} />
                        </FormControl>
                        <FormDescription>
                          Used in the product URL. Auto-generated from name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Product Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="19.99" 
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          disabled={categoriesLoading}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your product..." 
                          rows={4} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image URL */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a URL for the product image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Preview */}
                {form.watch("image") && (
                  <div className="border rounded-md p-3">
                    <p className="text-sm font-medium mb-2">Image Preview</p>
                    <div className="w-full h-48 rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={form.watch("image")}
                        alt="Product preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Image+Not+Found";
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Product Status */}
                <div className="space-y-4">
                  <FormLabel>Product Status</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured</FormLabel>
                            <FormDescription>
                              Display this product on the homepage
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isBestseller"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Bestseller</FormLabel>
                            <FormDescription>
                              Mark as a bestselling product
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isNew"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>New</FormLabel>
                            <FormDescription>
                              Mark as a new product
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isPopular"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Popular</FormLabel>
                            <FormDescription>
                              Mark as a popular product
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Dietary Options */}
                <FormField
                  control={form.control}
                  name="dietaryOptions"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Dietary Options</FormLabel>
                        <FormDescription>
                          Select the dietary options that apply to this product
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dietaryOptions.map((option) => (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="dietaryOptions"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={option.id}
                                  className="flex items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, option.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== option.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {option.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-primary text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditMode ? "Update Product" : "Create Product"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
