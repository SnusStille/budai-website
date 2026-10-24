"use client";

import { Component, type ReactNode } from "react";

/** Keeps one crashing section from taking down the whole page. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    console.error("Section crashed:", e);
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="mx-auto my-16 max-w-md rounded-2xl border border-white/10 bg-[#07070e] p-6 text-center">
          <p className="text-white">Something went wrong in this section.</p>
          <button type="button" onClick={() => this.setState({ failed: false })} className="mt-4 rounded-full bg-accent-cyan px-5 py-2 text-sm font-semibold text-[#020205]">
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
