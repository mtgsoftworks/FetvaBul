interface FetvaStructuredDataProps {
  fetva: {
    id: string;
    question: string;
    answer: string;
    category: string;
    source: string;
    date: string;
  };
}

export function FetvaStructuredData({ fetva }: FetvaStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: fetva.question,
      text: fetva.question,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: fetva.answer,
        author: {
          '@type': 'Organization',
          name: fetva.source,
        },
        dateCreated: fetva.date,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}