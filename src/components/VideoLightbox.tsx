import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface VideoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoLightbox = ({ isOpen, onClose, videoUrl }: VideoLightboxProps) => {
  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    // Handle shortened URLs (youtu.be/VIDEO_ID)
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle standard URLs (youtube.com/watch?v=VIDEO_ID)
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-black border-0">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)}
            title="Video"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoLightbox;