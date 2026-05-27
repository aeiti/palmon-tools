const REPO_URL = 'https://github.com/aeiti/palmon-tools';
const ISSUES_URL = `${REPO_URL}/issues`;
const BMC_URL = 'https://www.buymeacoffee.com/palmontools';

export default function About() {
  return (
    <article className="flex flex-col gap-6 text-slate-300">
      <header>
        <h1 className="h-page">About</h1>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="h-section">What this is</h2>
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
        <h2 className="h-section">Support</h2>
        <p>
          Palmon Tools is free and ad-free. If it's saved you some time, a
          bundle goes a long way toward fueling more updates.
        </p>
        <a
          href={BMC_URL}
          target="_blank"
          rel="noreferrer"
          className="w-fit rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          <img
            src="https://img.buymeacoffee.com/button-api/?text=Buy me a bundle&emoji=🎁&slug=palmontools&button_colour=5F7FFF&font_colour=ffffff&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00"
            alt="Buy me a bundle"
          />
        </a>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="h-section">Disclaimer</h2>
        <p>
          This is a fan-made project. It is not affiliated with, endorsed by,
          or sponsored by the publisher or developers of <em>Palmon: Survival</em>.
          All game names and assets belong to their respective owners.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="h-section">Feedback</h2>
        <p>
          Found a bug, have an idea for another tool, or spotted incorrect
          data? Open an issue on{' '}
          <a
            href={ISSUES_URL}
            target="_blank"
            rel="noreferrer"
            className="link-inline"
          >
            GitHub
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="h-section">Tech &amp; credits</h2>
        <p>
          Built with React, Vite, and Tailwind CSS. Source is on{' '}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="link-inline"
          >
            GitHub
          </a>
          .
        </p>
      </section>
    </article>
  );
}
