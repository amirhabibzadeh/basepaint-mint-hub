import { useContext } from "react";
import { useFarcaster } from "@/providers/FarcasterProvider";

export function useFarcasterUser() {
  const farcaster = useFarcaster();
  return farcaster?.user || null;
}
