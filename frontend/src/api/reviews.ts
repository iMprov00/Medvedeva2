export interface Review {
  id: number;
  author_name: string;
  content: string;
  rating: number;
  created_at: string;
  formatted_date?: string;
}

export async function fetchReviews(): Promise<Review[]> {
  try {
    const response = await fetch('/api/reviews');
    if (!response.ok) return [];
    return (await response.json()) as Review[];
  } catch {
    return [];
  }
}

export async function submitReview(data: {
  author_name: string;
  content: string;
  rating: number;
}): Promise<{ success: boolean; message?: string; errors?: string[] }> {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return (await response.json()) as { success: boolean; message?: string; errors?: string[] };
}
