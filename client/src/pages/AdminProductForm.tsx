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
  insertCategorySchema,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Loader2, Save,
  AlertTriangle, AlertCircle, Plus, Upload, Image as ImageIcon, X, Trash2
} from "lucide-react";
import { slugify } from "@/lib/utils";

// Extend product schema for the form
const productFormSchema = insertProductSchema.extend({
  slug: z.string().optional(),
}).refine(
  data => {
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
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const isEditMode = !!id;

  // Chip-based input states
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  // Price variations state
  const [priceVariations, setPriceVariations] = useState<Record<string, number>>({});

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
    queryKey: [`/api/admin/products/${id}`],
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
      images: [],
      categoryId: undefined,
      featured: false,
      isBestseller: false,
      isNew: false,
      isPopular: false,
      dietaryOptions: [],
      sizes: [],
      colors: [],
      priceVariations: {},
    },
  });

  // Update form values when product data is loaded
  useEffect(() => {
    if (product && isEditMode) {
      const productImage = product.image || "/api/placeholder/300/300?text=No+Image";
      setImagePreview(productImage);

      const productImages = Array.isArray(product.images) ? product.images : [];
      setAdditionalImages(productImages);

      const productSizes = Array.isArray(product.sizes) ? product.sizes as string[] : [];
      const productColors = Array.isArray(product.colors) ? product.colors as string[] : [];
      setSizes(productSizes);
      setColors(productColors);

      const productPriceVariations = (product.priceVariations as Record<string, number>) || {};
      setPriceVariations(productPriceVariations);

      form.reset({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        image: productImage,
        images: productImages,
        categoryId: product.categoryId,
        featured: product.featured,
        isBestseller: product.isBestseller,
        isNew: product.isNew,
        isPopular: product.isPopular,
        dietaryOptions: Array.isArray(product.dietaryOptions)
          ? product.dietaryOptions as string[]
          : [],
        sizes: productSizes,
        colors: productColors,
        priceVariations: productPriceVariations,
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

  // Handle primary image file selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle additional images upload
  const handleAdditionalImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage = reader.result as string;
          setAdditionalImages(prev => [...prev, newImage]);
          form.setValue("images", [...additionalImages, newImage]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove additional image
  const removeAdditionalImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(newImages);
    form.setValue("images", newImages);
  };

  // Add size chip
  const addSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      const newSizes = [...sizes, sizeInput.trim()];
      setSizes(newSizes);
      form.setValue("sizes", newSizes);
      setSizeInput("");
    }
  };

  // Remove size chip
  const removeSize = (size: string) => {
    const newSizes = sizes.filter(s => s !== size);
    setSizes(newSizes);
    form.setValue("sizes", newSizes);

    // Remove price variation associated with this size
    const newPriceVariations = { ...priceVariations };
    delete newPriceVariations[size];
    setPriceVariations(newPriceVariations);
    form.setValue("priceVariations", newPriceVariations);
  };

  // Add color chip
  const addColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      const newColors = [...colors, colorInput.trim()];
      setColors(newColors);
      form.setValue("colors", newColors);
      setColorInput("");
    }
  };

  // Remove color chip
  const removeColor = (color: string) => {
    const newColors = colors.filter(c => c !== color);
    setColors(newColors);
    form.setValue("colors", newColors);

    // Remove price variations associated with this color
    const newPriceVariations = { ...priceVariations };
    Object.keys(newPriceVariations).forEach(key => {
      if (key.endsWith(`-${color}`)) {
        delete newPriceVariations[key];
      }
    });
    setPriceVariations(newPriceVariations);
    form.setValue("priceVariations", newPriceVariations);
  };

  // Update size-based price variation
  const updateSizePriceVariation = (size: string, price: number) => {
    const newPriceVariations = { ...priceVariations, [size]: price };
    setPriceVariations(newPriceVariations);
    form.setValue("priceVariations", newPriceVariations);
  };

  // Update price variation (for size-color combinations if needed)
  const updatePriceVariation = (size: string, color: string, price: number) => {
    const key = `${size}-${color}`;
    const newPriceVariations = { ...priceVariations, [key]: price };
    setPriceVariations(newPriceVariations);
    form.setValue("priceVariations", newPriceVariations);
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const newCategory = await apiRequest("POST", "/api/admin/categories", {
        name: newCategoryName,
        slug: slugify(newCategoryName),
        image: newCategoryImage || null
      });

      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });

      const categoryData = newCategory as any;
      form.setValue("categoryId", categoryData.id);
      setNewCategoryName("");
      setNewCategoryImage("");

      toast({
        title: "Category created",
        description: "New category has been successfully created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!data.slug && data.name) {
      data.slug = slugify(data.name);
    }

    if (!data.image || data.image.trim() === "") {
      data.image = "/api/placeholder/300/300?text=No+Image";
    }

    // Ensure sizes and colors are set
    data.sizes = sizes;
    data.colors = colors;
    data.images = additionalImages;
    data.priceVariations = priceVariations;

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await apiRequest("PUT", `/api/admin/products/${id}`, data);
        toast({
          title: "Product updated",
          description: "The product has been successfully updated",
        });
      } else {
        await apiRequest("POST", "/api/admin/products", data);
        toast({
          title: "Product created",
          description: "The product has been successfully created",
        });
      }

      queryClient.invalidateQueries({
        queryKey: ['/api/products'],
      });

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
              <p className="mb-4">Could not load the requested product.</p>
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
        <title>{isEditMode ? "Edit" : "Add"} Product | Probashi Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/products")}
            className="mr-4"
            data-testid="button-back"
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
                          <Input placeholder="e.g. Chocolate Cake" {...field} data-testid="input-product-name" />
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
                          <Input placeholder="chocolate-cake" {...field} data-testid="input-slug" />
                        </FormControl>
                        <FormDescription>
                          Used in the product URL. Auto-generated from name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Base Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price (BDT)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="299"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-price"
                          />
                        </FormControl>
                        <FormDescription>
                          Default price (used when no size-specific prices are set)
                        </FormDescription>
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
                        <div className="flex gap-2">
                          <Select
                            disabled={categoriesLoading}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="flex-1" data-testid="select-category">
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

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" size="icon" data-testid="button-add-category">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Create New Category</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  placeholder="Category name"
                                  value={newCategoryName}
                                  onChange={(e) => setNewCategoryName(e.target.value)}
                                  data-testid="input-new-category"
                                />
                                <Input
                                  placeholder="Category image URL (optional)"
                                  value={newCategoryImage}
                                  onChange={(e) => setNewCategoryImage(e.target.value)}
                                  data-testid="input-new-category-image"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setNewCategoryName("");
                                      setNewCategoryImage("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={handleCreateCategory}
                                    disabled={isCreatingCategory || !newCategoryName.trim()}
                                    data-testid="button-create-category"
                                  >
                                    {isCreatingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
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
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Primary Image Upload */}
                <div className="space-y-4">
                  <FormLabel>Primary Product Image</FormLabel>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="flex-1"
                        data-testid="input-primary-image"
                      />
                    </div>
                    {imagePreview && (
                      <div className="relative w-48 h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Primary preview"
                          className="w-full h-full object-cover"
                          data-testid="img-primary-preview"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Images Upload */}
                <div className="space-y-4">
                  <FormLabel>Additional Images</FormLabel>
                  <div className="flex items-center gap-4 mb-4">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesChange}
                      className="flex-1"
                      data-testid="input-additional-images"
                    />
                  </div>
                  {additionalImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {additionalImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                            <img
                              src={img}
                              alt={`Additional ${index + 1}`}
                              className="w-full h-full object-cover"
                              data-testid={`img-additional-${index}`}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeAdditionalImage(index)}
                            data-testid={`button-remove-image-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sizes - Chip-based Input */}
                <div className="space-y-4">
                  <FormLabel>Product Sizes</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter size (e.g., Small)"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSize();
                        }
                      }}
                      data-testid="input-size"
                    />
                    <Button type="button" onClick={addSize} data-testid="button-add-size">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-2 text-sm" data-testid={`badge-size-${index}`}>
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="ml-2 hover:text-red-600"
                          data-testid={`button-remove-size-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Colors - Chip-based Input */}
                <div className="space-y-4">
                  <FormLabel>Product Colors</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter color (e.g., Red)"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addColor();
                        }
                      }}
                      data-testid="input-color"
                    />
                    <Button type="button" onClick={addColor} data-testid="button-add-color">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-2 text-sm" data-testid={`badge-color-${index}`}>
                        {color}
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="ml-2 hover:text-red-600"
                          data-testid={`button-remove-color-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Size-Based Pricing */}
                {sizes.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Size-Based Pricing</FormLabel>
                      <FormDescription>
                        Set specific prices for each size. Leave empty to use the base price.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sizes.map((size, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-700 rounded-lg">
                          <div className="flex-1">
                            <label className="text-sm font-medium mb-1 block">{size}</label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder={`Price for ${size}`}
                              value={priceVariations[size] || ""}
                              onChange={(e) => updateSizePriceVariation(size, parseFloat(e.target.value) || 0)}
                              className="w-full"
                              data-testid={`input-size-price-${index}`}
                            />
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            BDT
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      💡 Tip: If a size doesn't have a price set, the base price (৳{form.watch("price") || 0}) will be used.
                    </p>
                  </div>
                )}

                {/* Price Variations Matrix (for size-color combinations) */}
                {sizes.length > 0 && colors.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Advanced Price Variations (Size × Color)</FormLabel>
                      <FormDescription>
                        Set specific prices for each size and color combination
                      </FormDescription>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-800">
                            <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">Size / Color</th>
                            {colors.map((color, index) => (
                              <th key={index} className="border border-gray-300 dark:border-gray-700 p-2 text-center" data-testid={`header-color-${index}`}>
                                {color}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sizes.map((size, sizeIndex) => (
                            <tr key={sizeIndex}>
                              <td className="border border-gray-300 dark:border-gray-700 p-2 font-semibold" data-testid={`row-size-${sizeIndex}`}>
                                {size}
                              </td>
                              {colors.map((color, colorIndex) => {
                                const key = `${size}-${color}`;
                                return (
                                  <td key={colorIndex} className="border border-gray-300 dark:border-gray-700 p-2">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="Price"
                                      value={priceVariations[key] || ""}
                                      onChange={(e) => updatePriceVariation(size, color, parseFloat(e.target.value) || 0)}
                                      className="w-full"
                                      data-testid={`input-price-${sizeIndex}-${colorIndex}`}
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Product Flags */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-featured"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Featured</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isBestseller"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-bestseller"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Bestseller</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isNew"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-new"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">New</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPopular"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-popular"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Popular</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dietary Options */}
                <FormField
                  control={form.control}
                  name="dietaryOptions"
                  render={() => (
                    <FormItem>
                      <FormLabel>Dietary Options</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {dietaryOptions.map((option) => (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="dietaryOptions"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={(field.value as string[])?.includes(option.id)}
                                    onCheckedChange={(checked) => {
                                      const current = (field.value as string[]) || [];
                                      return checked
                                        ? field.onChange([...current, option.id])
                                        : field.onChange(current.filter((value: string) => value !== option.id));
                                    }}
                                    data-testid={`checkbox-dietary-${option.id}`}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/products")}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="button-submit"
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Update" : "Create"} Product
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
