'use client';

import Image from 'next/image';
import { preload } from 'react-dom';

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
  if (src === '/images/hero-honey.webp') {
    const srcSet = '/images/hero-honey-640.webp 640w, /images/hero-honey-960.webp 960w, /images/hero-honey.webp 1376w';
    const imageSizes = sizes || '100vw';
    if (priority) preload(src, { as: 'image', imageSrcSet: srcSet, imageSizes, fetchPriority: 'high' });
    return <img src={src} srcSet={srcSet} sizes={imageSizes} alt={alt} width={1376} height={768}
      className={`${fill ? 'img-fill ' : ''}${className}`.trim()} loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined} />;
  }
  if (priority) preload(src, { as: 'image', fetchPriority: 'high' });
  if (fill) {
    return <Image src={src} alt={alt} fill sizes={sizes || '100vw'} fetchPriority={priority ? 'high' : undefined} loading={priority ? 'eager' : 'lazy'} className={`img-fill ${className}`.trim()} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 800}
      sizes={sizes}
      fetchPriority={priority ? 'high' : undefined} loading={priority ? 'eager' : 'lazy'}
      className={className}
    />
  );
}
