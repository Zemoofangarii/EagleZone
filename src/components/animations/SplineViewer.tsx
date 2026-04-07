import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineViewerProps {
  /** Spline scene URL (from spline.design publish) */
  sceneUrl: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Embeds an interactive 3D Spline scene.
 *
 * Usage:
 *   <SplineViewer sceneUrl="https://prod.spline.design/xxxxx/scene.splinecode" />
 *
 * To get a scene URL:
 *   1. Create/open a scene at spline.design
 *   2. Click "Export" → "Web Content" → copy the production URL
 *
 * The component lazy-loads the Spline runtime so it doesn't affect initial bundle size.
 */
export function SplineViewer({ sceneUrl, className, fallback }: SplineViewerProps) {
  const defaultFallback = (
    <div className="w-full h-full flex items-center justify-center bg-card/50 rounded-lg border border-border">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading 3D scene...</span>
      </div>
    </div>
  );

  return (
    <div className={className}>
      <Suspense fallback={fallback || defaultFallback}>
        <Spline scene={sceneUrl} />
      </Suspense>
    </div>
  );
}
