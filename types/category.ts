import { z } from 'zod';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  fatwaCount: number;
  children?: Category[];
}

export type CategoryNode = Category;

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryWithHierarchy extends Category {
  level: number;
  path: string[];
  breadcrumbs: CategoryBreadcrumb[];
}

export interface CategoryStats {
  id: string;
  name: string;
  fatwaCount: number;
  viewCount: number;
  popularFatwas: string[];
  recentActivity: Date;
}

export interface CategoryTreeNode {
  category: CategoryNode;
  children: CategoryTreeNode[];
  depth: number;
}

export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  parentId: z.string().optional(),
  order: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  fatwaCount: z.number().min(0).default(0),
});

export const CategoryBreadcrumbSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const CategoryWithHierarchySchema = CategorySchema.extend({
  level: z.number().min(0),
  path: z.array(z.string()),
  breadcrumbs: z.array(CategoryBreadcrumbSchema),
});

export const CategoryStatsSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  fatwaCount: z.number().min(0),
  viewCount: z.number().min(0),
  popularFatwas: z.array(z.string()),
  recentActivity: z.date(),
});

export function isValidCategory(data: unknown): data is Category {
  return CategorySchema.safeParse(data).success;
}

export function createCategorySlug(name: string): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return '';

  const normalized = trimmed
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U');

  return normalized
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/&/g, ' ve ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildCategoryHierarchy(categories: Category[]): CategoryTreeNode[] {
  const nodeMap = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  categories.forEach(category => {
    nodeMap.set(category.id, {
      category,
      children: [],
      depth: 0,
    });
  });

  nodeMap.forEach(node => {
    const parentId = node.category.parentId;
    if (parentId) {
      const parent = nodeMap.get(parentId);
      if (parent) {
        node.depth = parent.depth + 1;
        parent.children.push(node);
        return;
      }
    }

    roots.push(node);
  });

  return roots;
}
