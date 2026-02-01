'use client';

import React, { use } from 'react'; // 1. Import 'use' hook
import DocumentForm from '@/components/admin/DocumentForm';

// 2. Type definition: params is now a Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvoicePage({ params }: PageProps) {
  // 3. Unwrap the params using React.use()
  const resolvedParams = use(params);
  
  // 4. Access the ID safely
  const decodedId = decodeURIComponent(resolvedParams.id);

  return (
    <div className="min-h-screen bg-[#121212]">
      <DocumentForm mode="invoice" documentId={decodedId} />
    </div>
  );
}