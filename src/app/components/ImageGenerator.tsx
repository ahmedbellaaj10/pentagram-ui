"use client";
import { useState } from "react";

interface ImageGeneratorProps {
    generateImage: (text: string) => Promise<{success : boolean; imageUrl?: string; error?: string}>;
}

export default function ImageGenerator({ generateImage }: ImageGeneratorProps) {
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await generateImage(inputText);

            if (!data.success) {
                throw new Error(data.error || "Failed to generate image");
            }

            if (data.imageUrl) {
                const img = new Image();
                img.onload = () => {
                    setImageUrl(data.imageUrl);
                };
                img.src = data.imageUrl;
            }

            setInputText("");
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-lg mt-10">
                {/* Header */}
                <header className="border-b border-gray-200 dark:border-gray-700 p-4 text-center">
                    <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Pentagram : Instagram but with only AI generated images
                    </h1>
                </header>

                {/* Image Display */}
                <main className="p-4 flex flex-col items-center">
                    {imageUrl ? (
                        <div className="w-full rounded-lg overflow-hidden">
                            <img
                                src={imageUrl}
                                alt="Generated Image"
                                className="w-full"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <p className="text-gray-500 dark:text-gray-300">
                                No image generated yet
                            </p>
                        </div>
                    )}
                </main>
                
                {/* Form */}
                <form
                    className="p-4 border-t border-gray-200 dark:border-gray-700"
                    onSubmit={handleSubmit}
                >   
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter a description"
                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                    />
                    <button
                        type="submit"
                        className="w-full p-2 bg-blue-500 text-white rounded-lg mt-2"
                        disabled={isLoading}
                    >
                        {isLoading ? "Generating..." : "Generate Image"}
                    </button>
                </form>
            </div>
        </div>
    );
}
