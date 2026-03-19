interface VideoPlaceholderProps {
  videoUrl?: string | null
}

function isEmbedUrl(url: string): boolean {
  return url.includes('heygen.com') || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')
}

function toEmbedSrc(url: string): string {
  // HeyGen share URLs → embed format
  if (url.includes('heygen.com/share/')) {
    return url.replace('/share/', '/embed/')
  }
  if (url.includes('heygen.com/videos/')) {
    const id = url.split('/videos/')[1]?.split('?')[0]
    return `https://app.heygen.com/embed/${id}`
  }
  return url
}

export function VideoPlaceholder({ videoUrl }: VideoPlaceholderProps) {
  if (!videoUrl) return null

  // Embed-based videos (HeyGen, YouTube, Vimeo)
  if (isEmbedUrl(videoUrl)) {
    return (
      <div className="mb-6 rounded-lg overflow-hidden" style={{ border: '1px solid #363654', aspectRatio: '16/9' }}>
        <iframe
          src={toEmbedSrc(videoUrl)}
          className="w-full h-full"
          style={{ backgroundColor: '#1A1A2E' }}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    )
  }

  // Direct video files (MP4 etc)
  return (
    <div className="mb-6 rounded-lg overflow-hidden" style={{ border: '1px solid #363654' }}>
      <video
        src={videoUrl}
        controls
        className="w-full"
        style={{ backgroundColor: '#1A1A2E' }}
      />
    </div>
  )
}
