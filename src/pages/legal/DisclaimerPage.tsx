import { ProsePage } from '@/components/layout/ProsePage';
import { DISCLAIMER_POINTS } from '@/components/layout/Disclaimer';

export default function DisclaimerPage() {
  return (
    <ProsePage
      eyebrow="Legal"
      title="Important notice"
      description="Please read this notice before relying on any listing or information on this website."
      seoDescription="Important notice: listings are not offers or guarantees, licences may not be transferable and acquisitions can require regulatory approval."
      template
    >
      <h2>Listings are not offers</h2>
      <p>{DISCLAIMER_POINTS[0]} Nothing on this website is an offer to sell, a solicitation of an offer to buy, or a recommendation regarding any business, security or financial product.</p>
      <h2>Licences may not be transferable</h2>
      <p>{DISCLAIMER_POINTS[1]}</p>
      <h2>Regulatory approval</h2>
      <p>{DISCLAIMER_POINTS[2]} Buyers are responsible for determining which approvals are required and for obtaining them.</p>
      <h2>Verification states</h2>
      <p>{DISCLAIMER_POINTS[3]} A verification state is only displayed where an authorised reviewer has recorded the corresponding check.</p>
      <h2>Demo listings</h2>
      <p>
        Listings labelled DEMO are fictitious and exist only to demonstrate how the platform works. They do not describe real
        businesses, are not available for acquisition and are not associated with any seller. Verification states on demo
        listings are illustrative only.
      </p>
      <h2>No advice</h2>
      <p>
        We do not provide legal, tax, regulatory, accounting or investment advice. You should obtain independent professional
        advice and carry out your own due diligence before entering into any transaction.
      </p>
      <h2>No client money</h2>
      <p>The platform does not hold client money or act as escrow agent, and does not execute transactions.</p>
    </ProsePage>
  );
}
