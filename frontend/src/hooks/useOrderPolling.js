import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';

const POLL_INTERVAL_MS = 3000;
const TERMINAL_STATUSES = new Set(['DELIVERED', 'FAILED', 'CANCELLED']);

/**
 * Polls the status of an order every 3 seconds until it reaches a terminal
 * state (DELIVERED, FAILED, or CANCELLED).
 *
 * @param {string|null} orderId — the order to track; pass null/undefined to disable polling
 * @returns {{ status: string|null, updatedAt: string|null, loading: boolean, error: string|null }}
 */
export default function useOrderPolling(orderId) {
  const [status, setStatus] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState(null);

  // Keep a ref to the latest status so the interval callback always sees it
  const statusRef = useRef(status);
  statusRef.current = status;

  const fetchStatus = useCallback(async () => {
    if (!orderId) return;

    try {
      const { data } = await api.get(`/orders/${orderId}/status`);
      const { status: newStatus, updatedAt: newUpdatedAt } = data.data;

      setStatus(newStatus);
      setUpdatedAt(newUpdatedAt);
      setError(null);
      statusRef.current = newStatus;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order status');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      setStatus(null);
      setUpdatedAt(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Reset state for a new order
    setStatus(null);
    setUpdatedAt(null);
    setLoading(true);
    setError(null);

    // Fetch immediately, then start the interval
    fetchStatus();

    const intervalId = setInterval(() => {
      // Stop polling once we've reached a terminal status
      if (TERMINAL_STATUSES.has(statusRef.current)) {
        clearInterval(intervalId);
        return;
      }
      fetchStatus();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [orderId, fetchStatus]);

  return { status, updatedAt, loading, error };
}
