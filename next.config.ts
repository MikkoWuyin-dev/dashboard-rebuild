import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev overlay's badge is pinned to the bottom-left of the viewport, so it
  // lands inside every 390px capture and nowhere in the reference -- about 900
  // stray pixels per mobile shot, which the diff was counting as our error.
  devIndicators: false,
};

export default nextConfig;
