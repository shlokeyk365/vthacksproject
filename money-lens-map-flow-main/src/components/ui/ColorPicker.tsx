import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Palette, Check } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

// Predefined color palettes
const colorPalettes = [
  // Financial & Professional
  { name: 'Financial Blue', colors: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'] },
  { name: 'Success Green', colors: ['#10B981', '#059669', '#047857', '#065F46'] },
  { name: 'Warning Orange', colors: ['#F59E0B', '#D97706', '#B45309', '#92400E'] },
  { name: 'Danger Red', colors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'] },
  
  // Modern & Creative
  { name: 'Purple Premium', colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'] },
  { name: 'Teal Modern', colors: ['#14B8A6', '#0D9488', '#0F766E', '#115E59'] },
  { name: 'Pink Elegant', colors: ['#EC4899', '#DB2777', '#BE185D', '#9D174D'] },
  { name: 'Indigo Deep', colors: ['#6366F1', '#4F46E5', '#4338CA', '#3730A3'] },
  
  // Earth & Nature
  { name: 'Forest Green', colors: ['#22C55E', '#16A34A', '#15803D', '#166534'] },
  { name: 'Ocean Blue', colors: ['#06B6D4', '#0891B2', '#0E7490', '#155E75'] },
  { name: 'Sunset Orange', colors: ['#F97316', '#EA580C', '#DC2626', '#B91C1C'] },
  { name: 'Earth Brown', colors: ['#A3A3A3', '#737373', '#525252', '#404040'] },
  
  // Monochrome
  { name: 'Slate Gray', colors: ['#64748B', '#475569', '#334155', '#1E293B'] },
  { name: 'Neutral Gray', colors: ['#6B7280', '#4B5563', '#374151', '#1F2937'] },
  { name: 'Warm Gray', colors: ['#78716C', '#57534E', '#44403C', '#292524'] },
  { name: 'Cool Gray', colors: ['#6B7280', '#4B5563', '#374151', '#1F2937'] }
];

// Convert hex to HSL
function hexToHsl(hex: string): string {
  // Normalize hex input
  let normalizedHex = hex;
  if (hex.startsWith('#')) {
    normalizedHex = hex.slice(1);
  }
  
  // Handle 3-digit hex
  if (normalizedHex.length === 3) {
    normalizedHex = normalizedHex.split('').map(char => char + char).join('');
  }
  
  // Validate hex format
  if (!/^[A-Fa-f0-9]{6}$/.test(normalizedHex)) {
    throw new Error('Invalid hex color format');
  }
  
  const r = parseInt(normalizedHex.slice(0, 2), 16) / 255;
  const g = parseInt(normalizedHex.slice(2, 4), 16) / 255;
  const b = parseInt(normalizedHex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Convert HSL to hex
function hslToHex(hsl: string): string {
  // Handle both "h s% l%" and "h s l" formats
  const parts = hsl.split(' ');
  if (parts.length !== 3) {
    throw new Error('Invalid HSL format');
  }
  
  const h = parseInt(parts[0]);
  const s = parseFloat(parts[1].replace('%', '')) / 100;
  const l = parseFloat(parts[2].replace('%', '')) / 100;
  
  // Validate inputs
  if (isNaN(h) || isNaN(s) || isNaN(l)) {
    throw new Error('Invalid HSL values');
  }
  
  if (h < 0 || h >= 360 || s < 0 || s > 1 || l < 0 || l > 1) {
    throw new Error('HSL values out of range');
  }
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, (n + m) * 255))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexValue, setHexValue] = useState('');
  const [isValidHex, setIsValidHex] = useState(true);

  // Convert HSL to hex for display
  useEffect(() => {
    try {
      const hex = hslToHex(value);
      setHexValue(hex);
      setIsValidHex(true);
    } catch (error) {
      // If conversion fails, try to use the value as hex directly
      if (value.startsWith('#')) {
        setHexValue(value);
        setIsValidHex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value));
      } else {
        // Only fallback to blue if we can't determine what the value is
        setHexValue('#3B82F6');
        setIsValidHex(false);
      }
    }
  }, [value]);

  const handleHexChange = (hex: string) => {
    setHexValue(hex);
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const isValid = hexPattern.test(hex);
    setIsValidHex(isValid);
    
    if (isValid) {
      const hsl = hexToHsl(hex);
      onChange(hsl);
    }
  };

  const handleColorSelect = (color: string) => {
    const hsl = hexToHsl(color);
    onChange(hsl);
    setHexValue(color);
    setIsValidHex(true);
  };

  return (
    <div className={className}>
      {label && <Label className="text-sm font-medium mb-2 block">{label}</Label>}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: `hsl(${value})` }}
            />
            <span className="truncate">
              {hexValue} {!isValidHex && '(Invalid)'}
            </span>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Choose Color
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Hex Input */}
            <div>
              <Label htmlFor="hex-input">Hex Code</Label>
              <div className="flex gap-2">
                <Input
                  id="hex-input"
                  value={hexValue}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#3B82F6"
                  className={!isValidHex ? 'border-red-500' : ''}
                />
                <Button
                  size="sm"
                  onClick={() => handleColorSelect(hexValue)}
                  disabled={!isValidHex}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
              {!isValidHex && (
                <p className="text-xs text-red-500 mt-1">Invalid hex color</p>
              )}
            </div>

            {/* Color Palettes */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Color Palettes</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {colorPalettes.map((palette, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">{palette.name}</p>
                    <div className="flex gap-1">
                      {palette.colors.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          onClick={() => handleColorSelect(color)}
                          className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-all hover:scale-110"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Colors */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Quick Colors</Label>
              <div className="grid grid-cols-8 gap-1">
                {[
                  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
                  '#8B5CF6', '#14B8A6', '#EC4899', '#6366F1',
                  '#22C55E', '#06B6D4', '#F97316', '#A3A3A3',
                  '#64748B', '#6B7280', '#78716C', '#6B7280'
                ].map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(color)}
                    className="w-6 h-6 rounded border border-border hover:border-primary transition-all hover:scale-110"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
