<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminNewVendorSignupNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Vendor $vendor) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->vendor->loadMissing(['category', 'city', 'country']);

        $category = $this->vendor->category?->name ?? __('Uncategorised');
        $location = collect([
            $this->vendor->city?->name,
            $this->vendor->country?->name,
        ])->filter()->implode(', ');

        return (new MailMessage)
            ->subject(__('New vendor application: :name', ['name' => $this->vendor->name]))
            ->greeting(__('Hello,'))
            ->line(__('A new business has signed up via List Your Business and is awaiting review.'))
            ->line('—')
            ->line('**'.__('Business').'** '.$this->vendor->name)
            ->line('**'.__('Email').'** '.$this->vendor->email)
            ->line('**'.__('Phone').'** '.($this->vendor->phone ?? '—'))
            ->line('**'.__('Category').'** '.$category)
            ->line('**'.__('Location').'** '.($location !== '' ? $location : '—'))
            ->action(__('Review applications'), route('admin.applications'))
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
