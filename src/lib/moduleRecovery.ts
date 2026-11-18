const recoveryKey = 'hard-module-recovery-at';
const recoveryWindow = 5 * 60 * 1000;

/** One automatic recovery per five minutes, preserving drafts and authentication. */
export function mayRecoverModuleLoad(storage: Pick<Storage, 'getItem' | 'setItem'>, now = Date.now()): boolean {
  try {
    const previous = storage.getItem(recoveryKey);
    const last = previous === null ? NaN : Number(previous);
    if (Number.isFinite(last) && now - last < recoveryWindow) return false;
    storage.setItem(recoveryKey, String(now));
    return true;
  } catch { return false; }
}
