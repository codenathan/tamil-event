<?php

declare(strict_types=1);

namespace App\Notifications\Concerns;

use Illuminate\Notifications\Messages\MailMessage;

trait CopiesAdminOnMail
{
    protected function withAdminBcc(MailMessage $mail): MailMessage
    {
        $address = config('mail.admin.address');

        if (filled($address)) {
            $mail->bcc($address);
        }

        return $mail;
    }
}
