import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Loading = ({ size = 200, fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <DotLottieReact
            src="/loading.lottie" // Local file in public folder
            loop
            autoplay
            style={{ width: size, height: size }}
          />
          <p className="text-secondary-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full py-8">
      <DotLottieReact
        src="/loading.lottie" // Local file in public folder
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default Loading;
