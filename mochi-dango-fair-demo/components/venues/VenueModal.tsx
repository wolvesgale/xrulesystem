"use client";

import { useEffect, useMemo, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { VenueAttachmentRecord, VenueRecord } from "@/lib/types";

export type VenueModalMode = "create" | "edit" | "view";

type VenueModalProps = {
  mode: VenueModalMode;
  initialVenue?: VenueRecord;
  readOnly?: boolean;
  onClose: () => void;
  onSaved?: (venue: VenueRecord) => void;
  onDeleted?: (id: string) => void;
};

// Modal for creating or editing venue records.
export function VenueModal({
  mode,
  initialVenue,
  readOnly = false,
  onClose,
  onSaved,
  onDeleted
}: VenueModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [rules, setRules] = useState("");
  const [notes, setNotes] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [attachments, setAttachments] = useState<VenueAttachmentRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (initialVenue) {
      setName(initialVenue.name);
      setAddress(initialVenue.address ?? "");
      setRules(initialVenue.rules ?? "");
      setNotes(initialVenue.notes ?? "");
      setReferenceUrl(initialVenue.referenceUrl ?? "");
      setAttachments(initialVenue.attachments ?? []);
    } else {
      setName("");
      setAddress("");
      setRules("");
      setNotes("");
      setReferenceUrl("");
      setAttachments([]);
    }
  }, [initialVenue]);

  useEffect(() => {
    const fetchAttachments = async () => {
      if (!initialVenue?.id) {
        return;
      }
      try {
        const response = await fetch(`/api/venues/${initialVenue.id}`);
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as VenueRecord;
        setAttachments(data.attachments ?? []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAttachments();
  }, [initialVenue?.id]);

  const heading = useMemo(() => {
    if (mode === "create") return "開催場所を新規登録";
    if (mode === "edit") return "開催場所情報を編集";
    return "開催場所情報を確認";
  }, [mode]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        name,
        address,
        rules,
        notes,
        referenceUrl
      };

      const url = mode === "create" ? "/api/venues" : `/api/venues/${initialVenue?.id ?? ""}`;
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "保存に失敗しました");
        return;
      }
      const venue = (await response.json()) as VenueRecord;
      onSaved?.(venue);
    } catch (err) {
      console.error(err);
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = readOnly || mode === "view";

  const refreshAttachments = async () => {
    if (!initialVenue?.id) return;
    try {
      const response = await fetch(`/api/venues/${initialVenue.id}`);
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as VenueRecord;
      setAttachments(data.attachments ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !initialVenue?.id) return;
    setUploadError("");
    setUploading(true);
    try {
      const tasks = Array.from(files).map((file) =>
        upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/uploads/venue",
          clientPayload: { venueId: initialVenue.id, filename: file.name }
        })
      );
      await Promise.all(tasks);
      await refreshAttachments();
    } catch (err) {
      console.error(err);
      setUploadError("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!window.confirm("添付ファイルを削除しますか？")) {
      return;
    }
    try {
      const response = await fetch(`/api/venues/attachments/${attachmentId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setUploadError(data.error ?? "削除に失敗しました");
        return;
      }
      setAttachments((prev) => prev.filter((item) => item.id !== attachmentId));
    } catch (err) {
      console.error(err);
      setUploadError("削除に失敗しました");
    }
  };

  const formatSize = (size: number) => {
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  };

  const handleDelete = async () => {
    if (!initialVenue) return;
    if (!window.confirm("開催場所情報を削除しますか？")) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/venues/${initialVenue.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "削除に失敗しました");
        return;
      }
      onDeleted?.(initialVenue.id);
    } catch (err) {
      console.error(err);
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{heading}</h3>
            <p className="text-sm text-slate-400">開催場所の詳細や裏方ルールを管理します。</p>
          </div>
          <button className="text-slate-400 hover:text-white" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-200">
            開催場所名
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isReadOnly}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            住所・エリア
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              disabled={isReadOnly}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200 md:col-span-2">
            裏方ルール・注意事項
            <textarea
              value={rules}
              onChange={(event) => setRules(event.target.value)}
              disabled={isReadOnly}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
              rows={3}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            参考リンク（PDF/画像）
            <input
              value={referenceUrl}
              onChange={(event) => setReferenceUrl(event.target.value)}
              disabled={isReadOnly}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            メモ
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={isReadOnly}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
              rows={3}
            />
          </label>
        </div>
        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">参考資料ファイル</p>
            {!isReadOnly && initialVenue?.id && (
              <label className="text-xs text-slate-300">
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(event) => handleUpload(event.target.files)}
                />
                <span className="inline-flex cursor-pointer rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-100 hover:border-slate-500">
                  {uploading ? "アップロード中..." : "ファイルを追加"}
                </span>
              </label>
            )}
          </div>
          {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
          {attachments.length === 0 ? (
            <p className="text-xs text-slate-400">添付ファイルはまだありません。</p>
          ) : (
            <ul className="space-y-2">
              {attachments.map((attachment) => (
                <li key={attachment.id} className="flex flex-col gap-2 rounded-md bg-slate-900/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-slate-100 underline"
                    >
                      {attachment.filename}
                    </a>
                    <p className="text-xs text-slate-400">
                      {attachment.contentType} • {formatSize(attachment.size)} •{" "}
                      {new Date(attachment.createdAt).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      className="rounded-md border border-red-500/60 px-3 py-1 text-xs text-red-300 hover:border-red-400"
                    >
                      削除
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-3">
          {!isReadOnly && mode === "edit" && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="rounded-md border border-red-500/60 px-4 py-2 text-sm font-semibold text-red-300 hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              削除する
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-slate-500"
          >
            キャンセル
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              disabled={loading || name.trim() === ""}
              className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "保存中..." : "保存する"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
