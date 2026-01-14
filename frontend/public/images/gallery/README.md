# Gallery Images Directory

Place your hostel photos in this directory with the following naming convention:

## Simple Image Names:

Just name your photos as:
- `photo-1.jpg`
- `photo-2.jpg`
- `photo-3.jpg`
- `photo-4.jpg`
- `photo-5.jpg`
- `photo-6.jpg`
- `photo-7.jpg`
- `photo-8.jpg`
- `photo-9.jpg`
- `photo-10.jpg`
- `photo-11.jpg`
- `photo-12.jpg`

You can add as many photos as you want - just keep numbering them sequentially.

## Image Specifications:
- **Format**: JPG, JPEG, PNG
- **Recommended Size**: 1920x1080 pixels (landscape) or 1080x1080 (square)
- **Max File Size**: Keep under 2MB for fast loading

## Adding More Images:

To add more images to the gallery:
1. Place the image file in this directory (e.g., `photo-13.jpg`, `photo-14.jpg`)
2. Update `/frontend/src/pages/Gallery.jsx` and add a new entry to the `galleryImages` array:

```javascript
{
  id: 13,
  src: '/images/gallery/photo-13.jpg',
  alt: 'Visitors Hostel',
  title: 'Your Photo Title'
}
```

## Current Images:
Currently, you have the following images in `/frontend/public/images/`:
- `hero.jpg` - Used in homepage hero section
- `room.jpg` - Used as fallback/placeholder

These images will also be used as fallback if gallery images are not found.
