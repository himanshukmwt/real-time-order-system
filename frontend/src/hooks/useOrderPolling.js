import { useState, useEffect } from 'react';
import api from '../api/axios';

const POLL_INTERVAL_MS = 3000;
const TERMINAL_STATUSES = new Set(['DELIVERED', 'FAILED', 'CANCELLED']);

export default function useOrderPolling(orderId) {
  const [status, setStatus] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState(null);

  useEffect(() => {
    setStatus(null);
    setUpdatedAt(null);
    setError(null);

    if (!orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    let cancelled = false;
    let timer;

    const poll = async () => {
      let stop = false;

      try {
        const { data } = await api.get(`/orders/${orderId}/status`);
        if (cancelled) return;

        const { status: newStatus, updatedAt: newUpdatedAt } = data.data;
        setStatus(newStatus);
        setUpdatedAt(newUpdatedAt);
        setError(null);
        stop = TERMINAL_STATUSES.has(newStatus);
      } catch (err) {
        if (cancelled) return;

        setError(err.response?.data?.message || 'Failed to fetch order status');
        const code = err.response?.status;
        stop = code === 404 || code === 403; 
      } finally {
        if (!cancelled) setLoading(false);
      }

      if (!cancelled && !stop) {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId]);

  return { status, updatedAt, loading, error };
}