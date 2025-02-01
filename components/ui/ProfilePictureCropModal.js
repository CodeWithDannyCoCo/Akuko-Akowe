"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Slider } from "./slider";
import { Minus, Plus, RotateCcw } from "lucide-react";

export default function ProfilePictureCropModal({ isOpen, onClose, onSave }) {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: "%", width: 100, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const [imgRef, setImgRef] = useState(null);
  const fileInputRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSrc(null);
      setCrop({ unit: "%", width: 100, aspect: 1 });
      setCompletedCrop(null);
      setZoom(1);
      setTempImageUrl(null);
      setImgRef(null);
      // Automatically open file picker when modal opens
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    }
  }, [isOpen]);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    } else {
      // If no file was selected, close the modal
      onClose();
    }
  };

  const handleZoomChange = useCallback((value) => {
    setZoom(value[0]);
  }, []);

  const onImageLoad = useCallback((img) => {
    setImgRef(img);
  }, []);

  const resetImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getCroppedImg = useCallback(
    (crop) => {
      if (!imgRef) return null;

      const canvas = document.createElement("canvas");
      const scaleX = imgRef.naturalWidth / imgRef.width;
      const scaleY = imgRef.naturalHeight / imgRef.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        imgRef,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            const url = URL.createObjectURL(blob);
            setTempImageUrl(url);
            resolve(url);
          },
          "image/jpeg",
          0.9
        );
      });
    },
    [imgRef]
  );

  const handleSave = useCallback(async () => {
    if (tempImageUrl) {
      onSave(tempImageUrl);
      onClose();
    } else if (src && completedCrop && imgRef) {
      const croppedImageUrl = await getCroppedImg(completedCrop);
      if (croppedImageUrl) {
        onSave(croppedImageUrl);
        onClose();
      }
    }
  }, [
    src,
    completedCrop,
    imgRef,
    tempImageUrl,
    onSave,
    onClose,
    getCroppedImg,
  ]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="hidden"
        id="picture-upload"
      />
      <Dialog open={isOpen && src !== null} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 border-0 dark:border dark:border-gray-800 shadow-2xl">
          <DialogHeader>
            <div className="flex justify-between items-center mb-4">
              <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                Adjust Profile Picture
              </DialogTitle>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Move and resize your picture to get the perfect crop.
            </p>
          </DialogHeader>

          <div className="space-y-6">
            <div className="relative w-full h-[400px] mx-auto overflow-hidden bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200/10 dark:border-gray-700/50 shadow-inner">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="!bg-transparent"
              >
                <img
                  ref={onImageLoad}
                  src={src}
                  alt="Crop me"
                  style={{ transform: `scale(${zoom})` }}
                  className="max-w-full max-h-[400px] object-contain"
                />
              </ReactCrop>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Zoom
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                  className="border-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
                >
                  <Minus size={16} />
                </Button>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={handleZoomChange}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  className="border-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={resetImage}
            >
              <RotateCcw size={16} className="mr-2" />
              Choose Different Photo
            </Button>
          </div>

          <DialogFooter className="sm:justify-between border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              disabled={!src || !completedCrop || !imgRef}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
