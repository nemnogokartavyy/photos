type Metadata = {
  title: string;
  description: string;
  openGraph: { title: string; description: string };
  twitter: { title: string; description: string };
};

export function createMetadata(title: string, description: string) {
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}
