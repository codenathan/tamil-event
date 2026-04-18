<?php

declare(strict_types=1);

namespace App\Enums;

enum EnquireStatusEnum: string
{
    case PENDING = 'pending';
    case READ = 'read';
}
