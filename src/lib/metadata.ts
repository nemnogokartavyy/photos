import type { Metadata } from "next";

export function createMetadata(
  title: string,
  description: string,
  favicon?: string
) {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
    ...(favicon && {
      icons: {
        icon: favicon,
      },
    }),
  } satisfies Metadata;
}
