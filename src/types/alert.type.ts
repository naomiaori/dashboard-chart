type AlertType = "ERROR" | "WARNING" | "MESSAGE" | null;

type AlertButton = {
  label: string;
  className: string;
  onClick: () => void;
};

export type TAlertProps = {
  open: boolean;
  type: AlertType;
  title?: string;
  description?: string;
  onClick?: () => void;
  buttons?: Array<Partial<AlertButton>>;
};

type AlertPropsMap = {
  ERROR: Omit<TAlertProps, "open" | "type" | "buttons">;
  WARNING: Omit<TAlertProps, "open" | "type" | "onClick">;
  MESSAGE: Omit<TAlertProps, "open" | "type" | "buttons">;
};

export type TOpenAlert = <T extends keyof AlertPropsMap>(
  type: T,
  props: AlertPropsMap[T],
) => void;

export type TAlertComponentMap = {
  ERROR: AlertPropsMap["ERROR"];
  WARNING: AlertPropsMap["WARNING"];
  MESSAGE: AlertPropsMap["MESSAGE"];
};
