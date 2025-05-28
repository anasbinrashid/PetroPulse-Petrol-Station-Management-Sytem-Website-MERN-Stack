import { createPortal } from "react-dom";

export function VideoBackground() {
  const portalTarget = document.getElementById("video-bg-root");
  if (!portalTarget) return null;

  return createPortal(
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 h-full w-full object-cover"
        style={{ pointerEvents: "none", filter: "brightness(50%)" }}
      >
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </>,
    portalTarget
  );
}
