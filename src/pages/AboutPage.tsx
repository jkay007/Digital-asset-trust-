import { ProsePage } from '@/components/layout/ProsePage';

export default function AboutPage() {
  return (
    <ProsePage
      eyebrow="Company"
      title="About Global Financial Assets"
      description="A moderated marketplace for the acquisition and sale of regulated financial businesses."
      seoDescription="About Global Financial Assets, a confidential marketplace for regulated financial businesses and licences."
    >
      <p>
        Global Financial Assets brings structure and transparency to a fragmented market. Owners of banks, payment and
        e-money institutions, crypto-asset service providers, brokerages, investment firms, insurers and other financial
        businesses can present opportunities discreetly. Qualified buyers can search them with clear, consistent information.
      </p>
      <h2>Our approach</h2>
      <ul>
        <li>
          <strong>Moderation first.</strong> Nothing is published until an authorised administrator has approved it.
        </li>
        <li>
          <strong>Honest verification.</strong> We display only the checks an authorised reviewer has recorded, with dates.
        </li>
        <li>
          <strong>Confidentiality.</strong> Public listings are anonymised; documents stay in private storage.
        </li>
        <li>
          <strong>Regulatory realism.</strong> We are clear that licences may not be transferable and that acquisitions often
          require regulatory approval.
        </li>
      </ul>
      <h2>What we are not</h2>
      <p>
        We are not a bank, broker, investment adviser or law firm. We do not hold client money, execute transactions or give
        advice.
      </p>
    </ProsePage>
  );
}
