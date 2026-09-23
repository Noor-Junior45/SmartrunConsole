import React, { useState, useRef } from 'react';
import { 
  Palette, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  UploadCloud, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Sparkles, 
  ArrowUpRight,
  ExternalLink,
  Layers
} from 'lucide-react';
import { ColorVariant } from '../types';
import { getColorInfo, getColorSwatchStyle, COMMON_COLOR_MAP } from '../lib/colorUtils';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';

interface ColorVariantsBuilderProps {
  variants: ColorVariant[];
  onChange: (variants: ColorVariant[]) => void;
  basePrice: number;
  baseMrp: number | null;
  productImages: string[];
  productName?: string;
}

const POPULAR_PRESETS = [
  { name: 'Red', hex: '#dc2626' },
  { name: 'Black', hex: '#0f172a' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green / Yellow', hex: '#16a34a' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Grey', hex: '#64748b' },
  { name: 'Brown', hex: '#78350f' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Gold', hex: '#d97706' },
  { name: 'Ivory', hex: '#fefce8' },
];

export function ColorVariantsBuilder({
  variants,
  onChange,
  basePrice,
  baseMrp,
  productImages,
  productName,
}: ColorVariantsBuilderProps) {
  const { showToast } = useToast();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [customColorName, setCustomColorName] = useState('');
  const [customHex, setCustomHex] = useState('#2563eb');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [imagePickerVariantIndex, setImagePickerVariantIndex] = useState<number | null>(null);
  const [urlInputIndex, setUrlInputIndex] = useState<number | null>(null);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to add a new variant
  const handleAddPreset = (name: string, hex: string) => {
    // Check if already exists
    const exists = variants.some(
      (v) => (v.color || v.name || '').trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) {
      showToast({
        type: 'warning',
        title: 'Variant Exists',
        description: `Variant "${name}" is already in the list.`,
      });
      return;
    }

    const newVariant: ColorVariant = {
      color: name,
      name,
      hex,
      price: basePrice > 0 ? basePrice : null,
      mrp: baseMrp,
      discount_percent:
        baseMrp && basePrice && baseMrp > basePrice
          ? Math.round(((baseMrp - basePrice) / baseMrp) * 100)
          : null,
      image_urls: [],
      image_url: undefined,
    };

    const updated = [...variants, newVariant];
    onChange(updated);
    setExpandedIndex(updated.length - 1);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customColorName.trim();
    if (!trimmed) return;

    const exists = variants.some(
      (v) => (v.color || v.name || '').trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      showToast({
        type: 'warning',
        title: 'Variant Exists',
        description: `Variant "${trimmed}" already exists.`,
      });
      return;
    }

    const info = getColorInfo(trimmed, customHex);
    const newVariant: ColorVariant = {
      color: trimmed,
      name: trimmed,
      hex: info.hex,
      price: basePrice > 0 ? basePrice : null,
      mrp: baseMrp,
      discount_percent:
        baseMrp && basePrice && baseMrp > basePrice
          ? Math.round(((baseMrp - basePrice) / baseMrp) * 100)
          : null,
      image_urls: [],
      image_url: undefined,
    };

    const updated = [...variants, newVariant];
    onChange(updated);
    setCustomColorName('');
    setIsAddingCustom(false);
    setExpandedIndex(updated.length - 1);
  };

  const handleUpdateVariant = (index: number, updates: Partial<ColorVariant>) => {
    const updated = [...variants];
    const current = { ...updated[index], ...updates };

    // Auto calculate discount percentage if price and MRP are present
    if (updates.price !== undefined || updates.mrp !== undefined) {
      const p = current.price !== null && current.price !== undefined ? current.price : basePrice;
      const m = current.mrp !== null && current.mrp !== undefined ? current.mrp : baseMrp;
      if (m && p && m > p) {
        current.discount_percent = Math.round(((m - p) / m) * 100);
      } else {
        current.discount_percent = null;
      }
    }

    // Keep color and name synchronized
    if (updates.color) {
      current.name = updates.color;
    }

    // Keep primary image_url synchronized with image_urls[0]
    if (current.image_urls && current.image_urls.length > 0) {
      current.image_url = current.image_urls[0];
    } else {
      current.image_url = undefined;
    }

    updated[index] = current;
    onChange(updated);
  };

  const handleRemoveVariant = (index: number) => {
    const removedName = variants[index]?.color || 'Variant';
    const updated = variants.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
    showToast({
      type: 'info',
      title: 'Variant Removed',
      description: `Removed "${removedName}" from color variants.`,
    });
  };

  const handleDuplicateVariant = (index: number) => {
    const source = variants[index];
    const copyName = `${source.color} (Copy)`;
    const newVariant: ColorVariant = {
      ...source,
      color: copyName,
      name: copyName,
      image_urls: [...(source.image_urls || [])],
    };
    const updated = [...variants, newVariant];
    onChange(updated);
    setExpandedIndex(updated.length - 1);
  };

  // Assign images from product gallery
  const handleToggleGalleryImage = (variantIndex: number, url: string) => {
    const variant = variants[variantIndex];
    const currentUrls = variant.image_urls || [];
    let updatedUrls: string[];

    if (currentUrls.includes(url)) {
      updatedUrls = currentUrls.filter((u) => u !== url);
    } else {
      updatedUrls = [...currentUrls, url];
    }

    handleUpdateVariant(variantIndex, {
      image_urls: updatedUrls,
      image_url: updatedUrls[0] || undefined,
    });
  };

  // Upload image specifically for variant
  const handleVariantFileUpload = async (variantIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'warning',
        title: 'Invalid File',
        description: 'Please select an image file (JPG, PNG, WebP).',
      });
      return;
    }

    setUploadingIndex(variantIndex);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `variants/${crypto.randomUUID()}-${cleanName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      if (publicUrlData?.publicUrl) {
        const uploadedUrl = publicUrlData.publicUrl;
        const currentUrls = variants[variantIndex].image_urls || [];
        const updatedUrls = [...currentUrls, uploadedUrl];
        handleUpdateVariant(variantIndex, {
          image_urls: updatedUrls,
          image_url: updatedUrls[0] || undefined,
        });
        showToast({
          type: 'success',
          title: 'Photo Uploaded',
          description: `Uploaded and linked image for ${variants[variantIndex].color}.`,
        });
      }
    } catch (err: unknown) {
      console.error('Variant photo upload error:', err);
      showToast({
        type: 'error',
        title: 'Upload Failed',
        description: err instanceof Error ? err.message : 'Could not upload variant image.',
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleAddManualUrl = (variantIndex: number) => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      showToast({
        type: 'warning',
        title: 'Invalid URL',
        description: 'Please enter a valid HTTP/HTTPS image URL.',
      });
      return;
    }

    const currentUrls = variants[variantIndex].image_urls || [];
    if (!currentUrls.includes(trimmed)) {
      const updatedUrls = [...currentUrls, trimmed];
      handleUpdateVariant(variantIndex, {
        image_urls: updatedUrls,
        image_url: updatedUrls[0] || undefined,
      });
    }
    setManualUrl('');
    setUrlInputIndex(null);
  };

  return (
    <div id="product-color-variants-builder" className="space-y-4">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1a1716]/10">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#2e4a3d]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a1716]">
              Color Variants & Linked Pricing
            </h3>
            {variants.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#2e4a3d]/10 text-[#2e4a3d] font-mono text-xs font-semibold">
                {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
              </span>
            )}
          </div>
          <p className="text-xs text-[#1a1716]/70 mt-0.5">
            Attach dedicated photos, custom MRP/selling prices, and color swatches. The customer storefront dynamically switches photos and prices when a user taps a swatch.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingCustom(!isAddingCustom)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2e4a3d] hover:bg-[#2e4a3d]/90 text-white text-xs font-mono uppercase tracking-wider rounded-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Custom Color</span>
        </button>
      </div>

      {/* Quick Add Presets Bar */}
      <div className="bg-white p-3 rounded-sm border border-[#1a1716]/10 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#1a1716]/70 uppercase tracking-wider">
          <span>Quick Add Popular Colors:</span>
          <span className="text-[10px] text-[#1a1716]/50">Click to add instantly</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_PRESETS.map((preset) => {
            const isAdded = variants.some(
              (v) => (v.color || v.name || '').toLowerCase() === preset.name.toLowerCase()
            );
            const style = getColorSwatchStyle(preset.name, preset.hex);
            const info = getColorInfo(preset.name, preset.hex);

            return (
              <button
                key={preset.name}
                type="button"
                disabled={isAdded}
                onClick={() => handleAddPreset(preset.name, preset.hex)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isAdded
                    ? 'bg-slate-100 border-slate-200 text-slate-400'
                    : 'bg-[#f2efeb] hover:bg-white border-[#1a1716]/15 hover:border-[#2e4a3d] text-[#1a1716]'
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    info.isLight ? 'border border-slate-300' : ''
                  }`}
                  style={style}
                />
                <span>{preset.name}</span>
                {isAdded ? (
                  <Check className="w-3 h-3 text-emerald-600 ml-0.5" />
                ) : (
                  <Plus className="w-3 h-3 text-[#1a1716]/40 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Input Dropdown / Form */}
      {isAddingCustom && (
        <form
          onSubmit={handleAddCustom}
          className="p-3 bg-[#f2efeb] border-2 border-dashed border-[#2e4a3d]/40 rounded-sm flex flex-wrap items-end gap-3 animate-in fade-in duration-150"
        >
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-mono uppercase text-[#1a1716]/70 mb-1">
              Color Name (e.g. Copper Bronze, Matte Charcoal)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Matte Black, Golden Oak..."
              value={customColorName}
              onChange={(e) => {
                setCustomColorName(e.target.value);
                // Attempt to auto-suggest hex from name
                const detected = getColorInfo(e.target.value);
                if (detected.hex && detected.hex !== '#94a3b8') {
                  setCustomHex(detected.hex);
                }
              }}
              className="w-full text-xs px-3 py-1.5 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
            />
          </div>

          <div className="w-28">
            <label className="block text-[11px] font-mono uppercase text-[#1a1716]/70 mb-1">
              Hex Swatch
            </label>
            <div className="flex items-center gap-1.5 bg-white px-2 py-1 border border-[#1a1716]/20 rounded-sm">
              <input
                type="color"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                className="w-5 h-5 rounded-full border-0 p-0 cursor-pointer"
              />
              <span className="text-xs font-mono text-[#1a1716]/80">{customHex}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#2e4a3d] hover:bg-[#2e4a3d]/90 text-white text-xs font-mono uppercase tracking-wider rounded-sm font-semibold transition cursor-pointer"
            >
              Add Variant
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#1a1716] border border-[#1a1716]/20 text-xs font-mono rounded-sm transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Variants List */}
      {variants.length === 0 ? (
        <div className="p-8 text-center bg-white border border-dashed border-[#1a1716]/20 rounded-sm">
          <Palette className="w-8 h-8 text-[#1a1716]/30 mx-auto mb-2" />
          <p className="text-xs font-mono text-[#1a1716]/70 uppercase font-semibold">
            No color variants configured
          </p>
          <p className="text-[11px] text-[#1a1716]/50 max-w-md mx-auto mt-1">
            This product will sell as a single standard item. If this item has colors (like wires, switches, pipes, cables), click a popular color above or add a custom variant.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant, index) => {
            const isExpanded = expandedIndex === index;
            const swatchStyle = getColorSwatchStyle(variant.color || variant.name || '', variant.hex);
            const colorInfo = getColorInfo(variant.color || variant.name || '', variant.hex);
            const variantPrice = variant.price !== null && variant.price !== undefined ? variant.price : basePrice;
            const variantMrp = variant.mrp !== null && variant.mrp !== undefined ? variant.mrp : baseMrp;
            const priceDiff = variantPrice - basePrice;
            const imagesCount = (variant.image_urls || []).length;

            return (
              <div
                key={`${variant.color}-${index}`}
                className={`bg-white border transition-all rounded-sm shadow-2xs ${
                  isExpanded ? 'border-[#2e4a3d] ring-1 ring-[#2e4a3d]/20' : 'border-[#1a1716]/15 hover:border-[#1a1716]/30'
                }`}
              >
                {/* Variant Header Row */}
                <div className="p-3 flex flex-wrap items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-3">
                    {/* Swatch Dot */}
                    <div
                      className={`w-6 h-6 rounded-full shrink-0 shadow-xs flex items-center justify-center ${
                        colorInfo.isLight ? 'border border-slate-300' : ''
                      }`}
                      style={swatchStyle}
                      title={`Hex: ${colorInfo.hex}`}
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1a1716] tracking-tight">
                          {variant.color || variant.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#1a1716]/50 px-1.5 py-0.2 rounded-xs bg-[#f2efeb]">
                          {variant.hex || colorInfo.hex}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-[#1a1716]/70 mt-0.5">
                        <span>
                          Price: <strong className="text-[#2e4a3d]">₹{variantPrice.toLocaleString('en-IN')}</strong>
                          {basePrice > 0 && priceDiff !== 0 && (
                            <span className={`ml-1 text-[10px] font-bold ${priceDiff > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                              ({priceDiff > 0 ? `+₹${priceDiff}` : `-₹${Math.abs(priceDiff)}`} vs base)
                            </span>
                          )}
                        </span>

                        {variantMrp && variantMrp > variantPrice && (
                          <span className="text-slate-400 line-through text-[11px]">
                            MRP: ₹{variantMrp.toLocaleString('en-IN')}
                          </span>
                        )}

                        {variant.discount_percent ? (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-xs">
                            {variant.discount_percent}% OFF
                          </span>
                        ) : null}

                        <span className="text-[11px] text-[#1a1716]/60 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {imagesCount} {imagesCount === 1 ? 'photo' : 'photos'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2">
                    {/* Thumbnail previews */}
                    {variant.image_urls && variant.image_urls.length > 0 && (
                      <div className="hidden md:flex items-center gap-1">
                        {variant.image_urls.slice(0, 3).map((url, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={url}
                            alt=""
                            className="w-7 h-7 object-cover rounded-xs border border-slate-200"
                          />
                        ))}
                        {variant.image_urls.length > 3 && (
                          <span className="text-[10px] font-mono text-slate-400">
                            +{variant.image_urls.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDuplicateVariant(index)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-sm transition cursor-pointer"
                      title="Duplicate this variant"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition cursor-pointer"
                      title="Delete variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                      className="px-2.5 py-1 bg-[#f2efeb] hover:bg-slate-200 text-[#1a1716] text-xs font-mono uppercase tracking-wider rounded-sm transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Close' : 'Configure'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Configuration Drawer */}
                {isExpanded && (
                  <div className="p-4 border-t border-[#1a1716]/10 bg-[#f9f8f6] space-y-4 animate-in fade-in duration-150">
                    {/* Color Name & Hex Customization */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#1a1716]/70 mb-1">
                          Color Name
                        </label>
                        <input
                          type="text"
                          value={variant.color || variant.name || ''}
                          onChange={(e) => handleUpdateVariant(index, { color: e.target.value })}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#1a1716]/70 mb-1">
                          Swatch Hex Code
                        </label>
                        <div className="flex items-center gap-2 bg-white px-2 py-1 border border-[#1a1716]/20 rounded-sm">
                          <input
                            type="color"
                            value={variant.hex || colorInfo.hex}
                            onChange={(e) => handleUpdateVariant(index, { hex: e.target.value })}
                            className="w-5 h-5 rounded-full border-0 p-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={variant.hex || colorInfo.hex}
                            onChange={(e) => handleUpdateVariant(index, { hex: e.target.value })}
                            className="w-full text-xs font-mono bg-transparent focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Selling Price */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#1a1716]/70 mb-1 flex items-center justify-between">
                          <span>Selling Price (₹)</span>
                          <span className="text-[10px] text-slate-400">Base: ₹{basePrice}</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder={`Base: ${basePrice}`}
                          value={variant.price !== null && variant.price !== undefined ? variant.price : ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : Number(e.target.value);
                            handleUpdateVariant(index, { price: val });
                          }}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d] font-mono font-semibold"
                        />
                      </div>
                    </div>

                    {/* MRP & Discount */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#1a1716]/70 mb-1 flex items-center justify-between">
                          <span>MRP (₹) (Optional)</span>
                          <span className="text-[10px] text-slate-400">Base: {baseMrp ? `₹${baseMrp}` : 'None'}</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder={baseMrp ? `Base MRP: ${baseMrp}` : 'e.g. 2100'}
                          value={variant.mrp !== null && variant.mrp !== undefined ? variant.mrp : ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : Number(e.target.value);
                            handleUpdateVariant(index, { mrp: val });
                          }}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#1a1716]/70 mb-1">
                          Calculated Discount
                        </label>
                        <div className="px-3 py-1.5 bg-white border border-[#1a1716]/20 rounded-sm text-xs font-mono flex items-center justify-between">
                          <span className="text-slate-600">Calculated on Save:</span>
                          <span className="font-bold text-[#2e4a3d]">
                            {variant.discount_percent ? `${variant.discount_percent}% OFF` : 'None'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Linked Photos Section */}
                    <div className="pt-2 border-t border-[#1a1716]/10 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#1a1716] flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-[#2e4a3d]" />
                            Linked Photos for {variant.color}
                          </span>
                          <p className="text-[11px] text-[#1a1716]/60">
                            When customer taps this swatch on Gr storefront, the gallery will immediately switch to these photos.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Pick from product gallery */}
                          {productImages.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setImagePickerVariantIndex(
                                  imagePickerVariantIndex === index ? null : index
                                )
                              }
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-[#1a1716]/20 text-xs font-mono rounded-sm transition flex items-center gap-1 cursor-pointer"
                            >
                              <Layers className="w-3.5 h-3.5 text-[#2e4a3d]" />
                              <span>Select from Gallery ({productImages.length})</span>
                            </button>
                          )}

                          {/* Direct upload */}
                          <label className="px-2.5 py-1 bg-[#2e4a3d] hover:bg-[#2e4a3d]/90 text-white text-xs font-mono uppercase tracking-wider rounded-sm transition flex items-center gap-1 cursor-pointer">
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>{uploadingIndex === index ? 'Uploading...' : 'Upload Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingIndex === index}
                              onChange={(e) => handleVariantFileUpload(index, e.target.files)}
                              className="hidden"
                            />
                          </label>

                          {/* URL button */}
                          <button
                            type="button"
                            onClick={() => setUrlInputIndex(urlInputIndex === index ? null : index)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-[#1a1716]/20 text-xs font-mono rounded-sm transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>Paste URL</span>
                          </button>
                        </div>
                      </div>

                      {/* URL input drawer */}
                      {urlInputIndex === index && (
                        <div className="flex items-center gap-2 p-2 bg-white border border-[#1a1716]/15 rounded-sm">
                          <input
                            type="url"
                            placeholder="https://example.com/red-wire.jpg"
                            value={manualUrl}
                            onChange={(e) => setManualUrl(e.target.value)}
                            className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddManualUrl(index)}
                            className="px-3 py-1 bg-[#2e4a3d] text-white text-xs font-mono rounded-sm font-semibold cursor-pointer"
                          >
                            Attach
                          </button>
                          <button
                            type="button"
                            onClick={() => setUrlInputIndex(null)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Select from existing gallery drawer */}
                      {imagePickerVariantIndex === index && productImages.length > 0 && (
                        <div className="p-3 bg-white border border-[#2e4a3d]/30 rounded-sm space-y-2 animate-in fade-in duration-100">
                          <div className="flex items-center justify-between text-[11px] font-mono text-[#1a1716]/70">
                            <span>Click any image to attach/detach from {variant.color}:</span>
                            <button
                              type="button"
                              onClick={() => setImagePickerVariantIndex(null)}
                              className="text-slate-400 hover:text-slate-600 text-xs"
                            >
                              Done
                            </button>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {productImages.map((imgUrl, imgIdx) => {
                              const isAttached = (variant.image_urls || []).includes(imgUrl);
                              return (
                                <button
                                  key={imgIdx}
                                  type="button"
                                  onClick={() => handleToggleGalleryImage(index, imgUrl)}
                                  className={`relative aspect-square rounded-sm overflow-hidden border-2 transition cursor-pointer group ${
                                    isAttached
                                      ? 'border-[#2e4a3d] ring-2 ring-[#2e4a3d]/30'
                                      : 'border-slate-200 opacity-60 hover:opacity-100'
                                  }`}
                                >
                                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                  {isAttached && (
                                    <div className="absolute top-1 right-1 w-4 h-4 bg-[#2e4a3d] rounded-full text-white flex items-center justify-center shadow-xs">
                                      <Check className="w-2.5 h-2.5" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Currently linked thumbnails for this variant */}
                      {(variant.image_urls || []).length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(variant.image_urls || []).map((imgUrl, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative group w-16 h-16 rounded-sm overflow-hidden border border-slate-300 bg-white shadow-2xs"
                            >
                              <img
                                src={imgUrl}
                                alt={`${variant.color} ${imgIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {imgIdx === 0 && (
                                <span className="absolute bottom-0 left-0 right-0 bg-[#2e4a3d]/90 text-white text-[9px] font-mono text-center py-0.2">
                                  Primary
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedUrls = (variant.image_urls || []).filter(
                                    (_, i) => i !== imgIdx
                                  );
                                  handleUpdateVariant(index, {
                                    image_urls: updatedUrls,
                                    image_url: updatedUrls[0] || undefined,
                                  });
                                }}
                                className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-rose-600 text-white rounded-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                title="Remove photo from variant"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-white border border-dashed border-slate-200 text-center rounded-sm">
                          <p className="text-[11px] text-slate-400 font-mono">
                            No specific photos attached to {variant.color}. It will fallback to the main product images.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
