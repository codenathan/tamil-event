<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Enquire;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VendorNewEnquiryNotification extends Notification
{
    use Queueable;

    public function __construct(public Enquire $enquire) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->enquire->loadMissing('vendor');

        $vendor = $this->enquire->vendor;
        $dateFormatted = $this->enquire->date->format('Y-m-d');

        $mail = (new MailMessage)
            ->replyTo($this->enquire->email, $this->enquire->name)
            ->subject(__('New enquiry for :listing', ['listing' => $vendor->name]))
            ->greeting(__('Hello,'))
            ->line(
                __('You have received a new enquiry for **:listing**. Replying to this email will go directly to the person who enquired.', [
                    'listing' => $vendor->name,
                ]),
            )
            ->line('—')
            ->line('**'.__('Name').'** '.$this->enquire->name)
            ->line('**'.__('Email').'** '.$this->enquire->email)
            ->line('**'.__('Date').'** '.$dateFormatted)
            ->line('**'.__('Message').'**');

        foreach (preg_split('/\R/u', $this->enquire->message) as $paragraph) {
            $trimmed = trim($paragraph);

            if ($trimmed !== '') {
                $mail->line($trimmed);
            }
        }

        return $mail
            ->line('—')
            ->salutation(__('Thanks, :app', ['app' => config('app.name')]));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
