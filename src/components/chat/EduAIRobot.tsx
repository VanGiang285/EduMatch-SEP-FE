"use client";
import React from "react";

interface EduAIRobotProps {
  size?: number;
  className?: string;
}

export function EduAIRobot({ size = 200, className = "" }: EduAIRobotProps) {
  return (
    <div className={`edu-ai-robot-wrapper ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="edu-ai-robot-svg"
      >
        <rect
          x="40"
          y="60"
          width="120"
          height="100"
          rx="15"
          fill="url(#robotGradient)"
          className="edu-ai-robot-body"
        />
        
        <rect
          x="50"
          y="20"
          width="100"
          height="50"
          rx="12"
          fill="url(#robotGradient)"
          className="edu-ai-robot-head"
        />
        
        <circle
          cx="100"
          cy="20"
          r="8"
          fill="#FD8B51"
          className="edu-ai-robot-antenna"
        />
        <line
          x1="100"
          y1="20"
          x2="100"
          y2="10"
          stroke="#FD8B51"
          strokeWidth="3"
          className="edu-ai-robot-antenna-line"
        />
        
        <circle
          cx="75"
          cy="40"
          r="8"
          fill="#FD8B51"
          className="edu-ai-robot-eye edu-ai-robot-eye-left"
        />
        <circle
          cx="75"
          cy="40"
          r="4"
          fill="#FFFFFF"
          className="edu-ai-robot-eye-pupil"
        />
        
        <circle
          cx="125"
          cy="40"
          r="8"
          fill="#FD8B51"
          className="edu-ai-robot-eye edu-ai-robot-eye-right"
        />
        <circle
          cx="125"
          cy="40"
          r="4"
          fill="#FFFFFF"
          className="edu-ai-robot-eye-pupil"
        />
        
        <path
          d="M 80 55 Q 100 65 120 55"
          stroke="#FD8B51"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          className="edu-ai-robot-mouth"
        />
        
        <rect
          x="70"
          y="80"
          width="60"
          height="40"
          rx="8"
          fill="rgba(253, 139, 81, 0.2)"
          className="edu-ai-robot-chest"
        />
        <circle
          cx="90"
          cy="100"
          r="4"
          fill="#FD8B51"
          className="edu-ai-robot-chest-dot"
        />
        <circle
          cx="100"
          cy="100"
          r="4"
          fill="#FD8B51"
          className="edu-ai-robot-chest-dot"
        />
        <circle
          cx="110"
          cy="100"
          r="4"
          fill="#FD8B51"
          className="edu-ai-robot-chest-dot"
        />
        
        <rect
          x="20"
          y="80"
          width="25"
          height="15"
          rx="5"
          fill="url(#robotGradient)"
          className="edu-ai-robot-arm edu-ai-robot-arm-left"
        />
        <circle
          cx="32.5"
          cy="95"
          r="8"
          fill="url(#robotGradient)"
          className="edu-ai-robot-hand"
        />
        
        <rect
          x="155"
          y="80"
          width="25"
          height="15"
          rx="5"
          fill="url(#robotGradient)"
          className="edu-ai-robot-arm edu-ai-robot-arm-right"
        />
        <circle
          cx="167.5"
          cy="95"
          r="8"
          fill="url(#robotGradient)"
          className="edu-ai-robot-hand"
        />
        
        <rect
          x="60"
          y="160"
          width="25"
          height="30"
          rx="5"
          fill="url(#robotGradient)"
          className="edu-ai-robot-leg edu-ai-robot-leg-left"
        />
        <rect
          x="55"
          y="190"
          width="35"
          height="8"
          rx="4"
          fill="#1e5a66"
          className="edu-ai-robot-foot"
        />
        
        <rect
          x="115"
          y="160"
          width="25"
          height="30"
          rx="5"
          fill="url(#robotGradient)"
          className="edu-ai-robot-leg edu-ai-robot-leg-right"
        />
        <rect
          x="110"
          y="190"
          width="35"
          height="8"
          rx="4"
          fill="#1e5a66"
          className="edu-ai-robot-foot"
        />
        
        <circle
          cx="30"
          cy="30"
          r="3"
          fill="#FD8B51"
          className="edu-ai-robot-sparkle edu-ai-robot-sparkle-1"
        />
        <circle
          cx="170"
          cy="50"
          r="3"
          fill="#FD8B51"
          className="edu-ai-robot-sparkle edu-ai-robot-sparkle-2"
        />
        <circle
          cx="50"
          cy="180"
          r="3"
          fill="#FD8B51"
          className="edu-ai-robot-sparkle edu-ai-robot-sparkle-3"
        />
        <circle
          cx="150"
          cy="180"
          r="3"
          fill="#FD8B51"
          className="edu-ai-robot-sparkle edu-ai-robot-sparkle-4"
        />
        
        <defs>
          <linearGradient id="robotGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#257180" />
            <stop offset="100%" stopColor="#1e5a66" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

