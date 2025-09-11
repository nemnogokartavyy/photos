export const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || "Ошибка загрузки");
    }
    return res.json();
  });
