import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Artex Production",
    short_name: "Artex",
    description:
      "Exhibition booth design and event production portfolio in Egypt.",
    start_url: "/en",
    display: "standalone",
    background_color: "#071115",
    theme_color: "#071115",
    categories: ["business", "design", "portfolio"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
