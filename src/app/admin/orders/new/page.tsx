'use client';

import React from 'react';
import DocumentForm from '@/components/admin/DocumentForm';

export default function NewOrderPage() {
  return <DocumentForm mode="order" documentId="new" />;
}