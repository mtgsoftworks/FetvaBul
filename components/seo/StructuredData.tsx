interface FetvaStructuredDataProps {
  fetva: {
    id: string;
    question: string;
    answer: string;
    categories: string[];
    source?: string;
    date?: string;
  };
}

export function FetvaStructuredData({ fetva }: FetvaStructuredDataProps) {
  const dateCreated = fetva.date ?? new Date().toISOString();
  const keywords = Array.isArray(fetva.categories) ? fetva.categories.join(', ') : '';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: fetva.question,
      text: fetva.question,
      keywords,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: fetva.answer,
        author: {
          '@type': 'Organization',
          name: fetva.source || 'FetvaBul',
        },
        dateCreated,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'FetvaBul',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}