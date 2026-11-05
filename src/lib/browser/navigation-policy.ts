export function isMicrophonePath(path: string): boolean {
  return /^\/(vi|en)\/audio\/(microphone|spectrum)\/?$/.test(path.split(/[?#]/, 1)[0]);
}
export function requiresDocumentNavigation(current: string, target: string): boolean {
  return isMicrophonePath(current) || isMicrophonePath(target);
}
