# Backend Implementation Required: Currency Conversion

## Summary
Frontend is now ready to display prices in user's local currency. Backend needs to implement currency conversion logic based on user location.

## What Works Now
✅ Frontend types support currency conversion fields
✅ Currency formatter utility created
✅ Price display component handles both original and converted prices
✅ Frontend no longer hardcodes USD

## What Backend Needs to Do

### 1. Store User's Preferred Currency
Ensure user profile includes:
```json
{
  "country": "GH",
  "preferred_currency": "GHS"
}
```

Get currency from country when user registers/updates profile.

### 2. Update Content Endpoints

#### GET /content/{id}
**Current Response:**
```json
{
  "price": 100,
  "currency": "USD"
}
```

**New Response (when viewer is from Ghana):**
```json
{
  "price": 100,
  "currency": "USD",
  "display_price": 1650.00,
  "display_currency": "GHS",
  "conversion_rate": 16.5,
  "conversion_date": "2025-11-23T10:00:00Z"
}
```

**Logic:**
1. Get viewer's country/currency from JWT token
2. If viewer currency ≠ content currency:
   - Fetch exchange rate (cache for 6 hours)
   - Calculate display_price = price × rate
   - Add conversion fields to response
3. If same currency:
   - Just return price and currency as before

#### GET /content (list endpoint)
Apply same logic to all content items in the list.

### 3. POST /content (create)
**Current Request:**
```json
{
  "price": 100,
  "currency": "USD"  // hardcoded by frontend
}
```

**New Approach:**
- Frontend sends: `{ "price": 100 }` (no currency)
- Backend gets mentor's country from profile
- Backend sets currency based on mentor's location:
  - US mentor → USD
  - Ghana mentor → GHS
  - etc.

### 4. Implement Exchange Rate Service

**Recommended Free API:**
- https://exchangerate-api.com/ (1,500 requests/month free)

**Pseudo Code:**
```python
import requests
from datetime import datetime, timedelta

# Cache rates for 6 hours
RATE_CACHE = {}
CACHE_DURATION = timedelta(hours=6)

def get_exchange_rate(from_currency, to_currency):
    cache_key = f"{from_currency}_{to_currency}"
    
    # Check cache
    if cache_key in RATE_CACHE:
        cached_rate, cached_time = RATE_CACHE[cache_key]
        if datetime.now() - cached_time < CACHE_DURATION:
            return cached_rate
    
    # Fetch new rate
    url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
    response = requests.get(url)
    data = response.json()
    
    rate = data['rates'][to_currency]
    
    # Cache it
    RATE_CACHE[cache_key] = (rate, datetime.now())
    
    return rate

def add_currency_conversion(content, user):
    """Add currency conversion to content response"""
    
    # Same currency - no conversion needed
    if content.currency == user.preferred_currency:
        return content
    
    # Get rate and convert
    rate = get_exchange_rate(content.currency, user.preferred_currency)
    
    return {
        **content,
        "display_price": content.price * rate,
        "display_currency": user.preferred_currency,
        "conversion_rate": rate,
        "conversion_date": datetime.now().isoformat(),
        # Keep original for reference
        "base_price": content.price,
        "base_currency": content.currency
    }
```

### 5. Country → Currency Mapping

```python
COUNTRY_CURRENCY = {
    'US': 'USD',
    'GH': 'GHS',
    'NG': 'NGN',
    'ZA': 'ZAR',
    'KE': 'KES',
    'GB': 'GBP',
    'DE': 'EUR',
    'FR': 'EUR',
    'ES': 'EUR',
    'IT': 'EUR',
    # Add more as needed
}

def get_currency_from_country(country_code):
    return COUNTRY_CURRENCY.get(country_code, 'USD')
```

### 6. Payments Integration

When user checkouts:
```json
{
  "content_id": "123",
  "amount": 1650.00,
  "currency": "GHS",
  "base_amount": 100.00,
  "base_currency": "USD"
}
```

Stripe should charge in `currency` (GHS), not base_currency.

### 7. Mentor Payouts

Pay mentors in their original currency (base_currency).
Store conversion rate used at time of purchase for accounting.

## Testing Checklist

- [ ] US mentor creates content for $100 USD
- [ ] Ghana user views content → sees ₵1,650 GHS
- [ ] Ghana user views content → sees "Original: $100 USD"
- [ ] US user views same content → sees $100 USD (no conversion)
- [ ] Exchange rates cached for 6 hours
- [ ] Invalid currency codes handled gracefully
- [ ] Content list endpoint includes conversion
- [ ] Checkout uses correct currency
- [ ] Mentor receives payout in their currency

## Priority

**HIGH** - Blocks international user experience

## Estimated Effort

- Exchange rate service: 4 hours
- Content endpoints update: 3 hours
- Testing: 2 hours
- **Total: ~1 day**

## Questions for Backend Team?

1. Do you prefer a different exchange rate API?
2. Should we support manual currency selection (override)?
3. Any concerns about Stripe multi-currency support?

---

## UPDATE: BACKEND IMPLEMENTATION COMPLETE (v2.7.0)

✅ **Backend Status:** Complete (deployed in v2.7.0)
✅ **Frontend Status:** Complete and updated

### Backend Implementation Summary (v2.7.0):
- ✅ Added `preferredCurrency` field to User model (auto-set from country)
- ✅ Content endpoints return converted prices for authenticated users
- ✅ Exchange rate integration with 6-hour caching (exchangerate-api.com)
- ✅ Payment checkout supports 50+ currencies
- ✅ Purchase tracking includes both base and converted amounts
- ✅ **BREAKING CHANGE**: POST /content no longer requires `currency` field (auto-set from mentor's country)
- ✅ Optional authentication on content endpoints for currency conversion

### Frontend Updates Applied:
- ✅ User type updated with `preferred_currency` field
- ✅ Content creation form no longer sends currency (backend auto-sets)
- ✅ AI builder already using new pattern
- ✅ PriceDisplay component ready for converted prices
- ✅ Currency utilities fully implemented

### How It Works Now:
1. **User Registration/Profile**: Backend auto-sets `preferredCurrency` from user's country
2. **Content Creation**: Mentors set price only - currency auto-set from mentor's country
3. **Content Viewing**: 
   - Authenticated: Backend returns converted prices in user's currency
   - Unauthenticated: Shows base price and currency
4. **Checkout**: Stripe charges in user's local currency
5. **Payouts**: Mentors receive payment in their original currency

**No Further Backend Work Required** ✅
