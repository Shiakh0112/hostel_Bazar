import { useState } from "react";
import Modal from "../common/Modal";
import { X } from "lucide-react";

const HostelGallery = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openImage = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  if (!images.length) {
    return (
      <div className="bg-gray-100 rounded-2xl p-12 text-center border border-gray-200">
        <div className="text-4xl mb-3 opacity-30">📷</div>
        <p className="text-gray-500 font-medium">No photos available</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
            onClick={() => openImage(image)}
          >
            <img
              src={image.url}
              alt={`Hostel ${image.type || "image"}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
              <div className="bg-white/80 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all">
                <span className="text-indigo-600 font-bold text-xs">Zoom</span>
              </div>
            </div>
            {index === 0 && (
              <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                Main
              </span>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedImage?.type || "Image"}
        size="full"
      >
        {selectedImage && (
          <div className="flex flex-col items-center justify-center bg-black/10 min-h-[60vh]">
            <img
              src={selectedImage.url}
              alt={selectedImage.type || "Image"}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default HostelGallery;
