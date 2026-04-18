<?php

namespace App\Enums;

enum VendorStatusEnum: string
{
    case APPROVED = 'approved';
    case PENDING = 'pending';
    case REJECTED = 'rejected';
}
