# Currency Display Examples

## Using the PriceDisplay Component

### Basic Usage (No Conversion)
```tsx
import { PriceDisplay } from '@/components/ui/price-display';

// When backend hasn't implemented conversion yet
<PriceDisplay 
  price={100} 
  currency="USD" 
/>
// Shows: $100.00
```

### With Currency Conversion
```tsx
// When backend returns conversion fields
<PriceDisplay 
  price={1650}           // Converted price (what user pays)
  currency="GHS"         // User's local currency
  basePrice={100}        // Original price set by mentor
  baseCurrency="USD"     // Mentor's currency
  conversionRate={16.5}  // Exchange rate used
  conversionDate="2025-11-23T10:00:00Z"
  size="lg"
/>
// Shows: 
// ₵1,650.00 (large, bold)
// Original: $100.00 (small, muted)
// ℹ️ (hover shows conversion details)
```

### Size Variants
```tsx
<PriceDisplay price={100} currency="USD" size="sm" />  // Small
<PriceDisplay price={100} currency="USD" size="md" />  // Medium (default)
<PriceDisplay price={100} currency="USD" size="lg" />  // Large
<PriceDisplay price={100} currency="USD" size="xl" />  // Extra Large
```

### Hide Original Price
```tsx
<PriceDisplay 
  price={1650}
  currency="GHS"
  basePrice={100}
  baseCurrency="USD"
  showOriginal={false}  // Won't show "Original: $100 USD"
/>
```

### Compact Display (no conversion info)
```tsx
import { PriceDisplayCompact } from '@/components/ui/price-display';

<PriceDisplayCompact price={100} currency="USD" />
// Shows: $100.00 (inline, no extras)
```

## Using Currency Utilities Directly

### Format Currency
```tsx
import { formatCurrency } from '@/lib/utils/currency';

const price = formatCurrency(1650, 'GHS');
// Returns: "₵1,650.00"

const usdPrice = formatCurrency(100, 'USD', 'en-US');
// Returns: "$100.00"
```

### Format with Original Price
```tsx
import { formatPriceWithOriginal } from '@/lib/utils/currency';

const result = formatPriceWithOriginal(
  1650,    // display price
  'GHS',   // display currency
  100,     // base price
  'USD'    // base currency
);

console.log(result);
// {
//   display: "₵1,650.00",
//   original: "$100.00",
//   isConverted: true
// }
```

### Get Currency Info
```tsx
import { 
  getCurrencySymbol, 
  getCurrencyName, 
  getCountryCurrency 
} from '@/lib/utils/currency';

getCurrencySymbol('GHS');        // Returns: "₵"
getCurrencyName('GHS');          // Returns: "Ghanaian Cedi"
getCountryCurrency('GH');        // Returns: "GHS"
```

## Real-World Examples

### Content Card in List
```tsx
'use client';

import { PriceDisplayCompact } from '@/components/ui/price-display';
import { Content } from '@/lib/api/types';

export function ContentCard({ content }: { content: Content }) {
  return (
    <div className="border rounded-lg p-4">
      <h3>{content.title}</h3>
      <p>{content.description}</p>
      
      <div className="mt-4 flex items-center justify-between">
        <PriceDisplayCompact 
          price={content.display_price || content.price}
          currency={content.display_currency || content.currency}
          className="text-lg text-orange-600"
        />
        <Button>View</Button>
      </div>
    </div>
  );
}
```

### Content Detail Page
```tsx
'use client';

import { PriceDisplay } from '@/components/ui/price-display';
import { Content } from '@/lib/api/types';

export function ContentDetail({ content }: { content: Content }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1>{content.title}</h1>
      
      <Card className="mt-8">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Price</p>
          
          <PriceDisplay
            price={content.display_price || content.price}
            currency={content.display_currency || content.currency}
            basePrice={content.base_price}
            baseCurrency={content.base_currency}
            conversionRate={content.conversion_rate}
            conversionDate={content.conversion_date}
            size="xl"
          />
          
          <Button className="w-full mt-6" size="lg">
            Enroll Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Checkout Summary
```tsx
'use client';

import { formatCurrency, formatPriceWithOriginal } from '@/lib/utils/currency';
import { Content } from '@/lib/api/types';

export function CheckoutSummary({ content }: { content: Content }) {
  const price = formatPriceWithOriginal(
    content.display_price || content.price,
    content.display_currency || content.currency,
    content.base_price,
    content.base_currency
  );

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{price.display}</span>
        </div>
        
        {price.isConverted && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Original Price</span>
            <span>{price.original}</span>
          </div>
        )}
        
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{price.display}</span>
          </div>
        </div>
      </div>
      
      <Button className="w-full mt-6">
        Proceed to Payment
      </Button>
    </div>
  );
}
```

### Dashboard Revenue Display
```tsx
'use client';

import { formatCurrency } from '@/lib/utils/currency';

export function RevenueSummary({ sales }: { sales: any[] }) {
  const total = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const currency = sales[0]?.currency || 'USD';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">
          {formatCurrency(total, currency)}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {sales.length} sales
        </p>
      </CardContent>
    </Card>
  );
}
```

## Migration Guide for Existing Code

### Before (Hardcoded USD)
```tsx
<p className="text-3xl font-bold">
  ${content.price}
</p>
<p className="text-sm">USD</p>
```

### After (Backend conversion support)
```tsx
<PriceDisplay
  price={content.display_price || content.price}
  currency={content.display_currency || content.currency}
  basePrice={content.base_price}
  baseCurrency={content.base_currency}
  size="lg"
/>
```

### Before (Manual formatting)
```tsx
<span>${content.price.toFixed(2)}</span>
```

### After (Proper formatting)
```tsx
import { formatCurrency } from '@/lib/utils/currency';

<span>{formatCurrency(content.price, content.currency)}</span>
```

## Handling Missing Backend Fields

All components gracefully handle missing conversion fields:

```tsx
// If backend hasn't implemented conversion yet:
const content = {
  price: 100,
  currency: 'USD'
  // No display_price, display_currency, etc.
};

// This still works! Shows: $100.00
<PriceDisplay 
  price={content.display_price || content.price}
  currency={content.display_currency || content.currency}
  basePrice={content.base_price}
  baseCurrency={content.base_currency}
/>
```

## Testing

```tsx
// Test different currencies
<PriceDisplay price={100} currency="USD" />   // $100.00
<PriceDisplay price={1650} currency="GHS" />  // ₵1,650.00
<PriceDisplay price={100} currency="EUR" />   // €100.00
<PriceDisplay price={100} currency="GBP" />   // £100.00

// Test conversion
<PriceDisplay 
  price={1650} 
  currency="GHS" 
  basePrice={100} 
  baseCurrency="USD"
  conversionRate={16.5}
/>
```

## Best Practices

1. **Always use display_price/display_currency when available:**
   ```tsx
   price={content.display_price || content.price}
   currency={content.display_currency || content.currency}
   ```

2. **Pass conversion fields for transparency:**
   ```tsx
   basePrice={content.base_price}
   baseCurrency={content.base_currency}
   conversionRate={content.conversion_rate}
   ```

3. **Use appropriate sizes:**
   - `sm`: List items, compact displays
   - `md`: Cards, side panels
   - `lg`: Detail pages, headers
   - `xl`: Hero sections, featured items

4. **Use PriceDisplayCompact for inline prices:**
   ```tsx
   Starting at <PriceDisplayCompact price={49} currency="USD" />
   ```
