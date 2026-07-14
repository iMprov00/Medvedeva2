import type { ClinicDocument, Doctor, GalleryPhoto, Promotion } from '../types/cms';

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const hasBody = init?.body !== undefined && init?.body !== null && init?.body !== '';

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((err as { error?: string }).error ?? 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function fetchPromotions(): Promise<Promotion[]> {
  return apiFetch<Promotion[]>('/api/promotions');
}

export async function fetchDoctors(specialty?: string): Promise<Doctor[]> {
  const query = specialty ? `?specialty=${encodeURIComponent(specialty)}` : '';
  return apiFetch<Doctor[]>(`/api/doctors${query}`);
}

export async function fetchGalleryPhotos(): Promise<GalleryPhoto[]> {
  return apiFetch<GalleryPhoto[]>('/api/gallery');
}

export async function fetchDocuments(): Promise<ClinicDocument[]> {
  return apiFetch<ClinicDocument[]>('/api/documents');
}

export async function adminLogin(username: string, password: string): Promise<void> {
  await apiFetch('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function adminLogout(): Promise<void> {
  await apiFetch('/api/admin/logout', { method: 'POST' });
}

export async function adminCheck(): Promise<boolean> {
  try {
    await apiFetch('/api/admin/me');
    return true;
  } catch {
    return false;
  }
}

export async function adminFetchPromotions(): Promise<Promotion[]> {
  return apiFetch<Promotion[]>('/api/admin/promotions');
}

export async function adminFetchPromotion(id: number): Promise<Promotion> {
  return apiFetch<Promotion>(`/api/admin/promotions/${id}`);
}

export async function adminSavePromotion(
  data: Record<string, unknown>,
  id?: number,
): Promise<Promotion> {
  if (id) {
    return apiFetch<Promotion>(`/api/admin/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  return apiFetch<Promotion>('/api/admin/promotions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminDeletePromotion(id: number): Promise<void> {
  await apiFetch(`/api/admin/promotions/${id}`, { method: 'DELETE' });
}

export async function adminFetchDoctors(): Promise<Doctor[]> {
  return apiFetch<Doctor[]>('/api/admin/doctors');
}

export async function adminFetchDoctor(id: number): Promise<Doctor> {
  return apiFetch<Doctor>(`/api/admin/doctors/${id}`);
}

export async function adminSaveDoctor(
  data: Record<string, unknown>,
  id?: number,
): Promise<Doctor> {
  if (id) {
    return apiFetch<Doctor>(`/api/admin/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  return apiFetch<Doctor>('/api/admin/doctors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteDoctor(id: number): Promise<void> {
  await apiFetch(`/api/admin/doctors/${id}`, { method: 'DELETE' });
}

export async function adminFetchGalleryPhotos(): Promise<GalleryPhoto[]> {
  return apiFetch<GalleryPhoto[]>('/api/admin/gallery');
}

export async function adminAddGalleryPhoto(imageUrl: string): Promise<GalleryPhoto> {
  return apiFetch<GalleryPhoto>('/api/admin/gallery', {
    method: 'POST',
    body: JSON.stringify({ imageUrl }),
  });
}

export async function adminDeleteGalleryPhoto(id: number): Promise<void> {
  await apiFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
}

export async function adminFetchDocuments(): Promise<ClinicDocument[]> {
  return apiFetch<ClinicDocument[]>('/api/admin/documents');
}

export async function adminSaveDocument(
  data: Record<string, unknown>,
  id?: number,
): Promise<ClinicDocument> {
  if (id) {
    return apiFetch<ClinicDocument>(`/api/admin/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  return apiFetch<ClinicDocument>('/api/admin/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteDocument(id: number): Promise<void> {
  await apiFetch(`/api/admin/documents/${id}`, { method: 'DELETE' });
}

export type UploadKind = 'doctor' | 'gallery' | 'promotion' | 'document' | 'default';

export interface UploadResult {
  url: string;
  originalFilename?: string;
}

export async function adminUpload(file: File, kind: UploadKind = 'default'): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`/api/admin/upload?kind=${encodeURIComponent(kind)}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('Файл слишком большой. Максимум 30 МБ. Уменьшите изображение и попробуйте снова.');
    }
    const err = await response.json().catch(() => ({ error: 'Не удалось загрузить файл' }));
    throw new Error((err as { error?: string }).error ?? 'Не удалось загрузить файл');
  }
  return (await response.json()) as UploadResult;
}
