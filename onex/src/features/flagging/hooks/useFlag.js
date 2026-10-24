import { useCallback, useState } from "react";
import { submitFlag } from "../services/flagService";
import { showAppToast } from "@/shared/utils/appToast";

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

      showAppToast({
        type: "flag_submitted",
        title: "Report submitted",
        message:
          payload?.targetType === "user"
            ? "Thanks. Our team will review this account."
            : "Thanks. Our team will review this post.",
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