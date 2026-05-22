const REPO_URL = 'https://github.com/aeiti/palmon-tools';
const ISSUES_URL = `${REPO_URL}/issues`;
const BMC_URL = 'https://www.buymeacoffee.com/palmontools';

export default function About() {
  return (
    <article className="flex flex-col gap-6 text-slate-300">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100 sm:text-3xl">
          About
        </h1>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-slate-100">
          What this is
        </h2>
        <p>
          Palmon Tools is a small collection of calculators and trackers for
          players of <em>Palmon: Survival</em>. The goal is fast, no-login
          utilities you can pull up mid-game on your phone — starting with a
          speedup inventory + target-time checker, with more tools planned.
        </p>
        <p>
          Everything you enter is saved locally in your browser. Nothing is
          sent to a server.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-slate-100">Support</h2>
        <p>
          Palmon Tools is free and ad-free. If it's saved you some time, a
          coffee goes a long way toward fueling more updates.
        </p>
        <a
          href={BMC_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-md bg-[#5F7FFF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4a6aef]"
        >
          <span aria-hidden="true">☕</span>
          Buy me a coffee
        </a>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-slate-100">Disclaimer</h2>
        <p>
          This is a fan-made project. It is not affiliated with, endorsed by,
          or sponsored by the publisher or developers of <em>Palmon: Survival</em>.
          All game names and assets belong to their respective owners.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-slate-100">Feedback</h2>
        <p>
          Found a bug, have an idea for another tool, or spotted incorrect
          data? Open an issue on{' '}
          <a
            href={ISSUES_URL}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-slate-100">
          Tech &amp; credits
        </h2>
        <p>
          Built with React, Vite, and Tailwind CSS. Source is on{' '}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      </section>
    </article>
  );
}
