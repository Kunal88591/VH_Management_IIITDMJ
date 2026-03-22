import { useState } from 'react';
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Gallery images - you can add more images here
  const galleryImages = [
    {
      id: 1,
      src: '/images/gallery/photo-1.jpg',
      alt: 'Visitors Hostel',
      title: 'Visitors Hostel'
    },
    {
      id: 2,
      src: '/images/gallery/photo-2.jpg',
      alt: 'Hostel View',
      title: 'Hostel View'
    },
    {
      id: 3,
      src: '/images/gallery/photo-3.jpg',
      alt: 'Accommodation',
      title: 'Accommodation'
    },
    {
      id: 4,
      src: '/images/gallery/photo-4.jpg',
      alt: 'Hostel Facility',
      title: 'Hostel Facility'
    },
    {
      id: 5,
      src: '/images/gallery/photo-5.jpg',
      alt: 'Hostel Interior',
      title: 'Hostel Interior'
    },
    {
      id: 6,
      src: '/images/gallery/photo-6.jpg',
      alt: 'Hostel Space',
      title: 'Hostel Space'
    },
    {
      id: 7,
      src: '/images/gallery/photo-7.jpg',
      alt: 'Hostel Area',
      title: 'Hostel Area'
    },
    {
      id: 8,
      src: '/images/gallery/photo-8.jpg',
      alt: 'Hostel Premises',
      title: 'Hostel Premises'
    },
    {
      id: 9,
      src: '/images/gallery/photo-9.jpg',
      alt: 'Hostel Building',
      title: 'Hostel Building'
    },
    {
      id: 10,
      src: '/images/gallery/photo-10.jpg',
      alt: 'Hostel Environment',
      title: 'Hostel Environment'
    },
    {
      id: 11,
      src: '/images/gallery/photo-11.jpg',
      alt: 'Hostel Setting',
      title: 'Hostel Setting'
    },
    {
      id: 12,
      src: '/images/gallery/photo-12.jpg',
      alt: 'Hostel Location',
      title: 'Hostel Location'
    },
    {
      id: 13,
      src: '/images/gallery/photo-13.jpg',
      alt: 'Hostel Photo',
      title: 'Hostel Photo'
    },
    {
      id: 14,
      src: '/images/gallery/photo-14.jpg',
      alt: 'Hostel View',
      title: 'Hostel View'
    },
    {
      id: 15,
      src: '/images/gallery/photo-15.jpg',
      alt: 'Hostel Image',
      title: 'Hostel Image'
    }
  ];

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : galleryImages.length - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex < galleryImages.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!selectedImage) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <div className="animate-fadeIn" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] bg-gradient-hero flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-poppins text-4xl md:text-5xl font-bold text-white mb-4">
            Photo Gallery
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Take a visual tour of our facilities and accommodation
          </p>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer aspect-square"
                onClick={() => openLightbox(image, index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to placeholder if image doesn't exist
                    e.target.src = '/images/room.jpg';
                  }}
                />
              </div>
            ))}
          </div>

          {/* No images message */}
          {galleryImages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No images available</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
            aria-label="Close"
          >
            <HiX className="w-8 h-8" />
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-50"
            aria-label="Previous"
          >
            <HiChevronLeft className="w-10 h-10" />
          </button>

          {/* Image */}
          <div 
            className="relative max-w-6xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              loading="eager"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = '/images/room.jpg';
              }}
            />
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-semibold mb-1">{selectedImage.title}</h3>
              <p className="text-gray-300">{selectedImage.alt}</p>
              <p className="text-sm text-gray-400 mt-2">
                {currentIndex + 1} / {galleryImages.length}
              </p>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-50"
            aria-label="Next"
          >
            <HiChevronRight className="w-10 h-10" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
