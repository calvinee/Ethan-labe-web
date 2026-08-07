import type { HomeCredential } from '@/lib/home-visuals';

export function CredentialsStrip({ credentials }: { credentials: HomeCredential[] }) {
  return (
    <section className="credentials-strip" aria-labelledby="credentials-title">
      <div className="credentials-heading">
        <p className="research-label">CREDENTIALS / 能力背书</p>
        <h2 id="credentials-title">工程能力的公开注脚</h2>
      </div>
      <div className="credentials-grid">
        {credentials.map((credential) => (
          <article key={`${credential.label}-${credential.title}`}>
            <span>{credential.label}</span>
            <strong>{credential.title}</strong>
            <p>{credential.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
