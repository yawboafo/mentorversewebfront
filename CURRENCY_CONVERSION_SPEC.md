# Currency Conversion Specification

## Overview
MentorVerse needs to display prices in the viewer's local currency, not the mentor's currency. This provides a better user experience for international mentees.

## Architecture Decision
**Backend handles currency conversion** ✅

## Backend Requirements

### 1. Content Storage
Store content with mentor's base currency:
```json
{
  "title": "Web Development Masterclass",
  "price": 100,
  "base_currency": "USD",
  "mentor_id": "123"
}
```

### 2. User Profile
Ensure user country/currency is stored:
```json
{
  "user_id": "456",
  "country": "GH",
  "preferred_currency": "GHS"
}
```

### 3. Content Response (GET /content/{id})
When returning content, convert price based on viewer's location:

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "content-123",
  "title": "Web Development Masterclass",
  "base_price": 100,
  "base_currency": "USD",
  "display_price": 1650.00,
  "display_currency": "GHS",
  "conversion_rate": 16.5,
  "conversion_date": "2025-11-23T10:00:00Z",
  "... other fields ..."
}
```

**Fields:**
- `base_price`: Original price set by mentor
- `base_currency`: Mentor's currency (e.g., "USD")
- `display_price`: Converted price for the current viewer
- `display_currency`: Viewer's local currency (from their profile)
- `conversion_rate`: Exchange rate used
- `conversion_date`: When rate was fetched (for transparency)

### 4. Content List (GET /content)
Same conversion logic applies to listing endpoints.

### 5. Checkout (POST /payments/checkout)
```json
{
  "content_id": "content-123",
  "payment_currency": "GHS",
  "amount": 1650.00,
  "base_currency": "USD",
  "base_amount": 100.00
}
```

## Currency Conversion Service

### Recommended APIs:
1. **Free Tier:**
   - [exchangerate-api.com](https://www.exchangerate-api.com/) (1,500 requests/month free)
   - [fixer.io](https://fixer.io/) (100 requests/month free)

2. **Paid (Production):**
   - [XE Currency Data API](https://www.xe.com/xecurrencydata/)
   - [Open Exchange Rates](https://openexchangerates.org/)

### Implementation:
```python
# Example backend pseudocode
def get_content_with_user_currency(content_id, user_id):
    content = get_content(content_id)
    user = get_user(user_id)
    
    if user.country == content.mentor.country:
        # Same currency, no conversion needed
        return {
            **content,
            "display_price": content.price,
            "display_currency": content.base_currency
        }
    
    # Get conversion rate
    rate = get_exchange_rate(
        from_currency=content.base_currency,
        to_currency=user.preferred_currency
    )
    
    return {
        **content,
        "base_price": content.price,
        "base_currency": content.base_currency,
        "display_price": content.price * rate,
        "display_currency": user.preferred_currency,
        "conversion_rate": rate,
        "conversion_date": datetime.now()
    }
