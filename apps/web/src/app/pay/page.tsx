import { Suspense } from 'react';
import { CheckoutViewer } from '@/components/checkout/CheckoutViewer';

export const metadata = {
  title: 'Bitcoin Payment Request',
  description: 'Scan the QR code or copy the address to send Bitcoin.',
};

export default function PayPage() {
  return (
    <Suspense>
      <CheckoutViewer />
    </Suspense>
  );
}
