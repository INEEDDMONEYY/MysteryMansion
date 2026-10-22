import { useCallback, useEffect, useState } from "react";

import getAccountRank from "../services/accountRankService";

const INITIAL_STATE = {
  rank: null,
  loading: false,
  error: null,
};

const useAccountRank = ({
  role,
  criterionScores = {},
  autoLoad = true,
} = {}) => {
  const [state, setState] = useState(INITIAL_STATE);

  const loadRank = useCallback(async () => {
    if (!role) {
      setState({
        rank: null,
        loading: false,
        error: "An account role is required.",
      });

      return null;
    }

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    try {
      const result = await getAccountRank({
        role,
        criterionScores,
      });

      setState({
        rank: result,
        loading: false,
        error: null,
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load account rank.";

      setState({
        rank: null,
        loading: false,
        error: message,
      });

      return null;
    }
  }, [role, criterionScores]);

  const resetRank = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    loadRank();
  }, [autoLoad, loadRank]);

  return {
    rank: state.rank,
    loading: state.loading,
    error: state.error,
    loadRank,
    resetRank,
  };
};

export default useAccountRank;