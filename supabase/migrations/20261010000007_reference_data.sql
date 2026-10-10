-- =============================================================================
-- Reference data required in every environment (not demo data).
-- Regulator summaries are general orientation only and must be kept current.
-- =============================================================================

insert into public.currency_rates (currency, rate_to_eur) values
  ('EUR', 1.0),
  ('USD', 0.92),
  ('GBP', 1.17),
  ('CHF', 1.05),
  ('AED', 0.25),
  ('SGD', 0.68)
on conflict (currency) do nothing;

insert into public.categories (slug, name, short_name, icon, sort_order, description, long_description, seo_title, seo_description) values
(
  'banks-financial-institutions', 'Banks & Financial Institutions', 'Banks', 'landmark', 10,
  'Licensed credit institutions, specialised banks, credit unions and deposit-taking institutions.',
  'Fully licensed and specialised banks, credit institutions and other deposit-taking businesses. Bank acquisitions are among the most heavily supervised transactions in finance: acquirers of qualifying holdings typically need prior approval from the banking supervisor, and in the euro area significant transactions involve the European Central Bank.',
  'Banks and financial institutions for sale',
  'Acquisition opportunities in licensed banks, specialised banks and credit institutions. Change-of-control approval is typically required.'
),
(
  'payments-emis', 'Payments & EMIs', 'Payments & EMIs', 'credit-card', 20,
  'Electronic money institutions, payment institutions and money transmitters with live or dormant authorisations.',
  'Electronic money institutions (EMIs), authorised and small payment institutions, money remittance businesses and money transmitters. Value often lies as much in safeguarding arrangements, banking partners, scheme memberships and passporting rights as in the authorisation itself.',
  'EMIs and payment institutions for sale',
  'Buy an authorised electronic money institution, payment institution or money transmitter. Compare jurisdictions, prices and verification status.'
),
(
  'crypto-digital-assets', 'Crypto & Digital Assets', 'Crypto & Digital Assets', 'bitcoin', 30,
  'Crypto-asset service providers, virtual asset service providers, exchanges, custodians and tokenisation platforms.',
  'Crypto-asset service providers (CASPs) authorised under the EU Markets in Crypto-Assets Regulation, virtual asset service providers (VASPs) in other regimes, exchanges, brokers, custodians and tokenisation businesses. Authorisation scope, custody arrangements and Travel Rule compliance are central to diligence.',
  'Crypto and digital asset businesses for sale',
  'Acquire an authorised CASP, VASP, crypto exchange or custodian. Listings show regulator, operating status and verification state.'
),
(
  'financial-licences', 'Financial Licences', 'Licences', 'file-badge', 40,
  'Companies holding financial authorisations, often pre-launch or dormant. Licences are rarely transferable on their own.',
  'Regulated companies whose principal value is an existing authorisation, often pre-launch or with limited activity. In most jurisdictions a licence cannot be transferred separately from the company that holds it, and a change of control requires regulatory approval. Dormant licences may be at risk of withdrawal.',
  'Companies with financial licences for sale',
  'Regulated companies holding financial licences and authorisations. Understand transferability and change-of-control requirements before you enquire.'
),
(
  'forex-brokerage', 'Forex & Brokerage', 'Forex & Brokerage', 'chart-candlestick', 50,
  'Investment firms, broker-dealers, CFD and forex brokers, introducing brokers and trading platforms.',
  'Investment firms and broker-dealers offering execution, reception and transmission of orders, dealing on own account or portfolio management, including CFD and forex brokers. Client categorisation, product governance and marketing restrictions vary sharply by jurisdiction.',
  'Forex brokers and brokerages for sale',
  'Acquisition opportunities in investment firms, broker-dealers and forex/CFD brokers across major and offshore jurisdictions.'
),
(
  'investment-firms-funds', 'Investment Firms & Funds', 'Investment & Funds', 'briefcase', 60,
  'Asset and fund managers, AIFMs, management companies, fund platforms and wealth managers.',
  'Alternative investment fund managers, UCITS management companies, portfolio and wealth managers, fund administrators and fund platforms. Assets under management, investor base and key-person dependencies usually drive value.',
  'Investment firms and fund managers for sale',
  'Buy an asset manager, AIFM, UCITS management company, wealth manager or fund administrator.'
),
(
  'casino-igaming', 'Casino & iGaming', 'iGaming', 'dices', 70,
  'Licensed online casino, sportsbook and B2B gaming operators and supplier businesses.',
  'B2C and B2B online gambling businesses including casino, sportsbook and platform providers. Gaming licences are typically issued to a specific entity and its qualifying shareholders; changes of ownership usually need regulator approval, and payment processing relationships are a key diligence item.',
  'iGaming and online casino businesses for sale',
  'Acquire a licensed online casino, sportsbook or B2B iGaming business. Gaming licences generally require approval on change of ownership.'
),
(
  'payment-gateways-banking-infrastructure', 'Payment Gateways & Banking Infrastructure', 'Payment Infrastructure', 'network', 80,
  'Payment gateways, processors, card issuing, core banking and banking-as-a-service technology.',
  'Payment gateways, acquiring and issuer processors, card-issuing programmes, core banking systems and banking-as-a-service platforms. These are often acquired as technology or asset purchases, sometimes alongside the regulated entity that operates them.',
  'Payment gateways and banking infrastructure for sale',
  'Buy payment gateway, processing, card issuing, core banking or banking-as-a-service businesses and platforms.'
),
(
  'insurance', 'Insurance', 'Insurance', 'umbrella', 90,
  'Insurers, reinsurers, captives, protected cell companies and insurance intermediaries.',
  'Insurance and reinsurance undertakings, captives, protected cell companies, managing general agents and brokers. Solvency position, run-off liabilities and the supervisor’s approval of new controllers are central considerations.',
  'Insurance companies and brokers for sale',
  'Acquisition opportunities in insurers, reinsurers, captives, cell companies, MGAs and insurance brokers.'
),
(
  'other-financial-businesses', 'Other Financial Businesses', 'Other', 'building', 100,
  'Lenders, crowdfunding platforms, trust and corporate service providers, debt collection and other financial businesses.',
  'Consumer and commercial lenders, crowdfunding and peer-to-peer platforms, trust and corporate service providers, debt purchasers and collectors, and other financial businesses that do not fit the categories above.',
  'Other financial businesses for sale',
  'Lenders, crowdfunding platforms, trust and corporate service providers and other financial businesses available for acquisition.'
)
on conflict (slug) do nothing;

