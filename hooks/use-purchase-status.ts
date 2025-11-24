import { useEffect, useState } from 'react';
import { purchasesApi, Purchase } from '@/lib/api/purchases';

export function usePurchaseStatus(contentId: string | null) {
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    const checkPurchase = async () => {
      if (!contentId) {
        setLoading(false);
        return;
      }

      try {
        const purchases = await purchasesApi.getMyPurchases();
        const matchingPurchase = purchases.find(
          (p: Purchase) => p.contentId === contentId && p.status === 'paid'
        );
        
        setIsPurchased(!!matchingPurchase);
        setPurchase(matchingPurchase || null);
      } catch (error) {
        console.error('Failed to check purchase status:', error);
        setIsPurchased(false);
        setPurchase(null);
      } finally {
        setLoading(false);
      }
    };

    checkPurchase();
  }, [contentId]);

  return { isPurchased, loading, purchase };
}
