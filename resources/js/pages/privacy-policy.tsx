import { Link } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <div className="prose prose-neutral dark:prose-invert container max-w-3xl px-4 py-16">
            <h1 className="mb-6 font-display text-3xl font-bold text-foreground md:text-4xl">
                Privacy Policy
            </h1>

            <p className="mb-4 text-muted-foreground">
                Last updated: {new Date().getFullYear()}
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                1. Information We Collect
            </h2>
            <p className="mb-4 leading-relaxed text-foreground/80">
                We collect information you provide directly, such as your name,
                email address, and phone number when you contact us or list your
                business. We also collect usage data through cookies and similar
                technologies.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                2. How We Use Cookies
            </h2>
            <p className="mb-4 leading-relaxed text-foreground/80">
                Cookies help us understand how you use our site, remember your
                preferences, and improve your experience. You can accept or
                decline cookies when you first visit our site. Declining cookies
                will redirect you away from our website.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                3. How We Use Your Information
            </h2>
            <p className="mb-4 leading-relaxed text-foreground/80">
                We use your information to provide and improve our services,
                respond to enquiries, process business listings, and communicate
                with you about our platform.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                4. Data Sharing
            </h2>
            <p className="mb-4 leading-relaxed text-foreground/80">
                We do not sell your personal information. We may share data with
                service providers who assist in operating our platform, subject
                to confidentiality agreements.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                5. Your Rights
            </h2>
            <p className="mb-4 leading-relaxed text-foreground/80">
                You have the right to access, correct, or delete your personal
                data. Contact us at any time to exercise these rights.
            </p>

            <h2 className="mt-8 mb-3 font-display text-xl font-semibold">
                6. Contact
            </h2>
            <p className="leading-relaxed text-foreground/80">
                If you have questions about this policy, please visit our{' '}
                <Link
                    href="/contact"
                    className="text-primary underline transition-colors hover:text-primary/80"
                >
                    Contact
                </Link>{' '}
                page.
            </p>
        </div>
    );
}
