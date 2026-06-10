import { useState, useCallback } from 'react';

export const usePagination = ({ initialPage = 1, initialLimit = 10 } = {}) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const onPageChange = useCallback((next) => {
    setPage(next < 1 ? 1 : next);
  }, []);

  const onLimitChange = useCallback((next) => {
    setLimit(next);
    setPage(1);
  }, []);

  const onTotalChange = useCallback((next) => {
    setTotal(next);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    onPageChange,
    onLimitChange,
    onTotalChange,
  };
};
