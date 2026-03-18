interface VideoPlaceholderProps {
  videoUrl?: string | null
}

export function VideoPlaceholder({ videoUrl }: VideoPlaceholderProps) {
  if (videoUrl) {
    return (
      <div className="mb-6 rounded-lg overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
        <video
          src={videoUrl}
          controls
          className="w-full"
          style={{ backgroundColor: '#FFFFFF' }}
        />
      </div>
    )
  }

  return (
    <div
      className="mb-6 rounded-lg p-8 flex flex-col items-center justify-center gap-3"
      style={{ backgroundColor: '#FFFFFF', border: '2px solid #D4A31E' }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#D4A31E20' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4A31E" className="w-6 h-6">
          <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
        </svg>
      </div>
      <p className="text-sm font-medium" style={{ color: '#D4A31E' }}>
        Video introduction coming soon
      </p>
    </div>
  )
}
