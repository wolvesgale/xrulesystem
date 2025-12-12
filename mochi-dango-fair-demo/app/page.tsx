import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-10 shadow-xl">
      <h1 className="text-3xl font-bold">Xrule 催事情報システムへようこそ</h1>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-md bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 sm:w-auto"
        >
          ログイン
        </Link>
        <Link
          href="/admin"
          className="inline-flex w-full items-center justify-center rounded-md border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800 sm:w-auto"
        >
          管理者ビューを見る
        </Link>
        <Link
          href="/agent"
          className="inline-flex w-full items-center justify-center rounded-md border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800 sm:w-auto"
        >
          代理店ビューを見る
        </Link>
      </div>
    </section>
  );
}
