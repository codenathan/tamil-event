import { Link } from '@inertiajs/react';
import { contact, privacyPolicy } from '@/routes';

export default function TermsAndConditions() {
    return (
        <div className="prose prose-neutral dark:prose-invert container max-w-3xl px-4 py-16">
            <h1 className="mb-6 font-display text-3xl font-bold text-foreground md:text-4xl">
                Terms & Conditions
            </h1>

            <p className="mb-4 text-muted-foreground">
                Last updated: {new Date().getFullYear()}
            </p>

            <p className="mb-6 leading-relaxed text-foreground/80">
                These Terms & Conditions govern your use of TamilEventPlanner
                and any business listings or enquiries you submit through our
                platform. By using the site or submitting a listing, you agree
                to these terms.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                1. The service
            </h2>
            <p className="mb-4 leading-relaxed text-foreground/80">
                TamilEventPlanner is an online directory that helps users
                discover Tamil event–related vendors and service providers. We
                may update, suspend, or change features of the platform at any
                time. We do not guarantee uninterrupted or error-free access.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                2. Business listings
            </h2>
            <p className="mb-4 leading-relaxed text-foreground/80">
                When you submit a business listing, you confirm that you are
                authorised to represent that business and that the information
                you provide (including contact details, descriptions, images,
                and services) is accurate and not misleading. Listings are
                subject to review; we may approve, reject, edit, or remove any
                listing at our discretion to protect users and the integrity of
                the directory.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                3. Your content
            </h2>
            <p className="mb-4 leading-relaxed text-foreground/80">
                You retain ownership of content you submit, but you grant us a
                non-exclusive licence to host, display, and promote that
                content on TamilEventPlanner and in related marketing. You must
                not upload content that infringes others&apos; rights, is
                unlawful, defamatory, or contains malware.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                4. User conduct
            </h2>
            <p className="mb-4 leading-relaxed text-foreground/80">
                You agree not to misuse the platform (for example by scraping
                our data at scale, impersonating others, or sending spam). We may
                suspend or terminate access where we reasonably believe these
                terms have been breached.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                5. Third parties and enquiries
            </h2>
            <p className="mb-4 leading-relaxed text-foreground/80">
                Enquiries and bookings are between users and vendors.
                TamilEventPlanner is not a party to those arrangements. We do
                not warrant the quality, safety, or legality of any vendor or
                event service.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                6. Limitation of liability
            </h2>
            <p className="mb-4 leading-relaxed text-foreground/80">
                To the fullest extent permitted by law, TamilEventPlanner and
                its operators are not liable for any indirect, incidental, or
                consequential loss arising from your use of the site or
                reliance on listings. Our total liability for any claim relating
                to the service shall not exceed the amount you paid us in the
                twelve months before the claim, or zero if you have not paid us.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                7. Changes
            </h2>
            <p className="mb-4 leading-relaxed text-foreground/80">
                We may update these terms from time to time. Continued use of
                the platform after changes constitutes acceptance of the revised
                terms. The &quot;Last updated&quot; date above will be revised
                when material changes are made.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                8. Contact
            </h2>
            <p className="leading-relaxed text-foreground/80">
                For questions about these terms, please visit our{' '}
                <Link
                    href={contact.url()}
                    className="text-primary underline transition-colors hover:text-primary/80"
                >
                    Contact
                </Link>{' '}
                page. You may also review our{' '}
                <Link
                    href={privacyPolicy.url()}
                    className="text-primary underline transition-colors hover:text-primary/80"
                >
                    Privacy Policy
                </Link>
                .
            </p>
        </div>
    );
}
