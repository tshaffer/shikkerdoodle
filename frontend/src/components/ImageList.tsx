import { useEffect, useState } from "react";

interface MediaFile {
  baseUrl: string;
  filename: string;
  mediaFileMetadata: any;
  mimeType: string;
}

interface MediaItem {
  id: string;
  createTime: string;
  mediaFile: MediaFile;
  type: string;
  baseUrl: string;
  mimeType: string;
}

const ImageList = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/images", { credentials: "include" });
      const data = await response.json();


      if (data.error) {
        setError("Failed to fetch images. Try selecting photos again.");
      } else if (data.mediaItems) {
        setMediaItems(data.mediaItems);
        console.log('MediaItems:');
        console.log(data.mediaItems);
      } else {
        setError("No images found. Try selecting photos again.");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("An error occurred while fetching images.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Selected Photos</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaItems.map((mediaItem) => {
          const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(mediaItem.mediaFile.baseUrl)}`;
          return (
            <img
              key={mediaItem.id}
              src={proxyUrl}
              alt={mediaItem.mediaFile.filename}
              className="w-full h-auto rounded-lg shadow-md"
              onError={(e) => console.error(`Image failed to load: ${proxyUrl}`)}
            />
          );
        })}
      </div>

      <button
        onClick={fetchImages}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Refresh Images
      </button>
    </div>
  );
};

export default ImageList;
