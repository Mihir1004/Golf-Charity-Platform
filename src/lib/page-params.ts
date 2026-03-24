export type SearchParams = Record<string, string | string[] | undefined>;

export type ActionFeedback = {
  message: string;
  tone: "success" | "error";
} | null;

function getSingleValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return null;
}

export function getActionFeedback(params: SearchParams): ActionFeedback {
  const success = getSingleValue(params.success);
  if (success) {
    return {
      message: decodeURIComponent(success),
      tone: "success",
    };
  }

  const error = getSingleValue(params.error);
  if (error) {
    return {
      message: decodeURIComponent(error),
      tone: "error",
    };
  }

  return null;
}
