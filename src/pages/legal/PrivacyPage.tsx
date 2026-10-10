import { ProsePage } from '@/components/layout/ProsePage';
import { site } from '@/config/site';

export default function PrivacyPage() {
  return (
    <ProsePage
      eyebrow="Legal"
      title="Privacy notice"
      description="How we collect, use and protect personal data."
      seoDescription="Privacy notice for the Global Financial Assets marketplace."
      template
    >
      <h2>What we collect</h2>
      <ul>
        <li>Account data: name, email, company, role, phone number and country.</li>
        <li>Enquiry data: the details you submit when enquiring about a listing.</li>
        <li>Mandate data: your acquisition criteria and budget ranges.</li>
        <li>Seller submissions and supporting documents.</li>
        <li>Security and audit records of actions taken on the platform.</li>
      </ul>
      <h2>How we use it</h2>
      <p>
        To operate the marketplace, review listings, respond to enquiries, make introductions you have agreed to, maintain
        security and meet legal obligations. We do not sell personal data.
      </p>
      <h2>Who can see it</h2>
      <p>
        Buyer contact details and enquiries are visible only to you and authorised platform staff. They are not shown to
        sellers without your consent. Confidential seller documents are held in private storage and are accessible only to the
        uploading seller and authorised reviewers.
      </p>
      <h2>Security</h2>
      <p>
        Access is enforced by database-level security policies, documents are released through short-lived signed links, and
        administrative actions are recorded in an audit log.
      </p>
      <h2>Your rights</h2>
      <p>
        Depending on your jurisdiction you may have rights of access, correction, deletion, restriction and objection. Contact{' '}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
      <h2>Retention, transfers and controller details</h2>
      <p>To be completed by counsel for the operating entity.</p>
    </ProsePage>
  );
}
