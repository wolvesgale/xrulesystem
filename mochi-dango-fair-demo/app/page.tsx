import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-10 shadow-xl">
      <h1 className="text-3xl font-bold">Xrule 催事情報システムへようこそ</h1>
      <p className="text-slate-300">
        このデモアプリでは、管理者と代理店それぞれの視点で催事販売スケジュールや催事場情報を確認し、
        運営ルールの共有やスケジュールの把握を体験できます。
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-md bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
        >
          管理者ビューを見る
        </Link>
        <Link
          href="/agent"
          className="inline-flex items-center justify-center rounded-md border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800"
        >
          代理店ビューを見る
        </Link>
      </div>
    </section>
  );
}
