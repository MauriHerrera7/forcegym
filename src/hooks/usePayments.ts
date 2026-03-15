'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchApi } from '@/lib/api'

export interface Payment {
  id: string
  amount: string
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  payment_method: string
  created_at: string
  membership?: {
    plan: {
      name: string
    }
  }
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPayments = useCallback(async () => {
    // SSR guard: localStorage is not available on the server
    if (typeof window === 'undefined') return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await fetchApi('/payments/my_payments/')
      setPayments(data.results || data)
    } catch (error: any) {
      console.error(`[usePayments] /payments/my_payments/ → status=${error?.status}`, error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const deletePayment = async (paymentId: string) => {
    try {
      await fetchApi(`/payments/${paymentId}/`, { method: 'DELETE' })
      setPayments(prev => prev.filter(p => p.id !== paymentId))
      return true
    } catch (error) {
      console.error('Error deleting payment:', error)
      return false
    }
  }

  const retryPayment = async (paymentId: string) => {
    try {
      const response = await fetchApi(`/payments/${paymentId}/initiate_mercadopago/`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      console.error('Error retrying payment:', error)
      throw error
    }
  }

  return { payments, loading, refreshPayments: fetchPayments, deletePayment, retryPayment }
}
