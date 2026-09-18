'use client'

import React, { useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

interface VideoPlayerProps {
  title: string
  description?: string
  videoUrl?: string
  posterImage?: string
  width?: string
  height?: string
}

export function VideoPlayer({
  title,
  description,
  videoUrl,
  posterImage,
  width = 'w-full',
  height = 'aspect-video',
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }

  // If no video URL provided, show placeholder with educational content
  if (!videoUrl) {
    return (
      <div className={`${width} ${height} bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center`}>
        <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 via-transparent to-danger-500/10" />

          {/* Content */}
          <div className="relative z-10 max-w-md">
            <div className="mb-6">
              <div className="inline-block p-4 bg-primary-500/20 rounded-full mb-4">
                <svg
                  className="w-12 h-12 text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>

            {description && <p className="text-neutral-300 text-sm mb-6 leading-relaxed">{description}</p>}

            <div className="bg-primary-500/30 border border-primary-400/50 rounded-lg p-4 text-sm text-primary-100">
              <p className="font-semibold mb-2">📹 Educational Video Ready</p>
              <p className="text-xs text-primary-200">
                A professional educational video showing asset lifecycle impact on:
              </p>
              <ul className="text-xs text-primary-200 mt-2 space-y-1">
                <li>✓ Employee spinal health with aging assets</li>
                <li>✓ Environmental impact of asset decomposition</li>
                <li>✓ Carbon & methane emissions in landfills</li>
                <li>✓ Global ecosystem effects</li>
              </ul>
            </div>

            <p className="text-xs text-neutral-400 mt-4">
              Replace this placeholder with your educational video file
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${width} ${height} bg-black rounded-xl overflow-hidden shadow-2xl group relative`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={posterImage}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        {/* Play Button */}
        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="p-4 bg-white/90 hover:bg-white text-neutral-900 rounded-full shadow-lg transform hover:scale-110 transition-transform"
            aria-label="Play video"
          >
            <Play className="w-8 h-8" />
          </button>
        )}
      </div>

      {/* Bottom Controls */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
          <button
            onClick={handlePlayPause}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors"
            aria-label="Pause video"
          >
            <Pause className="w-5 h-5" />
          </button>

          <button
            onClick={handleMute}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors"
            aria-label="Toggle mute"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={handleFullscreen}
            className="ml-auto p-2 hover:bg-white/20 rounded text-white transition-colors"
            aria-label="Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
