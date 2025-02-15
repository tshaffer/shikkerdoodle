import { useState } from "react";

const PhotoPicker = () => {
  const [pickerUrl, setPickerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startPhotoPickerSession = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/session", { credentials: "include" });
      const data = await response.json();

      if (data.pickerUrl) {
        setPickerUrl(data.pickerUrl);
      } else {
        alert("Failed to start session. Try logging in again.");
      }
    } catch (error) {
      console.error("Error starting Photo Picker session:", error);
      alert("An error occurred while starting the session.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <button
        onClick={startPhotoPickerSession}
        className="bg-green-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Loading..." : "Select Photos"}
      </button>

      {pickerUrl && (
        <div className="mt-4">
          <p>Click below to open Google Photos Picker:</p>
          <a
            href={pickerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Open Photo Picker
          </a>
        </div>
      )}
    </div>
  );
};

export default PhotoPicker;
