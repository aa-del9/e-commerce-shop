"use client";

import { useEffect, useSyncExternalStore } from "react";

interface WhatsAppProduct {
  path: string;
  title: string;
}

let current: WhatsAppProduct | null = null;
const listeners = new Set<() => void>();

function setProduct(product: WhatsAppProduct | null) {
  current = product;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useWhatsAppProduct(): WhatsAppProduct | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}

export function useRegisterWhatsAppProduct(product: WhatsAppProduct) {
  const { path, title } = product;
  useEffect(() => {
    setProduct({ path, title });
    return () => setProduct(null);
  }, [path, title]);
}
