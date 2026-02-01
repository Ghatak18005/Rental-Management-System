'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface DiagnosticResult {
  step: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  data?: any;
}

export default function DiagnosticsPage() {
  const supabase = createClient();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: DiagnosticResult[] = [];

      try {
        // Step 1: Check authentication
        results.push({ step: 'Authentication', status: 'loading', message: 'Checking...' });
        setDiagnostics([...results]);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          results[0] = { 
            step: 'Authentication', 
            status: 'error', 
            message: 'Not authenticated. Please login first.',
            data: authError 
          };
          setDiagnostics([...results]);
          setRunning(false);
          return;
        }

        results[0] = { 
          step: 'Authentication', 
          status: 'success', 
          message: `Logged in as: ${user.email}`,
          data: user.id 
        };
        setDiagnostics([...results]);

        // Step 2: Check rental_orders table
        results.push({ step: 'Checking rental_orders table', status: 'loading', message: 'Fetching...' });
        setDiagnostics([...results]);

        const { data: orders, error: ordersError } = await supabase
          .from('rental_orders')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersError) {
          results[1] = {
            step: 'Checking rental_orders table',
            status: 'error',
            message: `Error: ${ordersError.message}`,
            data: ordersError
          };
        } else {
          results[1] = {
            step: 'Checking rental_orders table',
            status: 'success',
            message: `Found ${orders?.length || 0} orders`,
            data: orders
          };
        }
        setDiagnostics([...results]);

        // Step 3: Check for draft orders specifically
        results.push({ step: 'Checking draft orders', status: 'loading', message: 'Searching...' });
        setDiagnostics([...results]);

        const { data: draftOrders, error: draftError } = await supabase
          .from('rental_orders')
          .select('*')
          .eq('customer_id', user.id)
          .eq('status', 'draft')
          .maybeSingle();

        if (draftError) {
          results[2] = {
            step: 'Checking draft orders',
            status: 'error',
            message: `Error: ${draftError.message}`,
            data: draftError
          };
        } else {
          results[2] = {
            step: 'Checking draft orders',
            status: draftOrders ? 'success' : 'error',
            message: draftOrders ? `Found draft order: ${draftOrders.id}` : 'No draft order found',
            data: draftOrders
          };
        }
        setDiagnostics([...results]);

        // Step 4: Check rental_order_items table
        if (draftOrders) {
          results.push({ step: 'Checking rental_order_items table', status: 'loading', message: 'Fetching...' });
          setDiagnostics([...results]);

          const { data: items, error: itemsError } = await supabase
            .from('rental_order_items')
            .select('*')
            .eq('order_id', draftOrders.id);

          if (itemsError) {
            results[3] = {
              step: 'Checking rental_order_items table',
              status: 'error',
              message: `Error: ${itemsError.message}`,
              data: itemsError
            };
          } else {
            results[3] = {
              step: 'Checking rental_order_items table',
              status: items && items.length > 0 ? 'success' : 'error',
              message: items && items.length > 0 ? `Found ${items.length} items` : 'No items in draft order',
              data: items
            };
          }
          setDiagnostics([...results]);
        }

        // Step 5: Test insert (create a test item)
        if (draftOrders) {
          results.push({ step: 'Database connectivity test', status: 'loading', message: 'Testing insert...' });
          setDiagnostics([...results]);

          const testId = Math.random().toString(36).substring(7);
          const { error: testError } = await supabase
            .from('rental_order_items')
            .insert({
              order_id: draftOrders.id,
              product_id: testId,
              product_name: `Test Item ${testId}`,
              price: 0,
              quantity: 1
            });

          if (testError) {
            results[4] = {
              step: 'Database connectivity test',
              status: 'error',
              message: `Insert error: ${testError.message}`,
              data: testError
            };
          } else {
            results[4] = {
              step: 'Database connectivity test',
              status: 'success',
              message: 'Insert test successful - database is working',
              data: { testId }
            };
          }
          setDiagnostics([...results]);
        }

      } catch (error: any) {
        results.push({
          step: 'Unexpected error',
          status: 'error',
          message: error.message,
          data: error
        });
        setDiagnostics([...results]);
      }

      setRunning(false);
    };

    runDiagnostics();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">🔍 Cart Diagnostics</h1>

        <div className="space-y-4">
          {diagnostics.map((diag, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 ${
                diag.status === 'loading'
                  ? 'bg-blue-50 border-blue-300'
                  : diag.status === 'success'
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {diag.status === 'loading' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 flex-shrink-0 mt-0.5" />
                ) : diag.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{diag.step}</h3>
                  <p
                    className={
                      diag.status === 'success'
                        ? 'text-green-700'
                        : diag.status === 'error'
                        ? 'text-red-700'
                        : 'text-blue-700'
                    }
                  >
                    {diag.message}
                  </p>

                  {diag.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                        View details
                      </summary>
                      <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-64 text-gray-700">
                        {JSON.stringify(diag.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!running && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
              <li>If all checks pass with ✅, your cart should work</li>
              <li>If any check fails with ❌, note the error message and contact support</li>
              <li>Go to Dashboard and try adding an item to cart</li>
              <li>Then go to Cart page and click Refresh button</li>
              <li>Check browser console (F12) for detailed logs</li>
            </ol>
          </div>
        )}

        <button
          onClick={() => window.location.href = '/dashboard'}
          className="mt-8 w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
