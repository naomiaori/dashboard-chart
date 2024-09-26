"use client";

import { useState, useEffect, DependencyList } from "react";

// needed to avoid some random out of sync scale computations 🤷‍♂️
export function useRerender(deps: DependencyList) {
  const [, triggerReRender] = useState(false);

  useEffect(() => {
    setTimeout(() => triggerReRender(true), 0);

    return () => triggerReRender(false);
  }, deps);
}
