'use client';

import Image from 'next/image';

type Props = {
  src: string;
  alt: string;
  /** Fill the positioned parent (the parent must be position: relative). */
  fill?: boolean;
  /** Above-the-fold image: load eagerly with high priority. */
  priority?: boolean;
  sizes?: string;
  className?: string;
  width?: number;
  height?: number;
};

/** Storefront image. Photos go through next/image so they are sized and cached. */
export default function Img({ src, alt, fill, priority, sizes, className = '', width, height }: Props) {
  if (fill) {
    return <Image src={src} alt={alt} fill sizes={sizes || '100vw'} priority={priority} className={`img-fill ${className}`.trim()} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 800}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
