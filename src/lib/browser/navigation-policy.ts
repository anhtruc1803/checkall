export function isMicrophonePath(path: string): boolean {
  return /^\/(vi|en)\/audio\/(microphone|spectrum)\/?$/.test(path.split(/[?#]/, 1)[0]);
}
export function requiresDocumentNavigation(current: string, target: string): boolean {
  return [current, target].some(
    (path) => isMicrophonePath(path) || isCameraPath(path) || isGamepadPath(path),
  );
}
export function isCameraPath(path: string): boolean {
  return /^\/(vi|en)\/camera\/(preview|resolution|fps)\/?$/.test(path.split(/[?#]/, 1)[0]);
}
export function isGamepadPath(path: string): boolean {
  return /^\/(vi|en)\/gamepad\/(tester|analog-stick|stick-drift)\/?$/.test(
    path.split(/[?#]/, 1)[0],
  );
}
