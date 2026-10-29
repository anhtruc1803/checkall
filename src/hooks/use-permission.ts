'use client';
import { useEffect, useState } from 'react';
import type { ToolPermission } from '@/lib/browser/capability-types';
import { observePermission, type PermissionSnapshot } from '@/lib/browser/permissions';

export function usePermission(permission: ToolPermission): PermissionSnapshot {
  const [snapshot, setSnapshot] = useState<PermissionSnapshot>({
    permission,
    state: 'unknown',
    source: 'unknown',
  });
  useEffect(() => observePermission(permission, setSnapshot), [permission]);
  return snapshot.permission === permission
    ? snapshot
    : { permission, state: 'unknown', source: 'unknown' };
}
