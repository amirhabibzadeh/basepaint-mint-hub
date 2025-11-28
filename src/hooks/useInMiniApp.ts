import { useContext } from "react";
import { useFarcaster } from "@/providers/FarcasterProvider";

export function useInMiniApp() {
  const farcaster = useFarcaster();
  return farcaster?.inMiniApp || false;
}

