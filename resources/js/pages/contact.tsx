import { useForm } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { store } from '@/routes/contact';

export default function Contact() {
    const { props } = usePage<{ flash: { success?: string } }>();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    useEffect(() => {
        if (props.flash?.success) {
            reset();
        }
    }, [props.flash?.success, reset]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(store.url());
    }

    return (
        <>
            <div className="container max-w-2xl px-4 py-16">
                <h1 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
                    Contact Us
                </h1>
                <p className="mb-8 text-muted-foreground">
                    Have a question or feedback? We'd love to hear from you.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label
                            htmlFor="name"
                            className="block text-sm font-medium"
                        >
                            Name{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Your name"
                            maxLength={100}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="email"
                            className="block text-sm font-medium"
                        >
                            Email{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="you@example.com"
                            maxLength={255}
                            required
                        />
                        <InputError message={errors.email} />
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="phone"
                            className="block text-sm font-medium"
                        >
                            Phone{' '}
                            <span className="text-xs text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            placeholder="+44 7700 000000"
                            maxLength={20}
                        />
                        <InputError message={errors.phone} />
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="message"
                            className="block text-sm font-medium"
                        >
                            Message{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="message"
                            name="message"
                            value={data.message}
                            onChange={e => setData('message', e.target.value)}
                            placeholder="How can we help?"
                            rows={5}
                            maxLength={2000}
                            required
                        />
                        <InputError message={errors.message} />
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                    >
                        Send Message
                    </Button>
                </form>
            </div>
        </>
    );
}
