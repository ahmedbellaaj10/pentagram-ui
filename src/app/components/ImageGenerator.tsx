"use client";

import { useEffect, useState } from "react";

interface Image {
  url: string;
  prompt: string;
}

export default function ImageGenerator({ generateImage }: { generateImage: (text: string) => Promise<any> }) {
  const [images, setImages] = useState<Image[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/generate-image");
        const data = await response.json();
        if (data.success) {
          setImages(data.images);
        } else {
          console.error("Failed to fetch images:", data.error);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await generateImage(inputText);
      if (!data.success) throw new Error(data.error);

      setImages((prev) => [{ url: data.imageUrl, prompt: inputText }, ...prev]);

      setInputText("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Pentagram - the AI Instagram Gallery
        </h1>
      </header>

      <main className="flex-grow p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.length > 0 ? (
            images.map((image, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-lg shadow-lg"
              >
                <img
                  src={image.url}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm">{image.prompt}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-300 col-span-full">
              No images generated yet.
            </p>
          )}
        </div>
      </main>

      <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="flex-grow p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </form>
      </footer>
    </div>
  );
}
