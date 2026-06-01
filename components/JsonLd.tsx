/**
 * Renders a JSON-LD structured-data block. Server component — emitted into the
 * HTML so crawlers see it without executing JS.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((entry, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Structured data is trusted, app-generated content.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}
