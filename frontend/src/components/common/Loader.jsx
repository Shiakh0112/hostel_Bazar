import React from "react";

const Loader = ({ size = "md", text = "Loading..." }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div
          className={`absolute rounded-full border-2 border-gray-200 ${sizeClasses[size]}`}
        ></div>

        {/* Middle Spinner */}
        <div
          className={`absolute rounded-full border-2 border-transparent border-t-primary-600 animate-spin ${sizeClasses[size]}`}
        ></div>

        {/* Inner Spinner - Reverse Direction */}
        <div
          className={`absolute rounded-full border-2 border-transparent border-t-accent-500 animate-spin ${sizeClasses[size]}`}
          style={{
            width: `calc(${sizeClasses[size].split(" ")[0]} * 0.6)`,
            height: `calc(${sizeClasses[size].split(" ")[1]} * 0.6)`,
            animationDirection: "reverse",
            animationDuration: "1.5s",
          }}
        ></div>

        {/* Center Dot */}
        <div
          className="rounded-full bg-gradient-to-br from-primary-500 to-primary-700 animate-pulse"
          style={{
            width: `calc(${sizeClasses[size].split(" ")[0]} * 0.3)`,
            height: `calc(${sizeClasses[size].split(" ")[1]} * 0.3)`,
          }}
        ></div>
      </div>

      {/* Loading Text with Animation */}
      {text && (
        <div className="mt-4 flex items-center">
          <p className={`text-gray-600 ${textSizeClasses[size]} animate-pulse`}>
            {text}
          </p>
          <div className="flex ml-2">
            <span
              className="w-1 h-1 bg-primary-600 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></span>
            <span
              className="w-1 h-1 bg-primary-600 rounded-full animate-bounce mx-0.5"
              style={{ animationDelay: "150ms" }}
            ></span>
            <span
              className="w-1 h-1 bg-primary-600 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loader;
