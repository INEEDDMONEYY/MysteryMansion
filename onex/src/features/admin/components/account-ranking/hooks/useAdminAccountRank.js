import { useCallback, useEffect, useState } from "react";

import {
  getAdminAccountRank,
  getAdminRankHistory,
} from "../services/adminAccountRankService";

const INITIAL_STATE = {
  rank: null,
  history: [],
  loading: false,
  historyLoading: false,
  error: null,
  historyError: null,
};

const useAdminAccountRank = ({
  accountId,
  role,
  criterionScores = {},
  autoLoad = true,
  loadHistory = false,
} = {}) => {
  const [state, setState] = useState(INITIAL_STATE);

  const fetchRank = useCallback(async () => {
    if (!role) {
      setState((current) => ({
        ...current,
        rank: null,
        loading: false,
        error: "An account role is required.",
      }));

      return null;
    }

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    try {
      const result = await getAdminAccountRank({
        role,
        criterionScores,
      });

      setState((current) => ({
        ...current,
        rank: result,
        loading: false,
        error: null,
      }));

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load account ranking.";

      setState((current) => ({
        ...current,
        loading: false,
        error: message,
      }));

      return null;
    }
  }, [role, criterionScores]);

  const fetchHistory = useCallback(async () => {
    if (!accountId) {
      setState((current) => ({
        ...current,
        history: [],
        historyLoading: false,
        historyError: "An account ID is required.",
      }));

      return [];
    }

    setState((current) => ({
      ...current,
      historyLoading: true,
      historyError: null,
    }));

    try {
      const result = await getAdminRankHistory({
        accountId,
      });

      setState((current) => ({
        ...current,
        history: Array.isArray(result) ? result : [],
        historyLoading: false,
        historyError: null,
      }));

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load ranking history.";

      setState((current) => ({
        ...current,
        historyLoading: false,
        historyError: message,
      }));

      return [];
    }
  }, [accountId]);

  const refresh = useCallback(async () => {
    const rankResult = await fetchRank();

    if (loadHistory && accountId) {
      await fetchHistory();
    }

    return rankResult;
  }, [
    accountId,
    fetchHistory,
    fetchRank,
    loadHistory,
  ]);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    fetchRank();
  }, [autoLoad, fetchRank]);

  useEffect(() => {
    if (!autoLoad || !loadHistory) {
      return;
    }

    fetchHistory();
  }, [
    autoLoad,
    loadHistory,
    fetchHistory,
  ]);

  return {
    rank: state.rank,
    history: state.history,
    loading: state.loading,
    historyLoading: state.historyLoading,
    error: state.error,
    historyError: state.historyError,
    fetchRank,
    fetchHistory,
    refresh,
    reset,
  };
};

export default useAdminAccountRank;