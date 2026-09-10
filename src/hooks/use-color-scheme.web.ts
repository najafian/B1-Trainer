import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/** Nothing to subscribe to - the snapshot alone distinguishes server from client. */
const subscribe = () => () => {};

/**
 * On web the tree is rendered statically first, where no colour scheme exists.
 * useSyncExternalStore gives React a different snapshot on the server ('light')
 * and on the client, which is the supported way to express that - unlike a
 * setState in an effect, it does not cause a second render pass.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const colorScheme = useRNColorScheme();

  return hasHydrated ? colorScheme : 'light';
}