```

### Rate Caching:
- Cache exchange rates for 1-6 hours
- Update daily for consistency
- Use middleware to inject user currency into all content responses

## Frontend Implementation

### 1. Update Type Definition
```typescript
export interface Content {
  // ... existing fields ...
  base_price?: number;          // Original price
  base_currency?: string;       // Original currency
  price: number;                // Display price (converted)
  currency: string;             // Display currency
  display_price?: number;       // Alias for price
  display_currency?: string;    // Alias for currency
  conversion_rate?: number;     // Exchange rate used
  conversion_date?: string;     // When rate was fetched
}
```

### 2. Currency Formatter Utility
```typescript
// lib/utils/currency.ts
export function formatCurrency(amount: number, currency: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// Show both currencies if converted
export function formatPriceWithOriginal(content: Content): string {
  const displayPrice = formatCurrency(content.price, content.currency);
  
  if (content.base_currency && content.base_currency !== content.currency) {
    const basePrice = formatCurrency(content.base_price!, content.base_currency);
    return `${displayPrice} (${basePrice})`;
  }
  
  return displayPrice;
}
```

### 3. Display in UI
```tsx
// Show converted price prominently
<div>
  <p className="text-3xl font-bold">
    {formatCurrency(content.price, content.currency)}
  </p>
  
  {/* Show original price if converted */}
  {content.base_currency && content.base_currency !== content.currency && (
    <p className="text-sm text-muted-foreground">
      Original price: {formatCurrency(content.base_price, content.base_currency)}
    </p>
  )}
</div>
```

## Example User Flows

### Scenario 1: US Mentor → Ghana Mentee
1. **Mentor (Emma in USA)** creates course: $100 USD
2. **Backend stores:** `price: 100, base_currency: "USD"`
3. **Mentee (in Ghana)** views course
4. **Backend detects:** User country = "GH", preferred currency = "GHS"
5. **Backend converts:** 100 USD × 16.5 = 1,650 GHS
6. **Frontend displays:** "GHS 1,650.00" (with "Original: $100 USD" below)

### Scenario 2: Ghana Mentor → US Mentee
1. **Mentor (in Ghana)** creates course: GHS 1,650
2. **Backend stores:** `price: 1650, base_currency: "GHS"`
3. **Mentee (in USA)** views course
4. **Backend converts:** 1650 GHS ÷ 16.5 = $100 USD
5. **Frontend displays:** "$100.00" (with "Original: GHS 1,650" below)

## Currency Support

### Priority Currencies:
1. **USD** - United States Dollar
2. **GHS** - Ghanaian Cedi
3. **EUR** - Euro
4. **GBP** - British Pound
5. **NGN** - Nigerian Naira
6. **ZAR** - South African Rand
7. **KES** - Kenyan Shilling

### Country → Currency Mapping:
```json
{
  "US": "USD",
  "GH": "GHS",
  "NG": "NGN",
  "ZA": "ZAR",
  "KE": "KES",
  "GB": "GBP",
  "DE": "EUR",
  "FR": "EUR"
}
```

## Payment Processing

### Stripe Currency Support:
- Stripe supports 135+ currencies
- Payment must be in the currency the customer sees
- Pass `display_currency` and `display_price` to Stripe checkout

### Mentor Payouts:
- Pay mentors in their base currency
- Platform handles conversion fees
- Clearly communicate exchange rates and fees

## Future Enhancements

1. **Manual Currency Selection:**
   - Allow users to temporarily view prices in different currencies
   - "View in USD | GHS | EUR"

2. **Price Recommendations:**
   - Suggest optimal pricing for different regions
   - Show median prices in viewer's currency

3. **Dynamic Pricing:**
   - Mentors set different prices per region
   - Purchasing power parity adjustments

4. **Currency Alerts:**
   - Notify mentors when exchange rates change significantly
   - Auto-adjust prices based on rules

## Testing Requirements

### Backend Tests:
- [ ] Content returns correct currency for US user
- [ ] Content returns correct currency for GH user
- [ ] Same currency (no conversion) works
- [ ] Invalid currency code handling
- [ ] Exchange rate API failure fallback
- [ ] Rate caching works correctly

### Frontend Tests:
- [ ] Currency formatter handles all supported currencies
- [ ] Original price shown when converted
- [ ] Same currency doesn't show duplicate
- [ ] Invalid currency shows fallback format

## Migration Plan

### Phase 1: Backend (Week 1)
1. Add currency conversion service
2. Update content endpoints to return display currency
3. Add conversion rate caching
4. Update API documentation

### Phase 2: Frontend (Week 1)
1. Update Content type definition
2. Add currency formatter utility
3. Update all price displays
4. Add "original price" display

### Phase 3: Testing (Week 2)
1. Test all currency combinations
2. Test with real users in different countries
3. Monitor conversion accuracy
4. Gather feedback

### Phase 4: Payments (Week 2)
1. Update checkout to use display currency
2. Test Stripe integration with multiple currencies
3. Verify mentor payouts work correctly

## Backend API Changes Needed

### 1. GET /content/{id}
**Add to response:**
```json
{
  "display_price": 1650.00,
  "display_currency": "GHS",
  "conversion_rate": 16.5,
  "conversion_date": "2025-11-23T10:00:00Z"
}
```

### 2. GET /content (list)
**Same additions to each content item**

### 3. GET /me (user profile)
**Ensure returns:**
```json
{
  "country": "GH",
  "preferred_currency": "GHS"
}
```

### 4. POST /content (create)
**Accept base currency from mentor:**
```json
{
  "price": 100,
  "currency": "USD"  // Mentor's currency
}
```

---

**Status:** Ready for Backend Implementation
**Priority:** High
**Estimated Effort:** 2 weeks (Backend + Frontend)
