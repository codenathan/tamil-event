<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Notifications\Concerns\CopiesAdminOnMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VendorWelcomeNotification extends Notification implements ShouldQueue
{
    use CopiesAdminOnMail;
    use Queueable;

    /**
     * How long the "set your password" link stays valid.
     */
    public const int LINK_EXPIRES_IN_DAYS = 7;

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = $this->invitationUrl($notifiable);

        return $this->withAdminBcc(
            (new MailMessage)
                ->subject('Welcome! Set your password')
                ->greeting('Welcome to our platform 👋')
                ->line('Your vendor account has been approved.')
                ->line('Click below to set your password and get started.')
                ->action('Set Password', $url)
                ->line('This link is valid for '.self::LINK_EXPIRES_IN_DAYS.' days. If it has expired, use "Forgot password" on the login page to get a new one.')
                ->line('If you did not expect this, please ignore this email.'),
        );
    }

    protected function invitationUrl(object $notifiable): string
    {
        return URL::temporarySignedRoute(
            'vendor-invitation.show',
            now()->addDays(self::LINK_EXPIRES_IN_DAYS),
            ['user' => $notifiable],
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
