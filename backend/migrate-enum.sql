UPDATE orders SET status = 'draft' WHERE status IN ('pending_payment','half_payment_done','paid_by_dealer');
