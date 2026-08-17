import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import type { Product, Category } from '../../types';
import { FiSave, FiArrowLeft, FiPlus, FiX, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

interface ColorInput {
  name_ar: string;
  name_fr: string;
  hex_code: string;
}

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form fields
  const [nameAr, setNameAr] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descFr, setDescFr] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [sale, setSale] = useState(false);

  // Colors
  const [colors, setColors] = useState<ColorInput[]>([]);
  const [newColor, setNewColor] = useState<ColorInput>({ name_ar: '', name_fr: '', hex_code: '#000000' });

  // Sizes
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Images
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    loadCategories();
    if (isEdit && id) {
      loadProduct(id);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch {
      toast.error('Failed to load categories');
    }
  };

  const loadProduct = async (productId: string) => {
    setLoading(true);
    try {
      const res = await api.getProduct(productId);
      const product: Product = res.product || res;
      setNameAr(product.name_ar);
      setNameFr(product.name_fr);
      setDescAr(product.description_ar || '');
      setDescFr(product.description_fr || '');
      setPrice(product.price.toString());
      setOldPrice(product.old_price?.toString() || '');
      setCategoryId(product.category_id || '');
      setAvailable(product.available);
      setFeatured(product.featured);
      setNewArrival(product.new_arrival);
      setSale(product.sale);

      if (product.colors) {
        setColors(product.colors.map((c: { name_ar: string; name_fr: string; hex_code: string }) => ({ name_ar: c.name_ar, name_fr: c.name_fr, hex_code: c.hex_code })));
      }
      if (product.sizes) {
        setSelectedSizes(product.sizes.map((s: { size: string }) => s.size));
      }
      if (product.images) {
        setExistingImages(product.images.map((img: { id: string; url: string }) => ({ id: img.id, url: img.url })));
      }
    } catch {
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const addColor = () => {
    if (!newColor.name_ar || !newColor.name_fr) {
      toast.error('Color names are required');
      return;
    }
    setColors((prev) => [...prev, { ...newColor }]);
    setNewColor({ name_ar: '', name_fr: '', hex_code: '#000000' });
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = async (imageId: string) => {
    try {
      await api.deleteProductImage(imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameAr || !nameFr || !price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const slug = slugify(nameFr || nameAr);
      const productData = {
        name_ar: nameAr,
        name_fr: nameFr,
        description_ar: descAr,
        description_fr: descFr,
        price: parseFloat(price),
        old_price: oldPrice ? parseFloat(oldPrice) : null,
        category_id: categoryId || null,
        available,
        featured,
        new_arrival: newArrival,
        sale,
        slug,
        colors,
        sizes: selectedSizes,
      };

      let productId = id;

      if (isEdit && id) {
        await api.updateProduct(id, productData);
        toast.success('Product updated successfully');
      } else {
        const res = await api.createProduct(productData);
        productId = res.product?.id || res.id;
        toast.success('Product created successfully');
      }

      // Upload new images
      if (newImages.length > 0 && productId) {
        const formData = new FormData();
        newImages.forEach((file) => formData.append('images', file));
        await api.uploadProductImages(productId, formData);
      }

      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#FE8B7C' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit Product' : 'New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (Arabic) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                dir="rtl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (French) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Arabic)</label>
              <textarea
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                rows={3}
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (French)</label>
              <textarea
                value={descFr}
                onChange={(e) => setDescFr(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Category */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (MRU) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Old Price (MRU)</label>
              <input
                type="number"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_fr} / {cat.name_ar}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status & Flags */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Status & Flags</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(e) => setNewArrival(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">New Arrival</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sale}
                onChange={(e) => setSale(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Sale</span>
            </label>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Colors</h2>

          {/* Existing colors */}
          {colors.length > 0 && (
            <div className="space-y-2 mb-4">
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: color.hex_code }}
                  />
                  <span className="text-sm text-gray-700">{color.name_fr}</span>
                  <span className="text-sm text-gray-500" dir="rtl">{color.name_ar}</span>
                  <span className="text-xs text-gray-400">{color.hex_code}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(idx)}
                    className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add color form */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name (Arabic)</label>
              <input
                type="text"
                value={newColor.name_ar}
                onChange={(e) => setNewColor((prev) => ({ ...prev, name_ar: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name (French)</label>
              <input
                type="text"
                value={newColor.name_fr}
                onChange={(e) => setNewColor((prev) => ({ ...prev, name_fr: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
              <input
                type="color"
                value={newColor.hex_code}
                onChange={(e) => setNewColor((prev) => ({ ...prev, hex_code: e.target.value }))}
                className="h-10 w-14 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={addColor}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#FE8B7C' }}
            >
              <FiPlus size={16} />
              Add
            </button>
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sizes</h2>
          <div className="flex flex-wrap gap-3">
            {SIZES.map((size) => (
              <label
                key={size}
                className={`flex items-center justify-center w-14 h-10 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors ${
                  selectedSizes.includes(size)
                    ? 'border-[#FE8B7C] text-white'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
                style={selectedSizes.includes(size) ? { backgroundColor: '#FE8B7C', borderColor: '#FE8B7C' } : {}}
              >
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => toggleSize(size)}
                  className="hidden"
                />
                {size}
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Images</h2>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              {existingImages.map((img) => (
                <div key={img.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteExistingImage(img.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New images preview */}
          {newImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              {newImages.map((file, idx) => (
                <div key={idx} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
            <FiPlus size={18} className="text-gray-500" />
            <span className="text-sm text-gray-600">Upload Images</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#FE8B7C' }}
            onMouseEnter={(e) => {
              if (!saving) (e.target as HTMLElement).style.backgroundColor = '#F47768';
            }}
            onMouseLeave={(e) => {
              if (!saving) (e.target as HTMLElement).style.backgroundColor = '#FE8B7C';
            }}
          >
            <FiSave size={16} />
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
