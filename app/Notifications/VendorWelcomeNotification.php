<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Routing\UrlGenerator;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VendorWelcomeNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public string $token)
    {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        $url = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('Welcome! Set your password')
            ->greeting('Welcome to our platform 👋')
            ->line('Your vendor account has been approved.')
            ->line('Click below to set your password and get started.')
            ->action('Set Password', $url)
            ->line('If you did not expect this, please ignore this email.');
    }

    protected function resetUrl($notifiable): string|UrlGenerator
    {
        return url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->email,
        ], false));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