insert into public.jurisdictions (slug, name, region, iso_code, sort_order, description, regulator_summary) values
('lithuania', 'Lithuania', 'European Union', 'LT', 10,
 'A leading EU hub for electronic money and payment institutions, with direct access to the central bank payment system for licensed firms.',
 'The Bank of Lithuania supervises banks, EMIs, payment institutions, investment firms and crypto-asset service providers.'),
('malta', 'Malta', 'European Union', 'MT', 20,
 'An established EU centre for financial services, funds, insurance and online gaming.',
 'The Malta Financial Services Authority (MFSA) supervises financial services; the Malta Gaming Authority (MGA) licenses gaming.'),
('cyprus', 'Cyprus', 'European Union', 'CY', 30,
 'A popular EU base for investment firms, brokers and electronic money institutions.',
 'The Cyprus Securities and Exchange Commission (CySEC) supervises investment firms and crypto-asset service providers; the Central Bank of Cyprus supervises banks, EMIs and payment institutions.'),
('estonia', 'Estonia', 'European Union', 'EE', 40,
 'A digitally advanced EU member state with a significant fintech and crypto sector.',
 'Finantsinspektsioon (the Estonian Financial Supervision and Resolution Authority) supervises credit, payment, investment and crypto-asset service providers.'),
('ireland', 'Ireland', 'European Union', 'IE', 50,
 'A major EU gateway for payments, funds, insurance and international banking.',
 'The Central Bank of Ireland authorises and supervises banks, payment and e-money institutions, investment firms, funds and insurers.'),
('luxembourg', 'Luxembourg', 'European Union', 'LU', 60,
 'Europe’s largest investment fund centre and a base for private banking, payments and insurance.',
 'The CSSF supervises banks, investment firms, payment and e-money institutions and funds; the Commissariat aux Assurances (CAA) supervises insurers.'),
('netherlands', 'Netherlands', 'European Union', 'NL', 70,
 'A large EU market with strong payments, banking and asset management sectors.',
 'De Nederlandsche Bank (DNB) handles prudential supervision; the Authority for the Financial Markets (AFM) supervises conduct and investment services.'),
('germany', 'Germany', 'European Union', 'DE', 80,
 'The EU’s largest economy, with a deep banking, payments and asset management market.',
 'BaFin, together with the Deutsche Bundesbank, supervises banks, payment institutions, investment firms and insurers.'),
('united-kingdom', 'United Kingdom', 'Europe (non-EU)', 'GB', 100,
 'A global financial centre with mature regimes for payments, e-money, investment, insurance and consumer credit.',
 'The Financial Conduct Authority (FCA) authorises conduct-regulated firms; the Prudential Regulation Authority (PRA) supervises banks and insurers. Change-in-control notifications are required for qualifying holdings.'),
('gibraltar', 'Gibraltar', 'Europe (non-EU)', 'GI', 110,
 'A specialist centre for insurance, online gaming and distributed-ledger technology businesses.',
 'The Gibraltar Financial Services Commission (GFSC) supervises financial services including DLT providers; gaming is licensed by the Gibraltar Gambling Commissioner.'),
('isle-of-man', 'Isle of Man', 'Europe (non-EU)', 'IM', 120,
 'A Crown Dependency with established insurance, fiduciary and online gaming sectors.',
 'The Isle of Man Financial Services Authority supervises financial services; the Gambling Supervision Commission licenses gaming.'),
