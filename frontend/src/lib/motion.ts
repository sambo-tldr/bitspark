import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Hook that returns reduced-motion-aware animation props.
 */
export function useRM() {
  const reduced = useReducedMotion();
  return function rm<R, N>(reducedValue: R, normalValue: N): R | N {
    return reduced ? reducedValue : normalValue;
  };
}
