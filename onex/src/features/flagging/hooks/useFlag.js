import { useCallback, useState } from "react";
import { submitFlag } from "../services/flagService";

const INITIAL_STATE = {
  status: "idle",
  error: null,
  result: null,
};

const useFlag = () => {
  const [state, setState] = useState(INITIAL_STATE);

  const flag = useCallback(async (payload) => {
    setState({
      status: "submitting",
      error: null,
      result: null,
    });

    try {
      const result = await submitFlag(payload);

      setState({
        status: "success",
        error: null,
        result,
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting the flag.";

      setState({
        status: "error",
        error: message,
        result: null,
      });

      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    flag,
    reset,
    isSubmitting: state.status === "submitting",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    status: state.status,
    error: state.error,
    result: state.result,
  };
};

export default useFlag;