('switzerland', 'Switzerland', 'Europe (non-EU)', 'CH', 130,
 'A leading centre for private banking, wealth and asset management and digital assets.',
 'FINMA authorises and supervises banks, securities firms, fund managers and insurers.'),
('liechtenstein', 'Liechtenstein', 'Europe (non-EU)', 'LI', 140,
 'An EEA member offering passporting into the EU for banks, funds, insurers and token service providers.',
 'The Financial Market Authority (FMA) Liechtenstein supervises the financial sector, including token and trusted technology service providers.'),
('united-arab-emirates', 'United Arab Emirates', 'Middle East', 'AE', 200,
 'A fast-growing financial hub with onshore and free-zone regimes, including DIFC and ADGM.',
 'Regulators include the Central Bank of the UAE, the Dubai Financial Services Authority (DIFC), the Financial Services Regulatory Authority (ADGM) and Dubai’s Virtual Assets Regulatory Authority (VARA).'),
('singapore', 'Singapore', 'Asia-Pacific', 'SG', 300,
 'Asia’s leading centre for payments, wealth management, funds and digital assets.',
 'The Monetary Authority of Singapore (MAS) regulates banks, payment service providers, capital markets intermediaries and insurers.'),
('hong-kong', 'Hong Kong', 'Asia-Pacific', 'HK', 310,
 'A gateway to Greater China with deep banking, securities and asset management markets.',
 'The HKMA supervises banks and stored value facilities; the Securities and Futures Commission (SFC) licenses securities and virtual asset businesses; the Insurance Authority supervises insurers.'),
('australia', 'Australia', 'Asia-Pacific', 'AU', 320,
 'A large, well-regulated market for financial services, payments and wealth management.',
 'ASIC administers Australian financial services and credit licences; APRA supervises banks and insurers; AUSTRAC oversees AML/CTF compliance.'),
('labuan', 'Labuan (Malaysia)', 'Asia-Pacific', 'MY', 330,
 'A Malaysian international business and financial centre for banking, insurance, trust and fintech businesses.',
 'The Labuan Financial Services Authority (Labuan FSA) licenses and supervises Labuan financial institutions.'),
('mauritius', 'Mauritius', 'Africa & Indian Ocean', 'MU', 400,
 'An international financial centre bridging Africa and Asia for investment dealers, funds and fintech.',
 'The Financial Services Commission (FSC) Mauritius supervises non-bank financial services; the Bank of Mauritius supervises banks.'),
('seychelles', 'Seychelles', 'Africa & Indian Ocean', 'SC', 410,
 'An offshore centre used for securities dealers and investment businesses.',
 'The Financial Services Authority (FSA) Seychelles supervises non-bank financial services, including securities dealers.'),
('british-virgin-islands', 'British Virgin Islands', 'Caribbean & Atlantic', 'VG', 500,
 'A leading offshore jurisdiction for holding structures, funds and investment businesses.',
 'The BVI Financial Services Commission supervises investment business, funds, insurance and virtual asset service providers.'),
('cayman-islands', 'Cayman Islands', 'Caribbean & Atlantic', 'KY', 510,
 'The leading domicile for hedge funds and a centre for banking, insurance and virtual assets.',
 'The Cayman Islands Monetary Authority (CIMA) supervises banks, insurers, funds, securities investment businesses and VASPs.'),
('bermuda', 'Bermuda', 'Caribbean & Atlantic', 'BM', 520,
 'A global reinsurance and insurance-linked securities centre with a digital asset regime.',
 'The Bermuda Monetary Authority (BMA) supervises insurers, banks, investment businesses and digital asset businesses.'),
('bahamas', 'Bahamas', 'Caribbean & Atlantic', 'BS', 530,
 'An offshore centre for private banking, wealth management and securities businesses.',
 'The Central Bank of The Bahamas supervises banks and trust companies; the Securities Commission of The Bahamas regulates securities and digital asset businesses.'),
('curacao', 'Curaçao', 'Caribbean & Atlantic', 'CW', 540,
 'A long-established online gaming jurisdiction that has moved to a new licensing framework.',
 'The Curaçao Gaming Authority licenses online gaming; the Central Bank of Curaçao and Sint Maarten supervises financial institutions.'),
('canada', 'Canada', 'North America', 'CA', 600,
 'A stable G7 market with federal and provincial regulation of banking, securities and money services.',
 'OSFI supervises federally regulated banks and insurers; FINTRAC registers money services businesses; CIRO and provincial securities commissions regulate dealers.'),
('united-states', 'United States', 'North America', 'US', 610,
 'The world’s largest financial market, with layered federal and state regulation.',
 'Money transmission is licensed state by state; broker-dealers are regulated by the SEC and FINRA; banks by federal and state banking agencies. FinCEN registration applies to money services businesses.')
on conflict (slug) do nothing;
