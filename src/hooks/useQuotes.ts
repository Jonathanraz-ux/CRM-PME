/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { Quote, QuoteItem } from '../types';
import { toQuote, fromQuote, QuoteRow, QuoteItemRow } from '../lib/mappers';

export interface UseQuotesResult {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createQuote: (data: Omit<Quote, 'id' | 'quoteNumber' | 'sentAt'>) => Promise<Quote | null>;
  updateQuote: (quote: Quote) => Promise<Quote | null>;
  deleteQuote: (id: string) => Promise<void>;
}

const buildQuoteNumber = (count: number) =>
  `DEV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

const writeItems = async (quoteId: string, items: QuoteItem[]) => {
  if (items.length === 0) return;
  const rows = items.map((i) => ({
    quote_id: quoteId,
    description: i.description,
    quantity: i.quantity,
    unit_price: i.unitPrice
  }));
  const { error } = await supabase.from('quote_items').insert(rows);
  if (error) throw error;
};

export function useQuotes(): UseQuotesResult {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const refresh = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('quotes')
      .select('*, quote_items(*)')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      return;
    }
    setQuotes((data ?? []).map(toQuote));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: err } = await supabase
        .from('quotes')
        .select('*, quote_items(*)')
        .order('created_at', { ascending: false });

      if (!active) return;
      if (err) {
        setError(err.message);
      } else {
        setQuotes((data ?? []).map(toQuote));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const createQuote = useCallback(
    async (data: Omit<Quote, 'id' | 'quoteNumber' | 'sentAt'>) => {
      const quoteNumber = buildQuoteNumber(quotes.length);
      const sentAt = data.status === 'SENT' ? new Date().toISOString() : '';
      const insert = fromQuote(data, quoteNumber, sentAt);

      const { data: created, error: err } = await supabase
        .from('quotes')
        .insert({
          quote_number: insert.quote_number,
          company_name: insert.company_name,
          contact_name: insert.contact_name,
          title: insert.title,
          tax_rate: insert.tax_rate,
          status: insert.status,
          sent_at: insert.sent_at,
          valid_until: insert.valid_until,
          notes: insert.notes,
          created_by: userId
        })
        .select('*, quote_items(*)')
        .single();

      if (err) {
        setError(err.message);
        return null;
      }

      try {
        await writeItems((created as QuoteRow).id, data.items);
      } catch (e: any) {
        setError(e.message);
        return null;
      }

      const { data: full, error: fetchErr } = await supabase
        .from('quotes')
        .select('*, quote_items(*)')
        .eq('id', (created as QuoteRow).id)
        .single();

      if (fetchErr) {
        setError(fetchErr.message);
        return null;
      }

      const quote = toQuote(full as QuoteRow);
      setQuotes((prev) => [quote, ...prev]);
      return quote;
    },
    [quotes.length, userId]
  );

  const updateQuote = useCallback(async (quote: Quote) => {
    const sentAt = quote.status === 'SENT' && !quote.sentAt
      ? new Date().toISOString()
      : quote.sentAt;

    const { error: err } = await supabase
      .from('quotes')
      .update({
        quote_number: quote.quoteNumber,
        company_name: quote.companyName,
        contact_name: quote.contactName,
        title: quote.title,
        tax_rate: quote.taxRate,
        status: quote.status,
        sent_at: sentAt || null,
        valid_until: quote.validUntil || null,
        notes: quote.notes ?? null
      })
      .eq('id', quote.id);

    if (err) {
      setError(err.message);
      return null;
    }

    // Re-sync the line items (delete + re-insert)
    const { error: delErr } = await supabase
      .from('quote_items')
      .delete()
      .eq('quote_id', quote.id);
    if (delErr) {
      setError(delErr.message);
      return null;
    }
    try {
      await writeItems(
        quote.id,
        quote.items.map((i) => ({ ...i }))
      );
    } catch (e: any) {
      setError(e.message);
      return null;
    }

    const { data: full, error: fetchErr } = await supabase
      .from('quotes')
      .select('*, quote_items(*)')
      .eq('id', quote.id)
      .single();

    if (fetchErr) {
      setError(fetchErr.message);
      return null;
    }

    const updated = toQuote(full as QuoteRow);
    setQuotes((prev) => prev.map((q) => (q.id === quote.id ? updated : q)));
    return updated;
  }, []);

  const deleteQuote = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('quotes').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  }, []);

  return { quotes, loading, error, refresh, createQuote, updateQuote, deleteQuote };
}
