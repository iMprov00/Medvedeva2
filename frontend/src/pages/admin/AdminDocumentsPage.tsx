import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  adminDeleteDocument,
  adminFetchDocuments,
  adminSaveDocument,
  adminUpload,
} from '../../api/cms';
import type { ClinicDocument } from '../../types/cms';
import './admin.css';

const emptyForm = {
  title: '',
  description: '',
  fileUrl: '',
  originalFilename: '',
  sortOrder: 0,
  active: true,
};

export function AdminDocumentsPage() {
  const [items, setItems] = useState<ClinicDocument[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    return adminFetchDocuments().then(setItems);
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sortOrder: items.length === 0 ? 0 : Math.max(...items.map((i) => i.sortOrder)) + 1,
    });
    setError('');
    setFormOpen(true);
  }

  function startEdit(doc: ClinicDocument) {
    setEditingId(doc.id);
    setForm({
      title: doc.title,
      description: doc.description ?? '',
      fileUrl: doc.fileUrl,
      originalFilename: doc.originalFilename ?? '',
      sortOrder: doc.sortOrder,
      active: doc.active,
    });
    setError('');
    setFormOpen(true);
  }

  function cancelForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setFormOpen(false);
  }

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await adminUpload(file, 'document');
      setForm((prev) => ({
        ...prev,
        fileUrl: result.url,
        originalFilename: result.originalFilename || file.name,
        title: prev.title || file.name.replace(/\.[^.]+$/, ''),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить файл');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Укажите название');
      return;
    }
    if (!form.fileUrl.trim()) {
      setError('Загрузите файл');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await adminSaveDocument(
        {
          title: form.title.trim(),
          description: form.description.trim() || null,
          fileUrl: form.fileUrl.trim(),
          originalFilename: form.originalFilename.trim() || null,
          sortOrder: Number(form.sortOrder) || 0,
          active: form.active,
        },
        editingId ?? undefined,
      );
      cancelForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Удалить документ?')) return;
    await adminDeleteDocument(id);
    if (editingId === id) cancelForm();
    await load();
  }

  return (
    <div>
      <div className="adminActions" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="adminTitle">Документы</h1>
          <p className="adminHint">Файлы на странице «Документы» сайта</p>
        </div>
        <button type="button" className="adminBtn" onClick={startCreate}>
          Добавить
        </button>
      </div>

      {formOpen && (
        <form className="adminCard" onSubmit={handleSubmit}>
          <h2 className="adminTitle" style={{ fontSize: '1.15rem' }}>
            {editingId ? 'Редактирование' : 'Новый документ'}
          </h2>

          <div className="formGroup">
            <label htmlFor="doc-title">Название</label>
            <input
              id="doc-title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="doc-description">Описание</label>
            <textarea
              id="doc-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="formGroup">
            <label htmlFor="doc-file">Файл</label>
            <input
              ref={fileInputRef}
              id="doc-file"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            {uploading && <p className="formHint">Загрузка файла...</p>}
            {form.fileUrl && (
              <p className="adminHint">
                Текущий файл:{' '}
                <a href={form.fileUrl} target="_blank" rel="noreferrer">
                  {form.originalFilename || form.fileUrl}
                </a>
              </p>
            )}
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label htmlFor="doc-order">Порядок</label>
              <input
                id="doc-order"
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="formGroup">
              <label className="toggleField">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                />
                Показывать на сайте
              </label>
            </div>
          </div>

          {error && <p className="formError">{error}</p>}

          <div className="formFooter">
            <button type="button" className="adminBtn adminBtnSecondary" onClick={cancelForm}>
              Отмена
            </button>
            <button type="submit" className="adminBtn" disabled={saving || uploading}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      )}

      <div className="adminCard">
        {items.length === 0 ? (
          <p className="adminHint">Документов пока нет. Нажмите «Добавить».</p>
        ) : (
          <table className="adminTable">
            <thead>
              <tr>
                <th>Поз.</th>
                <th>Название</th>
                <th>Описание</th>
                <th>Файл</th>
                <th>На сайте</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.sortOrder}</td>
                  <td>{item.title}</td>
                  <td>{item.description || '—'}</td>
                  <td>
                    <a href={item.fileUrl} target="_blank" rel="noreferrer">
                      Скачать
                    </a>
                  </td>
                  <td>{item.active ? 'Да' : 'Нет'}</td>
                  <td>
                    <button type="button" className="adminBtn adminBtnSecondary" onClick={() => startEdit(item)}>
                      Изменить
                    </button>{' '}
                    <button
                      type="button"
                      className="adminBtn adminBtnDanger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
