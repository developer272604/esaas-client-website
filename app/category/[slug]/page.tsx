import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryView } from '@/components/views/ListViews';
import { getCategory as getStaticCategory, getCategories } from '@/lib/catalog';
import { getCategory, categories } from '@/lib/catalog/config';
import { pageMeta } from '@/lib/seo';
import type { Category } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

// Generate static paths from both sources
export function generateStaticParams() {
  try {
    // Try to get from static JSON first
    const staticCategories = getCategories();
    if (staticCategories.length > 0) {
      return staticCategories.map((c: any) => ({ slug: c.slug }));
    }
  } catch {
    // Fall back to hardcoded categories
  }
  
  // Fallback to hardcoded categories
  return categories.map((c) => ({ slug: c.slug }));
}

// Adapt new category format to old format for metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  let category: Category | undefined;
  
  // Try static data first
  try {
    const staticCat = getStaticCategory(slug);
    if (staticCat) {
      category = {
        slug: staticCat.slug,
        name: staticCat.name,
        blurb: staticCat.description || '',
        image: '',
      };
    }
  } catch {
    // Try hardcoded data
  }
  
  // Fallback to hardcoded
  if (!category) {
    category = getCategory(slug);
  }
  
  if (!category) {
    return pageMeta('Category not found', 'That category is not in this store.', `/category/${slug}`);
  }
  
  return pageMeta(category.name, category.blurb, `/category/${slug}`);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  
  // Check if category exists in either source
  let categoryExists = false;
  try {
    const staticCat = getStaticCategory(slug);
    if (staticCat) {
      categoryExists = true;
    }
  } catch {
    // Try hardcoded
  }
  
  if (!categoryExists) {
    categoryExists = !!getCategory(slug);
  }
  
  if (!categoryExists) {
    notFound();
  }
  
  return <CategoryView slug={slug} />;
}
