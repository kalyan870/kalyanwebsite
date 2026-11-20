import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export default class FirebaseErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application ErrorBoundary caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f4eff2] text-black flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border-2 border-black p-8 shadow-[6px_6px_0_#000]">
            <p className="font-mono-code text-xs font-bold text-[#de4ba4] mb-2">
              APPLICATION RECOVERY
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight mb-3">
              Something interrupted the workspace.
            </h1>
            <p className="text-sm text-black/75 leading-relaxed mb-5">
              {this.state.errorMessage || "An unexpected client error occurred."}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, errorMessage: null })}
              className="bg-black text-[#f4eff2] border border-black px-5 py-2.5 text-xs font-bold hover:bg-[#dff247] hover:text-black transition-colors"
            >
              Restore View
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
