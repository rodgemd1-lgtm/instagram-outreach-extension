export const OPERATOR_EVENT_NAME = "alex-os:operator-command";

export interface OperatorCommandEventDetail {
  command?: string;
  openOnly?: boolean;
}

export function dispatchOperatorCommand(detail: OperatorCommandEventDetail): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<OperatorCommandEventDetail>(OPERATOR_EVENT_NAME, {
      detail,
    })
  );
}

export function openOperator(): void {
  dispatchOperatorCommand({ openOnly: true });
}
