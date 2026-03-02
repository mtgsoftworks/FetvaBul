'use server';

export default async function Head({ params }: { params: { id: string } }) {
  try {
    const res = await fetch(`/api/fatwas/${encodeURIComponent(params.id)}`, { cache: 'no-store' });
    const data = await res.json();
    const question: string | undefined = data?.fatwa?.question;
    const answer: string | undefined = data?.fatwa?.answer;
    const title = question ? `${question} | FetvaBul` : 'Fetva | FetvaBul';
    const desc = answer ? answer.replace(/\s+/g, ' ').slice(0, 160) : 'Güvenilir İslami bilgi kaynağınız';
    return (
      <>
        <title>{title}</title>
        <meta name="description" content={desc} />
      </>
    );
  } catch {
    return (
      <>
        <title>Fetva | FetvaBul</title>
        <meta name="description" content="Güvenilir İslami bilgi kaynağınız" />
      </>
    );
  }
}
