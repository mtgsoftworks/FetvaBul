import { Suspense } from 'react';
import AramaClient from './AramaClient';

export const revalidate = 300;

export default function AramaPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const initialQuery = process.env.STATIC_EXPORT === '1' ? '' : searchParams?.q?.trim() ?? '';

  return (
    <Suspense fallback={null}>
      <AramaClient initialQuery={initialQuery} />
    </Suspense>
  );
}
