<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ContactMessageEnum;
use Database\Factories\ContactMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property Carbon $date
 * @property string $email
 * @property string|null $phone
 * @property string|null $message
 * @property ContactMessageEnum $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @method static \Database\Factories\ContactMessageFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContactMessage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContactMessage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContactMessage query()
 *
 * @mixin Model
 */
#[Fillable(['name', 'date', 'email', 'phone', 'message', 'status'])]
final class ContactMessage extends Model
{
    /** @use HasFactory<ContactMessageFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'status' => ContactMessageEnum::class,
        ];
    }
}
