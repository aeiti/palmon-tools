import { Component } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes.js';

// Catches render-time errors thrown by any descendant. Wrap this around the
// router Outlet (with a key={location.pathname}) so a broken tool shows a
// fallback instead of blanking the whole app, and so navigating away
// auto-recovers via remount.
//
// React still requires a class component for componentDidCatch — there is no
// hook equivalent as of React 19.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface to the dev console at minimum; if we ever add telemetry, this
    // is the hook for it.
    // eslint-disable-next-line no-console
    console.error('Tool render error:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex flex-col items-center gap-4 rounded-lg bg-slate-800/60 px-6 py-10 text-center ring-1 ring-slate-700">
        <h2 className="text-lg font-semibold text-slate-100">
          Something went wrong
        </h2>
        <p className="max-w-md text-sm text-slate-300">
          This page hit an error and couldn't render. Your saved data is fine —
          jump to another page, or try again.
        </p>
        {error.message && (
          <pre className="max-w-md overflow-x-auto rounded bg-slate-900/80 px-3 py-2 text-left text-xs text-red-300 ring-1 ring-slate-700">
            {error.message}
          </pre>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={this.handleReset}
            className="btn-primary"
          >
            Try again
          </button>
          <Link to={ROUTES.home} className="btn-secondary">
            Go home
          </Link>
        </div>
      </div>
    );
  }
}
