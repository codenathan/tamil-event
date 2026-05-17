<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Notifications\Concerns\CopiesAdminOnMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Routing\UrlGenerator;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VendorWelcomeNotification extends Notification implements ShouldQueue
{
    use CopiesAdminOnMail;
    use Queueable;

    public function __construct(public string $token) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = $this->resetUrl($notifiable);

        return $this->withAdminBcc(
            (new MailMessage)
                ->subject('Welcome! Set your password')
                ->greeting('Welcome to our platform 👋')
                ->line('Your vendor account has been approved.')
                ->line('Click below to set your password and get started.')
                ->action('Set Password', $url)
                ->line('If you did not expect this, please ignore this email.'),
        );
    }

    protected function resetUrl(object $notifiable): string|UrlGenerator
    {
        return url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->email,
        ], false));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
