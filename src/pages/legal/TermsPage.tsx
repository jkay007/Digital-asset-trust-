import { Link } from 'react-router-dom';
import { ProsePage } from '@/components/layout/ProsePage';

export default function TermsPage() {
  return (
    <ProsePage
      eyebrow="Legal"
      title="Terms of use"
      description="The terms that apply to your use of the Global Financial Assets platform."
      seoDescription="Terms of use for the Global Financial Assets marketplace."
      template
    >
      <h2>1. About the platform</h2>
      <p>
        Global Financial Assets is an online marketplace that allows owners of financial businesses to present opportunities
        and allows prospective buyers to discover and enquire about them. We are not a party to any transaction.
      </p>
      <h2>2. Accounts</h2>
      <p>
        You must provide accurate information, keep your credentials secure and use the platform only for legitimate
        purposes. Access may be suspended where we suspect misuse, fraud or breach of these terms.
      </p>
      <h2>3. Seller obligations</h2>
      <p>
        Sellers confirm that they are authorised to market the business, that information submitted is accurate and not
        misleading, and that they will promptly notify us of material changes. Listings are published only after approval and
        may be edited, unpublished or removed at our discretion.
      </p>
      <h2>4. Buyer obligations</h2>
      <p>
        Buyers must keep confidential information confidential, use it only to evaluate the opportunity, and comply with any
        non-disclosure agreement.
      </p>
      <h2>5. No reliance</h2>
      <p>
        Information is provided by sellers and has not been audited. Please read the <Link to="/legal/disclaimer">important notice</Link>.
      </p>
      <h2>6. Liability</h2>
      <p>To be completed by counsel for the operating entity and governing law.</p>
      <h2>7. Governing law</h2>
      <p>To be completed by counsel.</p>
    </ProsePage>
  );
}
