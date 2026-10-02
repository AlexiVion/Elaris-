import type { DataSensitivity, RobotAdapterSecurityProfile } from "./types";

export const READ_ONLY_SECURITY_PROFILE: RobotAdapterSecurityProfile = Object.freeze({
  mode: "READ_ONLY",
  controlCommands: "DISABLED",
  actuation: "DISABLED",
  remoteControl: "DISABLED",
  cloudUpload: "DISABLED_BY_DEFAULT",
  rawAudio: "DISABLED_BY_DEFAULT",
  rawVideo: "DISABLED_BY_DEFAULT",
  telemetrySensitivity: "SENSITIVE_BY_DEFAULT",
});

const COMMANDISH_PATTERNS = [
  /(^|\/)lowcmd$/i,
  /(^|\/)arm_sdk$/i,
  /(^|\/).*command($|\/)/i,
  /(^|\/).*control($|\/)/i,
  /(^|\/).*cmd($|\/)/i,
] as const;

export function looksLikeCommandChannel(channelName: string) {
  return COMMANDISH_PATTERNS.some((pattern) => pattern.test(channelName));
}

export function assertReadOnlyChannel(channelName: string, explicitBlocked: readonly string[] = []) {
  if (explicitBlocked.includes(channelName) || looksLikeCommandChannel(channelName)) {
    throw new Error(`Elaris read-only policy blocks command/control channel: ${channelName}`);
  }
}

export function defaultTelemetrySensitivity(): DataSensitivity {
  return "SENSITIVE";
}
