'use server';

export default async function Head({ params }: { params: { slug: string } }) {
  try {
    const res = await fetch(`/api/categories/${encodeURIComponent(params.slug)}`, { cache: 'no-store' });
    const data = await res.json();
    const name: string | undefined = data?.category?.name;
    const desc: string | undefined = data?.category?.description;
    const title = name ? `${name} Fetvaları | FetvaBul` : 'Kategori | FetvaBul';
    const description = desc || 'Kategorilere göre düzenlenmiş fetvalar ve İslami bilgiler.';
    return (
      <>
        <title>{title}</title>
        <meta name="description" content={description} />
      </>
    );
  } catch {
    return (
      <>
        <title>Kategori | FetvaBul</title>
        <meta name="description" content="Kategorilere göre düzenlenmiş fetvalar ve İslami bilgiler." />
      </>
    );
  }
}
