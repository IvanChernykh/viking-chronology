import { Component, type ErrorInfo, type ReactNode } from 'react';
import { SceneFallback } from './SceneFallback';

interface SceneErrorBoundaryProps {
  children: ReactNode;
  resetKey: number;
  onRetry: () => void;
}

interface SceneErrorBoundaryState {
  failed: boolean;
}

export class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  state: SceneErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Viking 3D scene failed:', error, info.componentStack);
  }

  componentDidUpdate(previousProps: SceneErrorBoundaryProps): void {
    if (previousProps.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return <SceneFallback reason="runtime-error" onRetry={this.props.onRetry} />;
    }
    return this.props.children;
  }
}
