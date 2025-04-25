"use client";

import React, {useEffect, useState} from "react";
import { Input } from "./ui/input";
import { Camera, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/UseFetch";
import {processImageSearch} from "@/actions/home";

const HomeSearch = () => {
  const [searhTerm, setSearhTerm] = useState("");
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  const {
      loading: isProcessing,
      fn: processImageFn,
      data: processResult,
      error: processError,
  } = useFetch(processImageSearch)

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5 MB");
        return;
      }

      setIsUploading(true);
      setSearchImage(file);

      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result);
        setIsUploading(false);
        toast.success("Image uploaded successfully");
      };

      reader.onerror = () => {
        setIsUploading(false);
        toast.error("Failed to read the image");
      };

      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png"],
      },
      maxFiles: 1,
    });

  const handleTextSubmit = (e) => {
    e.preventDefault();

    if (!searhTerm.trim) {
      toast.error("Please enter a search key");
      return;
    }

    router.push(`/cars?search=${encodeURIComponent(searhTerm)}`);
  };

  const handleImageSearch = async (e) => {
    e.preventDefault();

    if (!searchImage) {
      toast.error("Please upload an image first");
      return;
    }

    // handle AI Logic
    await processImageFn(searchImage)
  };

  useEffect(() => {
    if (processError){
      toast.error(
          "Failed to analyze image: " + (processError?.message || "Unknown error")
      )
    }
  }, [processError])

  useEffect(() => {
    if (processResult?.success) {
      const params = new URLSearchParams()

      if (processResult.data.make) params.set("make", processResult.data.make);
      if (processResult.data.bodyType) params.set("bodyType", processResult.data.bodyType);
      if (processResult.data.color) params.set("color", processResult.data.color);

      router.push(`/cars?${params.toString()}`)
    }
  }, [processResult]);

  return (
    <div>
      <form onSubmit={handleTextSubmit}>
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Enter make, model, or use our AI Image search"
            onChange={(e) => setSearhTerm(e.target.value)}
            value={searhTerm}
            className="pl-10 pr-30 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm"
          />

          {/* Right section container */}
          <div className="absolute right-2 flex gap-2 items-center">
            <Camera
              size={35}
              onClick={() => setIsImageSearchActive(!isImageSearchActive)}
              className="cursor-pointer rounded-xl p-1.5"
              style={{
                background: isImageSearchActive ? "black" : "",
                color: isImageSearchActive ? "white" : "",
              }}
            />

            <Button type="submit" className="rounded-full px-4 py-2 text-sm">
              Search
            </Button>
          </div>
        </div>
      </form>
      {isImageSearchActive && (
        <div className="mt-4">
          <form className="space-y-4" onSubmit={handleImageSearch}>
            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center">
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Car Preview"
                    className="h-40 object-contain mb-4"
                  />

                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setSearchImage(null);
                      setImagePreview("");
                      toast.info("Image removed");
                    }}
                    className={"cursor-pointer"}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center ">
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-2">
                      {isDragActive && !isDragReject
                        ? "Leave the file here to upload"
                        : "Drag and drop a car image or click to select"}
                    </p>

                    {isDragReject && (
                      <p className="text-red-500 mb-2">Invalid image type</p>
                    )}

                    <p className="text-gray-400 text-sm">
                      Support: JPG, PNG, JPEG (max 5,b)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {imagePreview && (
              <Button type="submit" className={"w-full"} disabled={isUploading}>
                {isUploading ? "Uploading.." : "Search with this image"}
              </Button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default HomeSearch;
