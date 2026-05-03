# Hero Image

Drop your logo or hero image (`.png`, `.jpg`, `.webp`) in this folder.

Then in `app/page.tsx`, replace `<HeroImagePlaceholder />` with:

```tsx
<Image
  src="/your-image.png"
  alt="{{businessName}}"
  fill
  style={{ objectFit: 'cover', borderRadius: '1rem' }}
  priority
/>
```

Wrap it in a `position: 'relative'` container with the same `aspectRatio: '4 / 3'` as the placeholder.

The `Image` component from `next/image` is not yet imported — add it at the top of `page.tsx`:

```tsx
import Image from 'next/image';
```
