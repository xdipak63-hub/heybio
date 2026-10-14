
import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback !== undefined) {
      return this.props.fallback;
    }

    return (
      <section
        role="alert"
        style={{
          padding: "48px 24px",
          border: "1px solid #E7E9E2",
          borderRadius: 24,
          background: "#FFFFFF",
          textAlign: "center",
        }}
      >
        <AlertTriangle
          size={34}
          color="#B45309"
          aria-hidden="true"
        />

        <h2
          style={{
            margin: "18px 0 10px",
            fontSize: 25,
            color: "#171817",
          }}
        >
          Something went wrong
        </h2>

        <p
          style={{
            margin: "0 auto 24px",
            maxWidth: 380,
            lineHeight: 1.6,
            color: "#696E65",
          }}
        >
          This section could not be displayed.
          You can try loading it again.
        </p>

        <button
          type="button"
          onClick={this.reset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "13px 22px",
            border: 0,
            borderRadius: 100,
            background: "#BDF806",
            color: "#171817",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <RotateCcw size={17} />
          Try again
        </button>
      </section>
    );
  }
}

export default ErrorBoundary;
